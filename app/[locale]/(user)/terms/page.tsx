import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage from "../components/LegalPage";
import { TERMS } from "../components/legalContent";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

// The text in each language is in components/legalContent.ts
type Props = { params: Promise<{ locale: string }> };

const langOf = (locale: string): Locale =>
  routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  const seo = await getTranslations({ locale, namespace: "Seo.terms" });
  return pageMetadata({ locale, path: "/terms", title: t("termsMeta"), description: seo("description") });
}

export default async function TermsOfService({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage doc={TERMS[langOf(locale)]} />;
}
