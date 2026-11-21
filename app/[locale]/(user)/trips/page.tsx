// /trips, /fr/trips, /sw/trips: the special trips planned by the team (Admin > Trips).
// Rendered on the server so search engines read them; the menu only links here while one is published.
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTrips } from "@/lib/server-api";
import { tripPath } from "@/lib/trips";
import TripsList from "./TripsList";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Trips" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: tripPath(locale),
      languages: { en: tripPath("en"), fr: tripPath("fr"), sw: tripPath("sw"), "x-default": tripPath("en") },
    },
  };
}

export default async function TripsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const trips = await getTrips();
  return <TripsList trips={trips} />;
}
