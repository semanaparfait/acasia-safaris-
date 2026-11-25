"use client";

// /gallery: the photo albums made in Admin > Gallery, laid out like a magazine.
//   - index: a hero with a collage of the latest covers, the featured album, then every album
//   - /gallery?album=<id> (can be shared): the album's banner, its photos, the next album
// Photos open in a full-screen viewer with a strip of thumbnails.
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import SmartImage from "@/components/ui/smart-image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Images, Link2, MapPin, Maximize2, Play, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import type { GalleryAlbum, GalleryItem } from "@/lib/types";
import { albumCover, photosOf, useGalleryStore } from "@/store/galleryStore";

const VIDEO_ID = "Ov8JhHzPUKo";
const HERO_FALLBACK = "https://images.unsplash.com/photo-1504173010664-32509aeebb62?auto=format&fit=crop&w=2000&q=80";

const pad = (n: number) => String(n).padStart(2, "0");

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

  // Album names, descriptions and photo titles in the page's language
  const locale = useLocale();
  useEffect(() => {
    loadGallery(locale);
  }, [loadGallery, locale]);

  // Albums with photos only (an album being prepared stays hidden)
  const shown = useMemo(() => albums.filter((a) => photosOf(items, a.id).length > 0), [albums, items]);
  const album = albumId ? shown.find((a) => a.id === albumId) : undefined;
  const photos = useMemo(() => (album ? photosOf(items, album.id) : []), [album, items]);

  const openAlbum = (id: string | null) => {
    setLightboxIndex(null);
    router.push(id ? `${pathname}?album=${id}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showNext = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i + 1) % photos.length)), [photos.length]);
  const showPrev = useCallback(() => setLightboxIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)), [photos.length]);

  // Keyboard navigation + lock page scroll while the viewer is open
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

  return (
    <div className="bg-white text-[#0a120b] font-sans overflow-hidden selection:bg-[#c5a86d] selection:text-black">
      <AnimatePresence>
        {album && lightboxIndex !== null && photos[lightboxIndex] && (
          <Viewer
            album={album}
            photos={photos}
            index={lightboxIndex}
            onIndex={setLightboxIndex}
            onClose={closeLightbox}
            onNext={showNext}
            onPrev={showPrev}
          />
        )}
      </AnimatePresence>

      {album ? (
        <AlbumView album={album} photos={photos} albums={shown} items={items} onOpen={setLightboxIndex} onAlbum={openAlbum} />
      ) : (
        <>
          <Hero albums={shown} items={items} onAlbum={openAlbum} />
          <AlbumIndex albums={shown} items={items} loading={loading} onAlbum={openAlbum} />
        </>
      )}

      {/* Featured film (on the albums index only) */}
      {!album && (
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
      )}

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

// ---------- Index: hero ----------

// A full-screen slideshow of the album covers (slow zoom, cross-fade), a short title and one button.
// The album on screen is named in the corner: click it to open that album.
const SLIDE_MS = 6500;

function Hero({ albums, items, onAlbum }: { albums: GalleryAlbum[]; items: GalleryItem[]; onAlbum: (id: string) => void }) {
  const t = useTranslations("Gallery");
  const still = useReducedMotion();
  const slides = albums
    .map((a) => ({ album: a, image: albumCover(a, items) }))
    .filter((s): s is { album: GalleryAlbum; image: string } => Boolean(s.image))
    .slice(0, 5);
  const [slide, setSlide] = useState(0);
  const current = slides.length ? slides[slide % slides.length] : null;

  useEffect(() => {
    if (slides.length < 2 || still) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length, still, slide]);

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-[#0a1811] text-white">
      {/* The photos */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current?.album.id ?? "fallback"}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: still ? 1 : 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: still ? 0 : SLIDE_MS / 1000 + 1.5, ease: "linear" }}
          >
            <SmartImage src={current?.image ?? HERO_FALLBACK} alt="" className="h-full w-full object-cover" sizes="100vw" priority />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {/* Darkening over every photo, so the title reads on any image */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-[#0a1811]/45 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

      {/* Title */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-28 md:pb-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#c5a86d]">
            <span className="h-px w-12 bg-[#c5a86d]" /> {t("heroTag")}
          </span>
          <h1 className="mt-5 font-serif text-5xl font-normal uppercase leading-[0.95] tracking-wide sm:text-6xl md:text-7xl lg:text-8xl">
            {t("title1")}
            <span className="block text-[#c5a86d]">{t("title2")}</span>
          </h1>
          <button
            onClick={() => document.getElementById("albums")?.scrollIntoView({ behavior: "smooth" })}
            className="group mt-10 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 py-2 pl-7 pr-2 text-sm font-medium backdrop-blur-md transition-all duration-300 hover:border-[#c5a86d] hover:bg-[#c5a86d] hover:text-[#0e1d16]"
          >
            {t("browse")}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c5a86d] text-[#0e1d16] transition-colors group-hover:bg-[#0e1d16] group-hover:text-[#c5a86d]">
              <ChevronDown size={18} className="transition-transform group-hover:translate-y-0.5" />
            </span>
          </button>
        </motion.div>
      </div>

      {/* The album on screen + progress */}
      {current && (
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 pb-8">
            {slides.length > 1 ? (
              <div className="flex flex-1 gap-2" aria-hidden>
                {slides.map((s, i) => (
                  <button
                    key={s.album.id}
                    onClick={() => setSlide(i)}
                    className="relative h-[3px] max-w-16 flex-1 overflow-hidden rounded-full bg-white/25"
                    tabIndex={-1}
                  >
                    {i === slide % slides.length && (
                      <motion.span
                        key={slide}
                        className="absolute inset-y-0 left-0 bg-[#c5a86d]"
                        initial={{ width: still ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: still ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                      />
                    )}
                    {i < slide % slides.length && <span className="absolute inset-0 bg-white/70" />}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <AnimatePresence mode="wait">
              <motion.button
                key={current.album.id}
                onClick={() => onAlbum(current.album.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="group hidden items-center gap-3 text-right sm:flex"
              >
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55">{t("album")}</span>
                  <span className="block font-serif text-lg text-white transition-colors group-hover:text-[#c5a86d]">{current.album.name}</span>
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition-all group-hover:border-[#c5a86d] group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16]">
                  <ArrowRight size={15} />
                </span>
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- Index: the albums ----------

function AlbumIndex({
  albums,
  items,
  loading,
  onAlbum,
}: {
  albums: GalleryAlbum[];
  items: GalleryItem[];
  loading: boolean;
  onAlbum: (id: string) => void;
}) {
  const t = useTranslations("Gallery");
  const [featured, ...rest] = albums;

  return (
    <section id="albums" className="px-6 py-24 bg-[#f7f5f0] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#b28236]">
              <span className="h-px w-10 bg-[#c5a86d]" /> {t("collections")}
            </span>
            <h2 className="mt-4 text-3xl md:text-5xl font-serif uppercase tracking-wide">{t("albumsTitle")}</h2>
          </div>
          <p className="max-w-md text-sm text-[#0a120b]/60 leading-relaxed">{t("albumsText")}</p>
        </div>

        {!featured ? (
          <p className="py-20 text-center text-sm text-[#0a120b]/50">{loading ? "…" : t("noAlbums")}</p>
        ) : (
          <>
            <FeaturedAlbum album={featured} items={items} onOpen={() => onAlbum(featured.id)} />

            {rest.length > 0 && (
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {rest.map((a, i) => (
                  <AlbumCard key={a.id} album={a} items={items} number={i + 2} onOpen={() => onAlbum(a.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FeaturedAlbum({ album, items, onOpen }: { album: GalleryAlbum; items: GalleryItem[]; onOpen: () => void }) {
  const t = useTranslations("Gallery");
  const photos = photosOf(items, album.id);
  const cover = albumCover(album, items);
  const previews = photos.filter((p) => p.image !== cover).slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="group grid overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-40px_rgba(10,24,17,0.45)] ring-1 ring-black/5 lg:grid-cols-[1.35fr_1fr]"
    >
      <button onClick={onOpen} className="relative block min-h-[320px] overflow-hidden bg-[#12231a] lg:min-h-[520px]" aria-label={`${t("viewAlbum")}: ${album.name}`}>
        {cover && (
          <SmartImage src={cover} alt={album.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-[#c5a86d] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#0e1d16]">
          {t("featured")}
        </span>
      </button>

      <div className="flex flex-col p-8 sm:p-12">
        <span className="font-serif text-5xl text-[#c5a86d]/40 leading-none">01</span>
        <h3 className="mt-5 font-serif text-3xl sm:text-4xl leading-tight text-[#0a1811]">{album.name}</h3>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b28236]">
          <Images size={14} /> {t("photos", { count: photos.length })}
        </p>
        {album.description && <p className="mt-5 text-sm leading-relaxed text-[#0a120b]/65 line-clamp-5">{album.description}</p>}

        {previews.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {previews.map((p) => (
              <button key={p.id} onClick={onOpen} className="relative aspect-square overflow-hidden rounded-xl bg-[#f7f5f0]" tabIndex={-1} aria-hidden>
                <SmartImage src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" sizes="120px" />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onOpen}
          className="mt-auto self-start inline-flex items-center gap-2 rounded-full bg-[#0a1811] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-[#b28236] lg:mt-10"
        >
          {t("viewAlbum")} <ArrowRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}

function AlbumCard({ album, items, number, onOpen }: { album: GalleryAlbum; items: GalleryItem[]; number: number; onOpen: () => void }) {
  const t = useTranslations("Gallery");
  const cover = albumCover(album, items);
  const count = photosOf(items, album.id).length;

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (number % 3) * 0.08 }}
      onClick={onOpen}
      className="group block text-left"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#12231a] shadow-[0_20px_50px_-30px_rgba(10,24,17,0.5)]">
        {cover && (
          <SmartImage src={cover} alt={album.name} className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#12231a] backdrop-blur-sm">
          <Images size={12} /> {count}
        </span>
        <span className="absolute bottom-5 left-5 inline-flex translate-y-3 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {t("viewAlbum")} <ArrowRight size={14} />
        </span>
      </div>
      <div className="mt-5 flex gap-4">
        <span className="font-serif text-2xl leading-none text-[#c5a86d]">{pad(number)}</span>
        <div className="min-w-0 border-l border-[#0a120b]/10 pl-4">
          <h3 className="font-serif text-xl leading-snug text-[#0a1811] transition-colors group-hover:text-[#b28236]">{album.name}</h3>
          {album.description && <p className="mt-1.5 text-sm leading-relaxed text-[#0a120b]/60 line-clamp-2">{album.description}</p>}
        </div>
      </div>
    </motion.button>
  );
}

// ---------- One album ----------

function AlbumView({
  album,
  photos,
  albums,
  items,
  onOpen,
  onAlbum,
}: {
  album: GalleryAlbum;
  photos: GalleryItem[];
  albums: GalleryAlbum[];
  items: GalleryItem[];
  onOpen: (index: number) => void;
  onAlbum: (id: string | null) => void;
}) {
  const t = useTranslations("Gallery");
  const cover = albumCover(album, items);
  const position = albums.findIndex((a) => a.id === album.id);
  const next = albums.length > 1 ? albums[(position + 1) % albums.length] : null;
  const places = [...new Set(photos.map((p) => p.location?.trim()).filter(Boolean))].slice(0, 4) as string[];

  return (
    <>
      {/* Banner */}
      <section className="relative min-h-[62vh] w-full bg-[#0a1811] text-white px-6 flex items-end">
        {cover && <SmartImage src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" sizes="100vw" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-[#0a1811]/55 to-black/40" />
        <div className="relative z-10 w-full max-w-7xl mx-auto pt-36 pb-14">
          <nav className="flex items-center gap-2 text-xs text-zinc-300">
            <button onClick={() => onAlbum(null)} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <ArrowLeft size={14} /> {t("gallery")}
            </button>
            <span className="text-white/30">/</span>
            <span className="truncate text-white/80">{album.name}</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} key={album.id}>
            <span className="mt-8 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#c5a86d]">
              <span className="h-px w-10 bg-[#c5a86d]" /> {t("album")} {pad(position + 1)}
            </span>
            <h1 className="mt-4 max-w-4xl text-4xl sm:text-5xl md:text-6xl font-serif uppercase tracking-wide leading-[1.05]">{album.name}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <Images size={16} className="text-[#c5a86d]" /> {t("photos", { count: photos.length })}
              </span>
              {places.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-[#c5a86d]" /> {places.join(" · ")}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story + share */}
      <section className="px-6 pt-14">
        <div className="max-w-7xl mx-auto grid gap-8 border-b border-[#0a120b]/10 pb-12 lg:grid-cols-[1fr_auto] lg:items-start">
          {album.description ? (
            <p className="max-w-3xl font-serif text-lg md:text-xl leading-relaxed text-[#0a120b]/75 whitespace-pre-line first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-[#c5a86d]">
              {album.description}
            </p>
          ) : (
            <span />
          )}
          <ShareButtons album={album} />
        </div>
      </section>

      {/* Photos */}
      <section className="px-6 py-14">
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-5">
          {photos.map((img, i) => (
            <motion.button
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(i % 6, 5) * 0.05 }}
              onClick={() => onOpen(i)}
              className="group relative block w-full mb-5 overflow-hidden rounded-2xl bg-[#f7f5f0] break-inside-avoid text-left"
            >
              <SmartImage src={img.image} alt={img.title} className="w-full h-auto object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute right-4 top-4 flex h-10 w-10 -translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#0e1d16] opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <Maximize2 size={15} />
              </span>
              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="font-serif text-lg leading-snug">{img.title}</h3>
                {img.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-300">
                    <MapPin size={12} className="text-[#c5a86d]" /> {img.location}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Next album */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:flex-row sm:items-stretch">
          <button
            onClick={() => onAlbum(null)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0a120b]/15 px-8 py-6 text-sm font-semibold text-[#0a1811] transition-colors hover:border-[#0a1811] hover:bg-[#f7f5f0]"
          >
            <ArrowLeft size={16} /> {t("allAlbums")}
          </button>
          {next && (
            <button onClick={() => onAlbum(next.id)} className="group relative flex-1 overflow-hidden rounded-2xl bg-[#0a1811] text-left text-white min-h-[150px]">
              {albumCover(next, items) && (
                <SmartImage src={albumCover(next, items)!} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-all duration-700 group-hover:scale-105 group-hover:opacity-55" sizes="(max-width: 640px) 100vw, 70vw" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a1811] via-[#0a1811]/70 to-transparent" />
              <div className="relative flex h-full items-center justify-between gap-6 p-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d]">{t("nextAlbum")}</p>
                  <p className="mt-2 font-serif text-2xl sm:text-3xl">{next.name}</p>
                </div>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all group-hover:border-[#c5a86d] group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16]">
                  <ArrowRight size={20} />
                </span>
              </div>
            </button>
          )}
        </div>
      </section>
    </>
  );
}

// Copy the album's link, or send it on WhatsApp
function ShareButtons({ album }: { album: GalleryAlbum }) {
  const t = useTranslations("Gallery");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const link = () => window.location.href;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: nothing to do
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0a120b]/45">{t("share")}</span>
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-[#0a120b]/15 px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#0a1811] hover:bg-[#f7f5f0]"
      >
        {copied ? <Check size={15} className="text-emerald-600" /> : <Link2 size={15} />} {copied ? t("linkCopied") : t("copyLink")}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${album.name}: ${typeof window === "undefined" ? "" : window.location.href}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("shareWhatsapp")}
        title={t("shareWhatsapp")}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
      >
        <FaWhatsapp size={20} />
      </a>
    </div>
  );
}

// ---------- Full-screen viewer ----------

function Viewer({
  album,
  photos,
  index,
  onIndex,
  onClose,
  onNext,
  onPrev,
}: {
  album: GalleryAlbum;
  photos: GalleryItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const t = useTranslations("Gallery");
  const current = photos[index];
  const strip = useRef<HTMLDivElement>(null);

  // Keep the current thumbnail in view
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#060e0a]/97 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-white md:px-10">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d]">{album.name}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {pad(index + 1)} / {pad(photos.length)}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={t("close")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition-all hover:bg-white hover:text-[#0e1d16]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24">
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label={t("previous")}
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all hover:border-[#c5a86d] hover:bg-[#c5a86d] hover:text-[#0e1d16] md:left-8"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={current.image}
            alt={current.title}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label={t("next")}
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all hover:border-[#c5a86d] hover:bg-[#c5a86d] hover:text-[#0e1d16] md:right-8"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      <div className="px-6 pt-5 text-center text-white" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-xl md:text-2xl">{current.title}</h3>
        {current.location && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <MapPin size={12} className="text-[#c5a86d]" /> {current.location}
          </p>
        )}
      </div>

      {photos.length > 1 && (
        <div ref={strip} className="mx-auto flex max-w-full gap-2 overflow-x-auto px-6 pb-5 pt-4 [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button
              key={p.id}
              data-i={i}
              onClick={() => onIndex(i)}
              aria-label={`${i + 1} / ${photos.length}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition-all ${
                i === index ? "opacity-100 ring-2 ring-[#c5a86d]" : "opacity-40 hover:opacity-80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small thumbnails of photos already loaded */}
              <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
