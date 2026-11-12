"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation"; // keeps the visitor's language
import { GiGorilla, GiElephant, GiMountainRoad } from "react-icons/gi";
import { FaUsers, FaGem } from "react-icons/fa";
import { PiPawPrintFill } from "react-icons/pi";
import Image from "next/image";
import { useTranslations } from "next-intl";
import TourDetail from "@/app/[locale]/(user)/tour/components/TourDetail";
import { usePackagesStore } from "@/store/packagesStore";
import { tourHref } from "@/lib/helpers";
import GroupVsTailorMade from "@/app/[locale]/(user)/tour/components/GroupVsTailorMade";
import AllPackages from "@/app/[locale]/(user)/tour/components/AllPackages";

export default function TourPage() {
  return (
    <Suspense>
      <TourPageContent />
    </Suspense>
  );
}

// The selected category / package lives in the URL (see tourHref) so any link can open it.
// Category (as in the address) -> its key in messages
const CATEGORY_KEYS: Record<string, "all" | "gorilla" | "wildlife" | "luxury" | "cultural" | "group"> = {
  "All Packages": "all",
  "Gorilla Trekking": "gorilla",
  "Wildlife Safari": "wildlife",
  "Luxury Escapes": "luxury",
  "Cultural Tours": "cultural",
  "Group vs Tailor made": "group",
};

function TourPageContent() {
  const t = useTranslations("Tours");
  // A category an admin made up has no translation: shown as typed
  const categoryName = (name: string) => (CATEGORY_KEYS[name] ? t(`categories.${CATEGORY_KEYS[name]}`) : name);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePackage = searchParams.get("category") ?? "All Packages";
  const selectedId = searchParams.get("package");

  // Packages come from the API (see store/packagesStore.ts)
  const allPackages = usePackagesStore((s) => s.packages);
  const loading = usePackagesStore((s) => s.loading);
  const error = usePackagesStore((s) => s.error);
  const loadPublished = usePackagesStore((s) => s.loadPublished);

  useEffect(() => {
    loadPublished();
  }, [loadPublished]);

  // Old links (/tour?package=…): each package now has its own page, /tour/<id>
  useEffect(() => {
    if (selectedId) router.replace(tourHref({ package: selectedId }));
  }, [selectedId, router]);

  const packages = allPackages.filter((p) => p.active);
  const selectedPackage = packages.find((p) => p.id === selectedId);

  // The category names stay in English (they are in the address and the database);
  // their texts are in messages: Tours.categories.<key> and Tours.hero.<key>
  const heroImages: Record<string, string> = {
    "All Packages": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2200&auto=format&fit=crop&q=85",
    "Gorilla Trekking": "https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg",
    "Wildlife Safari": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=2200&auto=format&fit=crop&q=85",
    "Luxury Escapes": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2200&auto=format&fit=crop&q=85",
    "Cultural Tours": "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=2200&auto=format&fit=crop&q=85",
    "Group vs Tailor made": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=2200&auto=format&fit=crop&q=85",
  };

  const heroCategory = heroImages[selectedPackage?.category ?? activePackage]
    ? (selectedPackage?.category ?? activePackage)
    : "All Packages";
  const heroKey = CATEGORY_KEYS[heroCategory];
  const currentHero = {
    image: heroImages[heroCategory],
    tag: t(`hero.${heroKey}.tag`),
    title: t(`hero.${heroKey}.title`),
    subtitle: t(`hero.${heroKey}.subtitle`),
    description: t(`hero.${heroKey}.description`),
  };

  const navigate = (href: string) => {
    router.push(href, { scroll: false });
    document.getElementById("package-section")?.scrollIntoView({ behavior: "smooth" });
  };
  const showPackage = (id: string) => router.push(tourHref({ package: id }));

  const TourPackages = [
    {
      id: 1,
      icon: PiPawPrintFill,
      name: "All Packages",
    },
    {
      id: 2,
      icon: GiGorilla,
      name: "Gorilla Trekking",
    },
    {
      id: 3,
      icon: GiElephant,
      name: "Wildlife Safari",
    },
    {
      id: 4,
      icon: FaGem,
      name: "Luxury Escapes",
    },
    {
      id: 5,
      icon: GiMountainRoad,
      name: "Cultural Tours",
    },
    {
      id: 6,
      icon: FaUsers,
      name: "Group vs Tailor made",
    },
  ];

  return (
    <section>
      {/* Hero Section */}
      <section className="relative h-[480px] w-full flex items-center overflow-hidden">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            key={currentHero.image}
            src={currentHero.image}
            alt={currentHero.title}
            fill
            priority
            className="object-cover object-center filter brightness-[0.70] transition-all duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full text-white">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D4AF37] block mb-2 transition-all duration-300">
            {currentHero.tag}
          </span>
          <h1 className="text-3xl  md:text-5xl font-serif font-bold tracking-tight leading-tight mb-2 transition-all duration-300">
            {currentHero.title}
          </h1>
          <p className="text-lg sm:text-2xl font-serif text-amber-100 font-light mb-4 transition-all duration-300">
            {currentHero.subtitle}
          </p>
          <p className="text-xs sm:text-base text-zinc-200 font-light max-w-xl leading-relaxed mb-6 transition-all duration-300">
            {currentHero.description}
          </p>
          <a
            href="#package-section"
            className="inline-flex items-center gap-2 bg-[#B28236] hover:bg-[#966B2A] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-colors shadow-md"
          >
            <span>{t("explore")}</span>
            <span>→</span>
          </a>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div id="package-section" className="scroll-mt-20 bg-neutral-50/80 border-b border-neutral-200/80 py-5 px-4">
        <div className="flex gap-2.5 items-center justify-center flex-wrap max-w-7xl mx-auto">
          {TourPackages.map((pkg) => {
            const isActive = (selectedPackage?.category ?? activePackage) === pkg.name;
            return (
              <button
                key={pkg.id}
                onClick={() => navigate(tourHref({ category: pkg.name }))}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 cursor-pointer transition-all duration-200 text-xs font-medium ${
                  isActive
                    ? "bg-[#0B1E14] text-white border-[#0B1E14] shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-[#0B1E14] hover:text-[#0B1E14]"
                }`}
              >
                <div className={isActive ? "text-emerald-400" : "text-emerald-800"}>
                  {pkg.icon && <pkg.icon className="text-sm" />}
                </div>
                <span>{categoryName(pkg.name)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 flex items-center justify-between gap-4">
            <span>{t("error", { error })}</span>
            <button onClick={loadPublished} className="font-semibold underline cursor-pointer">
              {t("tryAgain")}
            </button>
          </div>
        </div>
      )}

      {loading && packages.length === 0 ? (
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-neutral-500">
          {t("loading")}
        </p>
      ) : selectedPackage ? (
        <TourDetail
          key={selectedPackage.id}
          tour={selectedPackage}
          onBack={() => navigate(tourHref({ category: activePackage }))}
        />
      ) : activePackage === "Group vs Tailor made" ? (
        <GroupVsTailorMade />
      ) : (
        <AllPackages
          title={activePackage === "All Packages" ? undefined : t("categoryPackages", { category: categoryName(activePackage) })}
          packages={
            activePackage === "All Packages"
              ? packages
              : packages.filter((p) => p.category === activePackage)
          }
          onSelectPackage={showPackage}
        />
      )}
    </section>
  );
}
