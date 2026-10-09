"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Trees } from 'lucide-react';

export default function AboutUs() {
  const features = [
    "Expert-Led Private Expeditions",
    "Luxury Wilderness Lodging",
    "Authentic Cultural Encounters",
    "Tailored Conservation Journeys",
  ];

  return (

    <section className="py-24 px-6 md:px-10 bg-[#f9f9fb] text-[#0a120b] overflow-hidden">

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 items-center justify-center">
        

        <div className="flex flex-col justify-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-emerald-700 font-bold text-xs mb-3 block uppercase tracking-widest">About Acasia</span>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              A Premier <br /> Safari Legacy
            </h2>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-10">
              Acasia Safaris Ltd is dedicated to crafting immersive journeys that connect you to the raw, untouched beauty of the African wild.
            </p>

            <div className="grid grid-cols-2 gap-y-8 mb-10">
              <div>
                <h4 className="text-3xl font-bold text-(--primary-color)">10,000+</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Yearly Visitors</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-(--primary-color)">94%</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Satisfaction Rate</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-(--primary-color)">Top 100</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Global Destination</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-(--primary-color)">12+</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Industry Awards</p>
              </div>
            </div>

            <button className="bg-emerald-800 text-white px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg">
              Learn More <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        <div className="relative h-[600px] w-full flex items-center justify-center lg:justify-end">
          

          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            className="absolute top-10 left-0 xl:-right-15 w-[260px] h-[160px] rounded-2xl shadow-xl z-10 border-8 border-white"
          >
            <img src="https://i.pinimg.com/1200x/15/d9/bd/15d9bdd92790068e0cec9a1d7b179196.jpg" 
            className="w-full h-full object-cover rounded-xl" 
            alt="Safari Detail" />
          </motion.div>


          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            className="relative w-[340px] h-[380px] z-0 shadow-2xl"
          >
            <img src="https://i.pinimg.com/736x/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg" 
            className="w-full h-full object-cover rounded-2xl"
             alt="Main Wildlife" />
            

            <div className="absolute top-1/2 -right-16 -translate-y-1/2 bg-emerald-700 text-white p-5 rounded-2xl shadow-2xl z-30 flex flex-col items-center gap-2 min-w-[140px]">
              <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center">
                 <Trees size={18} />
              </div>
              <p className="text-[11px] font-bold text-center uppercase tracking-tighter leading-tight">Embrace <br/> the wild</p>
            </div>
          </motion.div>



          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            className="absolute bottom-10 left-8 w-[240px] h-[160px] rounded-2xl border-8 border-white z-10 shadow-xl"
          >
            <img src="https://i.pinimg.com/736x/48/42/4b/48424b75b7f6fa0114c5664b86296ab8.jpg"
             className="w-full h-full object-cover rounded-xl"
              alt="Lodge Detail" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}