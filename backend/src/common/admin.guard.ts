import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Protects admin-only routes. The admin panel must send the secret from .env:
//   x-admin-key: <ADMIN_API_KEY>
// Use it on a route with:  @UseGuards(AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-admin-key'];

    if (key !== this.config.get<string>('ADMIN_API_KEY')) {
      throw new UnauthorizedException('Admin key is missing or wrong');
    }
    return true;
  }
}
