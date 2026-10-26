// Small helpers shared by the website and the admin panel.
import type React from "react";
import { Gem, Landmark, MapPin, Mountain, PawPrint, Trees, Waves, Zap } from "lucide-react";
import type { Booking, Message, Review, TourPackage } from "./types";

// ---------- Money ----------

// 2450 -> "$2,450"
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// ---------- Packages ----------

export const packageCategories = ["Gorilla Trekking", "Wildlife Safari", "Luxury Escapes", "Cultural Tours"];

// The duration of a package is the number of itinerary days
export const packageDays = (p: TourPackage) => p.itinerary.length;

// 7 -> "7 Days", 1 -> "1 Day"
export const daysLabel = (p: TourPackage) => {
  const n = packageDays(p);
  return `${n} ${n === 1 ? "Day" : "Days"}`;
};

// Link to the Tours page with a category or package open:
//   tourHref({ package: "7-day-gorilla" })  ->  "/tour?package=7-day-gorilla"
export const tourHref = (opts: { category?: string; package?: string } = {}) => {
  const params = new URLSearchParams();
  if (opts.category && opts.category !== "All Packages") params.set("category", opts.category);
  if (opts.package) params.set("package", opts.package);
  const query = params.toString();
  return query ? `/tour?${query}` : "/tour";
};

// ---------- Destinations ----------

export const destinationGroups = ["Wildlife", "Nature", "Culture", "Adventure", "Luxury"];

// Icon shown next to a destination's group
const groupIcons: Record<string, React.ElementType> = {
  Wildlife: PawPrint,
  Nature: Trees,
  Culture: Landmark,
  Adventure: Zap,
  Luxury: Gem,
  Lakes: Waves,
  Mountains: Mountain,
};
export const groupIcon = (group: string) => groupIcons[group] ?? MapPin;

// ---------- Customers ----------

export type Customer = {
  email: string;
  name: string;
  phone: string | null;
  country: string;
  trips: number;
  spent: number;
  joined: string; // date of the first booking
};

// Customers are not stored separately: they are worked out from the bookings,
// one customer per email address.
export function customersFromBookings(bookings: Booking[]): Customer[] {
  const byEmail = new Map<string, Customer>();

  for (const b of bookings) {
    const key = b.email.toLowerCase();
    const existing = byEmail.get(key);
    const counts = b.status !== "Cancelled";

    if (!existing) {
      byEmail.set(key, {
        email: b.email,
        name: b.customer,
        phone: b.phone ?? null,
        country: b.country,
        trips: counts ? 1 : 0,
        spent: counts ? b.amount : 0,
        joined: b.createdAt,
      });
    } else {
      if (counts) {
        existing.trips += 1;
        existing.spent += b.amount;
      }
      if (b.createdAt < existing.joined) existing.joined = b.createdAt;
      existing.phone ??= b.phone ?? null;
    }
  }
  return [...byEmail.values()];
}

// ---------- Recent activity (dashboard + notifications) ----------

export type Activity = {
  id: string;
  type: "booking" | "cancel" | "message" | "review";
  text: string;
  date: string;
};

// Newest events first, built from the real bookings, messages and reviews
export function recentActivity(bookings: Booking[], messages: Message[], reviews: Review[], limit = 8): Activity[] {
  const events: Activity[] = [
    ...bookings.map((b) => ({
      id: `b${b.id}`,
      type: b.status === "Cancelled" ? ("cancel" as const) : ("booking" as const),
      text:
        b.status === "Cancelled"
          ? `Booking #${b.id} by ${b.customer} was cancelled`
          : `New booking from ${b.customer}${b.package ? ` · ${b.package.title}` : ""}`,
      date: b.createdAt,
    })),
    ...messages.map((m) => ({
      id: `m${m.id}`,
      type: "message" as const,
      text: `${m.source === "Booking request" ? "Trip request" : "Message"} from ${m.name}: ${m.subject}`,
      date: m.receivedAt,
    })),
    ...reviews.map((r) => ({
      id: `r${r.id}`,
      type: "review" as const,
      text: `${r.name} left a ${r.rating}★ review`,
      date: r.createdAt,
    })),
  ];
  return events.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
