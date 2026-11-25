"use client";

// /gallery: the photo albums made in Admin > Gallery. An album opens on the same page
// (/gallery?album=<id>, so it can be shared), with its photos and a full-screen viewer.
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SmartImage from "@/components/ui/smart-image";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Play, MapPin, Maximize2, ChevronLeft, ChevronRight, ChevronDown, Images } from "lucide-react";
import { albumCover, photosOf, useGalleryStore } from "@/store/galleryStore";

const VIDEO_ID = "Ov8JhHzPUKo";

// useSearchParams needs a Suspense boundary (the page is rendered ahead of time)
export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <Gallery />
    </Suspense>
  );
}

function Gallery() {
  const t = useTranslations("Gallery");
  const router = useRouter();
  const pathname = usePathname();
  const albumId = useSearchParams().get("album");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playVideo, setPlayVideo] = useState(false);

  // Albums and photos come from the API (store/galleryStore.ts), made in Admin > Gallery
  const albums = useGalleryStore((s) => s.albums);
  const items = useGalleryStore((s) => s.items);
  const loading = useGalleryStore((s) => s.loading);
  const loadGallery = useGalleryStore((s) => s.load);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Albums with photos only (an album being prepared stays hidden)
  const shown = useMemo(() => albums.filter((a) => photosOf(items, a.id).length > 0), [albums, items]);
  const album = albumId ? albums.find((a) => a.id === albumId) : undefined;
  const photos = useMemo(() => (album ? photosOf(items, album.id) : []), [album, items]);

  const scrollToGrid = () => document.getElementById("gallery-grid")?.scrollIntoView({ behavior: "smooth" });
  const openAlbum = (id: string | null) => {
    setLightboxIndex(null);
    router.push(id ? `${pathname}?album=${id}` : pathname, { scroll: false });
    setTimeout(scrollToGrid, 50);
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showNext = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i + 1) % photos.length)), [photos.length]);
  const showPrev = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)), [photos.length]);

  // Keyboard navigation + lock page scroll while the lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, showNext, showPrev]);

  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="bg-white text-[#0a120b] font-sans overflow-hidden selection:bg-[#c5a86d] selection:text-black">
      {/* Lightbox */}
      <AnimatePresence>
        {current && album && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a1811]/95 backdrop-blur-md flex flex-col"
            onClick={closeLightbox}
          >
            <div className="flex items-center justify-between px-5 md:px-10 py-5 text-white">
              <span className="text-xs tracking-[0.25em] uppercase text-zinc-400">
                {album.name} · {(lightboxIndex ?? 0) + 1} / {photos.length}
              </span>
              <button
                onClick={closeLightbox}
                aria-label={t("close")}
                className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white hover:text-[#0e1d16] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-4 md:px-24 min-h-0">
              {photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label={t("previous")}
                  className="absolute left-3 md:left-8 z-10 w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#0e1d16] hover:border-[#c5a86d] transition-all"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={current.id}
                  src={current.image}
                  alt={current.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label={t("next")}
                  className="absolute right-3 md:right-8 z-10 w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#0e1d16] hover:border-[#c5a86d] transition-all"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            <div className="px-6 py-6 text-center text-white" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-serif uppercase tracking-wide">{current.title}</h3>
              {current.location && (
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin size={12} /> {current.location}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative min-h-[70vh] w-full bg-[#0a1811] text-white flex flex-col justify-center px-6">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <SmartImage src="https://images.unsplash.com/photo-1504173010664-32509aeebb62?auto=format&fit=crop&w=2000&q=80" alt={t("heroAlt")} className="w-full h-full object-cover object-[70%_center] brightness-[0.9]" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1d16] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto md:px-6 pt-36 pb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal uppercase tracking-wide leading-[1.08] mb-6">
              {t("title1")} <br />
              <span className="text-[#c5a86d]">{t("title2")}</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed max-w-xl mb-8">{t("intro")}</p>
            <button
              onClick={scrollToGrid}
              className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md hover:shadow-lg transition-all duration-300"
            >
              {t("browse")}
              <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <section id="gallery-grid" className="px-6 pt-20 pb-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          {album ? (
            <>
              {/* One album: its story, then its photos */}
              <button
                onClick={() => openAlbum(null)}
                className="mb-8 inline-flex items-center gap-2 text-sm text-[#0a120b]/55 hover:text-[#0a120b] transition-colors"
              >
                <ArrowLeft size={16} /> {t("allAlbums")}
              </button>
              <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-3xl">
                  <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">{t("album")}</span>
                  <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-tight">{album.name}</h2>
                  {album.description && (
                    <p className="mt-5 text-sm md:text-base text-[#0a120b]/65 font-light leading-relaxed whitespace-pre-line">{album.description}</p>
                  )}
                </div>
                <p className="flex items-center gap-2 text-sm text-[#0a120b]/50">
                  <Images size={16} />
                  {t("photos", { count: photos.length })}
                </p>
              </div>

              {photos.length === 0 ? (
                <p className="py-16 text-center text-sm text-[#0a120b]/50">{t("emptyAlbum")}</p>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                  {photos.map((img, i) => (
                    <motion.button
                      key={img.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04 }}
                      onClick={() => setLightboxIndex(i)}
                      className="group relative block w-full mb-5 overflow-hidden rounded-xl bg-[#f7f5f0] break-inside-avoid text-left shadow-sm hover:shadow-2xl transition-shadow duration-500"
                    >
                      <SmartImage src={img.image} alt={img.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#c5a86d] text-[#0e1d16] flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Maximize2 size={15} />
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <h3 className="text-lg md:text-xl font-serif leading-snug">{img.title}</h3>
                        {img.location && (
                          <p className="flex items-center gap-1.5 text-xs text-zinc-300 mt-1">
                            <MapPin size={12} className="text-[#c5a86d]" />
                            {img.location}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Every album */}
              <div className="text-center mb-14">
                <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">{t("collections")}</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.2em] uppercase">{t("albumsTitle")}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-[#0a120b]/60">{t("albumsText")}</p>
              </div>

              {shown.length === 0 ? (
                <p className="py-16 text-center text-sm text-[#0a120b]/50">{loading ? "…" : t("noAlbums")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {shown.map((a, i) => {
                    const cover = albumCover(a, items);
                    const count = photosOf(items, a.id).length;
                    return (
                      <motion.button
                        key={a.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (i % 3) * 0.1, duration: 0.6 }}
                        onClick={() => openAlbum(a.id)}
                        className="group relative rounded-xl overflow-hidden shadow-xl h-[440px] flex flex-col justify-end p-6 text-left border border-white/10 hover:border-[#c5a86d]/40 transition-all duration-500"
                      >
                        {cover && (
                          <SmartImage src={cover} alt={a.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                        <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#12231a]">
                          <Images size={12} /> {t("photos", { count })}
                        </span>
                        <div className="relative z-10 text-white">
                          <h3 className="text-xl sm:text-2xl font-serif mb-2 leading-snug">{a.name}</h3>
                          {a.description && <p className="text-sm text-zinc-300 leading-relaxed mb-4 line-clamp-3">{a.description}</p>}
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-[#c5a86d] uppercase tracking-widest">
                            {t("viewAlbum")}
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Featured film */}
      <section className="bg-[#12231a] text-white px-6 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-4">
              {t("filmTag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide leading-tight mb-6">
              {t("filmTitle1")} <br /> {t("filmTitle2")}
            </h2>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-8 max-w-md">
              {t("filmText")}
            </p>

            <button
              onClick={() => setPlayVideo(true)}
              className="group inline-flex items-center gap-3 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:text-[#c5a86d]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 transition-all duration-300 group-hover:border-[#c5a86d] group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16]">
                <Play size={15} className="ml-0.5 fill-current" />
              </span>

              <span className="border-b border-white/40 pb-1 transition-colors duration-300 group-hover:border-[#c5a86d]">
                {t("watch")}
              </span>
            </button>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
          >
            {playVideo ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                title={t("filmTitleAttr")}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlayVideo(true)}
                aria-label={t("playFilm")}
                className="group absolute inset-0 w-full h-full"
              >
                <SmartImage src={`https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`} alt={t("filmAlt")} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" sizes="(max-width: 1024px) 100vw, 50vw" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:bg-[#c5a86d] group-hover:border-[#c5a86d] transition-all duration-300">
                    <Play size={26} className="ml-1 fill-white text-white group-hover:fill-[#0e1d16] group-hover:text-[#0e1d16]" />
                  </span>
                </span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden bg-[#0a1811] text-white">
          <SmartImage src="https://i.pinimg.com/736x/2b/aa/0f/2baa0f0b1c59deec862d2a8a6b300ae8.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1811] via-[#0a1811]/85 to-transparent" />
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 max-w-2xl">
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-4">
              {t("yourTurn")}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-tight mb-5">
              {t("stepIn")}
            </h2>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-8 max-w-lg">
              {t("stepText")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/tour"
                className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md hover:shadow-lg transition-all duration-300"
              >
                {t("exploreTours")}
              </Link>
              <Link
                href="/contact"
                className="border border-white/40 hover:border-white bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white text-sm px-7 py-3 rounded-sm transition-all duration-300"
              >
                {t("contactUs")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
