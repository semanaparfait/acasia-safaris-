// /faq: the questions travelers ask us most (texts in faqContent.ts).
// Rendered on the server, with FAQPage structured data so Google can show the answers.
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { FAQ } from "./faqContent";
import FaqList from "./FaqList";

type Props = { params: Promise<{ locale: string }> };

const langOf = (locale: string): Locale =>
  routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;

const path = (locale: string) => `${locale === "en" ? "" : `/${locale}`}/faq`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: path(locale),
      languages: { en: path("en"), fr: path("fr"), sw: path("sw"), "x-default": path("en") },
    },
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections = FAQ[langOf(locale)];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((s) =>
      s.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <FaqList sections={sections} />
    </>
  );
}
