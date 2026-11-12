// The texts of the emails sent to visitors, in their website language.
// (Emails to the team, like sign-in codes, stay in English.)
// Package contents (title, itinerary, inclusions…) are shown as written in the admin panel.

export const LANGS = ['en', 'fr', 'sw'] as const;
export type Lang = (typeof LANGS)[number];
export const asLang = (value?: string | null): Lang =>
  LANGS.includes(value as Lang) ? (value as Lang) : 'en';

// For dates and numbers in emails
export const INTL_LOCALE: Record<Lang, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  sw: 'sw-KE',
};

// "2 adults", "1 child" (known price groups); others stay "2 × Students"
type Plural = (n: number) => string;
const plural =
  (one: string, other: string): Plural =>
  (n) =>
    `${n} ${n === 1 ? one : other}`;
const swPlural =
  (one: string, other: string): Plural =>
  (n) =>
    `${n === 1 ? one : other} ${n}`;

const en = {
  hello: (name: string) => `Hello ${name},`,
  openBooking: 'Open my booking',
  keepEmail:
    'Keep this email: the button is your private link to your booking and our conversation.',
  received: {
    subject: 'We received your booking request',
    heading: 'Your booking request is in',
    thanks: (title: string) =>
      `Thank you for choosing Acacia Safaris. We received your request for ${title}.`,
    askedFor: (price: string) =>
      `You asked for ${price}. Our team will answer within 24 hours.`,
    priceSoon: 'Our team will send you a price within 24 hours.',
    follow:
      'You can follow your booking and write to us at any time from your booking page.',
    yourTrip: 'your trip',
  },
  newPrice: {
    subject: (price: string) => `New price for your trip: ${price}`,
    heading: 'We have a price for you',
    proposed: (name: string, price: string) =>
      `${name} proposed ${price} for your trip.`,
    open: 'Open your booking to accept it or to reply.',
  },
  newMessage: {
    subject: 'New message about your trip',
    heading: 'You have a new message',
    wrote: (name: string) => `${name} wrote:`,
  },
  tripSoon: {
    subject: (title: string) => `Your trip is coming: ${title}`,
    heading: 'Your safari starts in 7 days',
    intro: (title: string, dates: string) =>
      `We can't wait to welcome you on ${title} (${dates}). Here is everything to have ready.`,
    qr: 'Your QR code ticket is attached and on your booking page. Show it on the first day, printed or on your phone.',
    bring:
      'Remember: a passport or ID for every traveler, comfortable shoes, a rain jacket, sun protection and your camera.',
    questions:
      'Any last questions? Write to us from your booking page and we will answer quickly.',
  },
  balance: {
    subject: (amount: string) => `Reminder: remaining balance of ${amount}`,
    heading: 'Your remaining balance',
    intro: (title: string, date: string) =>
      `Thank you for your deposit for ${title}. Your trip starts on ${date}.`,
    due: (amount: string) =>
      `The remaining ${amount} is due before your trip starts. Our team will send you the payment details, or you can ask for them from your booking page.`,
    paid: 'Already paid? Thank you, you can ignore this email.',
  },
  review: {
    subject: 'How was your safari?',
    heading: 'How was your trip?',
    intro: (title: string) =>
      `We hope you loved ${title}. Thank you for travelling with Acacia Safaris.`,
    ask: 'Would you share a few words about your experience? It takes one minute and helps other travelers choose their trip.',
    button: 'Leave a review',
  },
  confirm: {
    subject: (title: string, dates: string) => `Confirmed: ${title} · ${dates}`,
    preheader: (title: string) =>
      `Your trip ${title} is confirmed. Your QR code ticket and every detail are inside.`,
    badge: 'CONFIRMED',
    booked: 'Your trip is booked',
    intro:
      'Wonderful news: your booking is <strong style="color:#0a120b">confirmed</strong>. Below is your ticket and every detail of your trip. Please keep this email, you will need it on the day.',
    ticket: 'Your ticket',
    showQr: 'Show this QR code on the day of your trip',
    showQrNote: 'Printed or on your phone. Our team scans it to welcome you.',
    glance: 'At a glance',
    yourTrip: 'Your trip',
    dates: 'Dates',
    duration: 'Duration',
    travelers: 'Travelers',
    tripType: 'Trip type',
    lodging: 'Lodging',
    location: 'Location',
    route: 'Route',
    overview: 'Overview',
    aboutJourney: 'About this journey',
    price: 'Price',
    yourTotal: 'Your total',
    total: 'Total',
    free: 'free',
    itinerary: 'Itinerary',
    dayByDay: 'Day by day',
    day: 'Day',
    whatYouGet: 'What you get',
    includedTitle: 'Included and not included',
    included: 'INCLUDED',
    notIncluded: 'NOT INCLUDED',
    extras: 'Extras',
    extrasTitle: 'Little things we add',
    goodToKnow: 'Good to know',
    whyTitle: 'Why travelers love this trip',
    bring: 'On the day, remember to bring',
    bringItems: [
      'This QR code ticket, printed or on your phone',
      'A passport or ID for every traveler',
      'Comfortable walking shoes and a light rain jacket',
      'Sun protection, a refillable water bottle and your camera',
    ],
    whatsapp: 'Chat with us on WhatsApp',
    calendar: 'Add to calendar: open the attached .ics file',
    calendarFile: 'Add to calendar.ics',
    quotation: 'Full quotation attached (PDF)',
    questions:
      'Questions? Reply to this email or write to us from your booking page.',
    textConfirmed: (title: string) => `Your booking for ${title} is confirmed.`,
    textTicket: (code: string) =>
      `Your ticket code is ${code}. Bring the QR code (printed or on your phone) on the day of your trip.`,
    textOpen: (link: string) => `Open your booking: ${link}`,
  },
  cancel: {
    title: 'Cancellation policy',
    until: (date: string) => `Until ${date}`,
    between: (from: string, until: string) => `${from} – ${until}`,
    fromDate: (date: string) => `From ${date}`,
    fromToday: 'From today',
    free: 'Full refund, except permits',
    charge: (percent: number) => `${percent}% of the total is charged`,
    all: '100% is charged (also if you do not come)',
    permits:
      'Gorilla and chimpanzee permits cannot be refunded once bought. To cancel, write to us from your booking page.',
  },
  days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
  payment: {
    paid: 'Paid in full',
    deposit: 'Deposit received',
    due: (rate: number, amount: string) =>
      `${rate}% deposit (${amount}) holds your dates. We will send you the payment details.`,
  },
  groups: {
    Adult: plural('adult', 'adults'),
    Teenager: plural('teenager', 'teenagers'),
    Child: plural('child', 'children'),
    Infant: plural('infant', 'infants'),
  } as Record<string, Plural>,
  travelers: plural('traveler', 'travelers'),
};

