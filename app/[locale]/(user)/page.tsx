import HeroVideo from "@/app/[locale]/(user)/components/HeroVideo";
import TrustStrip from "@/app/[locale]/(user)/components/TrustStrip";
import Experience from "@/app/[locale]/(user)/components/Experience";
import PopularPackages from "@/app/[locale]/(user)/components/PopularPackages";
import AboutUs from "@/app/[locale]/(user)/components/AboutUs";
import WhyChooseUs from "@/app/[locale]/(user)/components/WhyChooseUs";
import GoodToKnow from "@/app/[locale]/(user)/components/GoodToKnow";
import GalleryStrip from "@/app/[locale]/(user)/components/GalleryStrip";
import Testimonials from "@/app/[locale]/(user)/components/Testimonials";

export default function Home() {
  return (
    <>
      <HeroVideo />
      <TrustStrip />
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
