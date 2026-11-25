// Every public page lives under /[locale] (en has no prefix: /tour, /fr/tour, /sw/tour).
// Gives the pages their language's texts (messages/*.json).
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

// Default title, description and link preview in the page's language
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    // Defaults: each page sets its own title, description and language links (lib/seo.ts)
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description"), siteName: "Acacia Safaris", images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image" },
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
