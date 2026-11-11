"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronRight, Mail, Menu, Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslations } from "next-intl";
import logo from "@/public/logo2.png";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { CurrencyPicker } from "@/components/ui/money";

// name = the text's key in messages/*.json (Nav)
const navLinks = [
  { name: "home", href: "/" },
  { name: "destinations", href: "/destination" },
  { name: "gallery", href: "/gallery" },
  { name: "tours", href: "/tour" },
  { name: "about", href: "/aboutus" },
  { name: "contact", href: "/contact" },
] as const;

const PHONE = "+250 798 635 578";
const WHATSAPP = "250798635578";
const EMAIL = "info@acaciasafaris.com";

export default function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname(); // without the language: "/tour" also on /fr/tour
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the phone menu when the page changes (also with the back button)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  const solid = isScrolled || pathname === "/contact";

  return (
    <header className={pathname === "/booking" ? "hidden" : ""}>
      <div
        className={`fixed left-0 top-0 w-full z-50 transition-all duration-500 ease-in-out ${
          solid ? "bg-[#0a120b]/90 backdrop-blur-xl shadow-2xl py-1 lg:py-3" : "bg-gradient-to-b from-black/50 to-transparent lg:bg-none py-2 lg:py-4"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 lg:h-auto">
          <Link href="/" className="flex items-center shrink-0" aria-label={t("home_aria")}>
            <Image src={logo} alt="Acacia Safaris" width={60} height={60} priority className="w-12 h-12 lg:w-[60px] lg:h-[60px] object-contain" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className={`text-[13px] font-bold uppercase tracking-[2px] transition-colors ${
                      active
                        ? "text-(--accent-gold) underline underline-offset-8 decoration-2 decoration-(--accent-gold)"
                        : "text-white/90 hover:text-(--accent-gold)"
                    }`}
                  >
                    {t(link.name)}
                  </Link>
                  {!active && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Desktop: language and currency */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSwitcher dark compact />
              <CurrencyPicker dark compact />
            </div>
            <Link
              href="/booking"
              className="hidden sm:inline-flex items-center gap-1.5 bg-(--accent-gold) hover:brightness-110 text-[#0e1d16] lg:text-white px-4 lg:px-7 py-2 lg:py-3 rounded-full lg:rounded-lg text-[11px] lg:text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-black/20 transition-all lg:hover:-translate-y-1 active:scale-95"
            >
              {t("planTrip")}
            </Link>

            {/* Phone menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              className="lg:hidden w-10 h-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </header>
  );
}

// The phone menu: a panel that slides in from the right, over a dark backdrop.
// Rendered in <body> so the blurred header cannot cut it off.
function MobileMenu({ open, onClose, isActive }: { open: boolean; onClose: () => void; isActive: (href: string) => boolean }) {
  const t = useTranslations("Nav");
  // Esc closes it, and the page behind does not scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[110] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.nav
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute right-0 inset-y-0 w-[86%] max-w-sm bg-[#0a120b] text-white flex flex-col shadow-2xl"
          >
            {/* Top */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
              <Link href="/" onClick={onClose} className="flex items-center">
                <span className="font-serif text-[15px] tracking-[0.25em]">
                  ACACIA <span className="text-(--accent-gold)">SAFARIS</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("closeMenu")}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X size={19} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">{t("explore")}</p>
              <ul className="space-y-1">
                {navLinks.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                          active ? "bg-white/[0.07]" : "active:bg-white/5"
                        }`}
                      >
                        <span className={`w-1 h-6 rounded-full ${active ? "bg-(--accent-gold)" : "bg-transparent"}`} />
                        <span className={`flex-1 text-[17px] font-medium ${active ? "text-(--accent-gold)" : "text-white/90"}`}>
                          {t(link.name)}
                        </span>
                        <ChevronRight size={18} className={active ? "text-(--accent-gold)" : "text-white/25"} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Contact */}
              <p className="px-3 mt-7 mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">{t("language")} · {t("currency")}</p>
              <div className="flex gap-2 px-3">
                <LanguageSwitcher dark className="flex-1 py-2.5" />
                <CurrencyPicker dark className="flex-1 py-2.5" />
              </div>

              <p className="px-3 mt-7 mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">{t("talkToUs")}</p>
              <div className="space-y-1">
                <ContactRow href={`https://wa.me/${WHATSAPP}`} icon={<FaWhatsapp size={17} />} iconClass="bg-[#25D366]/15 text-[#25D366]" label={t("whatsapp")} value={t("whatsappValue")} external />
                <ContactRow href={`tel:${PHONE.replace(/\s/g, "")}`} icon={<Phone size={16} />} iconClass="bg-white/10 text-(--accent-gold)" label={t("callUs")} value={PHONE} />
                <ContactRow href={`mailto:${EMAIL}`} icon={<Mail size={16} />} iconClass="bg-white/10 text-(--accent-gold)" label={t("email")} value={EMAIL} />
              </div>
            </div>

            {/* Call to action */}
            <div className="p-5 border-t border-white/10 bg-[#0d1a11]">
              <Link
                href="/booking"
                onClick={onClose}
                className="group w-full inline-flex items-center justify-center gap-2 bg-(--accent-gold) text-[#0e1d16] font-bold text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
              >
                {t("planYourTrip")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-3 text-center text-[11px] text-white/40">{t("planNote")}</p>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ContactRow({
  href,
  icon,
  iconClass,
  label,
  value,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 active:bg-white/5 transition-colors"
    >
      <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${iconClass}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] text-white/45">{label}</span>
        <span className="block text-sm text-white/90 truncate">{value}</span>
      </span>
      {external && <ArrowUpRight size={15} className="text-white/25" />}
    </a>
  );
}
