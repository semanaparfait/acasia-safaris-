import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export type AuditMeta = { action: string; entity?: string };

// Put on an admin route to record it in Admin > Activity when it succeeds:
//   @Audit('Changed a booking', 'Booking')
// "entity" + the :id (or :code) in the URL become the target, e.g. "Booking #3F2A9C1E (Ana)".
export const Audit = (action: string, entity?: string) =>
  SetMetadata(AUDIT_KEY, { action, entity } satisfies AuditMeta);
