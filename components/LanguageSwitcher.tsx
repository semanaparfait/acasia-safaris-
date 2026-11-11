"use client";

// EN / FR / SW: stays on the same page (and keeps ?package=… etc.), in another language.
// next-intl remembers the choice in a cookie for the next visit.
import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LANGUAGE_NAMES, routing, type Locale } from "@/i18n/routing";

// compact: only the code ("FR") in the closed menu, for the desktop navbar
export default function LanguageSwitcher({ className = "", dark = false, compact = false }: { className?: string; dark?: boolean; compact?: boolean }) {
  const t = useTranslations("Nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    // Read at the click (not useSearchParams, which would stop pages from being prebuilt)
    const query = Object.fromEntries(new URLSearchParams(window.location.search));
    startTransition(() => router.replace({ pathname, query }, { locale: next }));
  };

  return (
    <select
      aria-label={t("language")}
      value={locale}
      disabled={pending}
      onChange={(e) => change(e.target.value as Locale)}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer disabled:opacity-60 ${
        dark ? "border-white/20 bg-white/10 text-white [&>option]:text-[#0a120b]" : "border-[#0a120b]/15 bg-white text-[#0a120b]"
      } ${className}`}
    >
      {routing.locales.map((l) => (
        <option key={l} value={l} title={LANGUAGE_NAMES[l]}>
          {compact ? l.toUpperCase() : `${l.toUpperCase()} · ${LANGUAGE_NAMES[l]}`}
        </option>
      ))}
    </select>
  );
}
