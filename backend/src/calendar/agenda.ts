// What happens on a day, for the admins' morning email (Admin > Calendar shows the same on the website).
// Pure functions: see agenda.spec.ts.
//
// Days are "yyyy-MM-dd" strings. Booking dates are saved as the day at midnight UTC,
// so their day is the first 10 characters of the ISO date. "Today" is the day in Kigali.

export const DAY = 86_400_000;
export const BALANCE_DAYS = 14; // the remaining 50% is asked for from 14 days before the trip

export type AgendaBooking = {
  id: string;
  customer: string;
  travelers: number;
  startDate: Date;
  endDate: Date;
  status: string; // Pending, Negotiating, Confirmed, Completed, Cancelled
  payment: string; // Unpaid, Deposit, Paid, Refunded
  amount: number;
  needsReply: boolean;
  package: { title: string } | null;
  destinations: { title: string }[];
};

export type AgendaReminder = {
  id: string;
  title: string;
  date: Date;
  time: string | null;
  done: boolean;
  booking: { customer: string } | null;
};

export const dayOf = (date: Date) => date.toISOString().slice(0, 10);

// Today's date in Kigali, e.g. "2026-11-12"
export const kigaliDay = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali' }).format(now);

export const addDays = (day: string, n: number) =>
  dayOf(new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY));

export const tripName = (b: Pick<AgendaBooking, 'package' | 'destinations'>) =>
  b.package?.title ??
  (b.destinations.map((d) => d.title).join(', ') || 'Tailor-made trip');

// Pending, Negotiating and Confirmed trips are still going to happen
const live = (b: AgendaBooking) =>
  b.status !== 'Cancelled' && b.status !== 'Completed';
const unpaid = (b: AgendaBooking) =>
  b.payment !== 'Paid' && b.payment !== 'Refunded';

export function buildAgenda(
  bookings: AgendaBooking[],
  reminders: AgendaReminder[],
  today: string,
) {
  const active = bookings.filter(live);
  const byTime = (a: AgendaReminder, b: AgendaReminder) =>
    (a.time ?? '99').localeCompare(b.time ?? '99');
  return {
    today,
    departures: active.filter((b) => dayOf(b.startDate) === today),
    returns: active.filter((b) => dayOf(b.endDate) === today),
    onTrip: active.filter(
      (b) => dayOf(b.startDate) < today && dayOf(b.endDate) > today,
    ),
    tomorrow: active.filter((b) => dayOf(b.startDate) === addDays(today, 1)),
    // Confirmed trips starting in the next 14 days that are not fully paid
    balances: active.filter(
      (b) =>
        b.status === 'Confirmed' &&
        unpaid(b) &&
        dayOf(b.startDate) >= today &&
        dayOf(b.startDate) <= addDays(today, BALANCE_DAYS),
    ),
    remindersToday: reminders
      .filter((r) => !r.done && dayOf(r.date) === today)
      .sort(byTime),
    overdue: reminders.filter((r) => !r.done && dayOf(r.date) < today),
    pending: bookings.filter((b) => b.status === 'Pending').length,
    needsReply: bookings.filter((b) => b.needsReply && b.status !== 'Cancelled')
      .length,
  };
}

export type Agenda = ReturnType<typeof buildAgenda>;

// Nothing worth an email
export const isEmpty = (a: Agenda) =>
  !a.departures.length &&
  !a.returns.length &&
  !a.tomorrow.length &&
  !a.balances.length &&
  !a.remindersToday.length &&
  !a.overdue.length &&
  !a.pending &&
  !a.needsReply;
