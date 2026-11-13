import { agendaEmail } from './agenda-email';
import {
  addDays,
  buildAgenda,
  isEmpty,
  kigaliDay,
  type AgendaBooking,
  type AgendaReminder,
} from './agenda';

const d = (day: string) => new Date(`${day}T00:00:00Z`);

const booking = (changes: Partial<AgendaBooking> = {}): AgendaBooking => ({
  id: 'b1',
  customer: 'Ana Martinez',
  travelers: 2,
  startDate: d('2026-11-12'),
  endDate: d('2026-11-15'),
  status: 'Confirmed',
  payment: 'Deposit',
  amount: 2900,
  needsReply: false,
  package: { title: 'Gorilla Trek' },
  destinations: [],
  ...changes,
});

const reminder = (changes: Partial<AgendaReminder> = {}): AgendaReminder => ({
  id: 'r1',
  title: 'Buy permits',
  date: d('2026-11-12'),
  time: null,
  done: false,
  booking: null,
  ...changes,
});

describe('admin agenda', () => {
  const today = '2026-11-12';

  it('finds departures, returns, trips under way and tomorrow', () => {
    const a = buildAgenda(
      [
        booking({ id: 'leaves' }),
        booking({
          id: 'back',
          startDate: d('2026-11-08'),
          endDate: d('2026-11-12'),
        }),
        booking({
          id: 'away',
          startDate: d('2026-11-10'),
          endDate: d('2026-11-14'),
        }),
        booking({
          id: 'tomorrow',
          startDate: d('2026-11-13'),
          endDate: d('2026-11-16'),
        }),
        booking({ id: 'cancelled', status: 'Cancelled' }),
      ],
      [],
      today,
    );
    expect(a.departures.map((b) => b.id)).toEqual(['leaves']);
    expect(a.returns.map((b) => b.id)).toEqual(['back']);
    expect(a.onTrip.map((b) => b.id)).toEqual(['away']);
    expect(a.tomorrow.map((b) => b.id)).toEqual(['tomorrow']);
  });

  it('lists confirmed trips within 14 days that are not fully paid', () => {
    const a = buildAgenda(
      [
        booking({
          id: 'soon',
          startDate: d('2026-11-20'),
          endDate: d('2026-11-25'),
        }),
        booking({
          id: 'paid',
          payment: 'Paid',
          startDate: d('2026-11-20'),
          endDate: d('2026-11-25'),
        }),
        booking({
          id: 'later',
          startDate: d('2026-12-20'),
          endDate: d('2026-12-25'),
        }),
        booking({
          id: 'pending',
          status: 'Pending',
          startDate: d('2026-11-20'),
          endDate: d('2026-11-25'),
        }),
      ],
      [],
      today,
    );
    expect(a.balances.map((b) => b.id)).toEqual(['soon']);
    expect(a.pending).toBe(1);
  });

  it('sorts to-dos by time and finds the overdue ones', () => {
    const a = buildAgenda(
      [],
      [
        reminder({ id: 'late', date: d('2026-11-10') }),
        reminder({ id: 'afternoon', time: '15:00' }),
        reminder({ id: 'morning', time: '08:30' }),
        reminder({ id: 'anytime' }),
        reminder({ id: 'done', done: true }),
      ],
      today,
    );
    expect(a.remindersToday.map((r) => r.id)).toEqual([
      'morning',
      'afternoon',
      'anytime',
    ]);
    expect(a.overdue.map((r) => r.id)).toEqual(['late']);
  });

  it('knows a day with nothing to do', () => {
    expect(isEmpty(buildAgenda([], [], today))).toBe(true);
    expect(isEmpty(buildAgenda([booking()], [], today))).toBe(false);
  });

  it('counts days in Kigali time', () => {
    // 23:30 UTC on the 11th is already the 12th in Kigali (UTC+2)
    expect(kigaliDay(new Date('2026-11-11T23:30:00Z'))).toBe('2026-11-12');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('writes the email, with names escaped', () => {
    const a = buildAgenda(
      [booking({ customer: 'Ana <script>' })],
      [reminder()],
      today,
    );
    const mail = agendaEmail(a, 'Jean', 'https://acacia.test');
    expect(mail.subject).toBe('Today: 1 departure, 0 returns');
    expect(mail.html).toContain('Thursday 12 November');
    expect(mail.html).toContain('Ana &lt;script&gt;');
    expect(mail.html).toContain('https://acacia.test/admin/bookings?open=b1');
    expect(mail.text).toContain('Buy permits');
  });
});
