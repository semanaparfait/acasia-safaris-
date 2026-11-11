"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { useMessagesStore } from "@/store/messagesStore";

const contactCards = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+250 798 635 578",
    note: "Mon – Sat, 8am – 6pm CAT",
    href: "tel:+250 798 635 578",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@acaciasafaris.com",
    note: "Reply within 24 hours",
    href: "mailto:info@acaciasafaris.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with a planner",
    note: "Fastest way to reach us",
    href: "https://wa.me/250798635578",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Kigali, Rwanda",
    note: "By appointment",
    href: "#map",
  },
];

const fieldClass =
  "w-full bg-[#f7f5f0] border border-[#0a120b]/10 rounded-md px-4 py-3 text-sm text-[#0a120b] placeholder:text-[#0a120b]/35 outline-none focus:border-[#c5a86d] focus:bg-white focus:ring-4 focus:ring-[#c5a86d]/15 transition-all";

const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a120b]/55 mb-2";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const sendMessage = useMessagesStore((s) => s.sendMessage);

  const update =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm({ ...form, [key]: e.target.value });

  // Saves the message; the admin reads it under Messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError("");
    try {
      await sendMessage({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject || "General question",
        body: form.message,
        source: "Contact form",
      });
      setSubmitted(true);
    } catch (error) {
      setSendError((error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setSubmitted(false);
  };

  return (
    <div className="bg-white font-sans text-[#0a120b] selection:bg-[#c5a86d] selection:text-black">
      {/* Hero */}
      <section className="relative min-h-[60vh] w-full bg-[#0a1811] text-white flex flex-col justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80"
            alt="Two people shaking hands"
            className="w-full h-full object-cover object-center brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1d16] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-0 md:px-6 pt-36 pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal uppercase tracking-wide leading-[1.08] mb-6">
              Get in Touch <br />
              <span className="text-[#c5a86d]">With Us</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed max-w-xl">
              Have a question, a comment or need help with an existing booking?
              We&apos;d love to hear from you. Reach out and our team will get
              back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Floating contact cards */}
      <section className="relative z-20 px-6 -mt-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactCards.map((card, i) => (
            <motion.a
              key={card.label}
              href={card.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              className="group bg-white rounded-xl p-6 shadow-[0_20px_50px_-15px_rgba(10,24,17,0.35)] border border-[#0a120b]/5 hover:-translate-y-1.5 hover:border-[#c5a86d]/50 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-[#12231a] text-[#c5a86d] flex items-center justify-center mb-5 group-hover:bg-[#c5a86d] group-hover:text-[#0e1d16] transition-colors duration-300">
                <card.icon size={20} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0a120b]/45 mb-1.5">
                {card.label}
              </p>
              <p className="font-serif text-lg leading-snug mb-1 break-words">
                {card.value}
              </p>
              <p className="text-xs text-[#0a120b]/50">{card.note}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form + info */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Left: info panel */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-[#12231a] text-white p-8 md:p-10 flex flex-col justify-between min-h-[520px]"
          >
            <img
              src="https://i.pinimg.com/736x/a8/51/a1/a851a155910cf89acc36f7598a83ee84.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#12231a]/70 via-[#12231a]/85 to-[#0a1811]" />

            <div className="relative z-10">
              <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-4">
                Contact Information
              </span>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide leading-tight mb-6">
                We&apos;re here <br /> to help
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-8">
                Fill in the form and our team will reply within 24 hours. Prefer
                to talk? Call or message us directly.
              </p>
              <ul className="space-y-5">
                {[
                  { icon: Phone, text: "+250 7XX XXX XXX" },
                  { icon: Mail, text: "info@acaciasafaris.com" },
                  { icon: MapPin, text: "Kigali, Rwanda" },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-4 text-sm text-zinc-200"
                  >
                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-[#c5a86d]" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-10 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Clock size={20} className="text-[#c5a86d] shrink-0" />
                <div>
                  <p className="text-sm font-medium">Office Hours</p>
                  <p className="text-xs text-zinc-400">
                    Mon – Fri 8:00 – 18:00 · Sat 9:00 – 14:00
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social link"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#0e1d16] hover:border-[#c5a86d] transition-all duration-300 hover:-translate-y-1"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[520px] rounded-2xl border border-[#c5a86d]/30 bg-[#f7f5f0] flex flex-col items-center justify-center text-center p-10"
                >
                  <div className="w-16 h-16 rounded-full bg-[#12231a] text-[#c5a86d] flex items-center justify-center mb-6">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="text-3xl font-serif uppercase tracking-wide mb-3">
                    Thank you{form.name ? `, ${form.name.split(" ")[0]}` : ""}
                  </h3>
                  <p className="text-sm text-[#0a120b]/60 max-w-sm leading-relaxed mb-8">
                    Your message has been received. Our team will get back to
                    you within 24 hours.
                  </p>
                  <button
                    onClick={resetForm}
                    className="border border-[#0a120b]/20 hover:border-[#0a120b] text-sm px-7 py-3 rounded-sm transition-all"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
                      Send a message
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wide leading-tight">
                      Drop us a line
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className={labelClass}>
                        Full Name *
                      </label>
                      <input
                        id="name"
                        required
                        value={form.name}
                        onChange={update("name")}
                        placeholder="Jane Doe"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={update("email")}
                        placeholder="jane@example.com"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        Phone / WhatsApp
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+1 555 000 000"
                        className={fieldClass}
                      />
                    </div>
                    <div className="relative">
                      <label htmlFor="subject" className={labelClass}>
                        Subject
                      </label>
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={update("subject")}
                        className={`${fieldClass} appearance-none cursor-pointer`}
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Question</option>
                        <option value="booking">Existing Booking</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 bottom-3.5 w-4 h-4 text-[#0a120b]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClass}>
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={update("message")}
                      placeholder="How can we help you?"
                      className={`${fieldClass} resize-none`}
                    />
                  </div>

                  {sendError && (
                    <p className="text-sm text-red-600">{sendError}</p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between pt-2">
                    <p className="text-xs text-[#0a120b]/45 max-w-xs">
                      We respect your privacy. Your details are only used to
                      reply to you.
                    </p>
                    <button
                      type="submit"
                      disabled={sending}
                      className="group inline-flex items-center justify-center gap-2 bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-8 py-3.5 rounded-sm shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
                    >
                      {sending ? "Sending…" : "Send Message"}
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Map */}
      <section
        id="map"
        className="bg-[linear-gradient(to_bottom,#12231a_0%,#12231a_45%,#ffffff_45%,#ffffff_100%)] px-6 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#c5a86d] font-semibold text-[10px] uppercase tracking-[0.35em] block mb-3">
              Find Us
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.2em] uppercase text-white">
              Our Kigali Office
            </h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-[420px] md:h-[480px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4730576220622!2d30.098852474015416!3d-1.9646178980175963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca9b295f0ced9%3A0x3cb73a2a3f5aa7c5!2sSOLVIT%20AFRICA%20Training%20Center!5e0!3m2!1sen!2srw!4v1771490072483!5m2!1sen!2srw"
              width="100%"
              height="100%"
              allowFullScreen
              title="acacia Safaris office location"
              style={{ border: 0, filter: "grayscale(0.4) contrast(1.1)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8 max-w-xs bg-[#0a1811]/90 backdrop-blur-xl text-white border border-white/15 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#c5a86d] text-[#0e1d16] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <p className="font-serif text-lg">acacia Safaris Ltd</p>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Kigali, Rwanda. Visits by appointment. Give us a call before you
                drop by.
              </p>
              <a
                href="https://maps.google.com/?q=-1.9646178980175963,30.098852474015416"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#c5a86d] hover:text-white transition-colors"
              >
                Get Directions <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
