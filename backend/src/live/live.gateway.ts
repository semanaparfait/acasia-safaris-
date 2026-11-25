import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { linkExpired } from '../bookings/link';
import { accessOf, type Permission } from '../common/permissions';
import { PrismaService } from '../prisma/prisma.service';

// Live updates, so nobody has to reload: ws://<api>/live (Socket.IO)
//  - Admins connect with   auth: { token }   (from GET /api/auth/live-token) and get every booking change
//    ("booking" with the admin view, "booking:deleted" with { id }).
//  - A visitor connects with   auth: { booking: <accessToken> }   and gets their own booking
//    ("booking" with the public view) whenever the team answers or something changes.
//  - An admin writing a reply sends "typing" { bookingId, typing }; the visitor gets
//    "typing" { name, typing } so their page shows "<name> is typing…".
//  - The visitor sends "customerTyping" { typing }; admins get "customerTyping" { bookingId, typing }.
//  - Each admin only gets the updates of the areas they have access to (room "access:<key>").
//    When the main admin changes their access, they get "access" at once (the panel reloads
//    their account); if they lost admin access, "access" { revoked: true } and the connection ends.
@WebSocketGateway({ namespace: 'live' })
export class LiveGateway implements OnGatewayConnection {
  private readonly logger = new Logger(LiveGateway.name);

  @WebSocketServer()
  private server: Namespace;

  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const { token, booking } = (client.handshake.auth ?? {}) as {
      token?: unknown;
      booking?: unknown;
    };
    try {
      if (typeof token === 'string' && token) {
        const worker = await this.auth.verify(token, 'live'); // throws if the login is not valid anymore
        (client.data as { name?: string }).name = worker.name;
        await client.join(['admins', `worker:${worker.id}`]);
        await client.join(accessOf(worker).map((k) => `access:${k}`));
        return;
      }
      if (typeof booking === 'string' && booking) {
        const found = await this.prisma.booking.findUnique({
          where: { accessToken: booking },
          select: { id: true, endDate: true },
        });
        if (found && !linkExpired(found.endDate)) {
          (client.data as { bookingId?: string }).bookingId = found.id;
          await client.join(`booking:${booking}`);
          return;
        }
      }
    } catch (error) {
      this.logger.debug(`Live connection refused: ${error}`);
    }
    client.disconnect(true);
  }

  // An admin is (or stopped) writing to a customer: tell that customer's booking page
  private tokens = new Map<string, string>(); // booking id -> visitor link token
  @SubscribeMessage('typing')
  async typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { bookingId?: unknown; typing?: unknown },
  ) {
    const name = (client.data as { name?: string }).name;
    if (!name || !client.rooms.has('access:bookings')) return;
    if (typeof body?.bookingId !== 'string' || !body.bookingId) return;
    let token = this.tokens.get(body.bookingId);
    if (!token) {
      const found = await this.prisma.booking
        .findUnique({
          where: { id: body.bookingId },
          select: { accessToken: true },
        })
        .catch(() => null);
      if (!found?.accessToken) return;
      token = found.accessToken;
      if (this.tokens.size > 1000) this.tokens.clear();
      this.tokens.set(body.bookingId, token);
    }
    this.toVisitor(token, 'typing', { name, typing: body.typing === true });
  }

  // The visitor is (or stopped) writing on their booking page: admins see "<name> is typing…"
  @SubscribeMessage('customerTyping')
  customerTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { typing?: unknown },
  ) {
    const bookingId = (client.data as { bookingId?: string }).bookingId;
    if (!bookingId) return;
    this.toAdmins(
      'customerTyping',
      { bookingId, typing: body?.typing === true },
      'bookings',
    );
  }

  // The admin panels that are open, of the admins with this access
  toAdmins(event: string, data: unknown, access: Permission) {
    this.server?.to(`access:${access}`).emit(event, data);
  }

  // The main admin changed this worker's access (or removed it): their open panels follow at once
  async accessChanged(workerId: string) {
    if (!this.server) return;
    const sockets = await this.server.in(`worker:${workerId}`).fetchSockets();
    if (!sockets.length) return;
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { isAdmin: true, isOwner: true, status: true, permissions: true },
    });
    const active = worker?.isAdmin && worker.status === 'Active';
    for (const socket of sockets) {
      if (!active) {
        socket.emit('access', { revoked: true });
        socket.disconnect(true);
        continue;
      }
      for (const room of socket.rooms) {
        if (room.startsWith('access:')) socket.leave(room);
      }
      socket.join(accessOf(worker).map((k) => `access:${k}`));
      socket.emit('access', { permissions: accessOf(worker) });
    }
  }

  // The visitor's booking page (every tab they have open)
  toVisitor(accessToken: string, event: string, data: unknown) {
    this.server?.to(`booking:${accessToken}`).emit(event, data);
  }
}
