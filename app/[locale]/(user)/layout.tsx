import Navbar from "@/app/[locale]/(user)/components/Navbar";
import Footer from "@/app/[locale]/(user)/components/Footer";
import WhatsAppButton from "@/app/[locale]/(user)/components/WhatsAppButton";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
