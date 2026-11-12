"use client";

// The visible part of a package's own page: a photo banner with the title, then the
// same details, quotation and booking as before (TourDetail).
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import type { TourPackage } from "@/lib/types";
import { useRouter } from "@/i18n/navigation";
import TourDetail from "../components/TourDetail";

export default function PackagePage({ tour }: { tour: TourPackage }) {
  const router = useRouter();
  const tc = useTranslations("Common");
  return (
    <>
      <section className="relative h-[340px] sm:h-[400px] w-full overflow-hidden bg-[#0a1811] text-white">
        {tour.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.image} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-[#0a1811]/40 to-black/40" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
            {tc("days", { count: tour.itinerary.length })} · {tour.category}
          </p>
          <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-5xl">{tour.title}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-200">
            <MapPin size={15} className="text-[#d4af37]" /> {tour.location}
          </p>
        </div>
      </section>
      <TourDetail tour={tour} onBack={() => router.push("/tour")} />
    </>
  );
}
