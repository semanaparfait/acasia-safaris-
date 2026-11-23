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
import { PrismaService } from '../prisma/prisma.service';

// Live updates, so nobody has to reload: ws://<api>/live (Socket.IO)
//  - Admins connect with   auth: { token }   (from GET /api/auth/live-token) and get every booking change
//    ("booking" with the admin view, "booking:deleted" with { id }).
//  - A visitor connects with   auth: { booking: <accessToken> }   and gets their own booking
//    ("booking" with the public view) whenever the team answers or something changes.
//  - An admin writing a reply sends "typing" { bookingId, typing }; the visitor gets
//    "typing" { name, typing } so their page shows "<name> is typing…".
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
        await client.join('admins');
        return;
      }
      if (typeof booking === 'string' && booking) {
        const found = await this.prisma.booking.findUnique({
          where: { accessToken: booking },
          select: { endDate: true },
        });
        if (found && !linkExpired(found.endDate)) {
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
    if (!name || !client.rooms.has('admins')) return;
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

  // Every admin panel that is open
  toAdmins(event: string, data: unknown) {
    this.server?.to('admins').emit(event, data);
  }

  // The visitor's booking page (every tab they have open)
  toVisitor(accessToken: string, event: string, data: unknown) {
    this.server?.to(`booking:${accessToken}`).emit(event, data);
  }
}
