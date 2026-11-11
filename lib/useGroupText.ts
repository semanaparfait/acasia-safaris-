"use client";

// Price group names come from the package ("Adult", "Child", "16 years and over"…).
// The standard ones are translated (messages: Groups); names an admin made up stay as typed.
import { useTranslations } from "next-intl";

export function useGroupText() {
  // Keys are built from package data, so the translator is used without key checking
  const t = useTranslations("Groups") as unknown as {
    (key: string, values?: Record<string, string | number>): string;
    has: (key: string) => boolean;
  };
  const known = (key: string) => t.has(key);
  return {
    label: (label: string) => (known(label) ? t(label) : label),
    ages: (ages: string) => (known(ages) ? t(ages) : ages),
    // "2 adults", "1 child"; a made-up group: "2 × Students"
    count: (label: string, count: number) =>
      known(`${label}_n`) ? t(`${label}_n`, { count }) : t("count", { count, label }),
    travelers: (count: number) => t("travelers", { count }),
  };
}
