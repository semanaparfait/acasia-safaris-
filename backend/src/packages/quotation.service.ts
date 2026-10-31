import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';

const MM = 2.8346; // points in one millimetre
const WIDTH = 595.28; // A4
const HEIGHT = 841.89;
const MARGIN = 18 * MM;
const CONTENT = WIDTH - MARGIN * 2;
const BOTTOM = HEIGHT - 22 * MM; // content stops above the footer
const DAYS_PER_PAGE = 5;

const GREEN = '#12231a';
const GOLD = '#c5a86d';
const DARK_GOLD = '#a88a4c';
const CREAM = '#f7f5f0';
const INK = '#0a120b';
const MUTED = '#6a706b';
const LINE = '#e4e5e3';
const RED = '#aa3333';

const SERIF = 'Times-Roman';
const SANS = 'Helvetica';
const SANS_BOLD = 'Helvetica-Bold';

const PHONE = '+250 798 635 578';
const EMAIL = 'info@acaciasafaris.com';
const PLACE = 'Kigali, Rwanda';
const PRICE_BASIS =
  'Per person, in US dollars, based on two people sharing a room.';

const TERMS = [
  'A booking is confirmed once we receive your deposit and send written confirmation.',
  'The balance is due before your trip starts, on the date shown on your invoice.',
  'Gorilla and chimpanzee permits are paid in full at booking. They are bought in advance from the park authorities and are generally non-refundable.',
  'Prices may change if taxes, park fees or exchange rates change.',
  "Cancellation charges depend on how close to departure you cancel and on our partners' policies. Your booking confirmation lists the exact charges.",
  'Itineraries may be adjusted because of weather, safety or events beyond our control. We will always offer a suitable alternative.',
  'You need a valid passport, visas and any required vaccinations. We strongly recommend travel insurance covering cancellation, medical emergencies and evacuation.',
];

const STEPS = [
  [
    'Send your request',
    'Tell us your dates and how many people are traveling.',
  ],
  [
    'Talk to an expert',
    'A local specialist contacts you to fine-tune the details.',
  ],
  [
    'Get your itinerary',
    'Receive your final plan with lodges, activities and price.',
  ],
  ['Confirm and go', 'Pay your deposit and get ready for your trip.'],
];

export type Rate = { label: string; ages: string; price: number };

export type QuotationPackage = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  tripType: string;
  lodging: string;
  image: string;
  price: number;
  route: string[];
  inclusions: string[];
  exclusions: string[];
  perks: string[];
  fairPrice: string[];
  rates: unknown;
  itinerary: {
    day: number;
    title: string;
    description: string;
    image: string;
  }[];
};

// Used until the admin sets the prices of a package
export const defaultRates = (price: number): Rate[] => [
  { label: 'Adult', ages: '16 years and over', price },
  {
    label: 'Teenager',
    ages: '12 to 15 years',
    price: Math.round((price * 0.75) / 10) * 10,
  },
  {
    label: 'Child',
    ages: '4 to 11 years',
    price: Math.round((price * 0.5) / 10) * 10,
  },
  { label: 'Infant', ages: '0 to 3 years', price: 0 },
];

// The first row is always the adult price of the package
const ratesOf = (pkg: QuotationPackage): Rate[] => {
  const saved = Array.isArray(pkg.rates) ? (pkg.rates as Rate[]) : [];
  if (saved.length === 0) return defaultRates(pkg.price);
  return saved.map((r, i) => (i === 0 ? { ...r, price: pkg.price } : r));
};

// The built-in PDF fonts only have Western European letters
export const clean = (text: string) =>
  text
    .replace(/→/g, 'to')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7e\xa0-\xff–—‘’“”•]/g, '')
    .trim();

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

const hasGorillas = (pkg: QuotationPackage) =>
  /gorilla/i.test(`${pkg.title} ${pkg.tripType} ${pkg.category}`);

type Doc = PDFKit.PDFDocument;

// Makes the quotation PDF of a package, in the Acacia Safaris design
@Injectable()
export class QuotationService {
  private readonly logger = new Logger(QuotationService.name);

