import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import { allowedOrigins } from '../common/origins';

// Socket.IO with the same allowed websites as the API
export class LiveAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): unknown {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: allowedOrigins() },
    });
  }
}
