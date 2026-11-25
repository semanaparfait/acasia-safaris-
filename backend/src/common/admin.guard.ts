import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Worker } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SESSION_COOKIE, cookie } from '../auth/session';
import {
  ACCESS_KEY,
  OWNER_KEY,
  checkAccess,
  type Permission,
} from './permissions';

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
// Add @Access('bookings') (common/permissions.ts) so only admins with that access get in,
// or @OwnerOnly() for the main admin. Checked on every request: a change made by the
// main admin works at once, without logging out.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private reflector: Reflector,
  ) {}

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

    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(OWNER_KEY, targets)) {
      if (!request.worker.isOwner) {
        throw new ForbiddenException('Only the main admin can do this');
      }
    }
    const keys = this.reflector.getAllAndOverride<Permission[] | undefined>(
      ACCESS_KEY,
      targets,
    );
    if (keys?.length) checkAccess(request.worker, ...keys);
    return true;
  }
}
