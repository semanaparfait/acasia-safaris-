// The 404 page, in the visitor's language. Used by app/not-found.tsx (English, any
// unknown address) and app/[locale]/not-found.tsx (/fr/…, /sw/…).
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Compass, MapPin, Images, Mail, Mountain } from "lucide-react";
import logo from "@/public/logo2.png";

const BACKGROUND = "https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg";

// key = the texts in messages: NotFound.links.<key>
const suggestions = [
  { href: "/tour", key: "tours", icon: Compass },
  { href: "/destination", key: "destinations", icon: MapPin },
  { href: "/gallery", key: "gallery", icon: Images },
  { href: "/contact", key: "contact", icon: Mail },
] as const;

export default function NotFoundView() {
  const t = useTranslations("NotFound");
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a1811] text-white font-sans selection:bg-[#c5a86d] selection:text-black">
      {/* Background photo */}
      <Image src={BACKGROUND} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1811]/70 via-[#0a1811]/60 to-[#0a1811]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        {/* Logo */}
        <Link href="/" className="w-fit">
          <Image src={logo} alt="Acacia Safaris" className="h-12 w-auto" priority />
        </Link>

        {/* Message */}
        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-[#c5a86d] backdrop-blur">
            <Mountain className="size-3.5" /> {t("error")}
          </span>

          <h1 className="font-serif text-[7rem] leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#e7d3a3] to-[#c5a86d] sm:text-[10rem]">
            404
          </h1>

          <h2 className="mt-4 font-serif text-3xl uppercase tracking-wide sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300">
            {t("text")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-[#c5a86d] px-8 py-3.5 text-sm font-medium text-[#0e1d16] shadow-md transition-all hover:bg-[#b69656] hover:shadow-lg"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              {t("home")}
            </Link>
            <Link
              href="/tour"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/30 px-8 py-3.5 text-sm font-medium transition-all hover:border-white hover:bg-white hover:text-[#0e1d16]"
            >
              <Compass size={16} /> {t("tours")}
            </Link>
          </div>
        </section>

        {/* Helpful links */}
        <nav aria-label={t("popular")} className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur transition-all hover:border-[#c5a86d]/60 hover:bg-white/[0.08]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#c5a86d]/15 text-[#c5a86d]">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium group-hover:text-[#c5a86d]">{t(`links.${key}.label`)}</span>
                <span className="block text-xs text-zinc-400 mt-0.5">{t(`links.${key}.text`)}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
