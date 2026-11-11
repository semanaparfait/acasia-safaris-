import React from "react";
import Link from "next/link";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  label: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function LegalPage({ label, title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="bg-white font-sans text-[#0a120b] selection:bg-[#c5a86d] selection:text-black">
      {/* Header */}
      <section className="bg-[#12231a] text-white px-6 pt-40 pb-20">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-wide mb-4">{title}</h1>
          <p className="text-sm text-zinc-400">Last updated: {updated}</p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-4">
                On this page
              </p>
              <ul className="space-y-2.5 text-sm border-l border-[#0a120b]/10">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a
                      href={`#${slug(s.title)}`}
                      className="block pl-4 -ml-px border-l border-transparent text-[#0a120b]/55 hover:text-[#0a120b] hover:border-[#c5a86d] transition-colors"
                    >
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <article className="lg:col-span-3 max-w-3xl">
            <p className="text-base text-[#0a120b]/70 leading-relaxed mb-12">{intro}</p>
            <div className="space-y-12">
              {sections.map((s, i) => (
                <section key={s.title} id={slug(s.title)} className="scroll-mt-28">
                  <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wide mb-4">
                    <span className="text-[#c5a86d] mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  <div className="text-sm md:text-[15px] text-[#0a120b]/65 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 p-6 md:p-8 rounded-xl bg-[#f7f5f0] border border-[#0a120b]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg uppercase tracking-wide">Questions?</p>
                <p className="text-sm text-[#0a120b]/60">Our team is happy to help with anything on this page.</p>
              </div>
              <Link
                href="/contact"
                className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md transition-all text-center"
              >
                Contact Us
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
