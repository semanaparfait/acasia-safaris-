// /sitemap.xml: every public page in English, French and Swahili, and every published
// package, so search engines find them all. Packages are read from the API (cached 5 minutes).
import type { MetadataRoute } from "next";
import { getPackages, SITE_URL } from "@/lib/server-api";

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
  const packages = await getPackages();
  return [
    ...PAGES.flatMap((path) => entries(path, undefined, path === "" ? 1 : 0.7)),
    ...packages.flatMap((p) => entries(`/tour/${p.id}`, undefined, 0.9)),
  ];
}

// Rebuilt at most every hour
export const revalidate = 3600;
