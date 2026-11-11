// The website's languages. English keeps the normal addresses (/tour);
// French and Swahili get their own (/fr/tour, /sw/tour) so search engines index each one.
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "sw"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  sw: "Kiswahili",
};
