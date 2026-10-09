"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Great_Vibes } from 'next/font/google';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
});

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#0a120b] font-serif pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Page Header */}
        <div className="flex flex-col items-center text-center mb-24 border-b border-[#0a120b]/10 pb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-(--primary-dark) text-5xl md:text-6xl tracking-wide mb-4 block ${greatVibes.className}`}
          >
            Get in touch
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-6">
            Begin your <span className="italic text-gray-400">Journey</span>
          </h1>
          <p className="max-w-xl text-lg text-[#0a120b]/70 font-serif italic">
            Whether you are looking for a bespoke private safari or need assistance planning the perfect getaway, our concierges are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">


          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#0a120b]/50 mb-10">
                Direct Contact
              </h3>

              <div className="flex flex-col gap-10">

                <div className="flex items-start gap-6 group">
                  <div className="w-10 h-10 border border-[#0a120b]/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#0a120b] group-hover:text-white transition-all duration-500">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h4 className="text-2xl mb-2">Our Office</h4>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60 leading-relaxed">
                      Nairobi, Kenya<br />
                      Westlands, Delta Corner Tower
                    </p>
                  </div>
                </div>


                <div className="flex items-start gap-6 group">
                  <div className="w-10 h-10 border border-[#0a120b]/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#0a120b] group-hover:text-white transition-all duration-500">
                    <Phone size={16} />
                  </div>
                  <div>
                    <h4 className="text-2xl mb-2">Reservations</h4>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60 mb-1">
                      +254 700 000 000
                    </p>
                    <span className="text-sm italic text-[#0a120b]/40">Mon-Fri, 9am - 6pm EAT</span>
                  </div>
                </div>


                <div className="flex items-start gap-6 group">
                  <div className="w-10 h-10 border border-[#0a120b]/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#0a120b] group-hover:text-white transition-all duration-500">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-2xl mb-2">Inquiries</h4>
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60 cursor-pointer hover:text-[#0a120b] transition-colors">
                      concierge@acasiasafaris.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20">
              <div className="w-full h-px bg-[#0a120b]/10 mb-8" />
              <p className="text-sm italic text-[#0a120b]/50">
                "We believe that the finest journeys are crafted with patience, expertise, and an unwavering attention to detail."
              </p>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="bg-white p-10 md:p-14 border border-[#0a120b]/5 shadow-sm"
          >
            <h3 className="text-3xl mb-8">Send an Inquiry</h3>
            <form className="flex flex-col gap-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full bg-transparent border-b border-[#0a120b]/20 pb-3 text-lg focus:outline-none focus:border-[#0a120b] transition-colors rounded-none"
                    placeholder="Jane"
                  />
                </div>


                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full bg-transparent border-b border-[#0a120b]/20 pb-3 text-lg focus:outline-none focus:border-[#0a120b] transition-colors rounded-none"
                    placeholder="Doe"
                  />
                </div>
              </div>


              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-transparent border-b border-[#0a120b]/20 pb-3 text-lg focus:outline-none focus:border-[#0a120b] transition-colors rounded-none"
                  placeholder="jane@example.com"
                />
              </div>


              <div className="flex flex-col gap-2">
                <label htmlFor="interest" className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">
                  Primary Interest
                </label>
                <select
                  id="interest"
                  className="w-full bg-transparent border-b border-[#0a120b]/20 pb-3 text-lg focus:outline-none focus:border-[#0a120b] transition-colors rounded-none appearance-none cursor-pointer italic text-[#0a120b]/70"
                >
                  <option value="">Select a journey type...</option>
                  <option value="private">Private Safari</option>
                  <option value="group">Group Expedition</option>
                  <option value="honeymoon">Honeymoon</option>
                  <option value="photography">Photography Tour</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>


              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a120b]/60">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full bg-transparent border-b border-[#0a120b]/20 pb-3 text-lg focus:outline-none focus:border-[#0a120b] transition-colors resize-none rounded-none"
                  placeholder="Tell us about your dream adventure..."
                />
              </div>

              <button
                type="button"
                className="group mt-6 flex items-center justify-between w-full bg-[#0a120b] text-white px-8 py-5 hover:bg-[#0a120b]/80 transition-all font-sans text-[10px] font-bold uppercase tracking-[0.3em]"
              >
                <span>Submit Inquiry</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
              </button>

            </form>
          </motion.div>

        </div>
      </div>
            <div className="md:px-6 px-3 mt-8 mb-5 max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl h-[450px]">

            <iframe
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4730576220622!2d30.098852474015416!3d-1.9646178980175963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca9b295f0ced9%3A0x3cb73a2a3f5aa7c5!2sSOLVIT%20AFRICA%20Training%20Center!5e0!3m2!1sen!2srw!4v1771490072483!5m2!1sen!2srw"
            width="100%"
            height="100%"
            allowFullScreen
            style={{ border: 0, filter: 'grayscale(0.5) contrast(1.2)' }}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">

                </iframe>
        </div>
      </div>
    </div>
  );
}