"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

// TODO: replace with the real WhatsApp number (country code + number, digits only)
const WHATSAPP_NUMBER = "250798635578";
const MESSAGE = "Hello Acasia Safaris! I'd like to plan a trip to Rwanda.";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  // The booking page already has its own WhatsApp help box
  if (pathname === "/booking") return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed z-[90] bottom-5 right-5 sm:bottom-6 sm:right-6 flex items-center gap-3"
    >
      <span className="hidden sm:block opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-white text-[#12231a] text-sm font-medium px-4 py-2 rounded-full shadow-lg">
        Chat with us
      </span>
      <span className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <FaWhatsapp size={30} className="relative" />
      </span>
    </a>
  );
}
