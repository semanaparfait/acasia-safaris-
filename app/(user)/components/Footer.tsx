import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';
import logo from '@/public/logo.jpeg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a120b] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Branding & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-16 border-b border-white/10">
          
          {/* Column 1: Brand Story */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image 
                src={logo} 
                alt="Acasia Safaris Logo" 
                width={60} 
                height={60} 
                className="rounded-full border border-emerald-500/30"
              />
              <span className="text-2xl font-bold tracking-tighter">
                ACASIA<span className="text-emerald-500"> SAFARIS</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Crafting unforgettable African adventures. From the heart of the savannah to the peaks of the mountains, experience the wild with Acasia Safaris Ltd.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-6">Explore</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/tours" className="hover:text-emerald-500 transition-colors">Wild Safaris</Link></li>
                <li><Link href="/destinations" className="hover:text-emerald-500 transition-colors">Destinations</Link></li>
                <li><Link href="/about" className="hover:text-emerald-500 transition-colors">Our Story</Link></li>
                <li><Link href="/blog" className="hover:text-emerald-500 transition-colors">Travel Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/contact" className="hover:text-emerald-500 transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-500 transition-colors">Terms of Use</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-500 transition-colors">FAQs</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Join the Adventure</h4>
            <p className="text-gray-400 text-sm">Subscribe for travel tips and exclusive safari offers.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white/5 border border-white/10 rounded-lg py-4 px-6 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button className="absolute right-2 top-2 bg-emerald-600 p-2.5 rounded-full hover:bg-emerald-500 transition-colors">
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-gray-400">
                <Phone size={18} className="text-emerald-500" />
                <span className="text-sm">+250 7XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail size={18} className="text-emerald-500" />
                <span className="text-sm">info@acasiasafaris.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin size={18} className="text-emerald-500" />
                <span className="text-sm">Kigali, Rwanda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Accreditation & Copyright */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs tracking-widest uppercase">
            © {currentYear} ACASIA SAFARIS LTD. ALL RIGHTS RESERVED.
          </p>
          
          {/* Professional Accreditations - Essential for Tourism */}
          <div className="flex items-center gap-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             {/* Replace these with real travel association icons like IATA, ATTA, etc. */}
             <div className="text-[10px] font-bold border border-white/20 px-2 py-1 uppercase">Travel Assured</div>
             <div className="text-[10px] font-bold border border-white/20 px-2 py-1 uppercase">Eco-Certified</div>
             <div className="text-[10px] font-bold border border-white/20 px-2 py-1 uppercase">Safe Travels</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;