export type EmailTexts = typeof en;

const fr: EmailTexts = {
  hello: (name) => `Bonjour ${name},`,
  openBooking: 'Ouvrir ma réservation',
  keepEmail:
    'Conservez cet e-mail : le bouton est votre lien privé vers votre réservation et notre conversation.',
  received: {
    subject: 'Nous avons bien reçu votre demande de réservation',
    heading: 'Votre demande de réservation est bien arrivée',
    thanks: (title) =>
      `Merci d'avoir choisi Acacia Safaris. Nous avons bien reçu votre demande pour ${title}.`,
    askedFor: (price) =>
      `Vous avez demandé ${price}. Notre équipe vous répond sous 24 heures.`,
    priceSoon: 'Notre équipe vous enverra un prix sous 24 heures.',
    follow:
      'Vous pouvez suivre votre réservation et nous écrire à tout moment depuis la page de votre réservation.',
    yourTrip: 'votre voyage',
  },
  newPrice: {
    subject: (price) => `Nouveau prix pour votre voyage : ${price}`,
    heading: 'Nous avons un prix pour vous',
    proposed: (name, price) =>
      `${name} vous propose ${price} pour votre voyage.`,
    open: 'Ouvrez votre réservation pour l’accepter ou répondre.',
  },
  newMessage: {
    subject: 'Nouveau message concernant votre voyage',
    heading: 'Vous avez un nouveau message',
    wrote: (name) => `${name} a écrit :`,
  },
  tripSoon: {
    subject: (title) => `Votre voyage approche : ${title}`,
    heading: 'Votre safari commence dans 7 jours',
    intro: (title, dates) =>
      `Nous avons hâte de vous accueillir pour ${title} (${dates}). Voici tout ce qu'il faut préparer.`,
    qr: 'Votre billet QR code est joint à cet e-mail et sur la page de votre réservation. Présentez-le le premier jour, imprimé ou sur votre téléphone.',
    bring:
      "N'oubliez pas : un passeport ou une pièce d'identité pour chaque voyageur, de bonnes chaussures, une veste de pluie, une protection solaire et votre appareil photo.",
    questions:
      'Une dernière question ? Écrivez-nous depuis la page de votre réservation, nous vous répondrons rapidement.',
  },
  balance: {
    subject: (amount) => `Rappel : solde restant de ${amount}`,
    heading: 'Votre solde restant',
    intro: (title, date) =>
      `Merci pour votre acompte pour ${title}. Votre voyage commence le ${date}.`,
    due: (amount) =>
      `Le solde de ${amount} est à régler avant le début du voyage. Notre équipe vous enverra les détails du paiement, ou vous pouvez les demander depuis la page de votre réservation.`,
    paid: 'Déjà payé ? Merci, vous pouvez ignorer cet e-mail.',
  },
  review: {
    subject: 'Comment s’est passé votre safari ?',
    heading: 'Comment s’est passé votre voyage ?',
    intro: (title) =>
      `Nous espérons que vous avez adoré ${title}. Merci d'avoir voyagé avec Acacia Safaris.`,
    ask: 'Pourriez-vous partager quelques mots sur votre expérience ? Cela prend une minute et aide d’autres voyageurs à choisir leur voyage.',
    button: 'Laisser un avis',
  },
  confirm: {
    subject: (title, dates) => `Confirmé : ${title} · ${dates}`,
    preheader: (title) =>
      `Votre voyage ${title} est confirmé. Votre billet QR code et tous les détails sont à l'intérieur.`,
    badge: 'CONFIRMÉ',
    booked: 'Votre voyage est réservé',
    intro:
      'Excellente nouvelle : votre réservation est <strong style="color:#0a120b">confirmée</strong>. Voici votre billet et tous les détails de votre voyage. Conservez cet e-mail, vous en aurez besoin le jour du départ.',
    ticket: 'Votre billet',
    showQr: 'Présentez ce QR code le jour de votre voyage',
    showQrNote:
      'Imprimé ou sur votre téléphone. Notre équipe le scanne pour vous accueillir.',
    glance: "En un coup d'œil",
    yourTrip: 'Votre voyage',
    dates: 'Dates',
    duration: 'Durée',
    travelers: 'Voyageurs',
    tripType: 'Type de voyage',
    lodging: 'Hébergement',
    location: 'Lieu',
    route: 'Itinéraire',
    overview: 'Présentation',
    aboutJourney: 'À propos de ce voyage',
    price: 'Prix',
    yourTotal: 'Votre total',
    total: 'Total',
    free: 'gratuit',
    itinerary: 'Programme',
    dayByDay: 'Jour par jour',
    day: 'Jour',
    whatYouGet: 'Ce qui est prévu',
    includedTitle: 'Inclus et non inclus',
    included: 'INCLUS',
    notIncluded: 'NON INCLUS',
    extras: 'Petits plus',
    extrasTitle: 'Les attentions que nous ajoutons',
    goodToKnow: 'Bon à savoir',
    whyTitle: 'Pourquoi les voyageurs adorent ce voyage',
    bring: 'Le jour du départ, pensez à apporter',
    bringItems: [
      'Ce billet QR code, imprimé ou sur votre téléphone',
      "Un passeport ou une pièce d'identité pour chaque voyageur",
      'Des chaussures de marche confortables et une veste de pluie légère',
      'Une protection solaire, une gourde et votre appareil photo',
    ],
    whatsapp: 'Discuter avec nous sur WhatsApp',
    calendar: "Ajouter à l'agenda : ouvrez le fichier .ics joint",
    calendarFile: 'Ajouter à mon agenda.ics',
    quotation: 'Devis complet en pièce jointe (PDF)',
    questions:
      'Des questions ? Répondez à cet e-mail ou écrivez-nous depuis la page de votre réservation.',
    textConfirmed: (title) => `Votre réservation pour ${title} est confirmée.`,
    textTicket: (code) =>
      `Votre code billet est ${code}. Présentez le QR code (imprimé ou sur votre téléphone) le jour de votre voyage.`,
    textOpen: (link) => `Ouvrir votre réservation : ${link}`,
  },
  cancel: {
    title: "Conditions d'annulation",
    until: (date) => `Jusqu'au ${date}`,
    between: (from, until) => `Du ${from} au ${until}`,
    fromDate: (date) => `À partir du ${date}`,
    fromToday: "À partir d'aujourd'hui",
    free: 'Remboursement intégral, sauf les permis',
    charge: (percent) => `${percent} % du total est facturé`,
    all: "100 % est facturé (y compris en cas d'absence)",
    permits:
      'Les permis gorilles et chimpanzés ne sont pas remboursables une fois achetés. Pour annuler, écrivez-nous depuis la page de votre réservation.',
  },
  days: (n) => `${n} ${n === 1 ? 'jour' : 'jours'}`,
  payment: {
    paid: 'Entièrement payé',
    deposit: 'Acompte reçu',
    due: (rate, amount) =>
      `Un acompte de ${rate} % (${amount}) réserve vos dates. Nous vous enverrons les détails du paiement.`,
  },
  groups: {
    Adult: plural('adulte', 'adultes'),
    Teenager: plural('adolescent', 'adolescents'),
    Child: plural('enfant', 'enfants'),
    Infant: plural('bébé', 'bébés'),
  },
  travelers: plural('voyageur', 'voyageurs'),
};

