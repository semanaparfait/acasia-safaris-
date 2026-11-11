import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Live updates, so nobody has to reload: ws://<api>/live (Socket.IO)
//  - Admins connect with   auth: { token: <login token> }   and get every booking change
//    ("booking" with the admin view, "booking:deleted" with { id }).
//  - A visitor connects with   auth: { booking: <accessToken> }   and gets their own booking
//    ("booking" with the public view) whenever the team answers or something changes.
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
        await this.auth.verify(token); // throws if the login is not valid anymore
        await client.join('admins');
        return;
      }
      if (typeof booking === 'string' && booking) {
        const found = await this.prisma.booking.findUnique({
          where: { accessToken: booking },
          select: { id: true },
        });
        if (found) {
          await client.join(`booking:${booking}`);
          return;
        }
      }
    } catch (error) {
      this.logger.debug(`Live connection refused: ${error}`);
    }
    client.disconnect(true);
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
