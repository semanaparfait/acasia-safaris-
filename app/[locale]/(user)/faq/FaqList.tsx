"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { whatsappLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import type { FaqSection } from "./faqContent";

export default function FaqList({ sections }: { sections: FaqSection[] }) {
  const t = useTranslations("Faq");
  return (
    <div className="bg-[#faf8f5] min-h-screen font-sans text-[#0a120b]">
      <section className="bg-[#12231a] text-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-2">{t("eyebrow")}</p>
          <h1 className="font-serif text-3xl sm:text-5xl">{t("title")}</h1>
          <p className="text-sm text-white/65 mt-4 max-w-xl leading-relaxed">{t("subtitle")}</p>
          {/* Jump to a topic */}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label={t("topics")}>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85 hover:border-[#c5a86d] hover:text-[#c5a86d] transition"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12 space-y-12">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="font-serif text-2xl text-[#12231a] mb-4">{s.title}</h2>
            <div className="space-y-3">
              {s.items.map((item) => (
                <details
                  key={item.q}
                  onToggle={(e) => {
                    if ((e.currentTarget as HTMLDetailsElement).open) track("faq-open", { question: `${s.id}: ${item.q}`.slice(0, 200) });
                  }}
                  className="group rounded-2xl bg-white border border-[#0a120b]/[0.07] shadow-sm open:shadow-md transition-shadow"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium text-[#12231a] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown size={18} className="shrink-0 text-[#8e7345] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 -mt-1 text-sm leading-relaxed text-[#0a120b]/70">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Still a question: talk to a person */}
        <div className="rounded-2xl bg-[#12231a] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="font-serif text-xl">{t("stillTitle")}</p>
            <p className="text-sm text-white/65 mt-1">{t("stillText")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(t("whatsappMessage"))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp-open", { from: "faq" })}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:brightness-110 text-[#0a120b] text-sm font-semibold px-5 py-2.5"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-[#c5a86d] text-sm px-5 py-2.5"
            >
              {t("contact")} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
