"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  X,
  Play,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Images,
} from "lucide-react";

const categories = ["All", "Wildlife", "Landscapes", "Culture", "People"];

const galleryImages = [
  { id: 1, src: "https://i.pinimg.com/736x/2b/aa/0f/2baa0f0b1c59deec862d2a8a6b300ae8.jpg", category: "Wildlife", title: "Majestic Elephant", location: "Akagera Park" },
  { id: 2, src: "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg", category: "Wildlife", title: "Golden Monkey", location: "Volcanoes Park" },
  { id: 3, src: "https://i.pinimg.com/736x/f9/9e/2f/f99e2fdce5cee014a440d0ee3eedce76.jpg", category: "Landscapes", title: "Misty Mountains", location: "Virunga Massif" },
  { id: 4, src: "https://i.pinimg.com/736x/c7/c9/26/c7c926aaf0f161086dd07ecab6636f23.jpg", category: "People", title: "Local Portraits", location: "Kigali" },
  { id: 5, src: "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg", category: "Landscapes", title: "Lake Kivu Sunset", location: "Rubavu" },
  { id: 6, src: "https://i.pinimg.com/736x/80/8d/91/808d91821c1f5c2342c222215223cbc6.jpg", category: "Culture", title: "Traditional Dance", location: "Cultural Village" },
  { id: 7, src: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg", category: "Wildlife", title: "Silverback Gorilla", location: "Volcanoes Park" },
  { id: 8, src: "https://i.pinimg.com/736x/4f/fc/84/4ffc84cb985a075626662bea126f5ec7.jpg", category: "Landscapes", title: "Nyungwe Canopy", location: "Nyungwe Forest" },
  { id: 9, src: "https://i.pinimg.com/736x/0f/84/de/0f84dec8e96fc7763eb982ef71295fe8.jpg", category: "Culture", title: "Artisan Crafting", location: "Nyanza" },
];

const highlights = [
  {
    title: "The Gorilla Trek",
    desc: "Intimate moments with the endangered mountain gorillas in the misty bamboo forests.",
    img: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
    category: "Wildlife",
  },
  {
    title: "Golden Hour at Kivu",
    desc: "Serene sunsets and the gentle ripples of Rwanda's most stunning lake.",
    img: "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
    category: "Landscapes",
  },
  {
    title: "Spirit of the Culture",
    desc: "The vibrant energy, rich traditions and profound resilience of the Rwandan people.",
    img: "https://i.pinimg.com/736x/80/8d/91/808d91821c1f5c2342c222215223cbc6.jpg",
    category: "Culture",
  },
];

const VIDEO_ID = "Ov8JhHzPUKo";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playVideo, setPlayVideo] = useState(false);

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const countFor = (category: string) =>
    category === "All"
      ? galleryImages.length
      : galleryImages.filter((img) => img.category === category).length;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % filteredImages.length)),
    [filteredImages.length]
  );
  const showPrev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? i : (i - 1 + filteredImages.length) % filteredImages.length
      ),
    [filteredImages.length]
  );

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

  const openCollection = (category: string) => {
    setActiveCategory(category);
    document.getElementById("gallery-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  const current = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <div className="bg-white text-[#0a120b] font-sans overflow-hidden selection:bg-[#c5a86d] selection:text-black">
      {/* Lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a1811]/95 backdrop-blur-md flex flex-col"
            onClick={closeLightbox}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 md:px-10 py-5 text-white">
              <span className="text-xs tracking-[0.25em] uppercase text-zinc-400">
                {(lightboxIndex ?? 0) + 1} / {filteredImages.length}
              </span>
              <button
                onClick={closeLightbox}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white hover:text-[#0e1d16] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image */}
            <div className="relative flex-1 flex items-center justify-center px-4 md:px-24 min-h-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous photo"
                className="absolute left-3 md:left-8 z-10 w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#0e1d16] hover:border-[#c5a86d] transition-all"
              >
                <ChevronLeft size={22} />
              </button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={current.id}
                  src={current.src}
                  alt={current.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </AnimatePresence>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next photo"
                className="absolute right-3 md:right-8 z-10 w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#0e1d16] hover:border-[#c5a86d] transition-all"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Caption */}
            <div className="px-6 py-6 text-center text-white" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-serif uppercase tracking-wide">{current.title}</h3>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
                <span className="px-2.5 py-1 rounded-full bg-[#c5a86d]/15 text-[#c5a86d] uppercase tracking-widest text-[10px]">
                  {current.category}
                </span>
                <MapPin size={12} /> {current.location}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative min-h-[70vh] w-full bg-[#0a1811] text-white flex flex-col justify-center px-6">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504173010664-32509aeebb62?auto=format&fit=crop&w=2000&q=80"
            alt="Two lionesses watching from the grass"
            className="w-full h-full object-cover object-[70%_center] brightness-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1d16] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto md:px-6 pt-36 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal uppercase tracking-wide leading-[1.08] mb-6">
              Moments From <br />
              <span className="text-[#c5a86d]">The Wild</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed max-w-xl mb-8">
              Gorillas in the mist, golden sunsets over Lake Kivu and the warm smiles
              of the people we meet along the way. Take a look at the moments our guests
              and guides have captured.
            </p>
            <button
              onClick={() =>
                document.getElementById("gallery-grid")?.scrollIntoView({ behavior: "smooth" })
              }
              className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md hover:shadow-lg transition-all duration-300"
            >
              Browse Photos
              <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section id="gallery-grid" className="relative z-20 px-6 -mt-10 scroll-mt-24">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-[0_20px_50px_-15px_rgba(10,24,17,0.35)] border border-[#0a120b]/5 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-all duration-300 ${
                    active
                      ? "bg-[#12231a] text-[#c5a86d] shadow-md"
                      : "text-[#0a120b]/65 hover:bg-[#f7f5f0] hover:text-[#0a120b]"
                  }`}
                >
                  {category}
                  <span
                    className={`text-[10px] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center ${
                      active ? "bg-[#c5a86d] text-[#0e1d16]" : "bg-[#0a120b]/5 text-[#0a120b]/50"
                    }`}
                  >
                    {countFor(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
                Curated Collection
              </span>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide">
                {activeCategory === "All" ? "Through Our Lens" : activeCategory}
              </h2>
            </div>
            <p className="hidden sm:flex items-center gap-2 text-sm text-[#0a120b]/50">
              <Images size={16} />
              {filteredImages.length} photos
            </p>
          </div>

          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img, i) => (
                <motion.button
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setLightboxIndex(i)}
                  className="group relative block w-full mb-5 overflow-hidden rounded-xl bg-[#f7f5f0] break-inside-avoid text-left shadow-sm hover:shadow-2xl transition-shadow duration-500"
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-widest text-[#12231a]">
                    {img.category}
                  </span>
                  <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#c5a86d] text-[#0e1d16] flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Maximize2 size={15} />
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-lg md:text-xl font-serif leading-snug">{img.title}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-zinc-300 mt-1">
                      <MapPin size={12} className="text-[#c5a86d]" />
                      {img.location}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
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
              Featured Film
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide leading-tight mb-6">
              Feel the rhythm <br /> of the wild
            </h2>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-8 max-w-md">
              There is a heartbeat in Rwanda. It echoes through the canopies of Nyungwe,
              pulses through the streets of Kigali and settles quietly in the mist of the
              Virungas. Press play and feel it for yourself.
            </p>

            <button
              onClick={() => setPlayVideo(true)}
              className="group inline-flex items-center gap-3 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:text-[#c5a86d]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 transition-all duration-300 group-hover:border-[#c5a86d] group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16]">
                <Play size={15} className="ml-0.5 fill-current" />
              </span>

              <span className="border-b border-white/40 pb-1 transition-colors duration-300 group-hover:border-[#c5a86d]">
                Watch the film
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
                title="Visit Rwanda"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlayVideo(true)}
                aria-label="Play film"
                className="group absolute inset-0 w-full h-full"
              >
                <img
                  src={`https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`}
                  alt="Visit Rwanda film"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
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

      {/* Visual stories */}
      <section className="px-6 py-24 bg-[#f7f5f0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.2em] uppercase">
              Visual Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {highlights.map((story, i) => (
              <motion.button
                key={story.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                onClick={() => openCollection(story.category)}
                className="group relative rounded-xl overflow-hidden shadow-xl h-[420px] flex flex-col justify-end p-6 text-left border border-white/10 hover:border-[#c5a86d]/40 transition-all duration-500"
              >
                <img
                  src={story.img}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                <div className="relative z-10 text-white">
                  <h3 className="text-xl sm:text-2xl font-serif mb-2 leading-snug">{story.title}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">{story.desc}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-[#c5a86d] uppercase tracking-widest">
                    View {story.category}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden bg-[#0a1811] text-white">
          <img
            src="https://i.pinimg.com/736x/2b/aa/0f/2baa0f0b1c59deec862d2a8a6b300ae8.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1811] via-[#0a1811]/85 to-transparent" />
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 max-w-2xl">
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-4">
              Your turn
            </span>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-wide leading-tight mb-5">
              Step into the picture
            </h2>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-8 max-w-lg">
              Don&apos;t just look at these moments, live them. Let us create an
              unforgettable African adventure for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/tour"
                className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md hover:shadow-lg transition-all duration-300"
              >
                Explore Tours
              </Link>
              <Link
                href="/contact"
                className="border border-white/40 hover:border-white bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white text-sm px-7 py-3 rounded-sm transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
