"use client";

// "Request quotation" pop-up: get the package's PDF by download, WhatsApp or email.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { TourPackage } from "@/lib/types";
import { usePackagesStore } from "@/store/packagesStore";

const WHATSAPP_NUMBER = "250798635578";

const inputClass =
  "w-full bg-[#f7f5f0] border border-[#0a120b]/10 rounded-lg px-4 py-3 text-sm text-[#0a120b] placeholder:text-[#0a120b]/35 outline-none focus:border-[#c5a86d] focus:bg-white focus:ring-4 focus:ring-[#c5a86d]/15 transition-all";

function Option({
  icon,
  iconClass,
  title,
  text,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  text: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${iconClass}`}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-[#0a120b]">{title}</span>
        <span className="block text-xs text-[#0a120b]/55 mt-0.5">{text}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-[#0a120b]/30 group-hover:text-[#b69656] group-hover:translate-x-1 transition-all" />
    </>
  );
  const className =
    "group w-full flex items-center gap-4 text-left rounded-xl border border-[#0a120b]/10 bg-white p-3.5 hover:border-[#c5a86d] hover:shadow-md transition-all cursor-pointer";

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function QuotationModal({
  tour,
  open,
  onClose,
  onRequested,
}: {
  tour: TourPackage;
  open: boolean;
  onClose: () => void;
  onRequested: () => void; // the visitor chose how to get the quotation
}) {
  const emailQuotation = usePackagesStore((s) => s.emailQuotation);
  const [view, setView] = useState<"options" | "email" | "sent">("options");
  const [form, setForm] = useState({ name: "", email: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Close with Escape, and stop the page behind from scrolling
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

  // A new visit to the pop-up starts from the three options
  useEffect(() => {
    if (open) return;
    setView("options");
    setError("");
  }, [open]);

  if (!tour.quotation || typeof document === "undefined") return null;

  const fileName = `${tour.title} - Quotation.pdf`;
  const downloadHref = `${tour.quotation}?download=${encodeURIComponent(fileName)}`;
  const whatsappText = `Hello Acacia Safaris! I would like the quotation for "${tour.title}".\n\nQuotation: ${tour.quotation}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  const received = () => {
    onRequested();
    onClose();
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await emailQuotation(tour.id, { name: form.name.trim(), email: form.email.trim() });
      setView("sent");
      onRequested();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[#0a120b]/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quotation-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md max-h-full overflow-y-auto rounded-2xl bg-white shadow-2xl font-sans"
          >
            {/* Header: the package photo under a dark green veil */}
            <div className="relative overflow-hidden bg-[#12231a] px-6 pt-7 pb-6 text-white">
              {tour.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tour.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12231a] via-[#12231a]/70 to-[#12231a]/30" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute z-10 top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="relative">
                <span className="w-11 h-11 rounded-xl bg-[#c5a86d] text-[#0e1d16] flex items-center justify-center mb-4 shadow-lg">
                  <FileText size={21} />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-1.5">
                  Your quotation
                </p>
                <h2 id="quotation-title" className="font-serif text-xl leading-snug pr-6">
                  {tour.title}
                </h2>
              </div>
            </div>

            <div className="p-6">
              {view === "options" && (
                <>
                  <p className="text-sm text-[#0a120b]/60 leading-relaxed mb-4">
                    The full document: prices for adults and children, what is included and what is not. How would you like to receive it?
                  </p>
                  <div className="space-y-2.5">
                    <Option
                      icon={<Download size={20} />}
                      iconClass="bg-[#12231a] text-[#c5a86d]"
                      title="Download PDF"
                      text="Save it to your device now"
                      href={downloadHref}
                      onClick={received}
                    />
                    <Option
                      icon={<FaWhatsapp size={22} />}
                      iconClass="bg-[#25D366]/15 text-[#128C4B]"
                      title="Get it on WhatsApp"
                      text="Opens a chat with our team and the link"
                      href={whatsappHref}
                      onClick={received}
                    />
                    <Option
                      icon={<Mail size={20} />}
                      iconClass="bg-[#c5a86d]/20 text-[#94752f]"
                      title="Send to my email"
                      text="We will send it to your inbox"
                      onClick={() => setView("email")}
                    />
                  </div>
                </>
              )}

              {view === "email" && (
                <form onSubmit={sendEmail} className="space-y-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setView("options");
                      setError("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0a120b]/50 hover:text-[#0a120b] cursor-pointer"
                  >
                    <ArrowLeft size={14} /> All options
                  </button>
                  <input
                    required
                    autoFocus
                    aria-label="Your full name"
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                  <input
                    required
                    type="email"
                    aria-label="Your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  {error && <p className="text-xs text-red-600 leading-relaxed">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="group w-full inline-flex items-center justify-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-semibold text-sm px-6 py-3.5 rounded-lg shadow-md transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : null}
                    {sending ? "Sending…" : "Send my quotation"}
                    {!sending && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              )}

              {view === "sent" && (
                <div className="text-center py-3">
                  <span className="w-14 h-14 rounded-full bg-[#1F5A42]/10 text-[#1F5A42] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={28} />
                  </span>
                  <p className="font-serif text-lg mb-1">Quotation sent!</p>
                  <p className="text-sm text-[#0a120b]/55 mb-5">
                    Check your inbox at <span className="font-medium text-[#0a120b]">{form.email}</span>, and your spam folder if you do not see it.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-medium border border-[#0a120b]/15 hover:border-[#0a120b] px-6 py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#0a120b]/40 mt-5">
                <ShieldCheck size={13} /> Free, with no obligation to book
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
