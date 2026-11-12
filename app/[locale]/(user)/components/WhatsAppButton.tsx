"use client";

// The green chat button (bottom right). It opens a small card with quick replies; each one
// opens WhatsApp with a ready message in the visitor's language. On a package, the first
// reply is about that package (name, days and link), so the team knows at once what to answer.
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { X, ChevronRight } from "lucide-react";
import { useWhatsAppTopic, whatsappLink } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  const t = useTranslations("WhatsApp");
  const tc = useTranslations("Common");
  const pathname = usePathname(); // without the language: "/booking" also on /fr/booking
  const topic = useWhatsAppTopic((s) => s.topic);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Escape or a click outside closes the card
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // The booking page already has its own WhatsApp help box
  if (pathname === "/booking") return null;

  const replies = [
    ...(topic
      ? [{
          key: "trip",
          label: t("topics.trip", { title: topic.title }),
          message: t("messages.trip", { title: topic.title, days: tc("days", { count: topic.days }), url: topic.url }),
        }]
      : []),
    { key: "gorilla", label: t("topics.gorilla"), message: t("messages.gorilla") },
    { key: "custom", label: t("topics.custom"), message: t("messages.custom") },
    { key: "prices", label: t("topics.prices"), message: t("messages.prices") },
    { key: "other", label: t("topics.other"), message: t("message") },
  ];

  return (
    <div className="fixed z-[90] bottom-5 right-5 sm:bottom-6 sm:right-6 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          id="whatsapp-card"
          role="dialog"
          aria-label={t("aria")}
          className="w-[min(340px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        >
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <FaWhatsapp size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t("title")}</p>
              <p className="truncate text-[11px] text-white/75">{t("status")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="rounded-full p-1.5 hover:bg-white/15 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="bg-[#ECE5DD] px-4 py-4">
            <p className="max-w-[85%] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-sm text-[#0a120b] shadow-sm">
              {t("greeting")}
            </p>
            <p className="mt-3 mb-2 text-[11px] text-[#0a120b]/55">{t("choose")}</p>
            <ul className="space-y-1.5">
              {replies.map((r) => (
                <li key={r.key}>
                  <a
                    href={whatsappLink(r.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-[#25D366]/30 bg-white px-3 py-2 text-sm font-medium text-[#075E54] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10 focus-visible:outline-2 focus-visible:outline-[#25D366]"
                  >
                    <span className="min-w-0 truncate">{r.label}</span>
                    <ChevronRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-[10px] text-[#0a120b]/45">{t("note")}</p>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("aria")}
        aria-expanded={open}
        aria-controls="whatsapp-card"
        className="group flex items-center gap-3 cursor-pointer"
      >
        {!open && (
          <span className="hidden sm:block opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-white text-[#12231a] text-sm font-medium px-4 py-2 rounded-full shadow-lg">
            {t("chat")}
          </span>
        )}
        <span className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
          {!open && <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 motion-reduce:hidden" />}
          {open ? <X size={26} className="relative" /> : <FaWhatsapp size={30} className="relative" />}
        </span>
      </button>
    </div>
  );
}
