"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Compass, CheckCircle2, ShieldCheck, Gem, MapPin, Building, Car, Navigation, BookOpen } from 'lucide-react';
import { Great_Vibes } from 'next/font/google';

const greatVibes = Great_Vibes({ 
  weight: '400', 
  subsets: ['latin'],
});

const differentiators = [
  { icon: <ShieldCheck size={28} strokeWidth={1} />, title: "Local Experts", text: "Deep-rooted knowledge of Rwanda's hidden gems." },
  { icon: <Compass size={28} strokeWidth={1} />, title: "Trusted Guides", text: "Professional, multi-lingual rangers and drivers." },
  { icon: <CheckCircle2 size={28} strokeWidth={1} />, title: "Verified Destinations", text: "Every lodge and experience is personally vetted." },
  { icon: <Gem size={28} strokeWidth={1} />, title: "Premium Value", text: "Uncompromising quality accessible to discerning travelers." },
];

const services = [
  { icon: <Navigation size={24} strokeWidth={1} />, title: "Book Tours", desc: "Curated safaris and cultural immersions." },
  { icon: <Building size={24} strokeWidth={1} />, title: "Find Hotels", desc: "Access to Rwanda's most exclusive camps and lodges." },
  { icon: <Car size={24} strokeWidth={1} />, title: "Rent Cars", desc: "Premium 4x4 vehicles for rugged and comfortable travel." },
  { icon: <MapPin size={24} strokeWidth={1} />, title: "Discover Attractions", desc: "Tailored itineraries to the country's breathtaking landmarks." },
  { icon: <BookOpen size={24} strokeWidth={1} />, title: "Travel Guides", desc: "Comprehensive insights tailored for your journey." },
];

const highlights = [
  { name: "Volcanoes National Park", img: "https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg" },
  { name: "Lake Kivu", img: "https://i.pinimg.com/736x/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg" },
  { name: "Nyungwe Forest", img: "https://i.pinimg.com/736x/29/c6/d9/29c6d9f0c66cbefe2dfd664176627428.jpg" },
];

const team = [
  { name: "David M.", role: "Founder & Visionary", img: "https://i.pinimg.com/736x/d2/b3/fe/d2b3fe33dbe5cfecbd55a1a779f297f7.jpg" },
  { name: "Sarah K.", role: "Head of Travel Design", img: "https://i.pinimg.com/736x/50/74/ad/5074ad995d8d980f9f22499fd015f64b.jpg" },
  { name: "Eric N.", role: "Lead Safari Guide", img: "https://i.pinimg.com/736x/43/31/8d/43318dd3c21426b18fa571f5587f104f.jpg" },
];

