// Trip booking emails (Admin > Trips > Bookings):
//  - tripTicketHtml: to the traveler once the booking is paid: confirmation, QR code ticket
//    and receipt in one email, in the language they booked in (en / fr / sw)
//  - adminTripHtml: to the admins, for a new booking and for a payment received
// Built with tables and inline styles: that is what every email app shows the same way.
import type { Lang } from '../mail/i18n';

const GREEN = '#12231a';
const DEEP = '#0a1811';
const GOLD = '#c5a86d';
const INK = '#0a120b';
const MUTED = '#5e6960';
const CREAM = '#f7f5f0';
const LINE = '#ece6da';
const OK = '#1f5a42';
const WHATSAPP = '250798635578';
const SERIF = "Georgia,'Times New Roman',serif";

export const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ] ?? c,
  );
const h = escapeHtml;

// ---------- Traveler: confirmation + ticket + receipt ----------

const TEXTS = {
  en: {
    subject: (trip: string) => `Payment received · Your ticket for ${trip}`,
    preheader: (trip: string) =>
      `Your place on ${trip} is confirmed. Your QR code ticket and receipt are inside.`,
    badge: 'Payment received',
    eyebrow: "You're going!",
    hello: (name: string) => `Hello ${name},`,
    intro: (trip: string) =>
      `Thank you! We have received your payment in full and your place on <strong>${trip}</strong> is confirmed. Your ticket and your receipt are below: please keep this email.`,
    ticket: 'Your ticket',
    showQr: 'Show this QR code when you arrive',
    showQrNote:
      'On your phone or printed. Our team scans it on the day, or you can give the code.',
    trip: 'Your trip',
    date: 'Date',
    location: 'Meeting area',
    travelers: 'Travelers',
    option: 'Package',
    duration: 'Duration',
    datesOnRequest: 'To be confirmed with you',
    travelersCount: (n: number) => `${n} ${n === 1 ? 'traveler' : 'travelers'}`,
    receipt: 'Receipt',
    receiptNo: 'Receipt no.',
    paidOn: 'Paid on',
    billedTo: 'Billed to',
    item: 'Description',
    amount: 'Amount',
    total: 'Total paid',
    paid: 'PAID',
    paidInFull: 'Paid in full · Thank you',
    included: 'Included in your package',
    notIncluded: 'Not included',
    bring: 'Before you go',
    bringItems: [
      'Your ticket (this email) and a photo ID',
      'Comfortable walking shoes and a light rain jacket',
      'Water, sunscreen and your camera',
    ],
    viewTrip: 'View the trip page',
    whatsapp: 'Chat with us on WhatsApp',
    questions:
      'Questions? Reply to this email or message us on WhatsApp: we are happy to help.',
    textTicket: (code: string) =>
      `Your ticket code: ${code}. The QR code is attached: show it on the day.`,
  },
  fr: {
    subject: (trip: string) => `Paiement reçu · Votre billet pour ${trip}`,
    preheader: (trip: string) =>
      `Votre place pour ${trip} est confirmée. Votre billet QR et votre reçu sont à l'intérieur.`,
    badge: 'Paiement reçu',
    eyebrow: "C'est parti !",
    hello: (name: string) => `Bonjour ${name},`,
    intro: (trip: string) =>
      `Merci ! Nous avons bien reçu votre paiement complet et votre place pour <strong>${trip}</strong> est confirmée. Votre billet et votre reçu sont ci-dessous : conservez cet e-mail.`,
    ticket: 'Votre billet',
    showQr: 'Présentez ce QR code à votre arrivée',
    showQrNote:
      'Sur votre téléphone ou imprimé. Notre équipe le scanne le jour J, ou vous pouvez donner le code.',
    trip: 'Votre voyage',
    date: 'Date',
    location: 'Lieu',
    travelers: 'Voyageurs',
    option: 'Formule',
    duration: 'Durée',
    datesOnRequest: 'À confirmer avec vous',
    travelersCount: (n: number) => `${n} ${n === 1 ? 'voyageur' : 'voyageurs'}`,
    receipt: 'Reçu',
    receiptNo: 'Reçu n°',
    paidOn: 'Payé le',
    billedTo: 'Facturé à',
    item: 'Description',
    amount: 'Montant',
    total: 'Total payé',
    paid: 'PAYÉ',
    paidInFull: 'Payé en totalité · Merci',
    included: 'Inclus dans votre formule',
    notIncluded: 'Non inclus',
    bring: 'Avant de partir',
    bringItems: [
      "Votre billet (cet e-mail) et une pièce d'identité",
      'De bonnes chaussures de marche et une veste de pluie légère',
      'De l’eau, de la crème solaire et votre appareil photo',
    ],
    viewTrip: 'Voir la page du voyage',
    whatsapp: 'Écrivez-nous sur WhatsApp',
    questions:
      'Des questions ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp : nous sommes là pour vous aider.',
    textTicket: (code: string) =>
      `Votre code de billet : ${code}. Le QR code est joint : présentez-le le jour J.`,
  },
  sw: {
    subject: (trip: string) => `Malipo yamepokelewa · Tiketi yako ya ${trip}`,
    preheader: (trip: string) =>
      `Nafasi yako kwenye ${trip} imethibitishwa. Tiketi yako ya QR na risiti viko ndani.`,
    badge: 'Malipo yamepokelewa',
    eyebrow: 'Unaenda!',
    hello: (name: string) => `Habari ${name},`,
    intro: (trip: string) =>
      `Asante! Tumepokea malipo yako yote na nafasi yako kwenye <strong>${trip}</strong> imethibitishwa. Tiketi na risiti yako viko hapa chini: tafadhali hifadhi barua pepe hii.`,
    ticket: 'Tiketi yako',
    showQr: 'Onyesha QR code hii unapofika',
    showQrNote:
      'Kwenye simu yako au iliyochapishwa. Timu yetu itaiskani siku hiyo, au unaweza kutoa msimbo.',
    trip: 'Safari yako',
    date: 'Tarehe',
    location: 'Mahali',
    travelers: 'Wasafiri',
    option: 'Kifurushi',
    duration: 'Muda',
    datesOnRequest: 'Itathibitishwa nawe',
    travelersCount: (n: number) => `Wasafiri ${n}`,
    receipt: 'Risiti',
    receiptNo: 'Risiti na.',
    paidOn: 'Imelipwa',
    billedTo: 'Mlipaji',
    item: 'Maelezo',
    amount: 'Kiasi',
    total: 'Jumla iliyolipwa',
    paid: 'IMELIPWA',
    paidInFull: 'Imelipwa yote · Asante',
    included: 'Kinachojumuishwa kwenye kifurushi chako',
    notIncluded: 'Hakijajumuishwa',
    bring: 'Kabla ya kwenda',
    bringItems: [
      'Tiketi yako (barua pepe hii) na kitambulisho',
      'Viatu vizuri vya kutembea na koti jepesi la mvua',
      'Maji, mafuta ya jua na kamera yako',
    ],
    viewTrip: 'Tazama ukurasa wa safari',
    whatsapp: 'Ongea nasi kwa WhatsApp',
    questions:
      'Una maswali? Jibu barua pepe hii au tuandikie kwa WhatsApp: tuko tayari kukusaidia.',
    textTicket: (code: string) =>
      `Msimbo wa tiketi yako: ${code}. QR code imeambatishwa: ionyeshe siku hiyo.`,
  },
} satisfies Record<Lang, unknown>;

