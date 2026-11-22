import { ticketQrPng } from '../bookings/bookings.service';
import { buildTripTicketPdf } from './trip-ticket-pdf';
import { adminTripHtml, tripTicketHtml } from './trip-emails';
import {
  bookingSubtotal,
  bookingTotal,
  formatMoney,
  tripDiscount,
} from './trips.service';

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
      pdfUrl: 'https://x/ticket.pdf',
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

describe('trip discounts', () => {
  const trip = {
    earlyBirdPercent: 10,
    earlyBirdUntil: new Date('2026-11-30'),
    groupPercent: 5,
    groupMinTravelers: 6,
  };

  it('gives the early bird discount until the last day (included)', () => {
    expect(
      tripDiscount(trip, 2, new Date('2026-11-30T20:00:00Z')).percent,
    ).toBe(10);
    expect(
      tripDiscount(trip, 2, new Date('2026-12-01T08:00:00Z')).percent,
    ).toBe(0);
  });

  it('adds the group discount from the minimum number of travelers', () => {
    const d = tripDiscount(trip, 6, new Date('2026-11-01'));
    expect(d.percent).toBe(15);
    expect(d.note).toBe('Early bird -10% · Group of 6+ -5%');
    expect(tripDiscount(trip, 5, new Date('2026-12-05')).percent).toBe(0);
  });

  it('never gives more than 90% off', () => {
    const big = { ...trip, earlyBirdPercent: 80, groupPercent: 50 };
    expect(tripDiscount(big, 10, new Date('2026-11-01')).percent).toBe(90);
  });

  it('applies the discount to the total', () => {
    const b = { price: 100000, unit: 'per person', travelers: 6 };
    expect(bookingSubtotal(b)).toBe(600000);
    expect(bookingTotal({ ...b, discountPercent: 15 })).toBe(510000);
  });
});

describe('PDF ticket', () => {
  it('makes a one-page PDF with the ticket', async () => {
    const pdf = await buildTripTicketPdf({
      lang: 'sw',
      name: 'Ana',
      email: 'a@b.c',
      tripTitle: 'Nyungwe',
      location: 'Nyungwe',
      dates: null,
      option: 'Full',
      unitPrice: 'RWF 100,000',
      unit: 'per person',
      travelers: 2,
      total: 'RWF 200,000',
      included: ['Transport'],
      ticketCode: 'AC7K2M9QXP',
      receiptNo: 'TR-1',
      paidOn: 'today',
      issuedOn: 'today',
      qrPng: await ticketQrPng('AC7K2M9QXP'),
    });
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(
      (pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length,
    ).toBe(1);
  });
});
