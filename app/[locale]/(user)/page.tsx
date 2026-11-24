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
import { getTrips } from "@/lib/server-api";

export default async function Home() {
  // Published trips with a start date still ahead: the countdown banner only shows when there is one
  const today = new Date().toISOString().slice(0, 10);
  const trips = (await getTrips()).filter((t) => t.startDate && t.startDate.slice(0, 10) >= today);

  return (
    <>
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
