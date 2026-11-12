// Which texts of a package / destination are translated, and how a translation is applied.
// Pure functions (no database), so they are easy to test: see content.spec.ts.
//
// A record's translations are stored in its "translations" column:
//   { fr: { "<key>": { t: "Trek des gorilles", src: "Gorilla trek", edited?: true } }, sw: { ... } }
//   - key:    which text it is. One text = "title"; an item of a list = "perks|<the English item>",
//             so an item keeps its translation when the list is reordered or another item is added.
//   - t:      the translated text
//   - src:    the English text it was made from. When the English changes, t is out of date:
//             the website shows the English until it is translated again.
//   - edited: an admin wrote or corrected it (kept until the English text changes)

export const LANGUAGES = ['fr', 'sw'] as const;
export type Lang = (typeof LANGUAGES)[number];

export const isLang = (value: unknown): value is Lang =>
  LANGUAGES.includes(value as Lang);

export type Entry = { t: string; src: string; edited?: boolean };
export type LangTranslations = Record<string, Entry>;
export type Translations = Partial<Record<Lang, LangTranslations>>;

// One translatable text: its key and its English text
export type Unit = { key: string; en: string };

// The kinds of records that are translated
export type Kind = 'package' | 'destination';

type Day = { day: number; title: string; description: string };

export type PackageTexts = {
  title: string;
  badge?: string | null;
  location: string;
  description: string;
  tripType: string;
  lodging: string;
  route: string[];
  inclusions: string[];
  exclusions: string[];
  perks: string[];
  fairPrice: string[];
  whyChoose: string[];
  itinerary?: Day[];
};

export type DestinationTexts = {
  title: string;
  description: string;
  location: string;
  bestTime: string;
  fromKigali: string;
  highlights: string[];
};

// Translated fields, in the order the admin sees them
const PACKAGE_FIELDS = [
  'title',
  'badge',
  'location',
  'tripType',
  'lodging',
  'description',
] as const;
const PACKAGE_LISTS = [
  'route',
  'inclusions',
  'exclusions',
  'perks',
  'fairPrice',
  'whyChoose',
] as const;
const DESTINATION_FIELDS = [
  'title',
  'location',
  'bestTime',
  'fromKigali',
  'description',
] as const;
const DESTINATION_LISTS = ['highlights'] as const;

const itemKey = (list: string, en: string) => `${list}|${en}`;

// Empty texts are not translated
const filled = (units: Unit[]) => units.filter((u) => u.en.trim() !== '');

export function packageUnits(p: PackageTexts): Unit[] {
  const units: Unit[] = PACKAGE_FIELDS.map((f) => ({ key: f, en: p[f] ?? '' }));
  for (const list of PACKAGE_LISTS) {
    for (const en of p[list] ?? []) units.push({ key: itemKey(list, en), en });
  }
  for (const d of p.itinerary ?? []) {
    units.push({ key: itemKey('itinerary.title', d.title), en: d.title });
    units.push({
      key: itemKey('itinerary.description', d.description),
      en: d.description,
    });
  }
  return dedupe(filled(units));
}

export function destinationUnits(d: DestinationTexts): Unit[] {
  const units: Unit[] = DESTINATION_FIELDS.map((f) => ({
    key: f,
    en: d[f] ?? '',
  }));
  for (const list of DESTINATION_LISTS) {
    for (const en of d[list] ?? []) units.push({ key: itemKey(list, en), en });
  }
  return dedupe(filled(units));
}

export const unitsOf = (kind: Kind, record: PackageTexts | DestinationTexts) =>
  kind === 'package'
    ? packageUnits(record as PackageTexts)
    : destinationUnits(record as DestinationTexts);

// The same item twice in a list has one translation
function dedupe(units: Unit[]) {
  const seen = new Set<string>();
  return units.filter((u) =>
    seen.has(u.key) ? false : (seen.add(u.key), true),
  );
}

// The translation of one text, or null when there is none or it is out of date
export function translated(
  tr: LangTranslations | undefined,
  key: string,
  en: string,
) {
  const entry = tr?.[key];
  return entry && entry.src === en && entry.t.trim() !== '' ? entry.t : null;
}

export type UnitStatus = 'missing' | 'auto' | 'edited' | 'outdated';

export function statusOf(
  tr: LangTranslations | undefined,
  unit: Unit,
): UnitStatus {
  const entry = tr?.[unit.key];
  if (!entry || entry.t.trim() === '') return 'missing';
  if (entry.src !== unit.en) return 'outdated';
  return entry.edited ? 'edited' : 'auto';
}

// The texts that need a (new) machine translation
export const toTranslate = (tr: LangTranslations | undefined, units: Unit[]) =>
  units.filter((u) => {
    const s = statusOf(tr, u);
    return s === 'missing' || s === 'outdated';
  });

// Keeps only the entries of texts that still exist (removed items, old texts)
export function prune(
  tr: LangTranslations | undefined,
  units: Unit[],
): LangTranslations {
  const keys = new Set(units.map((u) => u.key));
  return Object.fromEntries(
    Object.entries(tr ?? {}).filter(([key]) => keys.has(key)),
  );
}

// ---------- Applying a language: the record as the website shows it ----------

const pick = (tr: LangTranslations | undefined, key: string, en: string) =>
  translated(tr, key, en) ?? en;

const pickList = (
  tr: LangTranslations | undefined,
  list: string,
  items: string[] = [],
) => items.map((en) => pick(tr, itemKey(list, en), en));

export function applyPackage<T extends PackageTexts>(
  p: T,
  tr: LangTranslations | undefined,
): T {
  const out: T = { ...p };
  for (const f of PACKAGE_FIELDS) {
    const en = p[f];
    if (typeof en === 'string' && en)
      (out as Record<string, unknown>)[f] = pick(tr, f, en);
  }
  for (const list of PACKAGE_LISTS) {
    (out as Record<string, unknown>)[list] = pickList(tr, list, p[list]);
  }
  if (p.itinerary) {
    out.itinerary = p.itinerary.map((d) => ({
      ...d,
      title: pick(tr, itemKey('itinerary.title', d.title), d.title),
      description: pick(
        tr,
        itemKey('itinerary.description', d.description),
        d.description,
      ),
    }));
  }
  return out;
}

export function applyDestination<T extends DestinationTexts>(
  d: T,
  tr: LangTranslations | undefined,
): T {
  const out: T = { ...d };
  for (const f of DESTINATION_FIELDS) {
    const en = d[f];
    if (typeof en === 'string' && en)
      (out as Record<string, unknown>)[f] = pick(tr, f, en);
  }
  for (const list of DESTINATION_LISTS) {
    (out as Record<string, unknown>)[list] = pickList(tr, list, d[list]);
  }
  return out;
}

// The stored JSON, read safely (an old or broken value counts as "no translations")
export function readTranslations(value: unknown): Translations {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Translations = {};
  for (const lang of LANGUAGES) {
    const tr = (value as Record<string, unknown>)[lang];
    if (!tr || typeof tr !== 'object') continue;
    const entries: LangTranslations = {};
    for (const [key, e] of Object.entries(tr as Record<string, unknown>)) {
      const entry = e as Partial<Entry> | null;
      if (
        entry &&
        typeof entry.t === 'string' &&
        typeof entry.src === 'string'
      ) {
        entries[key] = {
          t: entry.t,
          src: entry.src,
          ...(entry.edited ? { edited: true } : {}),
        };
      }
    }
    out[lang] = entries;
  }
  return out;
}
