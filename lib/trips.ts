// Small helpers for the special trips (Admin > Trips) shown on the website.
import type { Trip } from "./types";

// The lowest price of the trip's options (0 when there is none)
export const fromPrice = (t: Trip) => (t.prices.length ? Math.min(...t.prices.map((p) => p.price)) : 0);

// "20 – 26 Dec 2026", "28 Dec 2026 – 3 Jan 2027", in the page's language. null = no dates.
export function tripDates(t: Trip, locale: string) {
  if (!t.startDate) return null;
  const start = new Date(t.startDate);
  const end = t.endDate ? new Date(t.endDate) : null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" };
  const format = new Intl.DateTimeFormat(locale, opts);
  return end && end.getTime() !== start.getTime() ? format.formatRange(start, end) : format.format(start);
}

// Number of days from the dates (inclusive), or null
export function tripDays(t: Trip) {
  if (!t.startDate || !t.endDate) return null;
  return Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 864e5) + 1;
}

export const tripPath = (locale: string, id?: string) => `${locale === "en" ? "" : `/${locale}`}/trips${id ? `/${id}` : ""}`;