export type TripTicketEmail = {
  lang: Lang;
  name: string;
  email: string;
  phone?: string | null;
  tripTitle: string;
  tagline?: string | null;
  image?: string | null;
  location: string;
  dates: string | null; // "Wed 25 Nov 2026", null = on request
  duration?: string | null;
  option: string;
  unitPrice: string; // "RWF 100,000"
  unit: string; // "per person"
  travelers: number;
  total: string; // "RWF 200,000"
  included: string[];
  excluded: string[];
  ticketCode: string;
  receiptNo: string;
  paidOn: string;
  tripUrl: string;
};

export function tripTicketSubject(e: TripTicketEmail) {
  return TEXTS[e.lang].subject(e.tripTitle);
}

export function tripTicketText(e: TripTicketEmail) {
  const T = TEXTS[e.lang];
  return [
    T.hello(e.name),
    T.intro(e.tripTitle).replace(/<\/?strong>/g, ''),
    `${T.date}: ${e.dates ?? T.datesOnRequest}`,
    `${T.option}: ${e.option} · ${T.travelersCount(e.travelers)}`,
    `${T.total}: ${e.total} (${T.receiptNo} ${e.receiptNo})`,
    T.textTicket(e.ticketCode),
    e.tripUrl,
    'Acacia Safaris · Kigali, Rwanda · +250 798 635 578',
  ].join('\n\n');
}

