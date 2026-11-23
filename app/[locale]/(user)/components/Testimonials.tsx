"use client";
// "What our guests say" on the home page: our Google rating, then Google reviews mixed with
// the reviews travelers left on their booking page (published under Admin > Reviews).
import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from "next-intl";
import { motion } from 'framer-motion';
import { BadgeCheck, Quote, Star } from 'lucide-react';
import { useReviewsStore } from '@/store/reviewsStore';
import { useGoogleReviews, type GoogleReview } from '@/lib/googleReviews';
import { GoogleG, GoogleRatingBar, Stars } from '@/components/GoogleRating';
import type { Review } from '@/lib/types';

type Card = { kind: 'google'; review: GoogleReview } | { kind: 'own'; review: Review };

const SHOW = 4; // cards on the page
const CUT = 260; // longer Google reviews end with "Read more on Google"

export default function Testimonials() {
  const t = useTranslations("Home.testimonials");
  const locale = useLocale();
  // Published reviews from the API (admins publish them under Admin > Reviews)
  const reviews = useReviewsStore((s) => s.reviews);
  const loadPublished = useReviewsStore((s) => s.loadPublished);
  const google = useGoogleReviews(locale);

  useEffect(() => {
    loadPublished();
  }, [loadPublished]);

  const own = reviews.filter((r) => r.status === 'Published');
  const fromGoogle = google?.available ? google.reviews.filter((r) => r.rating >= 4) : [];

  // Alternate Google / ours, so both kinds show
  const cards: Card[] = [];
  for (let i = 0; cards.length < SHOW && (i < fromGoogle.length || i < own.length); i++) {
    if (fromGoogle[i]) cards.push({ kind: 'google', review: fromGoogle[i] });
    if (own[i] && cards.length < SHOW) cards.push({ kind: 'own', review: own[i] });
  }
  if (cards.length === 0 && !(google?.available && google.total)) return null;

  return (
    <section className="py-20 bg-[#F8F6F1] text-[#0a120b] px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-wide text-[#12231a]">
            {t("title1")} <span className="text-[#c5a86d]">{t("title2")}</span>
          </h2>
        </div>

        <GoogleRatingBar />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <motion.figure
              key={card.kind === 'own' ? card.review.id : `g-${card.review.author}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative bg-white rounded-2xl p-6 border border-[#0a120b]/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {card.kind === 'google' ? <GoogleCard review={card.review} /> : <OwnCard review={card.review} />}
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function GoogleCard({ review: r }: { review: GoogleReview }) {
  const t = useTranslations("GoogleReviews");
  const locale = useLocale();
  const when =
    r.when ||
    (r.publishedAt ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(r.publishedAt)) : "");
  const [open, setOpen] = useState(false);
  const long = r.text.length > CUT;
  return (
    <>
      <GoogleG className="absolute top-5 right-5 size-5" />
      <figcaption className="flex items-center gap-3 mb-4 pr-8">
        {r.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.photo} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
        ) : (
          <span className="w-10 h-10 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center font-serif">
            {r.author.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          {r.authorUrl ? (
            <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-semibold text-[#12231a] truncate hover:underline">
              {r.author}
            </a>
          ) : (
            <span className="block text-sm font-semibold text-[#12231a] truncate">{r.author}</span>
          )}
          <span className="flex items-center gap-2 text-xs text-[#0a120b]/50">
            <Stars rating={r.rating} size={12} /> {when}
          </span>
        </span>
      </figcaption>
      <blockquote className="text-[15px] leading-relaxed text-[#0a120b]/75 whitespace-pre-line">
        &ldquo;{long && !open ? `${r.text.slice(0, CUT).trimEnd()}…` : r.text}&rdquo;
      </blockquote>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-2 self-start text-xs font-medium text-[#1F5A42] hover:underline cursor-pointer">
          {open ? t("less") : t("more")}
        </button>
      )}
      {r.url && (
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 text-[11px] text-[#0a120b]/45 hover:text-[#0a120b]/70">
          {t("postedOn")} →
        </a>
      )}
    </>
  );
}

function OwnCard({ review: r }: { review: Review }) {
  const t = useTranslations("GoogleReviews");
  return (
    <>
      <Quote size={32} className="absolute top-5 right-5 text-[#c5a86d]/20" fill="currentColor" />

      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: r.rating }).map((_, s) => (
            <Star key={s} size={14} className="fill-[#c5a86d] text-[#c5a86d]" />
          ))}
        </div>
        {r.packageTitle && (
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F8F6F1] text-[#1F5A42]">
            {r.packageTitle}
          </span>
        )}
      </div>

      <blockquote className="text-[15px] leading-relaxed text-[#0a120b]/75 mb-5">
        &ldquo;{r.text}&rdquo;
      </blockquote>

      <figcaption className="flex items-center gap-3 mt-auto">
        <span className="w-10 h-10 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center font-serif">
          {r.name.charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#12231a]">{r.name}</span>
          <span className="flex items-center gap-1 text-xs text-[#0a120b]/50">
            {r.country} · <BadgeCheck size={12} className="text-[#1F5A42]" /> {t("verified")}
          </span>
        </span>
      </figcaption>
    </>
  );
}
