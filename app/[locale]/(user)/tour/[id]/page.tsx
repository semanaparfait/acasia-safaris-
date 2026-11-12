// A package's own page: /tour/<id>, /fr/tour/<id>, /sw/tour/<id>.
// Rendered on the server so Google reads the title, description and the structured data
// (TouristTrip with its price), and link previews show the package photo.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPackage, SITE_URL } from "@/lib/server-api";
import { packageRates } from "@/lib/helpers";
import PackagePage from "./PackagePage";

type Props = { params: Promise<{ locale: string; id: string }> };

const localePath = (locale: string, id: string) => `${locale === "en" ? "" : `/${locale}`}/tour/${id}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const pkg = await getPackage(id);
  if (!pkg) return {};
  const description = pkg.description.length > 160 ? `${pkg.description.slice(0, 157)}…` : pkg.description;
  return {
    title: `${pkg.title} | Acacia Safaris`,
    description,
    alternates: {
      canonical: localePath(locale, id),
      languages: { en: localePath("en", id), fr: localePath("fr", id), sw: localePath("sw", id), "x-default": localePath("en", id) },
    },
    openGraph: {
      title: pkg.title,
      description,
      images: pkg.image ? [{ url: pkg.image }] : undefined,
      type: "website",
      siteName: "Acacia Safaris",
    },
  };
}

export default async function TourPackagePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const pkg = await getPackage(id);
  if (!pkg) notFound();

  // Structured data (schema.org): Google can show the trip, its days and its price
  const adultPrice = packageRates(pkg)[0]?.price ?? pkg.price;
  const url = `${SITE_URL}${localePath(locale, id)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.description,
    url,
    image: pkg.image || undefined,
    touristType: pkg.category,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: pkg.itinerary.length,
      itemListElement: pkg.itinerary.map((day, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "TouristAttraction", name: day.title, description: day.description },
      })),
    },
    offers: {
      "@type": "Offer",
      price: adultPrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
      description: "Price per adult",
    },
    provider: {
      "@type": "TravelAgency",
      name: "Acacia Safaris Ltd",
      url: SITE_URL,
      telephone: "+250798635578",
      email: "info@acaciasafaris.com",
      address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so a package text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PackagePage tour={pkg} />
    </>
  );
}
