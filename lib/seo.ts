// What search engines and link previews read for a page: its title, description, its address
// in each language (so Google shows French visitors the French page) and the preview card.
//   export const generateMetadata = ... pageMetadata({ locale, path: "/contact", title, description })
import type { Metadata } from "next";

export const LOCALES = ["en", "fr", "sw"] as const;

// "/contact" in each language: /contact, /fr/contact, /sw/contact ("" = the home page)
export const localePath = (locale: string, path: string) => `${locale === "en" ? "" : `/${locale}`}${path}` || "/";

// Link previews (WhatsApp, Facebook, LinkedIn) want a language and country
const OG_LOCALE: Record<string, string> = { en: "en_US", fr: "fr_FR", sw: "sw_KE" };

// The picture shown when a page is shared, unless the page has its own (a package photo…)
export const DEFAULT_OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "Acacia Safaris: gorilla trekking & safaris in Rwanda" };

export function pageMetadata({
  locale,
  path,
  title,
  description,
  images,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
}): Metadata {
  const url = localePath(locale, path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
        "x-default": localePath("en", path),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Acacia Safaris",
      locale: OG_LOCALE[locale] ?? OG_LOCALE.en,
      url,
      title,
      description,
      images: images ?? [DEFAULT_OG_IMAGE],
    },
  };
}
