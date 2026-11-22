import { adminTripHtml, tripTicketHtml } from './trip-emails';
import { bookingTotal, formatMoney } from './trips.service';

describe('trip receipts', () => {
  it('works out the total from the unit', () => {
    expect(
      bookingTotal({ price: 100000, unit: 'per person', travelers: 3 }),
    ).toBe(300000);
    expect(bookingTotal({ price: 500, unit: 'per couple', travelers: 3 })).toBe(
      1000,
    );
    expect(bookingTotal({ price: 900, unit: 'per group', travelers: 7 })).toBe(
      900,
    );
  });

  it('formats money in the trip currency', () => {
    // (Intl puts a non-breaking space after "RWF")
    expect(formatMoney(100000, 'RWF').replace(/\s/g, ' ')).toBe('RWF 100,000');
    expect(formatMoney(99.5, 'EUR')).toBe('€99.50');
  });

  it('escapes what the traveler typed', () => {
    const base = {
      lang: 'en' as const,
      name: '<script>x</script>',
      email: 'a@b.c',
      tripTitle: 'Nyungwe',
      location: 'Nyungwe',
      dates: null,
      option: 'Full',
      unitPrice: 'RWF 1',
      unit: 'per person',
      travelers: 1,
      total: 'RWF 1',
      included: [],
      excluded: [],
      ticketCode: 'AC7K2M9QXP',
      receiptNo: 'TR-1',
      paidOn: 'today',
      tripUrl: 'https://x',
    };
    const html = tripTicketHtml(base);
    expect(html).not.toContain('<script>');
    expect(html).toContain('cid:ticket-qr');
    expect(html).toContain('AC7K2M9QXP');
    const admin = adminTripHtml({
      kind: 'new',
      tripTitle: 'Nyungwe',
      customer: '<b>x</b>',
      email: 'a@b.c',
      option: 'Full',
      travelers: 1,
      total: 'RWF 1',
      message: '<img src=x onerror=alert(1)>',
      link: 'https://x',
    });
    expect(admin).not.toContain('<img src=x');
  });
});
