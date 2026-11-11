import { tripCalendar } from './calendar';

const trip = {
  id: 'b1',
  title: '7-Day Gorilla Trek, Rwanda; with Lake Kivu',
  location: 'Volcanoes National Park',
  startDate: new Date('2026-12-01T00:00:00Z'),
  endDate: new Date('2026-12-07T00:00:00Z'),
  ticketCode: 'AC7K2M9QXP',
  link: 'https://acacia.example/my-booking/abc',
};

describe('tripCalendar', () => {
  const ics = tripCalendar(trip);
  const unfolded = ics.replace(/\r\n /g, '');

  it('is all-day from the first day to the day after the last', () => {
    expect(ics).toContain('DTSTART;VALUE=DATE:20261201');
    expect(ics).toContain('DTEND;VALUE=DATE:20261208');
  });

  it('escapes commas and semicolons in text', () => {
    expect(unfolded).toContain(
      'SUMMARY:Acacia Safaris: 7-Day Gorilla Trek\\, Rwanda\\; with Lake Kivu',
    );
  });

  it('has the ticket and the link, and a reminder 2 days before', () => {
    expect(unfolded).toContain('AC7K2M9QXP');
    expect(unfolded).toContain('URL:https://acacia.example/my-booking/abc');
    expect(ics).toContain('TRIGGER:-P2D');
  });

  it('uses CRLF and no line is longer than 75 bytes', () => {
    const lines = ics.split('\r\n').filter(Boolean);
    expect(lines.every((l) => Buffer.byteLength(l) <= 75)).toBe(true);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
  });
});
