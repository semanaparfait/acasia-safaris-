// /saved: the packages the visitor saved with the heart (kept in their browser)
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SavedTours from "./SavedTours";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Saved" });
  // Different for every visitor: nothing for search engines here
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function SavedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SavedTours />;
}
