import Footer from "@/app/(user)/components/Footer";
import Navbar from "@/app/(user)/components/Navbar";
// import Hero from "@/app/(user)/components/Hero";
import Hero2 from "@/app/(user)/components/Hero2";
import HeroVideo from "@/app/(user)/components/HeroVideo";
import Tours from "@/app/(user)/components/Tours";
// import Experience from "@/app/(user)/components/Experience";
import AboutUs from "@/app/(user)/components/AboutUs";
import WhyChooseUs from "@/app/(user)/components/WhyChooseUs";
import Testimonials from "@/app/(user)/components/Testimonials";
import Gallery from "@/app/(user)/components/Gallery";
import Experience from "./(user)/components/Experience";


export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      {/* <Hero2 /> */}
      <HeroVideo />
      {/* <Tours /> */}
      <Experience />
      <AboutUs />
      <WhyChooseUs />
      <Gallery />
      <Testimonials />
      {/* <Footer /> */}
    </>
  );
}
