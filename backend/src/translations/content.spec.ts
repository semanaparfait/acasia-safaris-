import {
  applyDestination,
  applyPackage,
  packageUnits,
  prune,
  readTranslations,
  statusOf,
  toTranslate,
  type LangTranslations,
  type PackageTexts,
} from './content';
import { batches } from './google-translate';

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
