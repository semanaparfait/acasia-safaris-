"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "250798635578"; // country code + number, digits only

export default function WhatsAppButton() {
  const t = useTranslations("WhatsApp");
  const pathname = usePathname(); // without the language: "/booking" also on /fr/booking
  // The first message is written in the visitor's language
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("message"))}`;

  // The booking page already has its own WhatsApp help box
  if (pathname === "/booking") return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("aria")}
      className="group fixed z-[90] bottom-5 right-5 sm:bottom-6 sm:right-6 flex items-center gap-3"
    >
      <span className="hidden sm:block opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-white text-[#12231a] text-sm font-medium px-4 py-2 rounded-full shadow-lg">
        {t("chat")}
      </span>
      <span className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <FaWhatsapp size={30} className="relative" />
      </span>
    </a>
  );
}
