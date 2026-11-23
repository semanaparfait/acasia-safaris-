"use client";

// Our Google rating: a full bar (Testimonials) and a small badge (next to "Book", footer).
// Google asks that its reviews are shown as coming from Google, with a link to them.
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { useGoogleReviews } from "@/lib/googleReviews";
import { GOOGLE_REVIEW_URL } from "@/lib/company";

// The Google "G"
export function GoogleG({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "fill-[#FBBC04] text-[#FBBC04]" : "fill-[#0a120b]/10 text-[#0a120b]/10"}
        />
      ))}
    </span>
  );
}

// "[G] 4.9 ★★★★★ · 132 reviews on Google   [See all] [Write a review]"
export function GoogleRatingBar() {
  const locale = useLocale();
  const t = useTranslations("GoogleReviews");
  const google = useGoogleReviews(locale);
  if (!google?.available || !google.total) return null;
  return (
    <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#0a120b]/5 bg-white px-5 py-4 shadow-sm sm:flex-row">
      <div className="flex items-center gap-3">
        <GoogleG className="size-8 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-[#12231a]">{google.rating.toFixed(1)}</span>
            <Stars rating={google.rating} size={16} />
          </div>
          <p className="text-xs text-[#0a120b]/55">{t("count", { count: google.total })}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {google.mapsUrl && (
          <a
            href={google.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#0a120b]/15 px-4 py-2 text-xs font-medium text-[#12231a] transition-colors hover:border-[#12231a]"
          >
            {t("seeAll")}
          </a>
        )}
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#12231a] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1F5A42]"
        >
          {t("write")}
        </a>
      </div>
    </div>
  );
}

// Small: "[G] ★ 4.9 · 132 Google reviews" (dark = on a dark background)
export function GoogleRatingBadge({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("GoogleReviews");
  const google = useGoogleReviews(locale);
  if (!google?.available || !google.total) return null;
  return (
    <a
      href={google.mapsUrl ?? GOOGLE_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
        dark ? "bg-white/10 text-white/85 hover:bg-white/15" : "bg-[#f7f5f0] text-[#0a120b]/70 hover:bg-[#efe8da]"
      } ${className}`}
    >
      <GoogleG className="size-3.5" />
      <Star size={12} className="fill-[#FBBC04] text-[#FBBC04]" />
      <strong className={dark ? "text-white" : "text-[#12231a]"}>{google.rating.toFixed(1)}</strong>
      <span>· {t("badge", { count: google.total })}</span>
    </a>
  );
}
