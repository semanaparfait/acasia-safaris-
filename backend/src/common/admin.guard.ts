import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Worker } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';

// A request that passed the guard knows which worker is logged in
export type AdminRequest = Request & {
  worker: Omit<Worker, 'passwordHash' | 'tokenVersion'>;
};

// Protects admin-only routes. The admin panel sends the token it got from
// POST /api/auth/login in the header:
//   Authorization: Bearer <token>
// Use it on a route with:  @UseGuards(AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const [type, token] = (request.headers.authorization ?? '').split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Please log in');
    }

    request.worker = await this.auth.verify(token);
    return true;
  }
}
