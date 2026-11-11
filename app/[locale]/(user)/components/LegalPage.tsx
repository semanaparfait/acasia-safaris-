import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LEGAL_UPDATED, type LegalBlock, type LegalDoc } from "./legalContent";

const EMAIL = "info@acaciasafaris.com";

// "Informations collectées" -> "informations-collectees" (for the links of the table of contents)
const slug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

// A paragraph with the email address as a link
function Paragraph({ text }: { text: string }) {
  const parts = text.split(EMAIL);
  return (
    <p>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a href={`mailto:${EMAIL}`} className="text-[#1F5A42] underline underline-offset-2">
              {EMAIL}
            </a>
          )}
        </React.Fragment>
      ))}
    </p>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <Paragraph text={block} />;
  return (
    <ul>
      {block.list.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

// The Privacy Policy and Terms of Service page, in the visitor's language (content: legalContent.ts)
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = useTranslations("Legal");
  const locale = useLocale();
  const updated = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(LEGAL_UPDATED),
  );

  return (
    <div className="bg-white font-sans text-[#0a120b] selection:bg-[#c5a86d] selection:text-black">
      {/* Header */}
      <section className="bg-[#12231a] text-white px-6 pt-40 pb-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-3">{t("label")}</p>
          <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-wide mb-4">{doc.title}</h1>
          <p className="text-sm text-zinc-400">{t("updated", { date: updated })}</p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c5a86d] mb-4">{t("onThisPage")}</p>
              <ul className="space-y-2.5 text-sm border-l border-[#0a120b]/10">
                {doc.sections.map((s, i) => (
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
            {locale !== "en" && (
              <p className="mb-6 rounded-lg bg-[#f7f5f0] px-4 py-3 text-xs text-[#0a120b]/60">{t("englishPrevails")}</p>
            )}
            <p className="text-base text-[#0a120b]/70 leading-relaxed mb-12">{doc.intro}</p>
            <div className="space-y-12">
              {doc.sections.map((s, i) => (
                <section key={s.title} id={slug(s.title)} className="scroll-mt-28">
                  <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wide mb-4">
                    <span className="text-[#c5a86d] mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  <div className="text-sm md:text-[15px] text-[#0a120b]/65 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
                    {s.body.map((block, j) => (
                      <Block key={j} block={block} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 p-6 md:p-8 rounded-xl bg-[#f7f5f0] border border-[#0a120b]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg uppercase tracking-wide">{t("questions")}</p>
                <p className="text-sm text-[#0a120b]/60">{t("help")}</p>
              </div>
              <Link
                href="/contact"
                className="bg-[#c5a86d] hover:bg-[#b69656] text-[#0e1d16] font-medium text-sm px-7 py-3 rounded-sm shadow-md transition-all text-center"
              >
                {t("contact")}
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
