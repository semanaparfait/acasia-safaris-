"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import logo from "@/public/logo2.png";
import { Link } from "@/i18n/navigation";
import SocialLinks from "@/components/SocialLinks";
import { useMessagesStore } from "@/store/messagesStore";
import { COMPANY } from "@/lib/company";


// name = the text's key in messages/*.json ("Nav.home", "Footer.bookSafari"…)
const exploreLinks = [
  { name: "Nav.home", href: "/" },
  { name: "Nav.destinations", href: "/destination" },
  { name: "Nav.tours", href: "/tour" },
  { name: "Nav.gallery", href: "/gallery" },
];

const companyLinks = [
  { name: "Nav.about", href: "/aboutus" },
  { name: "Footer.bookSafari", href: "/booking" },
  { name: "Footer.contactUs", href: "/contact" },
];

// Country codes: the names come in the page's language ("Tanzanie" in French)
const destinations = ["RW", "UG", "KE", "TZ"];

const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();
  const countries = new Intl.DisplayNames([locale], { type: "region" });
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const [subscribing, setSubscribing] = useState(false);

  // Saved in Admin > Messages ("Newsletter"), so the team has the list of subscribers
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      await sendMessage({
        name: "Newsletter subscriber",
        email: email.trim(),
        subject: "Newsletter subscription",
        body: `Please add ${email.trim()} to the newsletter (website language: ${locale}).`,
        source: "Newsletter",
      });
      setSubscribed(true);
      setEmail("");
    } catch {
      // Could not be saved: the visitor can try again
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#0a1811] text-white font-sans">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-2">
              {t("Footer.ready")}
            </span>
            <h3 className="text-2xl md:text-3xl font-serif uppercase tracking-wide">
              {t("Footer.headline")}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md transition-all duration-300"
            >
              {t("Footer.bookSafari")}
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 hover:border-white bg-white/5 hover:bg-white/10 text-white text-sm px-7 py-3 rounded-sm transition-all duration-300"
            >
              {t("Footer.contactUs")}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                alt="acacia Safaris Logo"
                width={56}
                height={56}
              />
              <span className="text-xl font-serif uppercase tracking-[0.15em]">
                acacia <span className="text-[#c5a86d]">Safaris</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              {t("Footer.about")}
            </p>
            <SocialLinks linkClassName="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#0e1d16] hover:border-[#c5a86d] transition-all duration-300 hover:-translate-y-1" />
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-6">
              {t("Footer.explore")}
            </h4>
            <ul className="space-y-3.5 text-sm text-zinc-400">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#c5a86d] transition-colors"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-6">
              {t("Footer.company")}
            </h4>
            <ul className="space-y-3.5 text-sm text-zinc-400">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#c5a86d] transition-colors"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & newsletter */}
          <div className="md:col-span-2 lg:col-span-4 space-y-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d]">
              {t("Footer.stayInTouch")}
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <a
                  href={COMPANY.phoneLink}
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Phone size={16} className="text-[#c5a86d] shrink-0" />
                  +250 798 635 578
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@acaciasafaris.com"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Mail size={16} className="text-[#c5a86d] shrink-0" />
                  info@acaciasafaris.com
                </a>
              </li>
              <li>
                <Link
                  href="/contact#map"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <MapPin size={16} className="text-[#c5a86d] shrink-0" />
                  {t("Footer.location")}
                </Link>
              </li>
            </ul>

            <div>
              <p className="text-sm text-zinc-400 mb-3">
                {t("Footer.newsletter")}
              </p>
              {subscribed ? (
                <p className="flex items-center gap-2 text-sm text-[#c5a86d] py-3.5">
                  <CheckCircle2 size={18} /> {t("Footer.thanks")}
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <label htmlFor="footer-email" className="sr-only">
                    {t("Footer.emailLabel")}
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("Footer.emailPlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-3.5 pl-5 pr-14 text-sm placeholder:text-zinc-500 outline-none focus:border-[#c5a86d] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    aria-label={t("Footer.subscribe")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] flex items-center justify-center transition-colors"
                  >
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Destinations row */}
        <div className="py-8 border-b border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            {t("Footer.destinations")}
          </span>
          {destinations.map((country) => (
            <Link
              key={country}
              href="/destination"
              className="text-sm text-zinc-400 hover:text-[#c5a86d] transition-colors"
            >
              {countries.of(country)}
            </Link>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-zinc-500 text-xs tracking-widest uppercase text-center md:text-left">
              {t("Footer.rights", { year: currentYear })}
            </p>
            <div className="flex items-center gap-5 text-xs text-zinc-400">
              <Link
                href="/privacy"
                className="hover:text-[#c5a86d] transition-colors"
              >
                {t("Footer.privacy")}
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <Link
                href="/terms"
                className="hover:text-[#c5a86d] transition-colors"
              >
                {t("Footer.terms")}
              </Link>
            </div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            {t("Footer.backToTop")}
            <span className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16] group-hover:border-[#c5a86d] transition-all">
              <ArrowUp size={15} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
