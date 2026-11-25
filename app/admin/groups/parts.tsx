// Pieces shared by Admin > Groups and a group's page
import { CalendarCheck, Compass, MapPinned, UsersRound } from "lucide-react";
import type { TravelGroup, TravelGroupType } from "@/lib/types";

export const GROUP_TYPES: Record<TravelGroupType, { label: string; icon: typeof Compass; text: string }> = {
  trip: { label: "Special trip", icon: Compass, text: "Everyone booked on this trip" },
  departure: { label: "Group departure", icon: UsersRound, text: "Everyone who joined this departure" },
  package: { label: "Package", icon: CalendarCheck, text: "Everyone on this package starting the same day" },
  destination: { label: "Destination", icon: MapPinned, text: "Everyone going here starting the same day" },
};

// The page of a group (its key has ":" and may have spaces)
export const groupHref = (key: string) => `/admin/groups/${encodeURIComponent(key)}`;

// "20 – 26 Dec 2026"
export function groupDates(g: Pick<TravelGroup, "startDate" | "endDate">) {
  const f = (d: string, year = true) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(year ? { year: "numeric" } : {}), timeZone: "UTC" });
  return g.endDate && g.endDate !== g.startDate ? `${f(g.startDate, false)} – ${f(g.endDate)}` : f(g.startDate);
}

// Days until the group leaves: "in 12 days", "tomorrow", "on the trip now"
export function whenText(g: Pick<TravelGroup, "startDate" | "endDate">) {
  const today = new Date().toISOString().slice(0, 10);
  const days = Math.round((Date.parse(`${g.startDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (days > 1) return `in ${days} days`;
  if (days === 1) return "tomorrow";
  if (days === 0) return "today";
  if (g.endDate && g.endDate >= today) return "on the trip now";
  return "finished";
}

// "+250788123456" -> a WhatsApp chat with this person, the text already typed
export function whatsappTo(phone: string | null, text: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const LANG_NAMES = { en: "English", fr: "French", sw: "Swahili" } as const;
