import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Worker } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SESSION_COOKIE, cookie } from '../auth/session';

// A request that passed the guard knows which worker is logged in
export type AdminRequest = Request & {
  worker: Omit<Worker, 'passwordHash' | 'tokenVersion'>;
};

// The admin panel adds this header to every request. Other websites cannot add it
// to a request sent with the login cookie, so they cannot make an admin's browser
// change something behind their back (CSRF).
export const CSRF_HEADER = 'x-requested-with';

const READ_ONLY = ['GET', 'HEAD', 'OPTIONS'];

// Protects admin-only routes. The login comes from the httpOnly cookie set by
// POST /api/auth/login (the admin panel), or from a header (Swagger, scripts):
//   Authorization: Bearer <token>
// Use it on a route with:  @UseGuards(AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const [type, bearer] = (request.headers.authorization ?? '').split(' ');
    const fromHeader = type === 'Bearer' && bearer ? bearer : undefined;
    const token = fromHeader ?? cookie(request, SESSION_COOKIE);

    if (!token) throw new UnauthorizedException('Please log in');

    if (
      !fromHeader &&
      !READ_ONLY.includes(request.method) &&
      !request.headers[CSRF_HEADER]
    ) {
      throw new ForbiddenException(
        'This request did not come from the admin panel',
      );
    }

    request.worker = await this.auth.verify(token);
    return true;
  }
}
