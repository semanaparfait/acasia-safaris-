"use client";

// Save (heart) and share buttons for a package.
//   <SaveTourButton id={pkg.id} />                     the heart, on cards and the package page
//   <ShareTourButton title={pkg.title} path="/tour/…" />  the phone's share sheet, or WhatsApp
import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSavedTours } from "@/lib/savedTours";
import { track } from "@/lib/analytics";

// The saved list lives in the browser: wait for it before showing a full heart
// (false on the server and the first render, so the page matches what the server sent)
function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useSavedTours.persist.onFinishHydration(onChange),
    () => useSavedTours.persist.hasHydrated(),
    () => false,
  );
}

export function useSavedCount() {
  const ready = useHydrated();
  const count = useSavedTours((s) => s.ids.length);
  return ready ? count : 0;
}

export function useSavedIds() {
  const ready = useHydrated();
  const ids = useSavedTours((s) => s.ids);
  return { ids: ready ? ids : [], ready };
}

export function SaveTourButton({ id, className = "", label = false }: { id: string; className?: string; label?: boolean }) {
  const t = useTranslations("Saved");
  const ready = useHydrated();
  const saved = useSavedTours((s) => s.ids.includes(id)) && ready;
  const toggle = useSavedTours((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? t("unsave") : t("save")}
      title={saved ? t("unsave") : t("save")}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full transition active:scale-90 cursor-pointer ${className}`}
    >
      <Heart className={`size-4 transition-colors ${saved ? "fill-red-500 text-red-500" : ""}`} />
      {label && <span className="text-xs font-semibold">{saved ? t("saved") : t("save")}</span>}
    </button>
  );
}

export function ShareTourButton({ title, path, id, className = "" }: { title: string; path: string; id: string; className?: string }) {
  const t = useTranslations("Saved");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = () => `${window.location.origin}${locale === "en" ? "" : `/${locale}`}${path}`;

  const share = async () => {
    const link = url();
    // Phones: the system share sheet (WhatsApp, Messages, Instagram…)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: t("shareText", { title }), url: link });
        track("tour-shared", { package: id, via: "system" });
      } catch {
        // The visitor closed the sheet
      }
      return;
    }
    setOpen((o) => !o);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      track("tour-shared", { package: id, via: "copy" });
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    } catch {
      window.prompt(t("copyLink"), url()); // old browsers: the visitor copies it by hand
      setOpen(false);
    }
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={share}
        aria-label={t("share")}
        title={t("share")}
        aria-expanded={open}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full transition active:scale-90 cursor-pointer ${className}`}
      >
        <Share2 className="size-4" />
      </button>
      {open && (
        <span className="absolute right-0 top-full mt-2 z-30 w-48 rounded-xl border border-black/10 bg-white p-1.5 shadow-xl text-sm text-[#0a120b]">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${t("shareText", { title })} ${url()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track("tour-shared", { package: id, via: "whatsapp" });
              setOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#25D366]/10"
          >
            <FaWhatsapp className="size-4 text-[#25D366]" /> WhatsApp
          </a>
          <button type="button" onClick={copy} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 cursor-pointer">
            <Share2 className="size-4 text-[#8e7345]" /> {copied ? t("copied") : t("copyLink")}
          </button>
        </span>
      )}
    </span>
  );
}
