"use client";

// /trip-review/<token>: after a trip, the "How was it?" email links here.
// The review is saved for the team to publish in Admin > Reviews.
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/ui/smart-image";
import { api } from "@/lib/api";

type Info = { customer: string; tripTitle: string; image: string | null; reviewed: boolean };

export default function TripReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations("TripReview");
  const [info, setInfo] = useState<Info | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [country, setCountry] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Info>(`/trips/review/${encodeURIComponent(token)}`).then(setInfo, () => setInvalid(true));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api(`/trips/review/${encodeURIComponent(token)}`, { method: "POST", body: { rating, country: country.trim(), text: text.trim() } });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const input = "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/15";
  const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500";
  const shown = hover || rating;

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <section className="relative h-[340px] overflow-hidden bg-[#0a1811] text-white">
        {info?.image && <SmartImage src={info.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" sizes="100vw" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1811] via-[#0a1811]/50 to-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col justify-end px-6 pb-20">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">{t("eyebrow")}</span>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-5xl">
            {info ? t("title", { trip: info.tripTitle }) : " "}
          </h1>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-2xl px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-9">
          {invalid ? (
            <Message text={t("invalid")} home={t("home")} />
          ) : !info ? (
            <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-[#c5a86d]" /></div>
          ) : info.reviewed && !sent ? (
            <Message text={t("already")} home={t("home")} ok />
          ) : sent ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={34} /></span>
              <h2 className="mt-5 font-serif text-3xl font-bold text-[#0a1811]">{t("thanksTitle")}</h2>
              <p className="mx-auto mt-2 max-w-md text-neutral-600">{t("thanksText")}</p>
              <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[#b28236] hover:underline">{t("home")}</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <p className="text-neutral-600 leading-relaxed">{t("intro", { name: info.customer.split(" ")[0] })}</p>

              <div>
                <span className={label}>{t("rating")}</span>
                <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      aria-label={t("stars", { count: n })}
                      aria-pressed={rating === n}
                      className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star size={36} className={n <= shown ? "fill-[#d4af37] text-[#d4af37]" : "text-neutral-300"} />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-medium text-neutral-500">{t("stars", { count: shown })}</span>
                </div>
              </div>

              <label className="block">
                <span className={label}>{t("country")}</span>
                <input required minLength={2} maxLength={80} value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t("countryPlaceholder")} className={input} />
              </label>

              <label className="block">
                <span className={label}>{t("text")}</span>
                <textarea required minLength={10} maxLength={2000} rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("textPlaceholder")} className={input} />
              </label>

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t("error", { error })}</p>}
              <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1811] py-4 text-sm font-bold text-white transition-colors hover:bg-[#b28236] disabled:opacity-60 cursor-pointer">
                <Send size={16} /> {sending ? t("sending") : t("send")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Message({ text, home, ok = false }: { text: string; home: string; ok?: boolean }) {
  return (
    <div className="py-6 text-center">
      {ok && <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={28} /></span>}
      <p className="text-neutral-600">{text}</p>
      <Link href="/" className="mt-5 inline-block text-sm font-semibold text-[#b28236] hover:underline">{home}</Link>
    </div>
  );
}
