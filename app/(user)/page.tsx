import HeroVideo from "@/app/(user)/components/HeroVideo";
import TrustStrip from "@/app/(user)/components/TrustStrip";
import Experience from "@/app/(user)/components/Experience";
import PopularPackages from "@/app/(user)/components/PopularPackages";
import AboutUs from "@/app/(user)/components/AboutUs";
import WhyChooseUs from "@/app/(user)/components/WhyChooseUs";
import GoodToKnow from "@/app/(user)/components/GoodToKnow";
import GalleryStrip from "@/app/(user)/components/GalleryStrip";
import Testimonials from "@/app/(user)/components/Testimonials";

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
