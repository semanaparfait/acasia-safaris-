// Reading the API from the server (pages Google reads, the sitemap). The browser uses lib/api.ts.
// Answers are cached for 5 minutes, so a busy page does not call the backend every time.
import type { TourPackage, Trip } from "./types";
import { langQuery } from "./api";

// NEXT_PUBLIC_API_URL is the backend, e.g. https://api.example.com/api
const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

// The website's public address (sitemap, links Google shows, social previews)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acaciasafarisrwanda.com/").replace(/\/$/, "");

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 300 } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null; // backend unreachable: the page shows "not found" instead of crashing
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A published package in the page's language, or null
export async function getPackage(id: string, locale?: string) {
  if (!UUID.test(id)) return null;
  const pkg = await get<TourPackage>(`/packages/${id}${langQuery(locale)}`);
  return pkg?.active ? pkg : null;
}

// All published packages (empty when the backend cannot be reached)
export async function getPackages(locale?: string) {
  return (await get<TourPackage[]>(`/packages${langQuery(locale)}`)) ?? [];
}

// A published trip (Admin > Trips), or null
// A published trip (Admin > Trips) in the page's language, or null
export async function getTrip(id: string, locale?: string) {
  if (!UUID.test(id)) return null;
  return get<Trip>(`/trips/${id}${langQuery(locale)}`);
}

// Published trips that have not ended (empty when the backend cannot be reached)
export async function getTrips(locale?: string) {
  return (await get<Trip[]>(`/trips${langQuery(locale)}`)) ?? [];
}
