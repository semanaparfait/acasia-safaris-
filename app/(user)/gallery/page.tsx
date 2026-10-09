"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Play, Camera, ZoomIn, Mountain, Users, Heart } from "lucide-react";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

// Categories
const categories = ["All", "Wildlife", "Landscapes", "Culture", "People"];

// Images Data for Masonry
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

// Highlight Stories
const highlights = [
  {
    title: "The Gorilla Trek",
    desc: "Intimate moments with the endangered mountain gorillas in the misty bamboo forests.",
    img: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg",
  },
  {
    title: "Golden Hour at Kivu",
    desc: "Serene sunsets and the gentle ripples of Rwanda's most stunning lake.",
    img: "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg",
  },
  {
    title: "Spirit of the Culture",
    desc: "The vibrant energy, rich traditions, and profound resilience of the Rwandan people.",
    img: "https://i.pinimg.com/736x/80/8d/91/808d91821c1f5c2342c222215223cbc6.jpg",
  }
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<typeof galleryImages[0] | null>(null);

  // Filter images
  const filteredImages = activeCategory === "All"
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <div className="bg-[#fcfcfc] text-[#0a120b] font-serif overflow-hidden">

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a120b]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X size={32} strokeWidth={1} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-full max-h-[75vh] object-contain shadow-2xl"
              />
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-light tracking-wide">{lightboxImage.title}</h3>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white/50 mt-2">
                  {lightboxImage.category} • {lightboxImage.location}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Hero / Intro Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-[#0a120b]">
          <img
            src="https://i.pinimg.com/1200x/6d/cd/14/6dcd140b80b210ac445a0eddfc40784a.jpg"
            alt="Gallery Hero"
            className="w-full h-full object-cover opacity-50 grayscale-[10%]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-(--primary-dark) text-5xl md:text-7xl tracking-wide mb-6 block ${greatVibes.className}`}
          >
            Moments from Rwanda
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-light tracking-tight text-white max-w-4xl leading-[1.1] mb-8 uppercase"
          >
            A visual <span className="italic font-serif normal-case font-light text-white/70">journey.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl font-serif italic max-w-2xl mb-12"
          >
            Discover the breathtaking beauty, vibrant culture, and untamed adventures captured through our lens.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              className="bg-white text-[#0a120b] px-12 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors"
              onClick={() => {
                document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Gallery
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Filter / Categories */}
      <section id="gallery-grid" className="py-24 max-w-7xl mx-auto px-6 md:px-12 border-b border-[#0a120b]/5">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">
            Curated Collections
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Through the <span className="italic text-gray-400">Lens</span>
          </h2>
        </div>

        {/* Categories Tabs */}
        <div className="flex justify-center flex-wrap gap-4 md:gap-8 pb-4">
          {categories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(category)}
              className={`font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${activeCategory === category
                  ? 'border-[var(--primary-dark)] text-[#0a120b]'
                  : 'border-transparent text-[#0a120b]/40 hover:text-[#0a120b]/70'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Image Grid / Masonry Layout */}
      <section className="pb-32 bg-[#fcfcfc]">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12">
          {/* CSS Columns Approach to Masonry */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pt-10">
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative group overflow-hidden cursor-pointer bg-gray-100 break-inside-avoid"
                  onClick={() => setLightboxImage(img)}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-auto object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-white">
                    <ZoomIn size={32} strokeWidth={1} className="mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500" />
                    <h4 className="text-xl font-light tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{img.title}</h4>
                    <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white/70 mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      {img.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. Featured Video Section */}
      <section className="py-32 bg-[#0a120b] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <span className="text-white/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-6">
                Featured Film
              </span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                Feel the rhythm of <span className="italic font-serif normal-case text-white/60">the wild.</span>
              </h2>
              <p className="text-lg text-white/60 italic font-serif leading-relaxed mb-10">
                "There is a palpable heartbeat in Rwanda. It reverberates in the dense canopies of Nyungwe, pulses through the streets of Kigali, and settles quietly in the mist of the Virungas."
              </p>
              <button className="flex items-center gap-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] hover:text-white/70 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#0a120b] transition-all">
                  <Play size={14} className="ml-1 fill-current" />
                </div>
                Watch Short Film
              </button>
            </div>

            <div className="w-full md:w-1/2 relative aspect-[4/3] overflow-hidden group">
              <iframe
                className="w-full h-full pointer-events-none opacity-60"
                src="https://www.youtube.com/embed/Ov8JhHzPUKo?autoplay=1&mute=1&loop=1&playlist=Ov8JhHzPUKo&controls=0&showinfo=0&modestbranding=1"
                title="Visit Rwanda"
                allow="autoplay; fullscreen"
              ></iframe>
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Gallery Highlights / Stories */}
      <section className="py-32 bg-white border-b border-[#0a120b]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-24">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">Portfolios</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">Visual <span className="italic text-gray-400">Stories</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {highlights.map((story, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden mb-8 bg-gray-100">
                  <img
                    src={story.img}
                    alt={story.title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl mb-4 text-[#0a120b] group-hover:text-[var(--primary-dark)] transition-colors">{story.title}</h3>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#0a120b]/50 leading-relaxed max-w-xs mx-auto">
                    {story.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA / Explore Tours */}
      <section className="py-32 px-6 flex flex-col items-center text-center bg-[#fcfcfc]">
        <div className="mb-10 text-[var(--primary-dark)] opacity-40">
          <Camera size={32} strokeWidth={1} />
        </div>
        <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
          Step into the <span className="italic text-gray-400">picture.</span>
        </h2>
        <p className="text-xl text-[#0a120b]/60 font-serif italic mb-12 max-w-2xl">
          Don't just look at the moments—live them. Let us craft your unforgettable Rwandan journey.
        </p>
        <div className="flex gap-6 flex-wrap justify-center">
          <button className="bg-[var(--primary-dark)] text-white px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-emerald-800 transition-colors">
            Book Your Adventure
          </button>
          <button className="border border-[#0a120b]/20 text-[#0a120b] px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-[#0a120b] hover:text-white transition-colors">
            View Itineraries
          </button>
        </div>
      </section>

    </div>
  );
}
