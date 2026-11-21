// /sitemap.xml: every public page in English, French and Swahili, and every published
// package, so search engines find them all. Packages are read from the API (cached 5 minutes).
import type { MetadataRoute } from "next";
import { getPackages, getTrips, SITE_URL } from "@/lib/server-api";

const PAGES = ["", "/destination", "/tour", "/gallery", "/aboutus", "/contact", "/booking", "/privacy", "/terms"];
const LOCALES = ["en", "fr", "sw"] as const;

const url = (locale: string, path: string) => `${SITE_URL}${locale === "en" ? "" : `/${locale}`}${path}`;

// Each page once per language, each listing its other languages
function entries(path: string, lastModified?: Date, priority = 0.7): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, url(l, path)]));
  return LOCALES.map((locale) => ({
    url: url(locale, path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packages, trips] = await Promise.all([getPackages(), getTrips()]);
  return [
    // The trips list only exists while a trip is published
    ...(trips.length ? entries("/trips", undefined, 0.8) : []),
    ...trips.flatMap((t) => entries(`/trips/${t.id}`, new Date(t.updatedAt), 0.9)),
    ...PAGES.flatMap((path) => entries(path, undefined, path === "" ? 1 : 0.7)),
    ...packages.flatMap((p) => entries(`/tour/${p.id}`, undefined, 0.9)),
  ];
}

// Rebuilt at most every hour
export const revalidate = 3600;