export function tripTicketHtml(e: TripTicketEmail) {
  const T = TEXTS[e.lang];

  const fact = (label: string, value: string) => `
    <td width="50%" style="padding:6px;vertical-align:top">
      <div style="background:${CREAM};border-radius:12px;padding:13px 15px">
        <p style="margin:0;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED}">${h(label)}</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:bold;color:${INK}">${h(value)}</p>
      </div>
    </td>`;
  const facts = [
    fact(T.date, e.dates ?? T.datesOnRequest),
    fact(T.location, e.location),
    fact(T.option, e.option),
    fact(T.travelers, T.travelersCount(e.travelers)),
    ...(e.duration ? [fact(T.duration, e.duration)] : []),
  ];
  const factRows: string[] = [];
  for (let i = 0; i < facts.length; i += 2) {
    factRows.push(
      `<tr>${facts[i]}${facts[i + 1] ?? '<td width="50%"></td>'}</tr>`,
    );
  }

  const list = (items: string[], mark: string, color: string) =>
    items
      .map(
        (i) => `<tr>
          <td width="24" style="vertical-align:top;padding:5px 0;color:${color};font-weight:bold;font-size:14px">${mark}</td>
          <td style="padding:5px 0;font-size:14px;line-height:1.5;color:${INK}">${h(i)}</td>
        </tr>`,
      )
      .join('');

  const heading = (title: string) => `
    <tr><td style="padding:34px 32px 14px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:28px;border-top:2px solid ${GOLD}"></td>
        <td style="padding-left:12px;font-family:${SERIF};font-size:21px;color:${INK}">${h(title)}</td>
      </tr></table>
    </td></tr>`;

  return `<!doctype html>
<html lang="${e.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${h(T.subject(e.tripTitle))}</title></head>
<body style="margin:0;padding:0;background:${CREAM}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${h(T.preheader(e.tripTitle))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};font-family:Arial,Helvetica,sans-serif;color:${INK}">
<tr><td align="center" style="padding:28px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 34px rgba(10,18,11,0.10)">

  <!-- Header -->
  <tr><td style="background:${DEEP};padding:22px 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${SERIF};font-size:18px;letter-spacing:4px;color:#ffffff">ACACIA <span style="color:${GOLD}">SAFARIS</span></td>
      <td align="right"><span style="display:inline-block;background:${OK};color:#d6f5e3;font-size:11px;font-weight:bold;letter-spacing:1px;padding:7px 13px;border-radius:20px;white-space:nowrap">&#10003;&nbsp;${h(T.badge)}</span></td>
    </tr></table>
  </td></tr>

  <!-- Hero -->
  ${e.image ? `<tr><td style="padding:0;background:${DEEP}"><img src="${h(e.image)}" alt="${h(e.tripTitle)}" width="600" style="display:block;width:100%;height:auto;max-height:300px;object-fit:cover"></td></tr>` : ''}
  <tr><td style="background:${DEEP};padding:26px 32px 32px">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};font-weight:bold">${h(T.eyebrow)}</p>
    <p style="margin:8px 0 0;font-family:${SERIF};font-size:30px;line-height:1.2;color:#ffffff">${h(e.tripTitle)}</p>
    ${e.tagline ? `<p style="margin:8px 0 0;font-family:${SERIF};font-style:italic;font-size:16px;color:#e2c98f">${h(e.tagline)}</p>` : ''}
    <p style="margin:12px 0 0;font-size:14px;color:#ffffffb3">&#128197;&nbsp; ${h(e.dates ?? T.datesOnRequest)} &nbsp;·&nbsp; &#128205;&nbsp; ${h(e.location)}</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:30px 32px 0">
    <p style="margin:0;font-size:16px;font-weight:bold">${h(T.hello(e.name))}</p>
    <p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:${MUTED}">${T.intro(h(e.tripTitle))}</p>
  </td></tr>

  <!-- Ticket -->
  <tr><td style="padding:26px 32px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN};border-radius:18px">
      <tr><td align="center" style="padding:26px 20px 6px">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};font-weight:bold">${h(T.ticket)}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#ffffffa6">${h(e.option)} &nbsp;·&nbsp; ${h(T.travelersCount(e.travelers))}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto 0"><tr><td style="background:#ffffff;border-radius:16px;padding:12px">
          <img src="cid:ticket-qr" alt="QR code ${h(e.ticketCode)}" width="190" height="190" style="display:block;width:190px;height:190px">
        </td></tr></table>
        <p style="margin:16px 0 0;font-family:'Courier New',Courier,monospace;font-size:25px;letter-spacing:6px;font-weight:bold;color:${GOLD}">${h(e.ticketCode)}</p>
      </td></tr>
      <tr><td style="padding:14px 24px 0"><div style="border-top:2px dashed #ffffff2e"></div></td></tr>
      <tr><td align="center" style="padding:14px 28px 24px">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#ffffff"><strong>${h(T.showQr)}</strong></p>
        <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#ffffffa6">${h(T.showQrNote)}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Trip -->
  ${heading(T.trip)}
  <tr><td style="padding:0 26px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${factRows.join('')}</table>
  </td></tr>

  <!-- Receipt -->
  ${heading(T.receipt)}
  <tr><td style="padding:0 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:14px;overflow:hidden">
      <tr><td style="background:${CREAM};padding:16px 18px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;font-size:12px;line-height:1.7;color:${MUTED}">
            ${h(T.receiptNo)} <strong style="color:${INK};font-family:'Courier New',Courier,monospace">${h(e.receiptNo)}</strong><br>
            ${h(T.paidOn)} <strong style="color:${INK}">${h(e.paidOn)}</strong>
          </td>
          <td align="right" style="vertical-align:top;font-size:12px;line-height:1.7;color:${MUTED}">
            ${h(T.billedTo)}<br><strong style="color:${INK}">${h(e.name)}</strong><br>${h(e.email)}${e.phone ? `<br>${h(e.phone)}` : ''}
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:6px 18px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${LINE}">${h(T.item)}</td>
            <td align="right" style="padding:10px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${LINE}">${h(T.amount)}</td>
          </tr>
          <tr>
            <td style="padding:14px 0;font-size:14px;line-height:1.5;color:${INK}">
              <strong>${h(e.tripTitle)}</strong><br>
              <span style="color:${MUTED};font-size:13px">${h(e.option)} · ${h(e.unitPrice)} ${h(e.unit)} &times; ${e.travelers}</span>
            </td>
            <td align="right" style="padding:14px 0;font-size:14px;font-weight:bold;color:${INK};white-space:nowrap;vertical-align:top">${h(e.total)}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 18px"><div style="border-top:1px solid ${LINE}"></div></td></tr>
      <tr><td style="padding:16px 18px 18px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle">
            <span style="display:inline-block;border:2px solid ${OK};color:${OK};font-weight:bold;font-size:13px;letter-spacing:3px;padding:5px 12px;border-radius:6px">&#10003; ${h(T.paid)}</span>
          </td>
          <td align="right" style="vertical-align:middle">
            <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED}">${h(T.total)}</p>
            <p style="margin:2px 0 0;font-family:${SERIF};font-size:28px;font-weight:bold;color:${GREEN}">${h(e.total)}</p>
          </td>
        </tr></table>
        <p style="margin:12px 0 0;font-size:12px;color:${OK};font-weight:bold">${h(T.paidInFull)}</p>
      </td></tr>
    </table>
  </td></tr>

  ${
    e.included.length || e.excluded.length
      ? `${heading(T.included)}
  <tr><td style="padding:0 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${e.included.length ? `<td style="vertical-align:top;padding-right:10px"><table role="presentation" cellpadding="0" cellspacing="0">${list(e.included, '&#10003;', OK)}</table></td>` : ''}
      ${e.excluded.length ? `<td width="45%" style="vertical-align:top;padding-left:10px"><p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#b4483c">${h(T.notIncluded)}</p><table role="presentation" cellpadding="0" cellspacing="0">${list(e.excluded, '&#10005;', '#b4483c')}</table></td>` : ''}
    </tr></table>
  </td></tr>`
      : ''
  }

  <!-- Before you go -->
  <tr><td style="padding:32px 32px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6ea;border:1px solid #ecdcb8;border-radius:14px">
      <tr><td style="padding:20px 22px">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8e7345;font-weight:bold">${h(T.bring)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px">${list(T.bringItems, '&#10003;', OK)}</table>
      </td></tr>
    </table>
  </td></tr>

  <!-- Buttons -->
  <tr><td align="center" style="padding:30px 32px 6px">
    <a href="${h(e.tripUrl)}" style="display:inline-block;background:${GOLD};color:#0e1d16;text-decoration:none;font-weight:bold;font-size:15px;padding:15px 34px;border-radius:10px">${h(T.viewTrip)}</a>
  </td></tr>
  <tr><td align="center" style="padding:12px 32px 0">
    <a href="https://wa.me/${WHATSAPP}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 20px;border-radius:30px">&#128172;&nbsp; ${h(T.whatsapp)}</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:30px 32px 26px">
    <div style="border-top:1px solid ${LINE};padding-top:18px;text-align:center">
      <p style="margin:0;font-family:${SERIF};font-size:14px;letter-spacing:3px;color:${GREEN}">ACACIA SAFARIS</p>
      <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#9aa39d">Kigali, Rwanda &nbsp;·&nbsp; +250 798 635 578 &nbsp;·&nbsp; info@acaciasafaris.com<br>${h(T.questions)}</p>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

// ---------- Admins (English) ----------

export type AdminTripEmail = {
  kind: 'new' | 'paid';
  tripTitle: string;
  customer: string;
  email: string;
  phone?: string | null;
  option: string;
  travelers: number;
  total: string;
  message?: string | null;
  ticketCode?: string | null;
  seats?: string | null; // "8 / 12 seats taken"
  link: string; // Admin > Trips > Bookings
};

export function adminTripSubject(e: AdminTripEmail) {
  return e.kind === 'new'
    ? `New trip booking: ${e.customer} · ${e.tripTitle}`
    : `Payment received: ${e.customer} · ${e.tripTitle} (${e.total})`;
}

export function adminTripText(e: AdminTripEmail) {
  return [
    e.kind === 'new'
      ? `${e.customer} booked ${e.tripTitle}.`
      : `${e.customer} paid ${e.total} for ${e.tripTitle}. Their ticket ${e.ticketCode ?? ''} and receipt were emailed to ${e.email}.`,
    `Package: ${e.option} · ${e.travelers} travelers · ${e.total}`,
    `Contact: ${e.email}${e.phone ? ` · ${e.phone}` : ''}`,
    e.seats ?? '',
    e.message ? `Message: ${e.message}` : '',
    e.link,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function adminTripHtml(e: AdminTripEmail) {
  const isNew = e.kind === 'new';
  const row = (label: string, value: string) => `<tr>
    <td style="padding:9px 0;font-size:13px;color:${MUTED};border-bottom:1px solid ${LINE};width:120px">${h(label)}</td>
    <td style="padding:9px 0;font-size:14px;font-weight:bold;color:${INK};border-bottom:1px solid ${LINE}">${value}</td>
  </tr>`;
  const waNumber = (e.phone ?? '').replace(/\D/g, '');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CREAM}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};font-family:Arial,Helvetica,sans-serif;color:${INK}">
<tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(10,18,11,0.08)">
  <tr><td style="background:${DEEP};padding:18px 28px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${SERIF};font-size:15px;letter-spacing:3px;color:#ffffff">ACACIA <span style="color:${GOLD}">ADMIN</span></td>
      <td align="right"><span style="display:inline-block;background:${isNew ? GOLD : OK};color:${isNew ? '#0e1d16' : '#d6f5e3'};font-size:11px;font-weight:bold;letter-spacing:1px;padding:6px 12px;border-radius:20px">${isNew ? '&#9733; NEW BOOKING' : '&#10003; PAYMENT RECEIVED'}</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:26px 28px 6px">
    <p style="margin:0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#8e7345;font-weight:bold">${h(e.tripTitle)}</p>
    <p style="margin:8px 0 0;font-family:${SERIF};font-size:24px;line-height:1.3;color:${INK}">${
      isNew
        ? `${h(e.customer)} booked ${e.travelers === 1 ? 'a seat' : `${e.travelers} seats`}`
        : `${h(e.customer)} paid ${h(e.total)}`
    }</p>
    <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${MUTED}">${
      isNew
        ? 'Confirm the booking with the traveler, then mark it as Paid once the money is received: their ticket and receipt are emailed automatically.'
        : `The booking is confirmed. Ticket <strong style="color:${INK};font-family:'Courier New',monospace;letter-spacing:2px">${h(e.ticketCode ?? '')}</strong> and the receipt were emailed to ${h(e.email)}.`
    }</p>
  </td></tr>
  <tr><td style="padding:14px 28px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Package', h(e.option))}
      ${row('Travelers', String(e.travelers))}
      ${row(isNew ? 'Total' : 'Paid', h(e.total))}
      ${row('Email', `<a href="mailto:${h(e.email)}" style="color:${OK}">${h(e.email)}</a>`)}
      ${e.phone ? row('Phone', `<a href="https://wa.me/${waNumber}" style="color:${OK}">${h(e.phone)} (WhatsApp)</a>`) : ''}
      ${e.seats ? row('Seats', h(e.seats)) : ''}
    </table>
  </td></tr>
  ${
    e.message
      ? `<tr><td style="padding:16px 28px 0"><div style="background:#fbf6ea;border:1px solid #ecdcb8;border-radius:12px;padding:14px 16px">
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8e7345;font-weight:bold">Message from the traveler</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};white-space:pre-line">${h(e.message)}</p>
    </div></td></tr>`
      : ''
  }
  <tr><td align="center" style="padding:24px 28px 8px">
    <a href="${h(e.link)}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:9px">Open the trip's bookings</a>
  </td></tr>
  <tr><td style="padding:16px 28px 22px;text-align:center;font-size:11px;color:#9aa39d">Acacia Safaris admin · automatic message</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
