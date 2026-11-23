// Visitor statistics with Umami (https://umami.is): page views are counted automatically,
// and track() records the moments that matter (a booking sent, a WhatsApp chat opened…).
// Umami uses no cookies and stores no personal data, so no cookie banner is needed.
// Turned off until NEXT_PUBLIC_UMAMI_WEBSITE_ID is set (see components/Analytics.tsx).
// Never send names, emails or phone numbers here: only what happened and on what.

type UmamiData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: UmamiData) => void };
  }
}

export type TrackEvent =
  | "booking-sent" // the custom-trip form (booking page)
  | "package-booked" // "Book this package"
  | "trip-booked" // a special trip (/trips)
  | "trip-waitlist"
  | "whatsapp-open"
  | "tour-saved"
  | "tour-shared"
  | "faq-open";

export function track(event: TrackEvent, data?: UmamiData) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Statistics must never break the page
  }
}
