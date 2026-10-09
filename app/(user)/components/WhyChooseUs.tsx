"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Compass, Leaf, Award } from 'lucide-react';

const pillars = [
  {
    icon: <ShieldCheck size={20} className="text-emerald-700" />,
    title: "Secure & Certified",
    desc: "Fully licensed by the RDB with comprehensive traveler insurance for total peace of mind."
  },
  {
    icon: <Compass size={20} className="text-emerald-700" />,
    title: "Expert Local Guides",
    desc: "Led by professionals who have spent decades navigating the East African savannah."
  },
  {
    icon: <Leaf size={20} className="text-emerald-700" />,
    title: "Eco-Conscious Travel",
    desc: "Every booking supports local conservation efforts and empowers rural communities."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-white text-[#0a120b] px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center">
          
          {/* Left Side: Immersive Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative rounded-[2.5rem] overflow-hidden w-[500px] shadow-2xl"
          >
            <img 
              src="https://i.pinimg.com/1200x/15/d9/bd/15d9bdd92790068e0cec9a1d7b179196.jpg" 
              className="w-full h-full object-cover" 
              alt="Safari Experience" 
            />
            {/* Minimalist Floating Badge */}
            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-white/20">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Awarded</p>
                <p className="text-sm font-bold">Top Safari Operator</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Clean Narrative & Features */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">
                The Acasia Standard
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-6 uppercase">
                Why our guests <br /> 
                <span className="italic font-serif font-light text-emerald-800/60">Choose Acasia.</span>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed max-w-md">
                We believe in safaris that are as refined as they are raw. Our commitment to quality 
                ensures your journey is safe, authentic, and perfectly tailored.
              </p>
            </motion.div>

            {/* List of Pillars */}
            <div className="space-y-8">
              {pillars.map((pill, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#f9f9fb] flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300">
                    {pill.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider mb-2">{pill.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed max-w-sm">{pill.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}