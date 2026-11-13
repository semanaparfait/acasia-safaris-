// Admin > Calendar: what happens each day, built from the bookings and the team's to-dos.
// Same rules as the admins' morning email (backend/src/calendar/agenda.ts).
//
// Days are "yyyy-MM-dd" strings. Booking dates are the day at midnight UTC, so their day
// is the first 10 characters. "Today" is the day in Kigali, wherever the admin is.
import type { AdminReminder, Booking } from "./types";

const DAY = 86_400_000;
export const BALANCE_DAYS = 14; // the remaining 50% is asked for from 14 days before the trip

export const dayOf = (iso: string) => iso.slice(0, 10);
export const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
export const addDays = (day: string, n: number) =>
  new Date(toDate(day).getTime() + n * DAY).toISOString().slice(0, 10);
export const kigaliToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali" }).format(new Date());

// Trips that are still going to happen, or happened (not cancelled)
export const isLive = (b: Booking) => b.status !== "Cancelled" && b.status !== "Completed";
export const showsOnCalendar = (b: Booking) => b.status !== "Cancelled";
export const needsBalance = (b: Booking) =>
  b.status === "Confirmed" && b.payment !== "Paid" && b.payment !== "Refunded";

// The day the balance reminders start (and the team should collect it)
export const balanceDay = (b: Booking) => addDays(dayOf(b.startDate), -BALANCE_DAYS);

export const tripName = (b: Booking) =>
  b.package?.title ?? (b.destinations.map((d) => d.title).join(", ") || "Tailor-made trip");

// ---------- The month grid ----------

// The weeks shown for a month, Monday first: [["2026-10-26", ... 7 days], ...]
export function monthWeeks(month: string /* "2026-11" */): string[][] {
  const first = `${month}-01`;
  const weekday = (toDate(first).getUTCDay() + 6) % 7; // Monday = 0
  let day = addDays(first, -weekday);
  const weeks: string[][] = [];
  do {
    const week = Array.from({ length: 7 }, (_, i) => addDays(day, i));
    weeks.push(week);
    day = addDays(day, 7);
  } while (day.slice(0, 7) === month);
  return weeks;
}

export const shiftMonth = (month: string, n: number) => {
  const d = toDate(`${month}-01`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
};

// One trip's piece inside a week row: columns 1-7, and a lane (row) so trips never overlap
export type Segment = {
  booking: Booking;
  start: number; // 1 = Monday
  end: number; // inclusive
  startsHere: boolean; // the trip's first day is in this week (rounded left edge)
  endsHere: boolean;
  lane: number;
};

export function weekSegments(week: string[], bookings: Booking[]): Segment[] {
  const first = week[0];
  const last = week[6];
  const pieces = bookings
    .filter((b) => dayOf(b.startDate) <= last && dayOf(b.endDate) >= first)
    .map((b) => {
      const from = dayOf(b.startDate) < first ? first : dayOf(b.startDate);
      const to = dayOf(b.endDate) > last ? last : dayOf(b.endDate);
      return {
        booking: b,
        start: week.indexOf(from) + 1,
        end: week.indexOf(to) + 1,
        startsHere: dayOf(b.startDate) >= first,
        endsHere: dayOf(b.endDate) <= last,
        lane: 0,
      };
    })
    // Earlier and longer trips first, so the bars stack neatly
    .sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const lanes: number[] = []; // last column used in each lane
  for (const p of pieces) {
    let lane = lanes.findIndex((end) => end < p.start);
    if (lane === -1) lane = lanes.length;
    lanes[lane] = p.end;
    p.lane = lane;
  }
  return pieces;
}

// ---------- One day ----------

export type DayAgenda = {
  departures: Booking[];
  returns: Booking[];
  onTrip: Booking[];
  balances: Booking[]; // the day the balance should be collected
  reminders: AdminReminder[];
};

export function dayAgenda(day: string, bookings: Booking[], reminders: AdminReminder[]): DayAgenda {
  const shown = bookings.filter(showsOnCalendar);
  const byTime = (a: AdminReminder, b: AdminReminder) =>
    Number(a.done) - Number(b.done) || (a.time ?? "99").localeCompare(b.time ?? "99");
  return {
    departures: shown.filter((b) => dayOf(b.startDate) === day),
    returns: shown.filter((b) => dayOf(b.endDate) === day && dayOf(b.startDate) !== day),
    onTrip: shown.filter((b) => dayOf(b.startDate) < day && dayOf(b.endDate) > day),
    balances: bookings.filter((b) => needsBalance(b) && balanceDay(b) === day),
    reminders: reminders.filter((r) => dayOf(r.date) === day).sort(byTime),
  };
}

export const overdueReminders = (reminders: AdminReminder[], today: string) =>
  reminders.filter((r) => !r.done && dayOf(r.date) < today).sort((a, b) => a.date.localeCompare(b.date));

// Balances still to collect: confirmed trips starting within 14 days, not fully paid
export const balancesDue = (bookings: Booking[], today: string) =>
  bookings
    .filter(
      (b) => needsBalance(b) && dayOf(b.startDate) >= today && dayOf(b.startDate) <= addDays(today, BALANCE_DAYS),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

// The count on the menu: what needs doing today
export function todayCount(bookings: Booking[], reminders: AdminReminder[], today = kigaliToday()) {
  const a = dayAgenda(today, bookings.filter(isLive), reminders);
  return (
    a.departures.length +
    a.returns.length +
    a.reminders.filter((r) => !r.done).length +
    overdueReminders(reminders, today).length
  );
}
