"use client";

// "Meet the team" on the About us page. Shows the workers marked "Show on website"
// in Admin > Workers. Clicking one opens a pop-up with their full profile.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Languages, Mail, Phone, X } from "lucide-react";
import { api } from "@/lib/api";
import { usedSocials } from "@/lib/socials";
import type { TeamMember } from "@/lib/types";

const initials = (name: string) =>
  name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

// The photo, or the initials on a green background when there is none
function Photo({ member, className }: { member: TeamMember; className: string }) {
  if (member.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={member.photo} alt={member.name} className={`${className} object-cover`} />;
  }
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-[#1c2e22] to-[#2f4a37]`}>
      <span className="font-serif text-4xl text-[#d4b47c]">{initials(member.name)}</span>
    </div>
  );
}

export default function TeamSection() {
  const [team, setTeam] = useState<TeamMember[] | null>(null); // null = loading
  const [open, setOpen] = useState<TeamMember | null>(null);

  useEffect(() => {
    api<TeamMember[]>("/team")
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  // Nobody is shown on the website yet: hide the whole section
  if (team && team.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8e7345] block mb-1">OUR TEAM</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1c2e22]">Meet the People Behind ACACIA SAFARIS</h2>
          <p className="text-sm text-[#5e6960] font-light mt-2">Click on someone to read their story and get in touch.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {team === null
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] rounded-lg bg-[#ece6da] animate-pulse" />
                  <div className="h-3 w-3/4 mx-auto rounded bg-[#ece6da] animate-pulse" />
                  <div className="h-2.5 w-1/2 mx-auto rounded bg-[#ece6da] animate-pulse" />
                </div>
              ))
            : team.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setOpen(member)}
                  className="group space-y-2 text-center cursor-pointer focus:outline-none"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-200 border border-[#e5ded0] group-focus-visible:ring-2 group-focus-visible:ring-[#c5a86d]">
                    <Photo member={member} className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c2e22]/85 via-[#1c2e22]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1c2e22] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      View profile <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-serif font-bold text-[#1c2e22] group-hover:text-[#8e7345] transition-colors">{member.name}</h3>
                    <p className="text-[10px] text-[#8e7345] uppercase tracking-wider font-medium">{member.companyRole}</p>
                  </div>
                </button>
              ))}
        </div>
      </div>

      <MemberModal member={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function MemberModal({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  // Esc closes the pop-up, and the page behind it does not scroll
  useEffect(() => {
    if (!member) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [member, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {member && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[#0a120b]/75 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-name"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-3xl max-h-full overflow-y-auto rounded-2xl bg-[#faf8f5] shadow-2xl font-sans md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute z-10 top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 md:bg-[#1c2e22]/[0.06] hover:bg-white md:hover:bg-[#1c2e22]/10 text-[#1c2e22] flex items-center justify-center shadow-sm md:shadow-none transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>

            {/* Left: the photo */}
            <div className="relative h-72 sm:h-80 md:h-auto md:min-h-[480px]">
              <Photo member={member} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c2e22]/70 via-transparent to-transparent md:hidden" />
            </div>

            {/* Right: the profile */}
            <div className="p-6 sm:p-8 flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8e7345]">{member.companyRole}</span>
              <h3 id="member-name" className="mt-2 text-2xl sm:text-3xl font-serif text-[#1c2e22] leading-tight pr-8">
                {member.name}
              </h3>
              <div className="mt-4 h-px w-12 bg-[#c5a86d]" />

              {member.bio && (
                <p className="mt-5 text-sm leading-relaxed text-[#4a5650] font-light whitespace-pre-line">{member.bio}</p>
              )}

              <div className="mt-6 space-y-2.5">
                {member.personalEmail && (
                  <ContactRow icon={<Mail size={15} />} label="Email" value={member.personalEmail} href={`mailto:${member.personalEmail}`} />
                )}
                {member.phone && (
                  <ContactRow icon={<Phone size={15} />} label="Phone" value={member.phone} href={`tel:${member.phone.replace(/\s/g, "")}`} />
                )}
              </div>

              {member.languages.length > 0 && (
                <div className="mt-6">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5e6960] mb-2.5">
                    <Languages size={13} className="text-[#8e7345]" /> Speaks
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.languages.map((language) => (
                      <span key={language} className="rounded-full border border-[#e5ded0] bg-white px-3 py-1 text-xs text-[#1c2e22]">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {usedSocials(member.socials).length > 0 && (
                <div className="mt-auto pt-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5e6960] mb-2.5">Follow</p>
                  <div className="flex flex-wrap gap-2">
                    {usedSocials(member.socials).map(({ key, label, icon: Icon, href }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on ${label}`}
                        title={label}
                        className="w-10 h-10 rounded-full bg-[#1c2e22] text-white flex items-center justify-center hover:bg-[#c5a86d] hover:text-[#1c2e22] hover:-translate-y-0.5 transition-all"
                      >
                        <Icon size={15} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[#e5ded0] bg-white px-3.5 py-2.5 hover:border-[#c5a86d] hover:shadow-sm transition-all"
    >
      <span className="w-8 h-8 shrink-0 rounded-lg bg-[#f4efe6] text-[#8e7345] flex items-center justify-center group-hover:bg-[#c5a86d] group-hover:text-white transition-colors">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-wider text-[#5e6960]">{label}</span>
        <span className="block text-sm text-[#1c2e22] truncate">{value}</span>
      </span>
    </a>
  );
}
