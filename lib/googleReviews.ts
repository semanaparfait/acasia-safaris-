"use client";

// Our Google rating and a few Google reviews (GET /api/google-reviews, refreshed daily by the server).
// One request per language for the whole visit, shared by every component that shows them.
import { useEffect } from "react";
import { create } from "zustand";
import { api } from "@/lib/api";

export type GoogleReview = {
  author: string;
  authorUrl: string | null;
  photo: string | null;
  rating: number;
  text: string;
  when: string;
  publishedAt: string | null;
  url: string | null;
};

export type GoogleReviews =
  | { available: false }
  | { available: true; rating: number; total: number; mapsUrl: string | null; reviews: GoogleReview[] };

const requests: Record<string, Promise<void>> = {};
const useStore = create<{ byLang: Record<string, GoogleReviews> }>()(() => ({ byLang: {} }));

export function useGoogleReviews(locale: string): GoogleReviews | null {
  const lang = locale === "fr" || locale === "sw" ? locale : "en";
  const data = useStore((s) => s.byLang[lang] ?? null);
  useEffect(() => {
    requests[lang] ??= api<GoogleReviews>(`/google-reviews?lang=${lang}`)
      .catch((): GoogleReviews => ({ available: false }))
      .then((result) => useStore.setState((s) => ({ byLang: { ...s.byLang, [lang]: result } })));
  }, [lang]);
  return data;
}
