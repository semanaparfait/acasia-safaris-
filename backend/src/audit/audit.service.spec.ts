import { cleanDetails } from './audit.service';

describe('cleanDetails', () => {
  it('keeps the texts of deeply nested lists (a trip and its price options)', () => {
    const trip = {
      title: 'Explore Nyungwe',
      prices: [
        {
          name: 'Full package',
          price: 100,
          included: ['Transport', 'Canopy walk & zipline'],
          excluded: [],
        },
      ],
    };
    expect(cleanDetails(trip)).toEqual(trip);
  });

  it('never leaves undefined items in a list', () => {
    expect(cleanDetails(['a', null, undefined, 'b'])).toEqual(['a', 'b']);
    // An object too deep is left out of its list; the text next to it stays
    expect(cleanDetails({ a: { b: { c: [{ d: 1 }, 'x'] } } })).toEqual({
      a: { b: { c: ['x'] } },
    });
  });

  it('removes secrets and cuts long texts', () => {
    const out = cleanDetails({
      password: 'x',
      resetCode: '123',
      note: 'y'.repeat(300),
    }) as Record<string, string>;
    expect(out.password).toBeUndefined();
    expect(out.resetCode).toBeUndefined();
    expect(out.note).toHaveLength(201);
  });
});