const sw: EmailTexts = {
  hello: (name) => `Habari ${name},`,
  openBooking: 'Fungua safari yangu',
  keepEmail:
    'Hifadhi barua pepe hii: kitufe ni kiungo chako cha siri cha safari yako na mazungumzo yetu.',
  received: {
    subject: 'Tumepokea ombi lako la safari',
    heading: 'Ombi lako la safari limefika',
    thanks: (title) =>
      `Asante kwa kuchagua Acacia Safaris. Tumepokea ombi lako la ${title}.`,
    askedFor: (price) => `Uliomba ${price}. Timu yetu itajibu ndani ya saa 24.`,
    priceSoon: 'Timu yetu itakutumia bei ndani ya saa 24.',
    follow:
      'Unaweza kufuatilia safari yako na kutuandikia wakati wowote kupitia ukurasa wa safari yako.',
    yourTrip: 'safari yako',
  },
  newPrice: {
    subject: (price) => `Bei mpya ya safari yako: ${price}`,
    heading: 'Tuna bei kwa ajili yako',
    proposed: (name, price) => `${name} amependekeza ${price} kwa safari yako.`,
    open: 'Fungua safari yako ili kuikubali au kujibu.',
  },
  newMessage: {
    subject: 'Ujumbe mpya kuhusu safari yako',
    heading: 'Una ujumbe mpya',
    wrote: (name) => `${name} ameandika:`,
  },
  tripSoon: {
    subject: (title) => `Safari yako inakaribia: ${title}`,
    heading: 'Safari yako inaanza baada ya siku 7',
    intro: (title, dates) =>
      `Tunasubiri kwa hamu kukukaribisha kwenye ${title} (${dates}). Haya ndiyo ya kuandaa.`,
    qr: 'Tiketi yako ya QR code imeambatishwa na iko kwenye ukurasa wa safari yako. Ionyeshe siku ya kwanza, ikiwa imechapishwa au kwenye simu yako.',
    bring:
      'Kumbuka: pasipoti au kitambulisho kwa kila msafiri, viatu vizuri, koti la mvua, kinga ya jua na kamera yako.',
    questions:
      'Una swali la mwisho? Tuandikie kupitia ukurasa wa safari yako na tutajibu haraka.',
  },
  balance: {
    subject: (amount) => `Ukumbusho: salio la ${amount}`,
    heading: 'Salio lako lililobaki',
    intro: (title, date) =>
      `Asante kwa amana yako ya ${title}. Safari yako inaanza ${date}.`,
    due: (amount) =>
      `Salio la ${amount} linapaswa kulipwa kabla safari haijaanza. Timu yetu itakutumia maelezo ya malipo, au unaweza kuyaomba kupitia ukurasa wa safari yako.`,
    paid: 'Umeshalipa? Asante, unaweza kupuuza barua pepe hii.',
  },
  review: {
    subject: 'Safari yako ilikuwaje?',
    heading: 'Safari yako ilikuwaje?',
    intro: (title) =>
      `Tunatumaini ulifurahia ${title}. Asante kwa kusafiri na Acacia Safaris.`,
    ask: 'Je, ungependa kutuandikia maneno machache kuhusu uzoefu wako? Inachukua dakika moja na inasaidia wasafiri wengine kuchagua safari yao.',
    button: 'Andika maoni',
  },
  confirm: {
    subject: (title, dates) => `Imethibitishwa: ${title} · ${dates}`,
    preheader: (title) =>
      `Safari yako ${title} imethibitishwa. Tiketi yako ya QR code na maelezo yote yamo ndani.`,
    badge: 'IMETHIBITISHWA',
    booked: 'Safari yako imewekwa',
    intro:
      'Habari njema: safari yako <strong style="color:#0a120b">imethibitishwa</strong>. Hapa chini kuna tiketi yako na maelezo yote ya safari. Tafadhali hifadhi barua pepe hii, utaihitaji siku ya safari.',
    ticket: 'Tiketi yako',
    showQr: 'Onyesha QR code hii siku ya safari yako',
    showQrNote:
      'Ikiwa imechapishwa au kwenye simu yako. Timu yetu itaiskani kukukaribisha.',
    glance: 'Kwa ufupi',
    yourTrip: 'Safari yako',
    dates: 'Tarehe',
    duration: 'Muda',
    travelers: 'Wasafiri',
    tripType: 'Aina ya safari',
    lodging: 'Malazi',
    location: 'Mahali',
    route: 'Njia',
    overview: 'Muhtasari',
    aboutJourney: 'Kuhusu safari hii',
    price: 'Bei',
    yourTotal: 'Jumla yako',
    total: 'Jumla',
    free: 'bure',
    itinerary: 'Ratiba',
    dayByDay: 'Siku kwa siku',
    day: 'Siku',
    whatYouGet: 'Unachopata',
    includedTitle: 'Vilivyojumuishwa na visivyojumuishwa',
    included: 'VIMEJUMUISHWA',
    notIncluded: 'HAVIJAJUMUISHWA',
    extras: 'Ziada',
    extrasTitle: 'Vitu vidogo tunavyoongeza',
    goodToKnow: 'Vizuri kujua',
    whyTitle: 'Kwa nini wasafiri wanaipenda safari hii',
    bring: 'Siku ya safari, kumbuka kuleta',
    bringItems: [
      'Tiketi hii ya QR code, iliyochapishwa au kwenye simu yako',
      'Pasipoti au kitambulisho kwa kila msafiri',
      'Viatu vizuri vya kutembea na koti jepesi la mvua',
      'Kinga ya jua, chupa ya maji na kamera yako',
    ],
    whatsapp: 'Ongea nasi kwenye WhatsApp',
    calendar: 'Weka kwenye kalenda: fungua faili ya .ics iliyoambatishwa',
    calendarFile: 'Weka kwenye kalenda.ics',
    quotation: 'Nukuu kamili imeambatishwa (PDF)',
    questions:
      'Una maswali? Jibu barua pepe hii au tuandikie kupitia ukurasa wa safari yako.',
    textConfirmed: (title) => `Safari yako ya ${title} imethibitishwa.`,
    textTicket: (code) =>
      `Namba ya tiketi yako ni ${code}. Leta QR code (iliyochapishwa au kwenye simu yako) siku ya safari.`,
    textOpen: (link) => `Fungua safari yako: ${link}`,
  },
  cancel: {
    title: 'Sera ya kughairi',
    until: (date) => `Hadi ${date}`,
    between: (from, until) => `${from} – ${until}`,
    fromDate: (date) => `Kuanzia ${date}`,
    fromToday: 'Kuanzia leo',
    free: 'Unarejeshewa fedha zote, isipokuwa vibali',
    charge: (percent) => `${percent}% ya jumla inatozwa`,
    all: '100% inatozwa (hata usipofika)',
    permits:
      'Vibali vya sokwe na sokwe-mtu havirejeshewi fedha baada ya kununuliwa. Ili kughairi, tuandikie kupitia ukurasa wa safari yako.',
  },
  days: (n) => `Siku ${n}`,
  payment: {
    paid: 'Imelipwa yote',
    deposit: 'Amana imepokelewa',
    due: (rate, amount) =>
      `Amana ya ${rate}% (${amount}) inashikilia tarehe zako. Tutakutumia maelezo ya malipo.`,
  },
  groups: {
    Adult: swPlural('Mtu mzima', 'Watu wazima'),
    Teenager: swPlural('Kijana', 'Vijana'),
    Child: swPlural('Mtoto', 'Watoto'),
    Infant: swPlural('Mtoto mchanga', 'Watoto wachanga'),
  },
  travelers: swPlural('Msafiri', 'Wasafiri'),
};

export const EMAIL_TEXTS: Record<Lang, EmailTexts> = { en, fr, sw };

// "2 adults, 1 child" in the email's language
export function travelersText(
  lang: Lang,
  guests: { label: string; count: number }[],
  total: number,
) {
  const t = EMAIL_TEXTS[lang];
  const shown = guests.filter((g) => g.count > 0);
  if (!shown.length) return t.travelers(total);
  return shown
    .map((g) =>
      t.groups[g.label]
        ? t.groups[g.label](g.count)
        : `${g.count} × ${g.label}`,
    )
    .join(', ');
}
