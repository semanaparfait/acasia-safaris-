// The admins' morning email: today's departures, returns, balances to collect and reminders.
import {
  tripName,
  type Agenda,
  type AgendaBooking,
  type AgendaReminder,
} from './agenda';

const GREEN = '#12231a';
const GOLD = '#c5a86d';
const INK = '#0a120b';
const MUTED = '#5e6960';
const LINE = '#ece6da';

const h = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

// "Thursday 12 November"
export const longDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

export function agendaEmail(agenda: Agenda, name: string, adminUrl: string) {
  const link = (path: string) => `${adminUrl}${path}`;
  const bookingRow = (b: AgendaBooking, extra = '') => `
    <tr><td style="padding:10px 0;border-top:1px solid ${LINE}">
      <a href="${link(`/admin/bookings?open=${b.id}`)}" style="color:${INK};font-weight:bold;text-decoration:none">${h(b.customer)}</a>
      <span style="color:${MUTED}"> · ${b.travelers} traveler${b.travelers === 1 ? '' : 's'}</span><br/>
      <span style="color:${MUTED};font-size:13px">${h(tripName(b))}${extra}</span>
    </td></tr>`;
  const reminderRow = (r: AgendaReminder, late = false) => `
    <tr><td style="padding:10px 0;border-top:1px solid ${LINE}">
      <span style="font-weight:bold;color:${late ? '#9B2C2C' : INK}">${r.time ? `${h(r.time)} · ` : ''}${h(r.title)}</span>
      ${r.booking ? `<br/><span style="color:${MUTED};font-size:13px">${h(r.booking.customer)}</span>` : ''}
      ${late ? `<br/><span style="color:#9B2C2C;font-size:12px">Was due ${h(longDay(r.date.toISOString().slice(0, 10)))}</span>` : ''}
    </td></tr>`;
  const section = (title: string, color: string, rows: string[]) =>
    rows.length
      ? `<tr><td style="padding:22px 32px 0">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;color:${color}">${h(title)} · ${rows.length}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">${rows.join('')}</table>
        </td></tr>`
      : '';

  const stat = (value: number, label: string) => `
    <td align="center" style="padding:14px 6px;border:1px solid ${LINE};border-radius:10px;background:#fff">
      <div style="font-size:24px;font-weight:bold;color:${GREEN}">${value}</div>
      <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">${label}</div>
    </td>`;

  const travelers = (list: AgendaBooking[]) =>
    list.reduce((n, b) => n + b.travelers, 0);
  const attention = [
    agenda.pending
      ? `${agenda.pending} booking${agenda.pending === 1 ? '' : 's'} waiting for confirmation`
      : '',
    agenda.needsReply
      ? `${agenda.needsReply} customer${agenda.needsReply === 1 ? '' : 's'} waiting for a reply`
      : '',
  ].filter(Boolean);

  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f0;font-family:Arial,Helvetica,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
  <tr><td style="background:${GREEN};padding:26px 32px">
    <p style="margin:0;color:${GOLD};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold">Today at Acacia Safaris</p>
    <p style="margin:6px 0 0;color:#fff;font-size:24px;font-weight:bold">${h(longDay(agenda.today))}</p>
    <p style="margin:6px 0 0;color:#c9d6cf;font-size:14px">Good morning ${h(name)}, here is the day.</p>
  </td></tr>
  <tr><td style="padding:22px 32px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="6"><tr>
      ${stat(agenda.departures.length, 'Departures')}
      ${stat(agenda.returns.length, 'Returns')}
      ${stat(travelers(agenda.onTrip) + travelers(agenda.departures), 'On safari')}
      ${stat(agenda.remindersToday.length + agenda.overdue.length, 'To-dos')}
    </tr></table>
  </td></tr>
  ${attention.length ? `<tr><td style="padding:16px 32px 0"><p style="margin:0;padding:12px 14px;background:#fbf5ea;border-left:3px solid ${GOLD};font-size:14px">${attention.map(h).join('<br/>')}</p></td></tr>` : ''}
  ${section(
    'Overdue to-dos',
    '#9B2C2C',
    agenda.overdue.map((r) => reminderRow(r, true)),
  )}
  ${section(
    'To-dos today',
    GREEN,
    agenda.remindersToday.map((r) => reminderRow(r)),
  )}
  ${section(
    'Departing today',
    '#2E7D5B',
    agenda.departures.map((b) =>
      bookingRow(
        b,
        b.status === 'Pending'
          ? ' · <b style="color:#b45309">not confirmed yet</b>'
          : '',
      ),
    ),
  )}
  ${section(
    'Returning today',
    '#1d4e89',
    agenda.returns.map((b) => bookingRow(b)),
  )}
  ${section(
    'Balances to collect (trip within 14 days)',
    '#b45309',
    agenda.balances.map((b) =>
      bookingRow(
        b,
        ` · starts ${h(longDay(b.startDate.toISOString().slice(0, 10)))} · ${b.payment === 'Unpaid' ? 'nothing paid' : 'deposit paid'} of ${usd(b.amount)}`,
      ),
    ),
  )}
  ${section(
    'Departing tomorrow',
    MUTED,
    agenda.tomorrow.map((b) => bookingRow(b)),
  )}
  <tr><td style="padding:26px 32px 30px">
    <a href="${link('/admin/calendar')}" style="display:inline-block;background:${GREEN};color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:10px">Open the calendar</a>
    <p style="margin:18px 0 0;font-size:12px;color:${MUTED}">Sent every morning at 7:00 (Kigali) to the admins, only on days with something to do.</p>
  </td></tr>
</table></td></tr></table></body></html>`;

  const lines = (title: string, items: string[]) =>
    items.length
      ? `\n${title}\n${items.map((i) => `- ${i}`).join('\n')}\n`
      : '';
  const text = `Today at Acacia Safaris: ${longDay(agenda.today)}
${attention.join('\n')}
${lines(
  'Overdue to-dos',
  agenda.overdue.map((r) => r.title),
)}${lines(
    'To-dos today',
    agenda.remindersToday.map((r) => `${r.time ? `${r.time} ` : ''}${r.title}`),
  )}${lines(
    'Departing today',
    agenda.departures.map(
      (b) => `${b.customer} (${b.travelers}): ${tripName(b)}`,
    ),
  )}${lines(
    'Returning today',
    agenda.returns.map((b) => `${b.customer}: ${tripName(b)}`),
  )}${lines(
    'Balances to collect',
    agenda.balances.map((b) => `${b.customer}: ${tripName(b)}`),
  )}${lines(
    'Departing tomorrow',
    agenda.tomorrow.map((b) => `${b.customer}: ${tripName(b)}`),
  )}
Calendar: ${link('/admin/calendar')}`;

  const count = agenda.departures.length + agenda.returns.length;
  const subject = `Today: ${count ? `${agenda.departures.length} departure${agenda.departures.length === 1 ? '' : 's'}, ${agenda.returns.length} return${agenda.returns.length === 1 ? '' : 's'}` : 'your agenda'}${agenda.overdue.length ? ` · ${agenda.overdue.length} overdue` : ''}`;
  return { subject, html, text };
}
