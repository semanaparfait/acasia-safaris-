// Trip dates are calendar days (stored as midnight UTC): they are shown in UTC so
// a visitor in New York does not see their 1 December trip as 30 November.
// The format follows the visitor's language ("Tue 1 Dec 2026", "mar. 1 déc. 2026", "Tue, Dec 1, 2026").

type Style = "short" | "long" | "full";

const OPTIONS: Record<Style, Intl.DateTimeFormatOptions> = {
  short: { weekday: "short", day: "numeric", month: "short" }, // Tue 1 Dec
  long: { weekday: "short", day: "numeric", month: "short", year: "numeric" }, // Tue 1 Dec 2026
  full: { weekday: "long", day: "numeric", month: "long", year: "numeric" }, // Tuesday 1 December 2026
};

// locale: the page's language ("fr"), or the browser's when not given
export function tripDate(date: string | Date, style: Style = "long", locale?: string) {
  return new Intl.DateTimeFormat(locale, { ...OPTIONS[style], timeZone: "UTC" }).format(new Date(date));
}

// "Tue 1 Dec – Mon 7 Dec 2026"
export function tripRange(start: string | Date, end: string | Date, locale?: string) {
  return `${tripDate(start, "short", locale)} – ${tripDate(end, "long", locale)}`;
}

// Moments (messages, check-in): the visitor's own time zone, e.g. "1 Dec, 14:05"
export function moment(date: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
