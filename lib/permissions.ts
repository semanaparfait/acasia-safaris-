// What each admin may open in the admin panel. Same list as the server:
// backend/src/common/permissions.ts (which checks every request; this only shapes the panel).
// The main admin (isOwner) has everything and gives the access in Admin > Workers > Edit.
import type { Worker } from "./types";

export const PERMISSIONS = [
  { key: "statistics", label: "Statistics", text: "Website visitors and where they come from" },
  { key: "bookings", label: "Bookings & customers", text: "Bookings, payments, customers, chats with customers, dashboard figures" },
  { key: "calendar", label: "Calendar", text: "The calendar, reminders and the morning agenda email" },
  { key: "departures", label: "Departures", text: "Group departures" },
  { key: "checkin", label: "Check-in", text: "Scanning tickets on the day of the trip" },
  { key: "messages", label: "Messages", text: "Messages from the website's contact form" },
  { key: "packages", label: "Tour packages & quotations", text: "Packages, their translations and quotation PDFs" },
  { key: "trips", label: "Trips", text: "Special trips, their bookings and waitlists" },
  { key: "destinations", label: "Destinations", text: "Destinations and their translations" },
  { key: "reviews", label: "Reviews", text: "Publishing or hiding reviews" },
  { key: "gallery", label: "Gallery", text: "Photos on the gallery page" },
  { key: "workers", label: "Workers & roles", text: "The team list and job roles (admin access stays with the main admin)" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["key"];
export const ALL_PERMISSIONS: Permission[] = PERMISSIONS.map((p) => p.key);

type Who = Pick<Worker, "isOwner" | "permissions"> | null | undefined;

// May this admin open that area? (any one of the keys)
export function can(worker: Who, ...keys: Permission[]) {
  if (!worker) return false;
  if (worker.isOwner) return true;
  return keys.some((k) => worker.permissions?.includes(k));
}

// The admin pages and the access each one needs (any one of them). Pages not listed
// (dashboard, settings) are open to every admin; "owner" = the main admin only.
const PAGES: [prefix: string, needs: Permission[] | "owner"][] = [
  ["/admin/statistics", ["statistics"]],
  ["/admin/calendar", ["calendar"]],
  ["/admin/bookings", ["bookings"]],
  ["/admin/customers", ["bookings"]],
  ["/admin/departures", ["departures"]],
  ["/admin/check-in", ["checkin"]],
  ["/admin/messages", ["messages", "bookings"]],
  ["/admin/packages", ["packages"]],
  ["/admin/quotations", ["packages"]],
  ["/admin/trips", ["trips"]],
  ["/admin/destinations", ["destinations"]],
  ["/admin/reviews", ["reviews"]],
  ["/admin/gallery", ["gallery"]],
  ["/admin/workers", ["workers"]],
  ["/admin/roles", ["workers"]],
  ["/admin/activity", "owner"],
  ["/admin/backups", "owner"],
];

export function canOpenPage(worker: Who, pathname: string) {
  const page = PAGES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!page) return true;
  const [, needs] = page;
  if (needs === "owner") return Boolean(worker?.isOwner);
  return can(worker, ...needs);
}
