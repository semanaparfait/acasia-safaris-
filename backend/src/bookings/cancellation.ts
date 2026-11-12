// The cancellation policy (Standard). Same rules as lib/cancellation.ts on the website.
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

const startOfDay = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export type CancellationRow = {
  charge: number;
  from: Date | null; // null = from today
  until: Date | null; // null = until the trip (and no-show)
};

// The periods for a trip starting on startDate, with their dates (periods already over left out)
export function cancellationSchedule(
  startDate: Date,
  today: Date = new Date(),
): CancellationRow[] {
  const start = startOfDay(startDate);
  const now = startOfDay(today);
  const rows: CancellationRow[] = [];
  CANCELLATION_TIERS.forEach((tier, i) => {
    const previous = CANCELLATION_TIERS[i - 1];
    const from = previous ? start - (previous.minDays - 1) * DAY : null;
    const until = tier.minDays > 0 ? start - tier.minDays * DAY : null;
    if (until !== null && until < now) return;
    rows.push({
      charge: tier.charge,
      from: from === null || from <= now ? null : new Date(from),
      until: until === null ? null : new Date(until),
    });
  });
  return rows;
}
