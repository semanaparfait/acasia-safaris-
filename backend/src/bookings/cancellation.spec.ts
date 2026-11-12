import { cancellationSchedule } from './cancellation';

// A trip starting on 1 March 2027
const start = new Date('2027-03-01T00:00:00Z');
const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe('cancellationSchedule', () => {
  it('gives the four periods with their real dates, booked well ahead', () => {
    const rows = cancellationSchedule(start, d('2026-11-12'));
    expect(rows).toEqual([
      { charge: 0, from: null, until: d('2026-12-31') }, // 60 days before
      { charge: 50, from: d('2027-01-01'), until: d('2027-01-30') }, // 59 to 30 days
      { charge: 75, from: d('2027-01-31'), until: d('2027-02-14') }, // 29 to 15 days
      { charge: 100, from: d('2027-02-15'), until: null }, // 14 days or less
    ]);
  });

  it('leaves out the periods already over (booked 40 days before)', () => {
    const rows = cancellationSchedule(start, d('2027-01-20'));
    expect(rows.map((r) => r.charge)).toEqual([50, 75, 100]);
    expect(rows[0].from).toBeNull(); // the current period starts today
    expect(rows[0].until).toEqual(d('2027-01-30'));
  });

  it('is 100% only, a few days before the trip', () => {
    const rows = cancellationSchedule(start, d('2027-02-25'));
    expect(rows).toEqual([{ charge: 100, from: null, until: null }]);
  });

  it('counts the last free day exactly 60 days before', () => {
    expect(cancellationSchedule(start, d('2026-12-31'))[0].charge).toBe(0);
    expect(cancellationSchedule(start, d('2027-01-01'))[0].charge).toBe(50);
  });
});
