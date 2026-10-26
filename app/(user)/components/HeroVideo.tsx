"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

const POSTER =
  "https://i.pinimg.com/1200x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  // Respect users who prefer reduced motion: show the poster instead of playing
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-[#0a1811] text-white font-sans selection:bg-[#c5a86d] selection:text-black">
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/acacia.mp4"
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-transparent to-black/50" />

      {/* Centred content */}
      <div className="relative z-10 h-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.4em] text-[#c5a86d] mb-6"
        >
          <span className="w-8 h-px bg-[#c5a86d]" />
          acacia Safaris
          <span className="w-8 h-px bg-[#c5a86d]" />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif uppercase tracking-wide leading-[1.02] mb-6"
        >
          Experience <br />
          <span className="text-[#c5a86d]">The Wild</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-sm md:text-lg text-zinc-200 font-light max-w-xl mb-10"
        >
          Unforgettable safaris in the heart of Rwanda.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-4 rounded-full shadow-lg hover:shadow-[0_15px_40px_-10px_rgba(197,168,109,0.7)] transition-all duration-300"
          >
            Book Your Trip
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/destination"
            className="inline-flex items-center gap-2 border border-white/50 hover:border-white bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm px-8 py-4 rounded-full transition-all duration-300"
          >
            Explore Destinations
          </Link>
        </motion.div>
      </div>

      {/* Video controls */}
      <div className="absolute z-10 bottom-8 right-6 md:right-10 flex gap-2">
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          {playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Scroll cue */}
      <motion.button
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
        }
        aria-label="Scroll down"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-zinc-300 hover:text-white"
      >
        Scroll
        <ChevronDown size={18} />
      </motion.button>
    </section>
  );
}
