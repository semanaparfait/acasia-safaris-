"use client"; 

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, MapPin, Phone, ChevronDown } from 'lucide-react';
import logo from '@/public/logo2.png';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/destination' },
    {name: 'Gallery', href: '/gallery'},
    { name: 'Tour package', href: '/tour' },
    { name: 'About Us', href: '/aboutus' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`${pathname === '/booking' ? 'hidden' : ""}`}>
 
      <div className={`fixed top-0 bg-amber-950 w-full z-60 hidden lg:block transition-transform duration-300 ${
        isScrolled ? '-translate-y-full ' : 'translate-y-0'
      } border-b border-white/10 bg-black/20 backdrop-blur-sm 
      `}>
        <div className="bg-amber-700 hidden max-w-7xl mx-auto px-6 py-2 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-white/80">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><MapPin size={12} className="text-emerald-500" /> Kigali, Rwanda</span>
            <span className="flex items-center gap-2"><Phone size={12} className="text-emerald-500" /> +250 7XX XXX XXX</span>
          </div>
          <div className="flex gap-4">
            <Link href="/faq" className="hover:text-emerald-400">FAQ</Link>
            <Link href="/reviews" className="hover:text-emerald-400">Guest Reviews</Link>
          </div>
        </div>
      </div>


      <header 
        className={`fixed  left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          pathname === '/contact'
            ? ' bg-[#0a120b]/90 py-6'
            : isScrolled 
              ? 'top-0 bg-[#0a120b]/90 backdrop-blur-xl py-3 shadow-2xl' 
              : 'top-0  bg-transparent py-'
        }`}
      >
        <nav className="max-w-7xl  mx-auto px-6 flex items-center justify-between py-2">
          

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative  ">
          <Image
                src={logo}
                alt="Acasia Safaris Logo"
                width={60}
                height={60}
                className=""
              />
            </div>
            <div className="flex flex-col hidden">
              <span className={`md:text-xl font-black leading-none tracking-tighter ${isScrolled ? 'text-white' : 'text-white'}`}>
                ACASIA<span className="text-[--accent-gold]"> SAFARIS</span>
              </span>
              <span className="text-[10px] uppercase tracking-[3px] text-[--accent-gold] font-bold">LTD</span>
            </div>
          </Link>


          <ul className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <li key={link.name} className="relative group">
                  <Link 
                    href={link.href}
                    className={`text-[13px] font-bold uppercase tracking-[2px] transition-colors ${
                      isActive
                        ? 'text-(--accent-gold) underline underline-offset-8 decoration-2 decoration-(--accent-gold)'
                        : 'text-white/90 hover:text-(--accent-gold)'
                    }`}
                  >
                    {link.name}
                  </Link>
                  
                  {!isActive && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                  )}
                </li>
              );
            })}
          </ul>


          <div className="flex items-center gap-6">
            
            <Link 
              href="/booking"
              className="bg-(--accent-gold) hidden md:flex hover:bg-(--accent-gold) text-white px-7  py-3 rounded-lg md:text-[12px] text-sm font-semibold md:font-bold uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              Plan Trip
            </Link>
            

            <button 
              className="lg:hidden text-white" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </nav>


        <div className={`fixed text-left inset-0 bg-[#0a120b] z-100 transition-all duration-700 flex flex-col justify-center items-center gap-8 ${
          isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        }`}>
           <button 
            className="absolute top-8 right-8 text-white" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={40} />
          </button>
          
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-4xl font-black text-white hover:text-emerald-500 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/booking" 
            className="mt-4 bg-(--accent-gold) text-white px-12 py-5 rounded-full font-black text-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Plan Trip
          </Link>
        </div>
      </header>
    </header>
  );
}