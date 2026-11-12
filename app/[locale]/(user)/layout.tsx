import { useTranslations } from "next-intl";
import Navbar from "@/app/[locale]/(user)/components/Navbar";
import Footer from "@/app/[locale]/(user)/components/Footer";
import WhatsAppButton from "@/app/[locale]/(user)/components/WhatsAppButton";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations("Common");
  return (
    <>
      {/* Keyboard and screen-reader users can jump past the menu (appears on Tab) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[#c5a86d] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#0e1d16] focus:shadow-lg"
      >
        {t("skip")}
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
