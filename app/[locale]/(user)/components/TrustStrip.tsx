import React from "react";
import { ShieldCheck, Users, Clock, Lock } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Licensed by RDB", text: "Registered Rwandan operator" },
  { icon: Users, title: "Local experts", text: "Rwandan guides & planners" },
  { icon: Clock, title: "Reply within 24h", text: "Fast, personal answers" },
  { icon: Lock, title: "No payment to enquire", text: "Plan first, pay later" },
];

export default function TrustStrip() {
  return (
    <section className="bg-[#12231a] text-white px-6 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.title}
            className={`flex items-center gap-4 py-7 px-2 sm:px-6 ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-white/10" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <span className="w-11 h-11 rounded-full bg-[#c5a86d]/15 text-[#c5a86d] flex items-center justify-center shrink-0">
              <it.icon size={20} />
            </span>
            <span>
              <span className="block text-sm font-semibold">{it.title}</span>
              <span className="block text-xs text-zinc-400">{it.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
