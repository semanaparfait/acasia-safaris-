// The cancellation policy (Standard). Same rules as backend/src/bookings/cancellation.ts.
// Days are counted before the first day of the trip; permits are never refunded.
//   60 days or more  ->  full refund (except permits)
//   30 to 59 days    ->  50% of the total is charged (the deposit)
//   15 to 29 days    ->  75%
//   14 days or less, or no-show  ->  100%

export const CANCELLATION_TIERS = [
  { minDays: 60, charge: 0 },
  { minDays: 30, charge: 50 },
  { minDays: 15, charge: 75 },
  { minDays: 0, charge: 100 },
] as const;

const DAY = 86_400_000;

// Trip dates are calendar days stored at midnight UTC
const startOfDay = (date: string | Date) => {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export type CancellationRow = {
  charge: number; // % of the total charged when cancelling in this period
  from: Date | null; // first day of the period (null = from the booking)
  until: Date | null; // last day of the period (null = until the trip, and no-show)
  current: boolean; // the period we are in today
};

// The periods for a trip starting on startDate, with their real dates.
// Periods already over are left out.
export function cancellationSchedule(startDate: string | Date, today: Date = new Date()): CancellationRow[] {
  const start = startOfDay(startDate);
  const now = startOfDay(today);
  const rows: CancellationRow[] = [];
  CANCELLATION_TIERS.forEach((tier, i) => {
    const previous = CANCELLATION_TIERS[i - 1];
    // e.g. 30–59 days before: from start-59 to start-30
    const from = previous ? start - (previous.minDays - 1) * DAY : null;
    const until = tier.minDays > 0 ? start - tier.minDays * DAY : null;
    if (until !== null && until < now) return; // already over
    const current = (from === null || from <= now) && (until === null || now <= until);
    rows.push({
      charge: tier.charge,
      from: from === null || from <= now ? null : new Date(from),
      until: until === null ? null : new Date(until),
      current,
    });
  });
  return rows;
}

// What cancelling today would cost (% of the total)
export const chargeIfCancelledToday = (startDate: string | Date) =>
  cancellationSchedule(startDate).find((r) => r.current)?.charge ?? 100;