  async build(pkg: QuotationPackage): Promise<Buffer> {
    const [cover, photos] = await Promise.all([
      this.photo(pkg.image, 1240, 1754),
      Promise.all(pkg.itinerary.map((d) => this.photo(d.image, 520, 350))),
    ]);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
      info: {
        Title: `${clean(pkg.title)} - Quotation`,
        Author: 'Acacia Safaris',
      },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const finished = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    this.coverPage(doc, pkg, cover);
    this.pricesPage(doc, pkg);
    this.itineraryPages(doc, pkg, photos);
    this.coversPage(doc, pkg);
    this.termsPage(doc, pkg);
    this.footers(doc, pkg);

    doc.end();
    return finished;
  }

  // Any image format, cut to the size needed. A missing image is left out.
  private async photo(url: string, width: number, height: number) {
    if (!url) return null;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) return null;
      return await sharp(Buffer.from(await response.arrayBuffer()))
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality: 74 })
        .toBuffer();
    } catch (error) {
      this.logger.warn(`Image left out of the quotation: ${url} (${error})`);
      return null;
    }
  }

  private coverPage(doc: Doc, pkg: QuotationPackage, cover: Buffer | null) {
    doc.rect(0, 0, WIDTH, HEIGHT).fill(GREEN);
    if (cover) doc.image(cover, 0, 0, { width: WIDTH, height: HEIGHT });

    const veil = doc.linearGradient(0, 0, 0, HEIGHT);
    veil
      .stop(0, GREEN, 0.72)
      .stop(0.34, GREEN, 0.2)
      .stop(0.66, GREEN, 0.82)
      .stop(1, GREEN, 1);
    doc.rect(0, 0, WIDTH, HEIGHT).fill(veil);

    const logo = join(process.cwd(), 'assets', 'logo.png');
    if (existsSync(logo)) doc.image(logo, MARGIN, 16 * MM, { height: 21 * MM });

    doc
      .font(SANS)
      .fontSize(8)
      .fillColor('#ffffff')
      .text(
        `QUOTATION AS-${pkg.id.slice(0, 6).toUpperCase()}`,
        MARGIN,
        21 * MM,
        { width: CONTENT, align: 'right', characterSpacing: 1 },
      )
      .text(`Issued ${this.issued()}`, { width: CONTENT, align: 'right' });

    const title = clean(pkg.title);
    const lead = clean(pkg.description);
    doc.font(SERIF).fontSize(36);
    const titleHeight = doc.heightOfString(title, { width: CONTENT });
    doc.font(SANS).fontSize(11);
    const leadWidth = 150 * MM;
    const leadHeight = doc.heightOfString(lead, {
      width: leadWidth,
      lineGap: 3,
    });

    const factsTop = HEIGHT - 48 * MM;
    let y = factsTop - 12 * MM - leadHeight - 8 * MM - titleHeight - 12 * MM;
    doc
      .font(SANS_BOLD)
      .fontSize(9)
      .fillColor(GOLD)
      .text('TOUR QUOTATION', MARGIN, y, { characterSpacing: 5 });
    y += 7 * MM;
    doc
      .font(SERIF)
      .fontSize(36)
      .fillColor('#ffffff')
      .text(title, MARGIN, y, { width: CONTENT });
    y += titleHeight + 3 * MM;
    doc.rect(MARGIN, y, 16 * MM, 1.5).fill(GOLD);
    y += 5 * MM;
    doc
      .font(SANS)
      .fontSize(11)
      .fillColor('#e4e7e5')
      .text(lead, MARGIN, y, { width: leadWidth, lineGap: 3 });

    doc.rect(MARGIN, factsTop, CONTENT, 0.6).fill(GOLD);
    const days = pkg.itinerary.length;
    const facts = [
      ['DURATION', `${days} ${days === 1 ? 'Day' : 'Days'}`],
      ['DESTINATION', pkg.location],
      ['TRIP TYPE', pkg.tripType],
      ['STAY', pkg.lodging],
    ];
    const column = CONTENT / 4;
    facts.forEach(([label, value], i) => {
      const x = MARGIN + i * column;
      doc
        .font(SANS)
        .fontSize(7)
        .fillColor(GOLD)
        .text(label, x, factsTop + 6 * MM, { characterSpacing: 2 });
      doc
        .font(SANS_BOLD)
        .fontSize(10)
        .fillColor('#ffffff')
        .text(clean(value) || '-', x, factsTop + 11 * MM, {
          width: column - 5 * MM,
        });
    });
  }

  private pricesPage(doc: Doc, pkg: QuotationPackage) {
    doc.addPage();
    let y = this.heading(doc, 'YOUR INVESTMENT', 'What this trip costs');
    const rates = ratesOf(pkg);

    y = this.table(
      doc,
      y,
      ['TRAVELER', 'AGE', 'PRICE PER PERSON'],
      rates.map((r) => [
        clean(r.label),
        clean(r.ages),
        r.price ? usd(r.price) : 'Free',
      ]),
    );
    doc
      .font(SANS)
      .fontSize(8.5)
      .fillColor(MUTED)
      .text(`${PRICE_BASIS} Valid until ${this.validUntil()}.`, MARGIN, y + 8, {
        width: CONTENT,
      });
    y = doc.y + 12;

    if (hasGorillas(pkg)) {
      const note =
        'Please note: gorilla trekking is only open to guests aged 15 and over. This is a park rule. Tell us the ages of your group and we will plan the right activities for everyone.';
      doc.font(SANS).fontSize(9.5);
      const height = doc.heightOfString(note, { width: CONTENT - 24 }) + 18;
      doc.rect(MARGIN, y, CONTENT, height).fill(CREAM);
      doc.rect(MARGIN, y, 2.5, height).fill(GOLD);
      doc
        .fillColor(INK)
        .text(note, MARGIN + 14, y + 9, { width: CONTENT - 24 });
      y += height + 8;
    }

    if (pkg.route.length > 0) {
      y += 14;
      doc.font(SERIF).fontSize(15).fillColor(INK).text('Your route', MARGIN, y);
      y = this.route(doc, pkg.route, y + 24);
    }

    if (rates.length > 2) {
      y += 24;
      doc
        .font(SERIF)
        .fontSize(15)
        .fillColor(INK)
        .text('Example group prices', MARGIN, y);
      const adults = rates[0].price * 2;
      this.table(
        doc,
        y + 24,
        ['GROUP', '', 'TOTAL'],
        [
          ['2 adults', '', usd(adults)],
          [
            `2 adults and 2 children (${clean(rates[2].ages)})`,
            '',
            usd(adults + rates[2].price * 2),
          ],
        ],
      );
    }
  }

  private itineraryPages(
    doc: Doc,
    pkg: QuotationPackage,
    photos: (Buffer | null)[],
  ) {
    const pages = Math.ceil(pkg.itinerary.length / DAYS_PER_PAGE);
    for (let page = 0; page < pages; page++) {
      doc.addPage();
      const part = pages > 1 ? `, PART ${page + 1} OF ${pages}` : '';
      let y = this.heading(doc, `YOUR JOURNEY${part}`, 'Day by day');

      const start = page * DAYS_PER_PAGE;
      pkg.itinerary.slice(start, start + DAYS_PER_PAGE).forEach((day, i) => {
        const rowHeight = 39 * MM;
        const center = y + rowHeight / 2;
        doc.circle(MARGIN + 7 * MM, center, 7 * MM).fill(GREEN);
        doc
          .font(SANS)
          .fontSize(5.5)
          .fillColor(GOLD)
          .text('DAY', MARGIN, center - 9, { width: 14 * MM, align: 'center' });
        doc
          .font(SERIF)
          .fontSize(13)
          .text(String(day.day), MARGIN, center - 2, {
            width: 14 * MM,
            align: 'center',
          });

        const photo = photos[start + i];
        const textX = MARGIN + 20 * MM;
        const textWidth = CONTENT - 20 * MM - (photo ? 52 * MM : 0);
        doc.font(SERIF).fontSize(12.5).fillColor(INK);
        const title = clean(day.title);
        const titleHeight = doc.heightOfString(title, { width: textWidth });
        doc.text(title, textX, y + 9 * MM, { width: textWidth });
        doc
          .font(SANS)
          .fontSize(9.5)
          .fillColor(MUTED)
          .text(clean(day.description), textX, y + 9 * MM + titleHeight + 3, {
            width: textWidth,
            height: 22 * MM - titleHeight,
            ellipsis: true,
            lineGap: 2,
          });

        if (photo) {
          const x = WIDTH - MARGIN - 46 * MM;
          doc.save();
          doc.roundedRect(x, y + 4 * MM, 46 * MM, 31 * MM, 2 * MM).clip();
          doc.image(photo, x, y + 4 * MM, { width: 46 * MM, height: 31 * MM });
          doc.restore();
        }
        y += rowHeight;
        if (i < DAYS_PER_PAGE - 1) doc.rect(MARGIN, y, CONTENT, 0.5).fill(LINE);
      });
    }
  }

  private coversPage(doc: Doc, pkg: QuotationPackage) {
    doc.addPage();
    let y = this.heading(doc, 'CLEAR FROM THE START', 'What your price covers');

    const gap = 6 * MM;
    const column = (CONTENT - gap) / 2;
    const included = pkg.inclusions.map(clean);
    const excluded = pkg.exclusions.map(clean);
    const height = Math.max(
      this.listHeight(doc, included, column),
      this.listHeight(doc, excluded, column),
    );
    this.list(doc, 'Included', included, MARGIN, y, column, height, {
      fill: GREEN,
      title: GOLD,
      text: '#ffffff',
      mark: 'tick',
    });
    this.list(
      doc,
      'Not included',
      excluded,
      MARGIN + column + gap,
      y,
      column,
      height,
      {
        fill: CREAM,
        title: INK,
        text: INK,
        mark: 'cross',
      },
    );
    y += height + gap;

    const perks = pkg.perks.map(clean).filter(Boolean);
    if (perks.length > 0) {
      const perksHeight = this.listHeight(doc, perks, CONTENT);
      y = this.room(doc, y, perksHeight);
      this.list(
        doc,
        'Special extras included',
        perks,
        MARGIN,
        y,
        CONTENT,
        perksHeight,
        {
          fill: CREAM,
          border: GOLD,
          title: INK,
          text: INK,
          mark: 'tick',
        },
      );
      y += perksHeight + gap;
    }

    const reasons = pkg.fairPrice.map(clean).filter(Boolean);
    if (reasons.length === 0) return;

    y = this.room(doc, y, 60);
    y += 4;
    doc
      .font(SERIF)
      .fontSize(15)
      .fillColor(INK)
      .text('Why this price is fair', MARGIN, y);
    y += 26;

    reasons.forEach((reason, i) => {
      // "Title: explanation", or just an explanation
      const split = reason.indexOf(': ');
      const title = split > 0 ? reason.slice(0, split) : '';
      const text = split > 0 ? reason.slice(split + 2) : reason;
      const x = MARGIN + 9 * MM;
      const width = CONTENT - 9 * MM;

      doc.font(SANS).fontSize(10);
      const textHeight = doc.heightOfString(text, { width, lineGap: 2 });
      y = this.room(doc, y, textHeight + (title ? 18 : 0) + 12);

      doc
        .font(SERIF)
        .fontSize(18)
        .fillColor(GOLD)
        .text(String(i + 1), MARGIN, y);
      let textY = y + 2;
      if (title) {
        doc
          .font(SANS_BOLD)
          .fontSize(10.5)
          .fillColor(INK)
          .text(title, x, textY, { width });
        textY = doc.y + 2;
      }
      doc
        .font(SANS)
        .fontSize(10)
        .fillColor(MUTED)
        .text(text, x, textY, { width, lineGap: 2 });
      y = doc.y + 8;
      if (i < reasons.length - 1) doc.rect(MARGIN, y, CONTENT, 0.5).fill(LINE);
      y += 8;
    });
  }

  private termsPage(doc: Doc, pkg: QuotationPackage) {
    doc.addPage();
    let y = this.heading(doc, 'GOOD TO KNOW', 'Booking terms');

    const terms = TERMS.filter(
      (t) => hasGorillas(pkg) || !t.startsWith('Gorilla'),
    );
    for (const term of terms) {
      doc.circle(MARGIN + 2, y + 5, 2).fill(GOLD);
      doc
        .font(SANS)
        .fontSize(9.5)
        .fillColor(INK)
        .text(term, MARGIN + 11, y, { width: CONTENT - 11, lineGap: 2 });
      y = doc.y + 7;
    }

    y += 24;
    doc.font(SERIF).fontSize(15).fillColor(INK).text('How to book', MARGIN, y);
    y += 26;
    const gap = 5 * MM;
    const column = (CONTENT - gap * 3) / 4;
    STEPS.forEach(([title, text], i) => {
      const x = MARGIN + i * (column + gap);
      doc
        .font(SERIF)
        .fontSize(18)
        .fillColor(GOLD)
        .text(String(i + 1), x, y);
      doc
        .font(SANS_BOLD)
        .fontSize(9.5)
        .fillColor(INK)
        .text(title, x, y + 24, { width: column });
      doc
        .font(SANS)
        .fontSize(8.5)
        .fillColor(MUTED)
        .text(text, x, doc.y + 3, { width: column, lineGap: 1.5 });
    });

    const boxHeight = 30 * MM;
    const boxY = HEIGHT - 26 * MM - boxHeight;
    doc.roundedRect(MARGIN, boxY, CONTENT, boxHeight, 3 * MM).fill(GREEN);
    doc
      .font(SERIF)
      .fontSize(17)
      .fillColor('#ffffff')
      .text('Ready to book?', MARGIN + 8 * MM, boxY + 8 * MM);
    doc
      .font(SANS)
      .fontSize(9.5)
      .fillColor('#c9cfcb')
      .text(
        'Our team will confirm your dates and tailor the details for you.',
        MARGIN + 8 * MM,
        boxY + 16 * MM,
        { width: 105 * MM },
      );
    doc
      .font(SANS)
      .fontSize(10)
      .fillColor(GOLD)
      .text(`${PHONE}\n${EMAIL}\n${PLACE}`, MARGIN, boxY + 8 * MM, {
        width: CONTENT - 8 * MM,
        align: 'right',
        lineGap: 2,
      });
  }

  // Footer on every page except the cover
  private footers(doc: Doc, pkg: QuotationPackage) {
    const { start, count } = doc.bufferedPageRange();
    for (let i = start + 1; i < start + count; i++) {
      doc.switchToPage(i);
      const y = HEIGHT - 16 * MM;
      doc.rect(MARGIN, y, CONTENT, 0.5).fill(LINE);
      doc
        .font(SANS)
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(`Acacia Safaris · ${clean(pkg.title)}`, MARGIN, y + 8, {
          lineBreak: false,
        });
      doc.text(`Page ${i + 1} of ${count}`, MARGIN, y + 8, {
        width: CONTENT,
        align: 'right',
        lineBreak: false,
      });
    }
  }

  private heading(doc: Doc, eyebrow: string, title: string) {
    doc
      .font(SANS_BOLD)
      .fontSize(8)
      .fillColor(DARK_GOLD)
      .text(eyebrow, MARGIN, 18 * MM, { characterSpacing: 3 });
    doc
      .font(SERIF)
      .fontSize(23)
      .fillColor(INK)
      .text(title, MARGIN, 18 * MM + 15);
    const y = doc.y + 8;
    doc.rect(MARGIN, y, 16 * MM, 1.5).fill(GOLD);
    return y + 20;
  }

  // Three columns: text, text, and a price on the right
  private table(doc: Doc, startY: number, header: string[], rows: string[][]) {
    const pad = 4 * MM;
    const second = MARGIN + 42 * MM;
    let y = startY;

    doc.rect(MARGIN, y, CONTENT, 9 * MM).fill(GREEN);
    doc.font(SANS_BOLD).fontSize(7.5).fillColor(GOLD);
    doc.text(header[0], MARGIN + pad, y + 9, { characterSpacing: 2 });
    doc.text(header[1], second, y + 9, { characterSpacing: 2 });
    doc.text(header[2], MARGIN, y + 9, {
      width: CONTENT - pad,
      align: 'right',
      characterSpacing: 2,
    });
    y += 9 * MM;

    rows.forEach((row, i) => {
      const height = 11.5 * MM;
      if (i === 0) doc.rect(MARGIN, y, CONTENT, height).fill(CREAM);
      doc
        .font(i === 0 ? SANS_BOLD : SANS)
        .fontSize(10)
        .fillColor(INK);
      doc.text(row[0], MARGIN + pad, y + 11, {
        width: row[1] ? 38 * MM : CONTENT - 40 * MM,
      });
      if (row[1]) doc.text(row[1], second, y + 11);
      doc
        .font(SERIF)
        .fontSize(13)
        .text(row[2], MARGIN, y + 9, { width: CONTENT - pad, align: 'right' });
      y += height;
      doc.rect(MARGIN, y, CONTENT, 0.5).fill(LINE);
    });
    return y;
  }

  private route(doc: Doc, stops: string[], startY: number) {
    let x = MARGIN;
    let y = startY;
    const height = 7 * MM;
    stops.map(clean).forEach((stop, i) => {
      doc.font(SANS_BOLD).fontSize(9);
      const width = doc.widthOfString(stop) + 6 * MM;
      if (x + width > WIDTH - MARGIN) {
        x = MARGIN;
        y += height + 2 * MM;
      }
      doc.roundedRect(x, y, width, height, height / 2).fill(CREAM);
      doc.fillColor(INK).text(stop, x + 3 * MM, y + 6, { lineBreak: false });
      x += width;
      if (i < stops.length - 1) {
        const mid = y + height / 2;
        doc
          .moveTo(x + 2, mid)
          .lineTo(x + 3 * MM, mid)
          .moveTo(x + 3 * MM - 3, mid - 2.5)
          .lineTo(x + 3 * MM, mid)
          .lineTo(x + 3 * MM - 3, mid + 2.5)
          .lineWidth(0.8)
          .strokeColor(GOLD)
          .stroke();
        x += 3 * MM + 2;
      }
    });
    return y + height;
  }

  private listHeight(doc: Doc, items: string[], width: number) {
    doc.font(SANS).fontSize(10);
    const rows = items.reduce(
      (sum, item) =>
        sum + doc.heightOfString(item, { width: width - 12 * MM }) + 6,
      0,
    );
    return rows + 18 * MM;
  }

  private list(
    doc: Doc,
    title: string,
    items: string[],
    x: number,
    startY: number,
    width: number,
    height: number,
    style: {
      fill: string;
      border?: string;
      title: string;
      text: string;
      mark: 'tick' | 'cross';
    },
  ) {
    const box = doc.roundedRect(x, startY, width, height, 3 * MM);
    if (style.border) box.fillAndStroke(style.fill, style.border);
    else box.fill(style.fill);

    const pad = 6 * MM;
    doc
      .font(SERIF)
      .fontSize(13)
      .fillColor(style.title)
      .text(title, x + pad, startY + 5 * MM);
    let y = startY + 13 * MM;
    for (const item of items) {
      this.mark(doc, x + pad, y + 1, style.mark === 'tick');
      doc
        .font(SANS)
        .fontSize(10)
        .fillColor(style.text)
        .text(item, x + pad + 6 * MM, y, {
          width: width - 12 * MM - 6 * MM + 6 * MM,
        });
      y = doc.y + 6;
    }
  }

  private mark(doc: Doc, x: number, y: number, tick: boolean) {
    doc.lineWidth(1.3).lineCap('round');
    if (tick) {
      doc
        .moveTo(x, y + 4)
        .lineTo(x + 3, y + 7)
        .lineTo(x + 8, y)
        .strokeColor(GOLD)
        .stroke();
    } else {
      doc
        .moveTo(x, y)
        .lineTo(x + 7, y + 7)
        .moveTo(x + 7, y)
        .lineTo(x, y + 7)
        .strokeColor(RED)
        .stroke();
    }
  }

  // Starts a new page if the next block would not fit
  private room(doc: Doc, y: number, needed: number) {
    if (y + needed <= BOTTOM) return y;
    doc.addPage();
    return MARGIN;
  }

  private issued() {
    return new Date().toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  }

  private validUntil() {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
