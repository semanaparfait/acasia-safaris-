import Navbar from "@/app/(user)/components/Navbar";
import Footer from "@/app/(user)/components/Footer";
import WhatsAppButton from "@/app/(user)/components/WhatsAppButton";

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
