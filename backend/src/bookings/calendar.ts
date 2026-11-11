// "Add to calendar": the trip as an .ics file (Google, Apple and Outlook calendars open it).
// The trip is all-day events from the first to the last day, with the ticket and the link.

export type CalendarTrip = {
  id: string;
  title: string;
  location?: string | null;
  startDate: Date; // midnight UTC of the first day
  endDate: Date; // midnight UTC of the last day
  ticketCode?: string | null;
  link: string; // the visitor's booking page
};

const day = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, ''); // 20261201

// Text in .ics: escape \ ; , and new lines
const text = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// Lines longer than 75 bytes must be folded (a space starts each following line)
function fold(line: string) {
  const parts: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    parts.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  parts.push(rest);
  return parts.join('\r\n');
}

export function tripCalendar(trip: CalendarTrip) {
  // All-day events end on the day AFTER the last day
  const afterLast = new Date(trip.endDate.getTime() + 86_400_000);
  const description = [
    trip.ticketCode
      ? `Your ticket: ${trip.ticketCode}. Bring the QR code from your confirmation email (printed or on your phone).`
      : 'Your Acacia Safaris trip.',
    'Remember: a passport or ID for every traveler.',
    `Your booking: ${trip.link}`,
  ].join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Acacia Safaris//Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${trip.id}@acaciasafaris.com`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${day(trip.startDate)}`,
    `DTEND;VALUE=DATE:${day(afterLast)}`,
    `SUMMARY:${text(`Acacia Safaris: ${trip.title}`)}`,
    ...(trip.location ? [`LOCATION:${text(trip.location)}`] : []),
    `DESCRIPTION:${text(description)}`,
    `URL:${trip.link}`,
    'TRANSP:OPAQUE',
    // A reminder 2 days before
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${text(`Your safari starts soon: ${trip.title}`)}`,
    'TRIGGER:-P2D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
