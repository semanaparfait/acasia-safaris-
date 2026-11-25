// A trip's own page: /trips/<id>, /fr/trips/<id>, /sw/trips/<id>.
// Rendered on the server so Google reads the trip, its price options and link previews show the photo.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTrip, SITE_URL } from "@/lib/server-api";
import { COMPANY } from "@/lib/company";
import { tripPath } from "@/lib/trips";
import TripPage from "./TripPage";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const trip = await getTrip(id, locale);
  if (!trip) return {};
  const text = trip.tagline ? `${trip.tagline}. ${trip.description}` : trip.description;
  const description = text.length > 160 ? `${text.slice(0, 157)}…` : text;
  return {
    title: `${trip.title} | Acacia Safaris`,
    description,
    alternates: {
      canonical: tripPath(locale, id),
      languages: { en: tripPath("en", id), fr: tripPath("fr", id), sw: tripPath("sw", id), "x-default": tripPath("en", id) },
    },
    openGraph: {
      title: trip.title,
      description,
      images: trip.images[0] ? [{ url: trip.images[0] }] : undefined,
      type: "website",
      siteName: "Acacia Safaris",
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const trip = await getTrip(id, locale);
  if (!trip) notFound();

  // Structured data (schema.org): the trip, its days and one offer per price option
  const url = `${SITE_URL}${tripPath(locale, id)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.description,
    url,
    image: trip.images.length ? trip.images : undefined,
    ...(trip.itinerary.length
      ? {
          itinerary: {
            "@type": "ItemList",
            numberOfItems: trip.itinerary.length,
            itemListElement: trip.itinerary.map((d, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "TouristAttraction", name: d.title, description: d.description },
            })),
          },
        }
      : {}),
    offers: trip.prices.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.price,
      priceCurrency: trip.currency,
      description: p.unit,
      availability: "https://schema.org/InStock",
      url,
      ...(trip.startDate ? { availabilityStarts: trip.startDate.slice(0, 10) } : {}),
    })),
    provider: {
      "@type": "TravelAgency",
      name: "Acacia Safaris Ltd",
      url: SITE_URL,
      telephone: COMPANY.phoneLink.replace("tel:", ""),
      email: "info@acaciasafarisrwanda.com",
      address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so a trip text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <TripPage trip={trip} url={url} />
    </>
  );
}
