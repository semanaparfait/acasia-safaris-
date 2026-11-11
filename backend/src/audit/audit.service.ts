import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditEntry = {
  worker?: { id: string; name: string } | null; // null = someone unknown (e.g. failed login)
  workerName?: string; // when there is no worker, e.g. the email that was typed
  action: string; // "Accepted the customer's price"
  target?: string | null; // "Booking #3F2A9C1E (Ana Martinez)"
  details?: unknown; // the changes; passwords and codes are removed first
  ip?: string | null;
};

// Keys that never go into the log
const SECRET = /password|code|token|secret|hash/i;

// Keeps the log small and free of secrets: no passwords or codes, long text cut
export function cleanDetails(value: unknown, depth = 0): unknown {
  if (value == null || depth > 3) return undefined;
  if (typeof value === 'string') {
    return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((v) => cleanDetails(v, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      if (SECRET.test(key)) continue;
      const cleaned = cleanDetails(v, depth + 1);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value;
}

// Admin > Activity: who did what, and when
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  // Never throws: a failed log line must not break what the admin was doing
  async record(entry: AuditEntry) {
    try {
      const details = cleanDetails(entry.details);
      await this.prisma.auditLog.create({
        data: {
          workerId: entry.worker?.id ?? null,
          workerName: entry.worker?.name ?? entry.workerName ?? 'Unknown',
          action: entry.action,
          target: entry.target ?? null,
          details:
            details === undefined
              ? Prisma.DbNull
              : (details as Prisma.InputJsonValue),
          ip: entry.ip ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`Activity log failed: ${error}`);
    }
  }

  // Newest first, 50 at a time. "before" = the createdAt of the last one already shown.
  list(before?: string, take = 50) {
    return this.prisma.auditLog.findMany({
      where: before ? { createdAt: { lt: new Date(before) } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(take, 1), 200),
    });
  }
}
