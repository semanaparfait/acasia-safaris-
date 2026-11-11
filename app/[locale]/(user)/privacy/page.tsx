import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage from "../components/LegalPage";
import { PRIVACY } from "../components/legalContent";
import { routing, type Locale } from "@/i18n/routing";

// The text in each language is in components/legalContent.ts
type Props = { params: Promise<{ locale: string }> };

const langOf = (locale: string): Locale =>
  routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return { title: t("privacyMeta") };
}

export default async function PrivacyPolicy({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage doc={PRIVACY[langOf(locale)]} />;
}
