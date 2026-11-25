import HeroVideo from "@/app/[locale]/(user)/components/HeroVideo";
import TrustStrip from "@/app/[locale]/(user)/components/TrustStrip";
import TripCountdown from "@/app/[locale]/(user)/components/TripCountdown";
import Experience from "@/app/[locale]/(user)/components/Experience";
import PopularPackages from "@/app/[locale]/(user)/components/PopularPackages";
import AboutUs from "@/app/[locale]/(user)/components/AboutUs";
import WhyChooseUs from "@/app/[locale]/(user)/components/WhyChooseUs";
import GoodToKnow from "@/app/[locale]/(user)/components/GoodToKnow";
import GalleryStrip from "@/app/[locale]/(user)/components/GalleryStrip";
import Testimonials from "@/app/[locale]/(user)/components/Testimonials";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTrips, SITE_URL } from "@/lib/server-api";
import { pageMetadata } from "@/lib/seo";
import { COMPANY, COMPANY_LEGAL, activeSocials } from "@/lib/company";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "", title: t("title"), description: t("description") });
}

// Who Acacia is, for Google (company panel, contact details, social profiles)
function companyData() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Acacia Safaris",
    legalName: COMPANY_LEGAL.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpeg`,
    image: `${SITE_URL}/og-image.jpg`,
    email: COMPANY.email,
    telephone: COMPANY.phone.replace(/\s/g, ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_LEGAL.address.replace(/,?\s*Kigali.*$/i, "") || undefined,
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
    areaServed: ["Rwanda", "Uganda", "Tanzania", "Kenya"],
    ...(COMPANY_LEGAL.registrationNumber ? { taxID: COMPANY_LEGAL.registrationNumber } : {}),
    sameAs: activeSocials().map(([, href]) => href),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Published trips with a start date still ahead (in the page's language): the countdown
  // banner only shows when there is one
  const today = new Date().toISOString().slice(0, 10);
  const trips = (await getTrips(locale)).filter((t) => t.startDate && t.startDate.slice(0, 10) >= today);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(companyData()) }} />
      <HeroVideo />
      <TrustStrip />
      {trips.length > 0 && <TripCountdown trips={trips} />}
      <Experience />
      <PopularPackages />
      <AboutUs />
      <WhyChooseUs />
      <GoodToKnow />
      <GalleryStrip />
      <Testimonials />
    </>
  );
}
