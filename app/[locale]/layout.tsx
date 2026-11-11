// Every public page lives under /[locale] (en has no prefix: /tour, /fr/tour, /sw/tour).
// Gives the pages their language's texts (messages/*.json).
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Title and description in the page's language, with links to the other languages
// (search engines show each visitor the right one)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { en: "/", fr: "/fr", sw: "/sw", "x-default": "/" },
    },
    openGraph: { title: t("title"), description: t("description"), locale, siteName: "Acacia Safaris" },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
