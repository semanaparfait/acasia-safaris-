// Which texts of a package, destination, trip, gallery album or team member are translated,
// and how a translation is applied.
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
export type Kind = 'package' | 'destination' | 'trip' | 'album' | 'worker';
export const KINDS: Kind[] = [
  'package',
  'destination',
  'trip',
  'album',
  'worker',
];

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

// A special trip (Admin > Trips). Price option names and units stay in English: bookings
// and the price calculation use them. Their description and included/excluded items are translated.
type TripDay = { title?: string; description?: string };
type TripPriceTexts = {
  description?: string;
  included?: string[];
  excluded?: string[];
};
export type TripTexts = {
  title: string;
  tagline?: string | null;
  location: string;
  duration?: string | null;
  groupSize?: string | null;
  description: string;
  highlights: string[];
  itinerary?: unknown; // [{ title, description }]
  prices?: unknown; // [{ name, unit, description, included[], excluded[] }]
};

// A gallery album, and the titles and places of its photos
type PhotoTexts = { title: string; location?: string | null };
export type AlbumTexts = {
  name: string;
  description: string;
  photos?: PhotoTexts[];
};

// A team member on the About us page
export type WorkerTexts = { companyRole?: string | null; bio?: string | null };

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

const TRIP_FIELDS = [
  'title',
  'tagline',
  'location',
  'duration',
  'groupSize',
  'description',
] as const;

// JSON lists (trip itinerary and prices) read safely
const objects = <T>(value: unknown): T[] =>
  Array.isArray(value)
    ? (value.filter((v) => v && typeof v === 'object') as T[])
    : [];
const texts = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];

export function tripUnits(t: TripTexts): Unit[] {
  const units: Unit[] = TRIP_FIELDS.map((f) => ({ key: f, en: t[f] ?? '' }));
  for (const en of t.highlights ?? [])
    units.push({ key: itemKey('highlights', en), en });
  for (const d of objects<TripDay>(t.itinerary)) {
    if (d.title)
      units.push({ key: itemKey('itinerary.title', d.title), en: d.title });
    if (d.description)
      units.push({
        key: itemKey('itinerary.description', d.description),
        en: d.description,
      });
  }
  for (const p of objects<TripPriceTexts>(t.prices)) {
    if (p.description)
      units.push({
        key: itemKey('prices.description', p.description),
        en: p.description,
      });
    for (const en of texts(p.included))
      units.push({ key: itemKey('prices.included', en), en });
    for (const en of texts(p.excluded))
      units.push({ key: itemKey('prices.excluded', en), en });
  }
  return dedupe(filled(units));
}

export function albumUnits(a: AlbumTexts): Unit[] {
  const units: Unit[] = [
    { key: 'name', en: a.name },
    { key: 'description', en: a.description ?? '' },
  ];
  for (const p of a.photos ?? []) {
    units.push({ key: itemKey('photos.title', p.title), en: p.title });
    if (p.location)
      units.push({
        key: itemKey('photos.location', p.location),
        en: p.location,
      });
  }
  return dedupe(filled(units));
}

export function workerUnits(w: WorkerTexts): Unit[] {
  return filled([
    { key: 'companyRole', en: w.companyRole ?? '' },
    { key: 'bio', en: w.bio ?? '' },
  ]);
}

export function unitsOf(kind: Kind, record: unknown): Unit[] {
  switch (kind) {
    case 'package':
      return packageUnits(record as PackageTexts);
    case 'destination':
      return destinationUnits(record as DestinationTexts);
    case 'trip':
      return tripUnits(record as TripTexts);
    case 'album':
      return albumUnits(record as AlbumTexts);
    case 'worker':
      return workerUnits(record as WorkerTexts);
  }
}

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

export function applyTrip<T extends TripTexts>(
  t: T,
  tr: LangTranslations | undefined,
): T {
  const out: T = { ...t };
  for (const f of TRIP_FIELDS) {
    const en = t[f];
    if (typeof en === 'string' && en)
      (out as Record<string, unknown>)[f] = pick(tr, f, en);
  }
  out.highlights = pickList(tr, 'highlights', t.highlights);
  if (Array.isArray(t.itinerary)) {
    out.itinerary = objects<TripDay>(t.itinerary).map((d) => ({
      ...d,
      ...(d.title
        ? { title: pick(tr, itemKey('itinerary.title', d.title), d.title) }
        : {}),
      ...(d.description
        ? {
            description: pick(
              tr,
              itemKey('itinerary.description', d.description),
              d.description,
            ),
          }
        : {}),
    }));
  }
  if (Array.isArray(t.prices)) {
    // name and unit stay as they are (bookings use them)
    out.prices = objects<TripPriceTexts>(t.prices).map((p) => ({
      ...p,
      ...(p.description
        ? {
            description: pick(
              tr,
              itemKey('prices.description', p.description),
              p.description,
            ),
          }
        : {}),
      ...(Array.isArray(p.included)
        ? { included: pickList(tr, 'prices.included', texts(p.included)) }
        : {}),
      ...(Array.isArray(p.excluded)
        ? { excluded: pickList(tr, 'prices.excluded', texts(p.excluded)) }
        : {}),
    }));
  }
  return out;
}

export function applyAlbum<T extends AlbumTexts>(
  a: T,
  tr: LangTranslations | undefined,
): T {
  return {
    ...a,
    name: pick(tr, 'name', a.name),
    description: a.description ? pick(tr, 'description', a.description) : '',
  };
}

// A photo, with the translations of its album
export function applyPhoto<T extends PhotoTexts>(
  p: T,
  tr: LangTranslations | undefined,
): T {
  return {
    ...p,
    title: pick(tr, itemKey('photos.title', p.title), p.title),
    ...(p.location
      ? {
          location: pick(
            tr,
            itemKey('photos.location', p.location),
            p.location,
          ),
        }
      : {}),
  };
}

export function applyWorker<T extends WorkerTexts>(
  w: T,
  tr: LangTranslations | undefined,
): T {
  return {
    ...w,
    ...(w.companyRole
      ? { companyRole: pick(tr, 'companyRole', w.companyRole) }
      : {}),
    ...(w.bio ? { bio: pick(tr, 'bio', w.bio) } : {}),
  };
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
