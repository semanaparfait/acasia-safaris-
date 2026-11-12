"use client";

// The French and Swahili texts of a package or destination (Admin > Packages / Destinations > one item).
// Google translates new and changed English texts automatically after each save; here the team
// can check them and correct any text. A correction is kept until the English text changes.
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Languages, RefreshCw, Save } from "lucide-react";
import { api } from "@/lib/api";
import { Badge, Button, Card, Tabs } from "./ui";

type Lang = "fr" | "sw";
type Status = "missing" | "auto" | "edited" | "outdated";
type Row = { key: string; field: string; en: string; text: string; status: Status };
type Data = { autoTranslate: boolean; languages: Record<Lang, Row[]> };

const LANGS: { value: Lang; label: string }[] = [
  { value: "fr", label: "French" },
  { value: "sw", label: "Swahili" },
];

// Names of the texts, as in the edit form
const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  badge: "Badge",
  location: "Location",
  tripType: "Trip type",
  lodging: "Lodging",
  description: "Description",
  route: "Route stop",
  inclusions: "Included",
  exclusions: "Not included",
  perks: "Perk",
  fairPrice: "Why this price is fair",
  whyChoose: "Why people choose this trip",
  "itinerary.title": "Day title",
  "itinerary.description": "Day description",
  bestTime: "Best time to visit",
  fromKigali: "From Kigali",
  highlights: "Highlight",
};

const STATUS: Record<Status, { label: string; tone: "gray" | "gold" | "amber" | "red" }> = {
  auto: { label: "Google", tone: "gray" },
  edited: { label: "Edited by hand", tone: "gold" },
  outdated: { label: "English changed", tone: "amber" },
  missing: { label: "Not translated", tone: "red" },
};

const needsWork = (r: Row) => r.status === "missing" || r.status === "outdated";

export default function TranslationsPanel({
  kind,
  id,
  version,
}: {
  kind: "packages" | "destinations";
  id: string;
  version?: string; // changes when the item is saved: the texts are loaded again
}) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("fr");
  const [drafts, setDrafts] = useState<Record<Lang, Record<string, string>>>({ fr: {}, sw: {} });
  const [busy, setBusy] = useState<"" | "save" | "translate">("");

  const load = useCallback(async () => {
    try {
      setData(await api<Data>(`/translations/${kind}/${id}`, { admin: true }));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }, [kind, id]);

  useEffect(() => {
    void load();
  }, [load, version]);

  // Just after a save, Google is still translating in the background: look again a few times
  const pending = data?.autoTranslate && LANGS.some(({ value }) => data.languages[value].some(needsWork));
  const [checks, setChecks] = useState(0);
  useEffect(() => {
    if (!pending || checks >= 3) return;
    const timer = setTimeout(() => {
      setChecks((c) => c + 1);
      void load();
    }, 3000);
    return () => clearTimeout(timer);
  }, [pending, checks, load]);

  const rows = useMemo(() => data?.languages[lang] ?? [], [data, lang]);
  const draft = drafts[lang];
  const dirty = Object.keys(draft).length > 0;

  const edit = (key: string, original: string, value: string) =>
    setDrafts((all) => {
      const next = { ...all[lang] };
      if (value === original) delete next[key];
      else next[key] = value;
      return { ...all, [lang]: next };
    });

  const save = async () => {
    setBusy("save");
    try {
      setData(await api<Data>(`/translations/${kind}/${id}/${lang}`, { method: "PUT", body: { values: draft }, admin: true }));
      setDrafts((all) => ({ ...all, [lang]: {} }));
      toast.success(`${lang === "fr" ? "French" : "Swahili"} texts saved`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy("");
    }
  };

  const translateNow = async () => {
    setBusy("translate");
    try {
      const result = await api<Data>(`/translations/${kind}/${id}/refresh`, { method: "POST", admin: true });
      setData(result);
      toast.success("Translations updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy("");
    }
  };

  const count = (l: Lang) => data?.languages[l].filter(needsWork).length ?? 0;
  const done = rows.filter((r) => !needsWork(r)).length;
  const edited = rows.filter((r) => r.status === "edited").length;

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Languages className="size-4 text-[#2E7D5B]" /> Translations
          </h2>
          <p className="text-xs text-[#0a120b]/50 mt-1">
            How this {kind === "packages" ? "package" : "destination"} reads on the French and Swahili website. A text
            without a translation is shown in English.
          </p>
        </div>
        {data?.autoTranslate && (
          <Button variant="secondary" onClick={translateNow} disabled={busy !== "" || dirty} className="shrink-0">
            <RefreshCw className={`size-4 ${busy === "translate" ? "animate-spin" : ""}`} /> Translate now
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {!data && !error && <p className="text-sm text-[#0a120b]/40">Loading translations…</p>}

      {data && (
        <>
          {!data.autoTranslate && (
            <p className="mb-4 rounded-lg bg-amber-50 text-amber-800 text-xs leading-relaxed px-3 py-2.5">
              Automatic translation is off: add <code>GOOGLE_TRANSLATE_API_KEY</code> to the backend settings. You can
              still write the translations below.
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <Tabs
              tabs={LANGS.map((l) => ({ ...l, count: count(l.value) || undefined }))}
              value={lang}
              onChange={setLang}
            />
            <p className="text-xs text-[#0a120b]/50">
              {done} of {rows.length} texts translated{edited ? ` · ${edited} edited by hand` : ""}
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-[#0a120b]/40">No texts yet.</p>
          ) : (
            <ul className="divide-y divide-[#0a120b]/[0.06]">
              {rows.map((r) => {
                const value = draft[r.key] ?? r.text;
                const long = r.field.includes("description") || r.en.length > 90;
                return (
                  <li key={r.key} className="py-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] uppercase tracking-wider text-[#0a120b]/45">
                          {FIELD_LABELS[r.field] ?? r.field}
                        </span>
                        {r.key in draft ? (
                          <Badge tone="blue">Not saved</Badge>
                        ) : (
                          <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#0a120b]/60 leading-relaxed whitespace-pre-line break-words">{r.en}</p>
                    </div>
                    <textarea
                      value={value}
                      onChange={(e) => edit(r.key, r.text, e.target.value)}
                      rows={long ? 4 : 1}
                      lang={lang}
                      aria-label={`${FIELD_LABELS[r.field] ?? r.field} in ${lang === "fr" ? "French" : "Swahili"}`}
                      placeholder={r.status === "missing" ? "Not translated yet" : undefined}
                      className={`w-full rounded-lg border px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#c5a86d]/40 ${
                        r.status === "outdated" && !(r.key in draft) ? "border-amber-300 bg-amber-50/40" : "border-[#0a120b]/10"
                      }`}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-[#0a120b]/[0.06]">
            <p className="text-xs text-[#0a120b]/45">
              To get Google&apos;s version again, empty the text, save, then press Translate now.
            </p>
            <div className="flex gap-2 shrink-0">
              {dirty && (
                <Button variant="ghost" onClick={() => setDrafts((all) => ({ ...all, [lang]: {} }))} disabled={busy !== ""}>
                  Discard
                </Button>
              )}
              <Button onClick={save} disabled={!dirty || busy !== ""}>
                <Save className="size-4" /> Save {lang === "fr" ? "French" : "Swahili"}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
