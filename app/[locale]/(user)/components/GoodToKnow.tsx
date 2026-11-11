"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Plane, CalendarDays, Car, ShieldCheck, ArrowRight } from "lucide-react";

// key = the texts in messages: Home.good.<key>
const facts = [
  { icon: Plane, key: "visa" },
  { icon: CalendarDays, key: "season" },
  { icon: Car, key: "travel" },
  { icon: ShieldCheck, key: "safe" },
] as const;

export default function GoodToKnow() {
  const t = useTranslations("Home.good");
  return (
    <section className="py-20 px-6 bg-[#F8F6F1] text-[#0a120b] font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[#c5a86d]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1F5A42]">{t("eyebrow")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide leading-[1.1] text-[#12231a] mb-5">
            {t("title1")} <span className="text-[#c5a86d]">{t("title2")}</span>
          </h2>
          <p className="text-sm text-[#0a120b]/60 leading-relaxed max-w-sm mb-6">
            {t("text")}
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[#12231a] border-b-2 border-[#c5a86d] pb-1"
          >
            {t("ask")}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {facts.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex gap-4 bg-white rounded-2xl p-5 border border-[#0a120b]/5 hover:shadow-lg transition-shadow"
            >
              <span className="w-11 h-11 rounded-xl bg-[#12231a] text-[#c5a86d] flex items-center justify-center shrink-0">
                <f.icon size={20} />
              </span>
              <span>
                <span className="block font-serif uppercase tracking-wide text-[#12231a] mb-1">{t(`${f.key}.title`)}</span>
                <span className="block text-sm text-[#0a120b]/60 leading-relaxed">{t(`${f.key}.text`)}</span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
