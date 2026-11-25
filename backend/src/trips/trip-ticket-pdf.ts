// The printable ticket of a paid trip booking (A4 PDF), for travelers without a phone
// on the day: attached to the payment and reminder emails, and downloadable from
// /api/trips/tickets/pdf/<ticketToken> (traveler) or the admin panel.
// Same look as the quotation PDFs: white page, green and gold, built-in fonts.
import { existsSync } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import type { Lang } from '../mail/i18n';
import { clean } from '../packages/quotation.service';

const MM = 2.8346; // points in one millimetre
const WIDTH = 595.28; // A4
const HEIGHT = 841.89;
const MARGIN = 16 * MM;
const CONTENT = WIDTH - MARGIN * 2;

const GREEN = '#12231a';
const DEEP = '#0a1811';
const GOLD = '#c5a86d';
const DARK_GOLD = '#a88a4c';
const CREAM = '#f7f5f0';
const INK = '#0a120b';
const MUTED = '#6a706b';
const LINE = '#e4e5e3';
const OK = '#1f5a42';

const SERIF = 'Times-Roman';
const SERIF_BOLD = 'Times-Bold';
const SANS = 'Helvetica';
const SANS_BOLD = 'Helvetica-Bold';
const MONO = 'Courier-Bold';

const TEXTS = {
  en: {
    eticket: 'E-TICKET',
    admit: (n: number) => `Admits ${n} ${n === 1 ? 'traveler' : 'travelers'}`,
    traveler: 'Traveler',
    package: 'Package',
    travelers: 'Travelers',
    date: 'Date',
    place: 'Meeting area',
    code: 'Ticket code',
    scan: 'Show this ticket (printed or on a phone) on the day. Our team scans the QR code.',
    receipt: 'Receipt',
    receiptNo: 'Receipt no.',
    paidOn: 'Paid on',
    billedTo: 'Billed to',
    total: 'Total paid',
    paid: 'PAID',
    included: 'Included in your package',
    onTheDay: 'On the day',
    steps: [
      'Bring this ticket, printed or on your phone, and a photo ID.',
      'Please arrive 15 minutes early at the meeting area.',
      'Wear comfortable walking shoes; bring water and a light rain jacket.',
      'Questions or running late? Call or WhatsApp us: +250 798 635 578.',
    ],
    datesOnRequest: 'To be confirmed with you',
    issued: (d: string) => `Issued on ${d}`,
  },
  fr: {
    eticket: 'BILLET ÉLECTRONIQUE',
    admit: (n: number) =>
      `Valable pour ${n} ${n === 1 ? 'voyageur' : 'voyageurs'}`,
    traveler: 'Voyageur',
    package: 'Formule',
    travelers: 'Voyageurs',
    date: 'Date',
    place: 'Lieu',
    code: 'Code du billet',
    scan: 'Présentez ce billet (imprimé ou sur téléphone) le jour J. Notre équipe scanne le QR code.',
    receipt: 'Reçu',
    receiptNo: 'Reçu n°',
    paidOn: 'Payé le',
    billedTo: 'Facturé à',
    total: 'Total payé',
    paid: 'PAYÉ',
    included: 'Inclus dans votre formule',
    onTheDay: 'Le jour J',
    steps: [
      "Apportez ce billet, imprimé ou sur votre téléphone, et une pièce d'identité.",
      "Merci d'arriver 15 minutes en avance au lieu de rendez-vous.",
      "Portez de bonnes chaussures de marche ; prenez de l'eau et une veste de pluie légère.",
      'Une question ou un retard ? Appelez-nous ou écrivez sur WhatsApp : +250 798 635 578.',
    ],
    datesOnRequest: 'À confirmer avec vous',
    issued: (d: string) => `Émis le ${d}`,
  },
  sw: {
    eticket: 'TIKETI YA KIDIJITALI',
    admit: (n: number) => `Ni ya wasafiri ${n}`,
    traveler: 'Msafiri',
    package: 'Kifurushi',
    travelers: 'Wasafiri',
    date: 'Tarehe',
    place: 'Mahali',
    code: 'Msimbo wa tiketi',
    scan: 'Onyesha tiketi hii (iliyochapishwa au kwenye simu) siku hiyo. Timu yetu itaiskani QR code.',
    receipt: 'Risiti',
    receiptNo: 'Risiti na.',
    paidOn: 'Imelipwa',
    billedTo: 'Mlipaji',
    total: 'Jumla iliyolipwa',
    paid: 'IMELIPWA',
    included: 'Kinachojumuishwa kwenye kifurushi chako',
    onTheDay: 'Siku ya safari',
    steps: [
      'Leta tiketi hii, iliyochapishwa au kwenye simu yako, na kitambulisho.',
      'Tafadhali fika dakika 15 mapema mahali pa kukutana.',
      'Vaa viatu vizuri vya kutembea; leta maji na koti jepesi la mvua.',
      'Una swali au umechelewa? Tupigie au tuandikie WhatsApp: +250 798 635 578.',
    ],
    datesOnRequest: 'Itathibitishwa nawe',
    issued: (d: string) => `Imetolewa ${d}`,
  },
} satisfies Record<Lang, unknown>;

