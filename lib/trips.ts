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

// Currencies offered first in Admin > Trips (any other ISO code can be typed)
export const TRIP_CURRENCIES = ["RWF", "USD", "EUR", "GBP", "UGX", "KES", "TZS", "CAD"] as const;

// "RWF 100,000", "$1,450", "€99.50": in the trip's own currency
export function formatPrice(amount: number, currency: string, locale = "en-US") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`; // unknown code: shown as typed
  }
}

// What a booking costs before discounts: "per person" × travelers, "per couple" × couples, "per group" once
export function bookingSubtotal(b: { price: number; unit: string; travelers: number }) {
  const unit = b.unit.toLowerCase();
  if (unit.includes("group")) return b.price;
  if (unit.includes("couple")) return b.price * Math.ceil(b.travelers / 2);
  return b.price * b.travelers;
}

// The total after the discount (same as bookingTotal in backend/src/trips/trips.service.ts)
export function bookingTotal(b: { price: number; unit: string; travelers: number; discountPercent?: number | null }) {
  const total = bookingSubtotal(b) * (1 - (b.discountPercent ?? 0) / 100);
  return Number.isInteger(b.price) ? Math.round(total) : Math.round(total * 100) / 100;
}

type DiscountTrip = Pick<Trip, "earlyBirdPercent" | "earlyBirdUntil" | "groupPercent" | "groupMinTravelers">;

// The early bird deal while it lasts (the last day included), or null
export function earlyBird(trip: DiscountTrip, now = new Date()) {
  if (!trip.earlyBirdPercent || !trip.earlyBirdUntil) return null;
  return now.toISOString().slice(0, 10) <= trip.earlyBirdUntil.slice(0, 10) ? { percent: trip.earlyBirdPercent, until: trip.earlyBirdUntil } : null;
}

// The discount a booking would get now (the server works it out again when booking)
export function tripDiscount(trip: DiscountTrip, travelers: number, now = new Date()) {
  const early = earlyBird(trip, now);
  const group = trip.groupPercent && trip.groupMinTravelers && travelers >= trip.groupMinTravelers ? trip.groupPercent : 0;
  return { early: early?.percent ?? 0, group, percent: Math.min(90, (early?.percent ?? 0) + group) };
}
