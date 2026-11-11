import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tap } from 'rxjs';
import type { AdminRequest } from '../common/admin.guard';
import { AUDIT_KEY, type AuditMeta } from './audit.decorator';
import { AuditService } from './audit.service';

// What the answer was about, to make the log readable: "Ana Martinez", "7-Day Gorilla Trek"
function nameOf(data: unknown): string | undefined {
  const d = data as Record<string, unknown> | null;
  const item = (d?.booking as Record<string, unknown> | undefined) ?? d;
  const name = item?.customer ?? item?.title ?? item?.name;
  return typeof name === 'string' ? name : undefined;
}

// Records every admin route marked with @Audit(...) once it succeeded
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const meta = this.reflector.get<AuditMeta | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );
    if (!meta || context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<AdminRequest>();
    return next.handle().pipe(
      tap((data) => {
        const params = (request.params ?? {}) as Record<
          string,
          string | undefined
        >;
        const key = params.id ?? params.code;
        const ref = key ? `#${key.slice(0, 8).toUpperCase()}` : '';
        const name = nameOf(data);
        const target = meta.entity
          ? [meta.entity, ref, name ? `(${name})` : '']
              .filter(Boolean)
              .join(' ')
          : name;
        void this.audit.record({
          worker: request.worker,
          action: meta.action,
          target,
          details: request.body,
          ip: request.ip,
        });
      }),
    );
  }
}