export default function About() {
  return (
    <div className="bg-[#fcfcfc] text-[#0a120b] font-serif overflow-hidden">
      
      <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden bg-[#0a120b]">
        <iframe
          className="w-full h-full pointer-events-none opacity-60"
          src="https://www.youtube.com/embed/Ov8JhHzPUKo?autoplay=1&mute=1&loop=1&playlist=Ov8JhHzPUKo&controls=0&showinfo=0&modestbranding=1"
          title="Visit Rwanda"
          allow="autoplay; fullscreen"
        ></iframe>
      </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-(--primary-dark) text-3xl md:text-6xl tracking-wide mb-6 block ${greatVibes.className}`}
          >
            Discover Rwanda With Us
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:text-4xl text-2xl  font-light tracking-tight text-white max-w-4xl leading-[1.1] mb-8"
          >
            We connect travelers to the <span className="italic text-white/70">beauty, culture, and adventure</span> of Rwanda.
          </motion.h1>
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white text-[#0a120b] px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors"
          >
            Explore Destinations
          </motion.button>
        </div>
      </section>

      {/* 2. Our Story */}
<section className="py-28 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-[0.5em] block mb-10">
            Our story
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter leading-tight mb-12 text-[#0a120b] uppercase">
            A passion for the wild <br /> 
            <span className="italic font-serif font-light text-emerald-800/40 normal-case tracking-normal">and the stories it tells.</span>
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed text-[#0a120b]/70 font-serif italic max-w-3xl mx-auto">
            "Our journey began with a singular vision: to reveal the untamed beauty of Rwanda. We believe every traveler deserves an authentic, deeply moving experience of the Land of a Thousand Hills."
          </p>
        </motion.div>
      </section>

      {/* 3. Mission & Vision - Minimalist Grid */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Mission */}
          <div className="p-16 md:p-24 flex flex-col items-center md:items-start text-center md:text-left group transition-colors hover:bg-[#f9f9fb]">
            <span className="text-emerald-700/50 font-bold text-[9px] uppercase tracking-[0.6em] block mb-8 group-hover:text-emerald-700 transition-colors">
              The Mission
            </span>
            <h3 className="text-2xl md:text-3xl font-light leading-snug tracking-tight text-[#0a120b]">
              To make travel in Rwanda <br />
              <span className="italic font-serif text-emerald-800/60">simple, safe, & unforgettable.</span>
            </h3>
          </div>

          {/* Vision */}
          <div className="p-16 md:p-24 flex flex-col items-center md:items-start text-center md:text-left group transition-colors hover:bg-[#f9f9fb]">
            <span className="text-emerald-700/50 font-bold text-[9px] uppercase tracking-[0.6em] block mb-8 group-hover:text-emerald-700 transition-colors">
              The Vision
            </span>
            <h3 className="text-2xl md:text-3xl font-light leading-snug tracking-tight text-[#0a120b]">
              To be the most <span className="italic font-serif text-emerald-800/60">trusted gateway</span> <br />
              to the soul of African tourism.
            </h3>
          </div>

        </div>
      </section>

      {/* 4. What Makes Us Different */}
      <section className="py-32 bg-[#fcfcfc]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
              The Acasia <span className="italic text-gray-400">Difference</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {differentiators.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 border border-[#0a120b]/10 rounded-full flex items-center justify-center text-[var(--primary-dark)] mb-6">
                  {item.icon}
                </div>
                <h4 className="text-xl mb-3 text-[#0a120b]">{item.title}</h4>
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a120b]/50 leading-relaxed max-w-[200px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Our Services */}
      <section className="py-32 bg-white border-y border-[#0a120b]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20">
            <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">Our Services</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
              Crafting your <span className="italic text-gray-400">ideal journey</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">
            {services.map((service, idx) => (
              <div key={idx} className="flex flex-col border-l border-[#0a120b]/10 pl-6">
                <div className="text-[#0a120b]/30 mb-6">{service.icon}</div>
                <h4 className="text-xl mb-3">{service.title}</h4>
                <p className="text-sm font-sans text-[#0a120b]/50 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Rwanda Highlights */}
      <section className="py-32 bg-[#fcfcfc]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">
                Destinations
              </span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Rwanda <span className="italic text-gray-400">Highlights</span>
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((place, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden mb-6 bg-gray-100">
                  <img 
                    src={place.img} 
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[15%] group-hover:grayscale-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl text-[#0a120b]">{place.name}</h3>
                  <div className="w-8 h-[1px] bg-[#0a120b]/20 group-hover:bg-[#0a120b] transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Meet the Team */}
      <section className="py-32 bg-white border-y border-[#0a120b]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="text-[#0a120b]/40 font-sans font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">Leadership</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-20">
            Meet the <span className="italic text-gray-400">Team</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-16 md:gap-24">
            {team.map((member, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-8 border border-[#0a120b]/5">
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105"
                  />
                </div>
                <h4 className="text-2xl mb-2">{member.name}</h4>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/50">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 9. Statistics */}
      <section className="bg-[var(--primary-dark)] text-white py-24">
        <div className="max-w-5xl mx-auto px-6 flex justify-around flex-wrap gap-12 text-center">
           <div className="flex flex-col items-center">
              <span className="text-6xl md:text-7xl font-light italic mb-4">500+</span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Travelers Served</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-6xl md:text-7xl font-light italic mb-4">50+</span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Destinations</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-6xl md:text-7xl font-light italic mb-4">100+</span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Tours Completed</span>
           </div>
        </div>
      </section>

      {/* 10. Call to Action */}
      <section className="py-32 px-6 flex flex-col items-center text-center bg-[#0a120b] text-white">
        <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
          Ready to explore <span className="italic text-white/60">Rwanda?</span>
        </h2>
        <p className="font-serif italic text-xl text-white/60 mb-12">
          Start your journey with us today.
        </p>
        <div className="flex gap-6 flex-wrap justify-center">
          <button className="bg-white text-[#0a120b] px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors">
            Explore Tours
          </button>
          <button className="border border-white/20 text-white px-10 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-colors">
            Contact Us
          </button>
        </div>
      </section>

    </div>
  );
}
