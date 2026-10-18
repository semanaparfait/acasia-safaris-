import React from "react";
import shemaCEO from "@/public/aboutus/shema.jpeg"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export default function Experience() {
  const experiences: ExperienceItem[] = [
    {
      id: "gorilla",
      title: "Gorilla & Primate Trekking",
      description:
        "Face-to-face encounters with mountain gorillas in Volcanoes National Park and chimpanzees in Nyungwe.",
      href: "/booking?destination=gorillas",
      image:
        "https://i.pinimg.com/736x/a8/51/a1/a851a155910cf89acc36f7598a83ee84.jpg",
    },
    {
      id: "savannah",
      title: "Savannah & Big Five",
      description:
        "Private game drives and boat safaris among lions, elephants and rhinos in Akagera National Park.",
      href: "/booking?destination=wildlife",
      image:
        "https://i.pinimg.com/736x/f5/b0/19/f5b019021de4fdaaa46fc56b4fde7c4f.jpg",
    },
    {
      id: "lodges",
      title: "Ultra-Luxury Lodges",
      description:
        "Hand-picked eco-lodges, lakeside resorts and boutique hotels across Rwanda.",
      href: "/booking?destination=luxury",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="bg-[linear-gradient(to_bottom,#12231a_0%,#12231a_50%,#ffffff_50%,#ffffff_100%)] py-24 px-6 text-white relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.2em] uppercase text-[#d4b47c]">
            The Acacia Experience
          </h2>
        </div>

        {/* Experiences 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {experiences.map((exp) => (
            <Link
              key={exp.id}
              href={exp.href}
              className="group relative rounded-xl overflow-hidden shadow-2xl h-[420px] sm:h-[460px] flex flex-col justify-end p-6 border border-white/10 hover:border-[#c5a86d]/40 transition-all duration-500"
            >
              {/* Background Image */}
              <img
                src={exp.image}
                alt={exp.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Multi-stage Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

              {/* Card Content */}
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-serif text-white mb-2 leading-snug">
                  {exp.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed mb-4">
                  {exp.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#c5a86d]">
                  Explore
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CEO Quote Card */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-[#fcfbf9] text-[#1c2921] rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
            {/* Quote & Author Info */}
            <div className="space-y-3 text-center sm:text-left">
              <p className="italic text-xs sm:text-[13px] leading-relaxed text-[#2a362f] max-w-lg">
                &ldquo;Every journey we craft is an intimate story of adventure,
                conservation, and luxury. We don&apos;t just show you East Africa—we
                invite you to experience its soul.&rdquo;
              </p>
              <div className="text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-[#18231c]">
                Shema Alain,{" "}
                <span className="text-[#8c7447] font-medium">
                  CEO of ACACIA SAFARIS
                </span>
              </div>
            </div>

            {/* CEO Headshot */}
            <div className="shrink-0">
              <Image
                src={shemaCEO}
                alt="Shema Alain - CEO"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg object-cover shadow-md border border-black/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
