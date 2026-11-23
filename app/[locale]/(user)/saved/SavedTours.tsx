"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Calendar, Heart, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/ui/smart-image";
import { Money } from "@/components/ui/money";
import { SaveTourButton, ShareTourButton, useSavedIds } from "@/components/TourActions";
import { NextDepartureChip } from "@/app/[locale]/(user)/tour/components/GroupDepartures";
import { tourHref } from "@/lib/helpers";
import { usePackagesStore } from "@/store/packagesStore";

export default function SavedTours() {
  const t = useTranslations("Saved");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const packages = usePackagesStore((s) => s.packages);
  const loading = usePackagesStore((s) => s.loading);
  const loadPublished = usePackagesStore((s) => s.loadPublished);
  const { ids, ready } = useSavedIds();

  useEffect(() => {
    loadPublished(locale);
  }, [loadPublished, locale]);

  // In the order they were saved; a package taken off the website is simply not shown
  const saved = ids.map((id) => packages.find((p) => p.id === id && p.active)).filter((p) => p !== undefined);
  const waiting = !ready || (loading && packages.length === 0);

  return (
    <div className="bg-[#faf8f5] min-h-screen font-sans text-[#0a120b]">
      <section className="bg-[#12231a] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-32 pb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-2">{t("eyebrow")}</p>
          <h1 className="font-serif text-3xl sm:text-4xl">{t("title")}</h1>
          <p className="text-sm text-white/65 mt-3 max-w-xl">{t("subtitle")}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10">
        {waiting ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border border-black/5 animate-pulse" />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="max-w-md mx-auto text-center rounded-2xl bg-white border border-black/5 p-10">
            <span className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <Heart className="size-6" />
            </span>
            <p className="font-serif text-xl text-[#12231a]">{t("emptyTitle")}</p>
            <p className="text-sm text-[#0a120b]/60 mt-2">{t("emptyText")}</p>
            <Link
              href="/tour"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#12231a] hover:bg-[#1F5A42] text-white text-sm px-6 py-3 transition"
            >
              {t("browse")} <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#0a120b]/55 mb-5">{t("count", { count: saved.length })}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.map((pkg) => (
                <article
                  key={pkg.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition flex flex-col"
                >
                  <Link href={tourHref({ package: pkg.id })} className="relative block h-48 overflow-hidden bg-neutral-100">
                    {pkg.image && (
                      <SmartImage
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-[#12231a]">
                      <Calendar size={12} className="text-[#1F5A42]" /> {tc("days", { count: pkg.itinerary.length })}
                    </span>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-serif text-lg leading-snug text-[#12231a]">
                        <Link href={tourHref({ package: pkg.id })} className="hover:text-[#8e7345]">
                          {pkg.title}
                        </Link>
                      </h2>
                      <div className="flex gap-1.5 shrink-0">
                        <SaveTourButton id={pkg.id} className="w-9 h-9 border border-black/10 hover:border-black/30" />
                        <ShareTourButton
                          id={pkg.id}
                          title={pkg.title}
                          path={`/tour/${pkg.id}`}
                          className="w-9 h-9 border border-black/10 hover:border-black/30"
                        />
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-[#0a120b]/50 mt-1.5">
                      <MapPin size={12} className="text-[#c5a86d]" /> {pkg.location}
                    </p>
                    <NextDepartureChip packageId={pkg.id} className="mt-3 self-start" />
                    <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-black/5">
                      <span className="text-xs text-[#0a120b]/55">
                        {t("from")} <Money usd={pkg.price} className="text-base font-semibold text-[#12231a]" />
                      </span>
                      <Link
                        href={tourHref({ package: pkg.id })}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1F5A42] hover:underline"
                      >
                        {t("view")} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