export type TripTicketPdf = {
  lang: Lang;
  name: string;
  email: string;
  phone?: string | null;
  tripTitle: string;
  tagline?: string | null;
  image?: string | null; // the trip's cover photo (URL)
  location: string;
  dates: string | null;
  option: string;
  unitPrice: string;
  unit: string;
  travelers: number;
  subtotal?: string | null;
  discount?: { label: string; amount: string } | null;
  total: string;
  included: string[];
  ticketCode: string;
  receiptNo: string;
  paidOn: string;
  issuedOn: string;
  qrPng: Buffer;
};

// The cover photo, cut to the banner (a missing or broken photo is left out)
async function bannerPhoto(url?: string | null) {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    return await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(1240, 420, { fit: 'cover' })
      .jpeg({ quality: 78 })
      .toBuffer();
  } catch {
    return null;
  }
}

export async function buildTripTicketPdf(t: TripTicketPdf): Promise<Buffer> {
  const T = TEXTS[t.lang];
  const photo = await bannerPhoto(t.image);

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `${clean(t.tripTitle)} - Ticket ${t.ticketCode}`,
      Author: 'Acacia Safaris',
    },
  });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  // ---------- Banner ----------
  const BANNER = 52 * MM;
  doc.rect(0, 0, WIDTH, BANNER).fill(DEEP);
  if (photo) {
    doc.image(photo, 0, 0, { width: WIDTH, height: BANNER });
    const veil = doc.linearGradient(0, 0, 0, BANNER);
    veil.stop(0, DEEP, 0.75).stop(0.5, DEEP, 0.45).stop(1, DEEP, 0.92);
    doc.rect(0, 0, WIDTH, BANNER).fill(veil);
  }
  const logo = join(process.cwd(), 'assets', 'logo.png');
  if (existsSync(logo)) doc.image(logo, MARGIN, 9 * MM, { height: 17 * MM });
  doc
    .font(SANS_BOLD)
    .fontSize(8)
    .fillColor(GOLD)
    .text(T.eticket, MARGIN, 11 * MM, {
      width: CONTENT,
      align: 'right',
      characterSpacing: 2.5,
    });
  doc
    .font(SANS)
    .fontSize(8.5)
    .fillColor('#ffffff')
    .text(T.admit(t.travelers), MARGIN, 16 * MM, {
      width: CONTENT,
      align: 'right',
    });
  doc
    .font(SERIF_BOLD)
    .fontSize(22)
    .fillColor('#ffffff')
    .text(clean(t.tripTitle), MARGIN, 31 * MM, {
      width: CONTENT,
      lineBreak: false,
      ellipsis: true,
    });
  if (t.tagline) {
    doc
      .font('Times-Italic')
      .fontSize(11.5)
      .fillColor('#e2c98f')
      .text(clean(t.tagline), MARGIN, 41 * MM, {
        width: CONTENT,
        lineBreak: false,
        ellipsis: true,
      });
  }

  // ---------- Ticket card ----------
  const cardY = BANNER + 9 * MM;
  const cardH = 80 * MM;
  const qrSize = 56 * MM;
  const stubW = qrSize + 14 * MM;
  const stubX = MARGIN + CONTENT - stubW;
  doc
    .roundedRect(MARGIN, cardY, CONTENT, cardH, 10)
    .lineWidth(1.2)
    .strokeColor(GREEN)
    .stroke();
  // QR stub (right), separated by a dashed tear line
  doc
    .moveTo(stubX, cardY + 6)
    .lineTo(stubX, cardY + cardH - 6)
    .dash(4, { space: 3 })
    .strokeColor('#9aa39d')
    .lineWidth(1)
    .stroke()
    .undash();
  doc.image(t.qrPng, stubX + 7 * MM, cardY + 6 * MM, {
    width: qrSize,
    height: qrSize,
  });
  doc
    .font(MONO)
    .fontSize(15)
    .fillColor(INK)
    .text(t.ticketCode, stubX, cardY + 6 * MM + qrSize + 3 * MM, {
      width: stubW,
      align: 'center',
      characterSpacing: 2.5,
    });
  doc
    .font(SANS)
    .fontSize(7)
    .fillColor(MUTED)
    .text(T.code.toUpperCase(), stubX, cardY + cardH - 7 * MM, {
      width: stubW,
      align: 'center',
      characterSpacing: 1.5,
    });

  // Details (left)
  const fields: [string, string][] = [
    [T.traveler, t.name],
    [T.date, t.dates ?? T.datesOnRequest],
    [T.place, t.location],
    [T.package, t.option],
    [T.travelers, String(t.travelers)],
  ];
  const leftX = MARGIN + 8 * MM;
  const leftW = stubX - leftX - 6 * MM;
  let y = cardY + 7 * MM;
  fields.forEach(([label, value], i) => {
    doc
      .font(SANS)
      .fontSize(7)
      .fillColor(MUTED)
      .text(label.toUpperCase(), leftX, y, { characterSpacing: 1.4 });
    doc
      .font(i === 0 ? SERIF_BOLD : SANS_BOLD)
      .fontSize(i === 0 ? 16 : 11)
      .fillColor(INK)
      .text(clean(value), leftX, y + 3.6 * MM, {
        width: leftW,
        lineBreak: false,
        ellipsis: true,
      });
    y += i === 0 ? 14 * MM : 11.5 * MM;
  });

  doc
    .font(SANS)
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(clean(T.scan), MARGIN, cardY + cardH + 4 * MM, {
      width: CONTENT,
      align: 'center',
    });

  // ---------- Receipt ----------
  let ry = cardY + cardH + 14 * MM;
  doc
    .moveTo(MARGIN, ry)
    .lineTo(MARGIN + 8 * MM, ry)
    .lineWidth(1.5)
    .strokeColor(GOLD)
    .stroke();
  doc
    .font(SERIF)
    .fontSize(16)
    .fillColor(INK)
    .text(T.receipt, MARGIN + 11 * MM, ry - 7);
  ry += 7 * MM;

  const boxH = (t.discount ? 58 : 49) * MM;
  doc.roundedRect(MARGIN, ry, CONTENT, boxH, 8).fill(CREAM);
  const pad = 6 * MM;
  doc
    .font(SANS)
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(`${T.receiptNo} `, MARGIN + pad, ry + pad, { continued: true })
    .font(MONO)
    .fillColor(INK)
    .text(t.receiptNo)
    .font(SANS)
    .fillColor(MUTED)
    .text(`${T.paidOn} `, { continued: true })
    .font(SANS_BOLD)
    .fillColor(INK)
    .text(clean(t.paidOn));
  doc
    .font(SANS)
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(T.billedTo, MARGIN, ry + pad, {
      width: CONTENT - pad,
      align: 'right',
    })
    .font(SANS_BOLD)
    .fillColor(INK)
    .text(clean(t.name), { width: CONTENT - pad, align: 'right' })
    .font(SANS)
    .fillColor(MUTED)
    .text(clean([t.email, t.phone].filter(Boolean).join(' · ')), {
      width: CONTENT - pad,
      align: 'right',
    });

  let ly = ry + 19 * MM;
  doc
    .moveTo(MARGIN + pad, ly - 2 * MM)
    .lineTo(MARGIN + CONTENT - pad, ly - 2 * MM)
    .lineWidth(0.6)
    .strokeColor(LINE)
    .stroke();
  doc
    .font(SANS_BOLD)
    .fontSize(10)
    .fillColor(INK)
    .text(clean(t.tripTitle), MARGIN + pad, ly, {
      width: CONTENT * 0.62,
      lineBreak: false,
      ellipsis: true,
    })
    .font(SANS)
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(
      clean(`${t.option} · ${t.unitPrice} ${t.unit} × ${t.travelers}`),
      MARGIN + pad,
      ly + 4.5 * MM,
      { width: CONTENT * 0.62 },
    );
  doc
    .font(SANS_BOLD)
    .fontSize(10)
    .fillColor(INK)
    .text(clean(t.subtotal ?? t.total), MARGIN, ly, {
      width: CONTENT - pad,
      align: 'right',
    });
  if (t.discount) {
    ly += 11 * MM;
    doc
      .font(SANS)
      .fontSize(9)
      .fillColor(OK)
      .text(clean(t.discount.label), MARGIN + pad, ly)
      .font(SANS_BOLD)
      .text(clean(t.discount.amount), MARGIN, ly, {
        width: CONTENT - pad,
        align: 'right',
      });
  }

  // Divider, then the PAID stamp and the total
  const dividerY = ly + (t.discount ? 8 : 10) * MM;
  doc
    .moveTo(MARGIN + pad, dividerY)
    .lineTo(MARGIN + CONTENT - pad, dividerY)
    .lineWidth(0.6)
    .strokeColor(LINE)
    .stroke();
  const sy = dividerY + 6 * MM;
  doc.save();
  doc.rotate(-8, { origin: [MARGIN + pad + 16 * MM, sy + 5 * MM] });
  doc
    .roundedRect(MARGIN + pad, sy, 32 * MM, 10 * MM, 3)
    .lineWidth(1.8)
    .strokeColor(OK)
    .stroke();
  doc
    .font(SANS_BOLD)
    .fontSize(13)
    .fillColor(OK)
    .text(clean(T.paid), MARGIN + pad, sy + 2.6 * MM, {
      width: 32 * MM,
      align: 'center',
      characterSpacing: 3,
    });
  doc.restore();
  doc
    .font(SANS)
    .fontSize(7.5)
    .fillColor(MUTED)
    .text(T.total.toUpperCase(), MARGIN, sy - 1 * MM, {
      width: CONTENT - pad,
      align: 'right',
      characterSpacing: 1.2,
    })
    .font(SERIF_BOLD)
    .fontSize(22)
    .fillColor(GREEN)
    .text(clean(t.total), MARGIN, sy + 2.5 * MM, {
      width: CONTENT - pad,
      align: 'right',
    });

  // ---------- Included + on the day ----------
  const by = ry + boxH + 10 * MM;
  const colW = (CONTENT - 10 * MM) / 2;
  const heading = (text: string, x: number, yy: number) =>
    doc
      .font(SANS_BOLD)
      .fontSize(8)
      .fillColor(DARK_GOLD)
      .text(clean(text).toUpperCase(), x, yy, {
        width: colW,
        characterSpacing: 1.5,
      });
  const bullets = (
    items: string[],
    x: number,
    yy: number,
    mark: string,
    color: string,
  ) => {
    let cy = yy;
    for (const item of items.slice(0, 8)) {
      doc.font(SANS_BOLD).fontSize(9).fillColor(color).text(mark, x, cy);
      doc
        .font(SANS)
        .fontSize(9)
        .fillColor(INK)
        .text(clean(item), x + 5 * MM, cy, { width: colW - 5 * MM });
      cy = doc.y + 1.6 * MM;
    }
    return cy;
  };
  const rightX = MARGIN + colW + 10 * MM;
  if (t.included.length) {
    heading(T.included, MARGIN, by);
    bullets(t.included, MARGIN, by + 6 * MM, '+', OK);
  }
  heading(T.onTheDay, t.included.length ? rightX : MARGIN, by);
  bullets(
    T.steps,
    t.included.length ? rightX : MARGIN,
    by + 6 * MM,
    '•',
    DARK_GOLD,
  );

  // ---------- Footer ----------
  const fy = HEIGHT - 16 * MM;
  doc.rect(0, fy - 4 * MM, WIDTH, 20 * MM).fill(GREEN);
  doc
    .font(SERIF)
    .fontSize(10)
    .fillColor('#ffffff')
    .text('ACACIA SAFARIS', MARGIN, fy, { characterSpacing: 3 });
  doc
    .font(SANS)
    .fontSize(7.5)
    .fillColor('#ffffff', 0.72)
    .text(
      'Kigali, Rwanda  ·  +250 798 635 578  ·  info@acaciasafarisrwanda.com  ·  acaciasafarisrwanda.com',
      MARGIN,
      fy + 5 * MM,
    );
  doc
    .font(SANS)
    .fontSize(7.5)
    .fillColor(GOLD, 1)
    .text(clean(T.issued(t.issuedOn)), MARGIN, fy + 1 * MM, {
      width: CONTENT,
      align: 'right',
    });

  doc.end();
  return finished;
}
