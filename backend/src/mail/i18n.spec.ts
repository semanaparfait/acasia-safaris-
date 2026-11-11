import { EMAIL_TEXTS, asLang, travelersText } from './i18n';

describe('email languages', () => {
  it('falls back to English for an unknown language', () => {
    expect(asLang('de')).toBe('en');
    expect(asLang(undefined)).toBe('en');
    expect(asLang('fr')).toBe('fr');
  });

  it('writes travelers in the visitor language', () => {
    const guests = [
      { label: 'Adult', count: 2 },
      { label: 'Child', count: 1 },
      { label: 'Students', count: 3 }, // a group made up by an admin
    ];
    expect(travelersText('en', guests, 6)).toBe(
      '2 adults, 1 child, 3 × Students',
    );
    expect(travelersText('fr', guests, 6)).toBe(
      '2 adultes, 1 enfant, 3 × Students',
    );
    expect(travelersText('sw', guests, 6)).toBe(
      'Watu wazima 2, Mtoto 1, 3 × Students',
    );
    expect(travelersText('fr', [], 4)).toBe('4 voyageurs');
  });

  it('has every confirmation text in every language', () => {
    const keys = Object.keys(EMAIL_TEXTS.en.confirm).sort();
    expect(Object.keys(EMAIL_TEXTS.fr.confirm).sort()).toEqual(keys);
    expect(Object.keys(EMAIL_TEXTS.sw.confirm).sort()).toEqual(keys);
  });
});
