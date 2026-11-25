import {
  albumUnits,
  applyAlbum,
  applyDestination,
  applyPackage,
  applyPhoto,
  applyTrip,
  applyWorker,
  tripUnits,
  workerUnits,
  packageUnits,
  prune,
  readTranslations,
  statusOf,
  toTranslate,
  type LangTranslations,
  type PackageTexts,
} from './content';
import { batches } from './machine-translate';

const pkg: PackageTexts = {
  title: 'Gorilla Trek',
  badge: null,
  location: 'Volcanoes National Park',
  description: 'Meet the gorillas.',
  tripType: 'Private',
  lodging: 'Lodge',
  route: ['Kigali', 'Musanze'],
  inclusions: ['Permit'],
  exclusions: [],
  perks: ['Free pickup'],
  fairPrice: [],
  whyChoose: [],
  itinerary: [{ day: 1, title: 'Arrival', description: 'Drive north.' }],
};

describe('content translations', () => {
  it('lists every text once, without empty ones', () => {
    const keys = packageUnits({ ...pkg, route: ['Kigali', 'Kigali'] }).map(
      (u) => u.key,
    );
    expect(keys).toEqual([
      'title',
      'location',
      'tripType',
      'lodging',
      'description',
      'route|Kigali',
      'inclusions|Permit',
      'perks|Free pickup',
      'itinerary.title|Arrival',
      'itinerary.description|Drive north.',
    ]);
  });

  it('applies the translations that are up to date, English for the rest', () => {
    const fr: LangTranslations = {
      title: { t: 'Trek des gorilles', src: 'Gorilla Trek' },
      description: { t: 'Ancien texte', src: 'Old English text' }, // out of date
      'perks|Free pickup': { t: 'Accueil gratuit', src: 'Free pickup' },
      'itinerary.title|Arrival': { t: 'Arrivée', src: 'Arrival' },
    };
    const out = applyPackage(pkg, fr);
    expect(out.title).toBe('Trek des gorilles');
    expect(out.description).toBe('Meet the gorillas.');
    expect(out.perks).toEqual(['Accueil gratuit']);
    expect(out.route).toEqual(['Kigali', 'Musanze']);
    expect(out.itinerary?.[0]).toEqual({
      day: 1,
      title: 'Arrivée',
      description: 'Drive north.',
    });
    expect(out.badge).toBeNull();
    expect(pkg.title).toBe('Gorilla Trek'); // the original is not changed
  });

  it('gives each text a status, and translates only missing or out-of-date ones', () => {
    const units = packageUnits(pkg);
    const tr: LangTranslations = {
      title: { t: 'Trek des gorilles', src: 'Gorilla Trek' },
      location: { t: 'Parc', src: 'Volcanoes National Park', edited: true },
      description: { t: 'Vieux', src: 'Old' },
    };
    const status = (key: string) =>
      statusOf(
        tr,
        units.find((u) => u.key === key)!,
      );
    expect(status('title')).toBe('auto');
    expect(status('location')).toBe('edited');
    expect(status('description')).toBe('outdated');
    expect(status('lodging')).toBe('missing');
    const keys = toTranslate(tr, units).map((u) => u.key);
    expect(keys).not.toContain('title');
    expect(keys).not.toContain('location'); // an admin's correction is kept
    expect(keys).toContain('description');
  });

  it('drops the translations of texts that were removed', () => {
    const tr: LangTranslations = {
      'perks|Free pickup': { t: 'a', src: 'Free pickup' },
      'perks|Old perk': { t: 'b', src: 'Old perk' },
    };
    expect(Object.keys(prune(tr, packageUnits(pkg)))).toEqual([
      'perks|Free pickup',
    ]);
  });

  it('translates destinations and reads broken stored values safely', () => {
    const d = {
      title: 'Lake Kivu',
      description: 'A lake',
      location: 'West',
      bestTime: 'June',
      fromKigali: '3h',
      highlights: ['Boat'],
    };
    const out = applyDestination(d, {
      title: { t: 'Lac Kivu', src: 'Lake Kivu' },
      'highlights|Boat': { t: 'Bateau', src: 'Boat' },
    });
    expect(out.title).toBe('Lac Kivu');
    expect(out.highlights).toEqual(['Bateau']);
    expect(readTranslations(null)).toEqual({});
    expect(readTranslations({ fr: { title: { t: 1 } }, de: {} })).toEqual({
      fr: {},
    });
  });

  it('splits long lists of texts into Google-sized requests', () => {
    expect(batches(Array<string>(250).fill('a')).map((b) => b.length)).toEqual([
      100, 100, 50,
    ]);
    expect(batches(['x'.repeat(15_000), 'y'.repeat(15_000)]).length).toBe(2);
  });
});

describe('trips, albums and team', () => {
  const fr = (
    pairs: Record<string, string>,
    units: { key: string; en: string }[],
  ) =>
    Object.fromEntries(
      units.map((u) => [u.key, { t: pairs[u.en] ?? u.en, src: u.en }]),
    );

  it('translates a trip but keeps price option names and units in English', () => {
    const trip = {
      title: 'Christmas in the Virunga',
      tagline: null,
      location: 'Musanze',
      description: 'Gorillas and lakes.',
      highlights: ['Gorilla trek'],
      itinerary: [{ title: 'Arrival', description: 'Drive to Musanze.' }],
      prices: [
        {
          name: 'Full package',
          unit: 'per person',
          price: 1200,
          description: 'Everything included',
          included: ['Permits'],
          excluded: ['Flights'],
        },
      ],
    };
    const units = tripUnits(trip);
    expect(units.map((u) => u.key)).toEqual([
      'title',
      'location',
      'description',
      'highlights|Gorilla trek',
      'itinerary.title|Arrival',
      'itinerary.description|Drive to Musanze.',
      'prices.description|Everything included',
      'prices.included|Permits',
      'prices.excluded|Flights',
    ]);
    const out = applyTrip(
      trip,
      fr(
        {
          Permits: 'Permis',
          'Gorilla trek': 'Trek des gorilles',
          Arrival: 'Arrivée',
        },
        units,
      ),
    );
    const price = (
      out.prices as { name: string; unit: string; included: string[] }[]
    )[0];
    expect(price.name).toBe('Full package');
    expect(price.unit).toBe('per person');
    expect(price.included).toEqual(['Permis']);
    expect(out.highlights).toEqual(['Trek des gorilles']);
    expect((out.itinerary as { title: string }[])[0].title).toBe('Arrivée');
  });

  it('translates an album and its photos by their English text', () => {
    const album = {
      name: 'Gorillas',
      description: 'Our treks.',
      photos: [{ title: 'Silverback', location: 'Volcanoes Park' }],
    };
    const tr = fr(
      { Gorillas: 'Gorilles', Silverback: 'Dos argenté' },
      albumUnits(album),
    );
    expect(applyAlbum(album, tr).name).toBe('Gorilles');
    expect(
      applyPhoto({ title: 'Silverback', location: 'Volcanoes Park' }, tr).title,
    ).toBe('Dos argenté');
    // A photo whose English title changed shows the English until translated again
    expect(applyPhoto({ title: 'Mother and baby' }, tr).title).toBe(
      'Mother and baby',
    );
  });

  it('translates a team member title and bio only', () => {
    const units = workerUnits({ companyRole: 'Head Guide', bio: '' });
    expect(units.map((u) => u.key)).toEqual(['companyRole']);
    expect(
      applyWorker(
        { companyRole: 'Head Guide', bio: null },
        fr({ 'Head Guide': 'Guide principal' }, units),
      ).companyRole,
    ).toBe('Guide principal');
  });
});
