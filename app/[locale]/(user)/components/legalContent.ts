// The Privacy Policy and Terms of Service in English, French and Swahili.
// A body is paragraphs (text) and lists ({ list: [...] }). The email address is made a link.
// The English version prevails if the versions differ (a note says so on the other languages).
//
// The company's name, RDB licence, registration number and address come from lib/company.ts
// (COMPANY_LEGAL): fill them in there, never here. While one is empty it is left out of the text.
import { COMPANY, COMPANY_LEGAL as L } from "@/lib/company";

export type LegalBlock = string | { list: string[] };
export type LegalDoc = {
  title: string;
  intro: string;
  sections: { title: string; body: LegalBlock[] }[];
};
type Lang = "en" | "fr" | "sw";

export const LEGAL_UPDATED = "2026-11-26"; // shown in the reader's date format

const EMAIL = COMPANY.email;
const PHONE = COMPANY.phone;
const SITE = L.website.replace(/^https?:\/\//, "");

// "Acacia Safaris Ltd (RDB tourism licence No. X, company code Y), Kigali, Rwanda": only what is filled in
const companyLine = (licence: string, code: string) => {
  const parts = [L.rdbLicence && `${licence} ${L.rdbLicence}`, L.registrationNumber && `${code} ${L.registrationNumber}`].filter(Boolean);
  return `${L.name}${parts.length ? ` (${parts.join(", ")})` : ""}, ${L.address}`;
};

// ---------------------------------------------------------------------------------------------
// Privacy Policy
// ---------------------------------------------------------------------------------------------

export const PRIVACY: Record<Lang, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    intro: `${L.name} ("Acacia", "we") organises safaris and tours in Rwanda and East Africa. This policy explains what personal information we collect when you use ${SITE} or travel with us, why we use it, who we share it with and what your rights are. It follows Rwanda's Law No. 058/2021 on the protection of personal data and privacy and, for travelers in the European Union, the General Data Protection Regulation (GDPR).`,
    sections: [
      { title: "Who We Are", body: [
        `The company responsible for your personal information is ${companyLine("RDB tourism licence No.", "company code")}. You can reach us at ${EMAIL} or ${PHONE}.`,
      ] },
      { title: "Information We Collect", body: [
        "We only collect what we need to plan and run your trip:",
        { list: [
          "Contact and booking details: your name, email address, phone or WhatsApp number, country, language, travel dates, the number and ages of travelers, the trip you choose, price offers and the payments you make",
          "Travel details you give us: passport details (needed for gorilla permits, lodges and flights), arrival and departure flights, an emergency contact",
          "Dietary, medical or accessibility needs, only if you choose to share them so we can look after you",
          "Your messages and files: messages in your booking chat, and the photos and documents you send us (for example a copy of your passport), as well as emails and WhatsApp messages",
          "Your review if you write one: your name, country, rating and text",
          "How the website is used: pages visited, approximate country, type of device and browser. This is measured without cookies and does not identify you. Our servers also keep short technical logs (including IP addresses) for security.",
        ] },
      ] },
      { title: "Why We Use It, and On What Basis", body: [{ list: [
        "To answer your questions, prepare quotes, make your booking, buy permits and arrange lodges and transfers: needed to provide the trip you ask for (contract)",
        "To send your booking emails, ticket, reminders and messages to your travel group: needed for your trip (contract)",
        "To take care of health, dietary or accessibility needs: your consent, which you can withdraw at any time",
        "To send newsletters and offers: only if you subscribed (consent). Every email has an unsubscribe link.",
        "To keep accounting and tax records: required by law",
        "To keep the website and your data secure, prevent fraud and improve our services with anonymous statistics: our legitimate interests",
      ] }] },
      { title: "Who We Share It With", body: [
        "We never sell your personal information. We only share what is needed:",
        { list: [
          "With the partners who deliver your trip: lodges and hotels, park authorities (for permits), airlines, drivers and guides",
          "With the service providers that run our website and systems, who process data only on our instructions: Vercel (website hosting), Microsoft Azure (our booking system, and automatic translation of texts into French and Swahili), Neon (secure database and file storage), Namecheap Private Email (email), Meta (when you write to us on WhatsApp) and Umami (anonymous website statistics). When online payment is available, the payment provider processes your card or Mobile Money details; we never see or keep your full card number.",
          "With authorities when the law requires it",
        ] },
      ] },
      { title: "Information Stored Outside Rwanda", body: [
        "Some of our service providers store data outside Rwanda, mainly in the United States and the European Union (for example our database in the United States and our booking system in Spain). We choose providers with strong security and contractual protections, and transfer data only as allowed by Rwandan law and, where it applies, the GDPR (for example with standard contractual clauses).",
      ] },
      { title: "How Long We Keep It", body: [{ list: [
        "Booking and payment records: for as long as Rwandan tax and accounting law requires",
        "Passport copies and other travel documents: only as long as needed for your trip; we delete them sooner if you ask",
        "Messages from the contact form and quote requests that did not lead to a booking: up to 2 years",
        "Website statistics: anonymous, so they cannot be linked to you",
        "Encrypted backups of our database are kept for 30 days, then deleted automatically",
      ] }] },
      { title: "Cookies and Browser Storage", body: [
        "We do not use advertising or tracking cookies, and our website statistics work without cookies. To make the site easier to use, your browser remembers a few things on your own device: your language and currency, the tours you save, and a booking form you have started (so you do not lose it). Staff who log in to our admin panel get a secure login cookie. You can clear all of this at any time in your browser settings.",
      ] },
      { title: "How We Protect It", body: [
        "The website is served over an encrypted connection (HTTPS). Photos and files you send in your booking chat are kept in private storage that only you (through your private booking link) and authorised Acacia staff can open. Our staff log in with two-step verification, each person only sees the areas they need, and our database is backed up every night in encrypted form. Your booking page link is private: please do not share it.",
      ] },
      { title: "Children", body: [
        "Bookings that include children are made by a parent or guardian. We only collect the details we need for the trip, such as children's ages for permits, lodges and prices.",
      ] },
      { title: "Your Rights", body: [
        "You can ask us at any time to:",
        { list: [
          "See the personal information we hold about you, and receive a copy",
          "Correct information that is wrong or incomplete",
          "Delete your information, unless we must keep it by law (for example accounting records)",
          "Limit or object to how we use it, and withdraw a consent you gave",
          "Stop newsletters and offers",
        ] },
        `Write to ${EMAIL}. We reply within 30 days. If you are not satisfied, you can complain to Rwanda's National Cyber Security Authority (NCSA) or, in the European Union, to your country's data protection authority.`,
      ] },
      { title: "If Something Goes Wrong", body: [
        "If a security incident puts your personal information at risk, we will inform you and the authorities as the law requires, and tell you what we are doing about it.",
      ] },
      { title: "Changes to This Policy", body: [
        "We may update this policy when our services change. The latest version is always on this page, with the date it was last updated.",
      ] },
      { title: "Contact Us", body: [
        `For any privacy question or request, email ${EMAIL} or write to ${companyLine("RDB tourism licence No.", "company code")}.`,
      ] },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    intro: `${L.name} (« Acacia », « nous ») organise des safaris et des circuits au Rwanda et en Afrique de l'Est. Cette politique explique quelles informations personnelles nous collectons lorsque vous utilisez ${SITE} ou voyagez avec nous, pourquoi nous les utilisons, avec qui nous les partageons et quels sont vos droits. Elle respecte la loi rwandaise n° 058/2021 relative à la protection des données à caractère personnel et de la vie privée et, pour les voyageurs de l'Union européenne, le Règlement général sur la protection des données (RGPD).`,
    sections: [
      { title: "Qui sommes-nous", body: [
        `La société responsable de vos informations personnelles est ${companyLine("licence touristique RDB n°", "code entreprise")}. Vous pouvez nous joindre à ${EMAIL} ou au ${PHONE}.`,
      ] },
      { title: "Informations collectées", body: [
        "Nous ne collectons que ce dont nous avons besoin pour préparer et réaliser votre voyage :",
        { list: [
          "Coordonnées et réservation : nom, adresse e-mail, numéro de téléphone ou WhatsApp, pays, langue, dates de voyage, nombre et âge des voyageurs, voyage choisi, offres de prix et paiements effectués",
          "Informations de voyage que vous nous donnez : passeport (nécessaire pour les permis gorilles, les lodges et les vols), vols d'arrivée et de départ, personne à contacter en cas d'urgence",
          "Besoins alimentaires, médicaux ou d'accessibilité, uniquement si vous choisissez de les partager pour que nous prenions soin de vous",
          "Vos messages et fichiers : messages de votre conversation de réservation, photos et documents que vous nous envoyez (par exemple une copie de passeport), ainsi que les e-mails et messages WhatsApp",
          "Votre avis si vous en rédigez un : nom, pays, note et texte",
          "L'utilisation du site : pages consultées, pays approximatif, type d'appareil et de navigateur. Ces mesures se font sans cookies et ne vous identifient pas. Nos serveurs conservent aussi de courts journaux techniques (dont les adresses IP) pour la sécurité.",
        ] },
      ] },
      { title: "Pourquoi et sur quelle base", body: [{ list: [
        "Répondre à vos questions, préparer des devis, réserver votre voyage, acheter les permis et organiser lodges et transferts : nécessaire au voyage que vous demandez (contrat)",
        "Vous envoyer les e-mails de réservation, votre billet, les rappels et les messages à votre groupe de voyage : nécessaire à votre voyage (contrat)",
        "Prendre en compte vos besoins de santé, alimentaires ou d'accessibilité : votre consentement, que vous pouvez retirer à tout moment",
        "Envoyer des newsletters et des offres : uniquement si vous êtes abonné (consentement). Chaque e-mail contient un lien de désabonnement.",
        "Tenir la comptabilité et les registres fiscaux : obligation légale",
        "Protéger le site et vos données, prévenir la fraude et améliorer nos services grâce à des statistiques anonymes : nos intérêts légitimes",
      ] }] },
      { title: "Avec qui nous les partageons", body: [
        "Nous ne vendons jamais vos informations personnelles. Nous ne partageons que le nécessaire :",
        { list: [
          "Avec les partenaires qui réalisent votre voyage : lodges et hôtels, autorités des parcs (pour les permis), compagnies aériennes, chauffeurs et guides",
          "Avec les prestataires qui font fonctionner notre site et nos systèmes, qui ne traitent les données que sur nos instructions : Vercel (hébergement du site), Microsoft Azure (notre système de réservation, et la traduction automatique des textes en français et en swahili), Neon (base de données et stockage de fichiers sécurisés), Namecheap Private Email (e-mail), Meta (lorsque vous nous écrivez sur WhatsApp) et Umami (statistiques anonymes du site). Lorsque le paiement en ligne sera disponible, le prestataire de paiement traitera votre carte ou Mobile Money ; nous ne voyons ni ne conservons jamais votre numéro de carte complet.",
          "Avec les autorités lorsque la loi l'exige",
        ] },
      ] },
      { title: "Informations conservées hors du Rwanda", body: [
        "Certains de nos prestataires conservent des données hors du Rwanda, principalement aux États-Unis et dans l'Union européenne (par exemple notre base de données aux États-Unis et notre système de réservation en Espagne). Nous choisissons des prestataires offrant une sécurité et des garanties contractuelles solides, et ne transférons les données que dans le respect de la loi rwandaise et, lorsqu'il s'applique, du RGPD (par exemple au moyen de clauses contractuelles types).",
      ] },
      { title: "Durée de conservation", body: [{ list: [
        "Réservations et paiements : aussi longtemps que l'exige la loi fiscale et comptable rwandaise",
        "Copies de passeport et autres documents de voyage : seulement le temps nécessaire à votre voyage ; nous les supprimons plus tôt si vous le demandez",
        "Messages du formulaire de contact et demandes de devis sans réservation : jusqu'à 2 ans",
        "Statistiques du site : anonymes, elles ne peuvent pas être reliées à vous",
        "Les sauvegardes chiffrées de notre base de données sont conservées 30 jours, puis supprimées automatiquement",
      ] }] },
      { title: "Cookies et stockage du navigateur", body: [
        "Nous n'utilisons pas de cookies publicitaires ni de suivi, et nos statistiques fonctionnent sans cookies. Pour faciliter votre visite, votre navigateur retient quelques éléments sur votre propre appareil : langue et devise, circuits enregistrés, et un formulaire de réservation commencé (pour ne pas le perdre). Le personnel qui se connecte à notre espace d'administration reçoit un cookie de connexion sécurisé. Vous pouvez tout effacer à tout moment dans les réglages de votre navigateur.",
      ] },
      { title: "Comment nous les protégeons", body: [
        "Le site est servi par une connexion chiffrée (HTTPS). Les photos et fichiers envoyés dans votre conversation de réservation sont conservés dans un stockage privé que seuls vous (grâce à votre lien de réservation privé) et le personnel autorisé d'Acacia pouvez ouvrir. Notre personnel se connecte avec une vérification en deux étapes, chacun ne voit que les espaces nécessaires, et notre base de données est sauvegardée chaque nuit sous forme chiffrée. Le lien de votre page de réservation est privé : ne le partagez pas.",
      ] },
      { title: "Enfants", body: [
        "Les réservations incluant des enfants sont faites par un parent ou un tuteur. Nous ne collectons que les informations nécessaires au voyage, comme l'âge des enfants pour les permis, les lodges et les prix.",
      ] },
      { title: "Vos droits", body: [
        "Vous pouvez à tout moment nous demander de :",
        { list: [
          "Consulter les informations personnelles que nous détenons sur vous et en recevoir une copie",
          "Corriger des informations inexactes ou incomplètes",
          "Supprimer vos informations, sauf si la loi nous oblige à les garder (par exemple la comptabilité)",
          "Limiter leur utilisation ou vous y opposer, et retirer un consentement donné",
          "Ne plus recevoir de newsletters ni d'offres",
        ] },
        `Écrivez à ${EMAIL}. Nous répondons sous 30 jours. Si vous n'êtes pas satisfait, vous pouvez saisir l'Autorité nationale de cybersécurité du Rwanda (NCSA) ou, dans l'Union européenne, l'autorité de protection des données de votre pays.`,
      ] },
      { title: "En cas d'incident", body: [
        "Si un incident de sécurité met vos informations personnelles en danger, nous vous en informerons, ainsi que les autorités, comme la loi l'exige, et vous dirons ce que nous faisons pour y remédier.",
      ] },
      { title: "Modifications de cette politique", body: [
        "Nous pouvons mettre à jour cette politique lorsque nos services évoluent. La dernière version est toujours sur cette page, avec sa date de mise à jour.",
      ] },
      { title: "Nous contacter", body: [
        `Pour toute question ou demande sur vos données, écrivez à ${EMAIL} ou à ${companyLine("licence touristique RDB n°", "code entreprise")}.`,
      ] },
    ],
  },
  sw: {
    title: "Sera ya Faragha",
    intro: `${L.name} ("Acacia", "sisi") huandaa safari na ziara nchini Rwanda na Afrika Mashariki. Sera hii inaeleza taarifa binafsi tunazokusanya unapotumia ${SITE} au kusafiri nasi, kwa nini tunazitumia, tunazishiriki na nani, na haki zako. Inafuata Sheria ya Rwanda Na. 058/2021 kuhusu ulinzi wa taarifa binafsi na faragha na, kwa wasafiri wa Umoja wa Ulaya, Kanuni ya Jumla ya Ulinzi wa Data (GDPR).`,
    sections: [
      { title: "Sisi ni Nani", body: [
        `Kampuni inayohusika na taarifa zako binafsi ni ${companyLine("leseni ya utalii ya RDB Na.", "namba ya kampuni")}. Unaweza kutufikia kupitia ${EMAIL} au ${PHONE}.`,
      ] },
      { title: "Taarifa Tunazokusanya", body: [
        "Tunakusanya tu kile tunachohitaji kuandaa na kuendesha safari yako:",
        { list: [
          "Mawasiliano na uhifadhi: jina, barua pepe, namba ya simu au WhatsApp, nchi, lugha, tarehe za safari, idadi na umri wa wasafiri, safari uliyochagua, ofa za bei na malipo unayofanya",
          "Taarifa za safari unazotupa: taarifa za pasipoti (zinahitajika kwa vibali vya sokwe, nyumba za kulala wageni na ndege), safari za ndege za kuwasili na kuondoka, mtu wa kuwasiliana naye wakati wa dharura",
          "Mahitaji ya chakula, afya au ufikiaji, ikiwa tu utachagua kuyashiriki ili tukuhudumie vizuri",
          "Ujumbe na faili zako: ujumbe katika mazungumzo ya uhifadhi wako, picha na nyaraka unazotutumia (kwa mfano nakala ya pasipoti), pamoja na barua pepe na ujumbe wa WhatsApp",
          "Maoni yako ukiandika: jina, nchi, alama na maandishi",
          "Matumizi ya tovuti: kurasa ulizotembelea, nchi kwa makadirio, aina ya kifaa na kivinjari. Hupimwa bila vidakuzi (cookies) na haikutambulishi. Seva zetu pia huhifadhi kumbukumbu fupi za kiufundi (pamoja na anwani za IP) kwa usalama.",
        ] },
      ] },
      { title: "Kwa Nini Tunazitumia na kwa Msingi Gani", body: [{ list: [
        "Kujibu maswali yako, kuandaa makadirio ya bei, kuhifadhi safari yako, kununua vibali na kupanga malazi na usafiri: inahitajika kutoa safari unayoomba (mkataba)",
        "Kukutumia barua pepe za uhifadhi, tiketi, vikumbusho na ujumbe kwa kikundi chako cha safari: inahitajika kwa safari yako (mkataba)",
        "Kushughulikia mahitaji ya afya, chakula au ufikiaji: idhini yako, ambayo unaweza kuiondoa wakati wowote",
        "Kutuma majarida na ofa: ikiwa tu umejiandikisha (idhini). Kila barua pepe ina kiungo cha kujiondoa.",
        "Kutunza kumbukumbu za hesabu na kodi: inatakiwa na sheria",
        "Kulinda tovuti na taarifa zako, kuzuia udanganyifu na kuboresha huduma zetu kwa takwimu zisizokutambulisha: maslahi yetu halali",
      ] }] },
      { title: "Tunazishiriki na Nani", body: [
        "Hatuuzi kamwe taarifa zako binafsi. Tunashiriki tu kinachohitajika:",
        { list: [
          "Na washirika wanaotekeleza safari yako: nyumba za kulala wageni na hoteli, mamlaka za hifadhi (kwa vibali), mashirika ya ndege, madereva na waongozaji",
          "Na watoa huduma wanaoendesha tovuti na mifumo yetu, wanaoshughulikia taarifa kwa maelekezo yetu tu: Vercel (kuhifadhi tovuti), Microsoft Azure (mfumo wetu wa uhifadhi, na kutafsiri maandishi kwa Kifaransa na Kiswahili moja kwa moja), Neon (hifadhidata na uhifadhi salama wa faili), Namecheap Private Email (barua pepe), Meta (unapotuandikia kwa WhatsApp) na Umami (takwimu za tovuti zisizokutambulisha). Malipo ya mtandaoni yakipatikana, mtoa huduma wa malipo atashughulikia kadi yako au Mobile Money; hatuoni wala kuhifadhi namba kamili ya kadi yako.",
          "Na mamlaka pale sheria inapotaka",
        ] },
      ] },
      { title: "Taarifa Zinazohifadhiwa Nje ya Rwanda", body: [
        "Baadhi ya watoa huduma wetu huhifadhi taarifa nje ya Rwanda, hasa Marekani na Umoja wa Ulaya (kwa mfano hifadhidata yetu iko Marekani na mfumo wetu wa uhifadhi uko Hispania). Tunachagua watoa huduma wenye usalama imara na ulinzi wa kimkataba, na tunahamisha taarifa tu kama inavyoruhusiwa na sheria ya Rwanda na, pale inapohusika, GDPR (kwa mfano kwa vifungu vya kawaida vya mkataba).",
      ] },
      { title: "Tunazihifadhi kwa Muda Gani", body: [{ list: [
        "Kumbukumbu za uhifadhi na malipo: kwa muda unaotakiwa na sheria za kodi na hesabu za Rwanda",
        "Nakala za pasipoti na nyaraka nyingine za safari: kwa muda unaohitajika kwa safari yako tu; tunazifuta mapema ukiomba",
        "Ujumbe wa fomu ya mawasiliano na maombi ya bei yasiyosababisha uhifadhi: hadi miaka 2",
        "Takwimu za tovuti: hazikutambulishi, hivyo haziwezi kuhusishwa nawe",
        "Nakala za akiba za hifadhidata zilizosimbwa huhifadhiwa siku 30, kisha hufutwa moja kwa moja",
      ] }] },
      { title: "Vidakuzi na Hifadhi ya Kivinjari", body: [
        "Hatutumii vidakuzi vya matangazo wala vya kufuatilia, na takwimu zetu hufanya kazi bila vidakuzi. Ili kurahisisha matumizi, kivinjari chako hukumbuka mambo machache kwenye kifaa chako mwenyewe: lugha na sarafu, ziara ulizohifadhi, na fomu ya uhifadhi uliyoanza (ili usiipoteze). Wafanyakazi wanaoingia kwenye eneo letu la utawala hupata kidakuzi salama cha kuingia. Unaweza kufuta haya yote wakati wowote katika mipangilio ya kivinjari chako.",
      ] },
      { title: "Jinsi Tunavyozilinda", body: [
        "Tovuti inatumia muunganisho uliosimbwa (HTTPS). Picha na faili unazotuma katika mazungumzo ya uhifadhi wako huhifadhiwa katika hifadhi ya faragha ambayo ni wewe tu (kupitia kiungo chako cha faragha cha uhifadhi) na wafanyakazi walioidhinishwa wa Acacia wanaoweza kuifungua. Wafanyakazi wetu huingia kwa uthibitisho wa hatua mbili, kila mmoja huona maeneo anayohitaji tu, na hifadhidata yetu huhifadhiwa nakala kila usiku ikiwa imesimbwa. Kiungo cha ukurasa wako wa uhifadhi ni cha faragha: tafadhali usikishiriki.",
      ] },
      { title: "Watoto", body: [
        "Uhifadhi unaohusisha watoto hufanywa na mzazi au mlezi. Tunakusanya tu taarifa zinazohitajika kwa safari, kama umri wa watoto kwa vibali, malazi na bei.",
      ] },
      { title: "Haki Zako", body: [
        "Unaweza kutuomba wakati wowote:",
        { list: [
          "Kuona taarifa binafsi tulizonazo kukuhusu, na kupata nakala yake",
          "Kurekebisha taarifa zisizo sahihi au pungufu",
          "Kufuta taarifa zako, isipokuwa pale sheria inapotulazimu kuzihifadhi (kwa mfano kumbukumbu za hesabu)",
          "Kupunguza au kupinga jinsi tunavyozitumia, na kuondoa idhini uliyotoa",
          "Kuacha kupokea majarida na ofa",
        ] },
        `Tuandikie kwa ${EMAIL}. Tunajibu ndani ya siku 30. Ikiwa hujaridhika, unaweza kulalamika kwa Mamlaka ya Taifa ya Usalama wa Mtandao ya Rwanda (NCSA) au, katika Umoja wa Ulaya, kwa mamlaka ya ulinzi wa data ya nchi yako.`,
      ] },
      { title: "Ikitokea Tatizo", body: [
        "Ikiwa tukio la kiusalama litahatarisha taarifa zako binafsi, tutakujulisha wewe na mamlaka kama sheria inavyotaka, na kukueleza tunachofanya kulishughulikia.",
      ] },
      { title: "Mabadiliko ya Sera Hii", body: [
        "Tunaweza kusasisha sera hii huduma zetu zinapobadilika. Toleo la karibuni zaidi liko kwenye ukurasa huu kila wakati, pamoja na tarehe lilipobadilishwa.",
      ] },
      { title: "Wasiliana Nasi", body: [
        `Kwa swali au ombi lolote kuhusu faragha, tuandikie kwa ${EMAIL} au kwa ${companyLine("leseni ya utalii ya RDB Na.", "namba ya kampuni")}.`,
      ] },
    ],
  },
};

// ---------------------------------------------------------------------------------------------
// Terms of Service
// ---------------------------------------------------------------------------------------------

export const TERMS: Record<Lang, LegalDoc> = {
  en: {
    title: "Terms of Service",
    intro: `Please read these terms before booking with ${L.name}. They explain your rights and responsibilities, and ours, so your journey runs smoothly.`,
    sections: [
      { title: "About Us and These Terms", body: [
        `${companyLine("RDB tourism licence No.", "company code")} is a tour operator licensed by the Rwanda Development Board (RDB). Contact: ${EMAIL}, ${PHONE}.`,
        `These terms apply to every booking made with us, on ${SITE}, by email or by WhatsApp, and to the use of our website. By booking you accept them. The version published on the day you book applies to your booking.`,
      ] },
      { title: "How a Booking Is Confirmed", body: [{ list: [
        "Tour packages and group departures booked at the listed price are confirmed by email, with your ticket and QR code.",
        "If you propose a lower price, we may accept it, make a counter-offer or decline. The price is binding once both sides have accepted it in your booking page; the booking is then confirmed.",
        "Trips built from destinations are priced by our team after your request. Nothing is owed until you accept our price.",
        "Special trips are reserved with no payment at first. Your place is confirmed when we confirm it and receive your payment. Seats are limited; joining a waitlist does not guarantee a place.",
      ] }] },
      { title: "Prices and Payment", body: [{ list: [
        "Prices are in US dollars. Prices shown in other currencies are estimates only.",
        "A deposit of 50% of the total holds your dates. The remaining 50% is due before your trip starts; we send you a reminder and the payment details.",
        "Gorilla and chimpanzee permits are paid in full at the time of booking, as we buy them in advance from the park authorities.",
        "Early-bird discounts apply to bookings made on or before the date shown; group discounts apply from the number of travelers shown. Discounts cannot be added after booking.",
        "Prices can change before full payment if taxes, park fees or exchange rates change; we tell you before anything changes.",
        "If a price on the website is clearly wrong because of a mistake, we tell you as soon as we notice and offer the correct price or a full refund.",
      ] }] },
      { title: "If You Cancel", body: [
        "Please tell us in writing, from your booking page or by email. What is charged depends on how many days before the first day of the trip you cancel:",
        { list: [
          "60 days or more: full refund, except permits",
          "30 to 59 days: 50% of the total is charged (the deposit)",
          "15 to 29 days: 75% of the total is charged",
          "14 days or less, or if you do not come: 100% of the total is charged",
        ] },
        "Gorilla and chimpanzee permits cannot be refunded once bought, as set by the park authority; changing the traveler's name on a permit depends on the park's rules. Your booking page and confirmation email show these dates for your trip.",
      ] },
      { title: "Changes or Cancellation by Us", body: [
        "We will do our best to accommodate changes you ask for, subject to availability and any extra cost. Rarely, we may need to adjust an itinerary because of weather, safety, park rules or events beyond our control; we will offer an alternative of similar quality.",
        "If we must cancel your trip (for example a park closes, or a group departure does not reach the minimum number of travelers), you can choose another date or trip, or receive a full refund of what you paid us. We are not responsible for costs you paid to others, such as international flights: travel insurance is strongly recommended.",
      ] },
      { title: "Group Departures and Special Trips", body: [
        "Group departures and special trips are shared with other travelers. We may combine bookings into one group and share travelers' first names in group messages. Everyone is expected to respect the group, the guide's schedule and other travelers.",
      ] },
      { title: "Travel Documents, Health and Age", body: [
        "You are responsible for a passport valid for at least 6 months after your trip, the visas you need (for example the East Africa Tourist Visa) and the required vaccinations, such as yellow fever where applicable.",
        "Gorilla trekking in Rwanda requires a minimum age of 15, and other park activities may have their own limits. Children must travel with a parent or responsible adult. Trekking needs a reasonable level of fitness, and park authorities may refuse entry to visitors who are visibly unwell.",
      ] },
      { title: "Travel Insurance", body: [
        "Comprehensive travel insurance covering cancellation, medical emergencies and evacuation is strongly recommended for every traveler.",
      ] },
      { title: "Your Responsibilities", body: [
        "Please follow the instructions of guides and rangers, respect wildlife, local communities and park rules, and behave in a way that keeps everyone safe. We may end the trip of a traveler who seriously endangers others, without refund.",
        "When you write to us or send files in your booking chat, do not send anything illegal, offensive or harmful. We may remove such content.",
      ] },
      { title: "Reviews", body: [
        "If you write a review, you allow us to publish it on our website with your name and country. We may decline reviews that are offensive, unrelated to your trip or contain other people's personal information.",
      ] },
      { title: "Limitation of Liability", body: [
        "We carefully select our partners, but we are not responsible for loss, injury or delay caused by events beyond our reasonable control, including natural events, illness, strikes, political unrest or the actions of independent suppliers. Nothing in these terms limits a liability that cannot be limited by law.",
      ] },
      { title: "Complaints", body: [
        `If something is not right during your trip, tell your guide straight away so it can be fixed on the spot. If it is not resolved, write to ${EMAIL} within 30 days after your trip. We reply within 14 days.`,
      ] },
      { title: "Website and Content", body: [
        "All photos, texts and content on this website belong to Acacia Safaris Ltd or its partners and may not be copied without permission. Your personal information is used as described in our Privacy Policy.",
      ] },
      { title: "Governing Law and Disputes", body: [
        "These terms are governed by the laws of the Republic of Rwanda. We will always first try to settle a disagreement amicably, if needed through mediation; otherwise the competent courts of Kigali decide. If you live in the European Union, you keep the protections of the consumer law of your country that cannot be set aside.",
      ] },
    ],
  },
  fr: {
    title: "Conditions générales",
    intro: `Veuillez lire ces conditions avant de réserver avec ${L.name}. Elles expliquent vos droits et responsabilités, ainsi que les nôtres, pour que votre voyage se déroule sans souci.`,
    sections: [
      { title: "Qui sommes-nous et ces conditions", body: [
        `${companyLine("licence touristique RDB n°", "code entreprise")} est un tour-opérateur agréé par le Rwanda Development Board (RDB). Contact : ${EMAIL}, ${PHONE}.`,
        `Ces conditions s'appliquent à toute réservation faite avec nous, sur ${SITE}, par e-mail ou par WhatsApp, ainsi qu'à l'utilisation de notre site. En réservant, vous les acceptez. La version publiée le jour de votre réservation s'applique à celle-ci.`,
      ] },
      { title: "Confirmation d'une réservation", body: [{ list: [
        "Les circuits et départs en groupe réservés au prix affiché sont confirmés par e-mail, avec votre billet et son QR code.",
        "Si vous proposez un prix plus bas, nous pouvons l'accepter, faire une contre-proposition ou refuser. Le prix engage les deux parties une fois accepté par chacune sur votre page de réservation ; la réservation est alors confirmée.",
        "Les voyages composés de destinations sont chiffrés par notre équipe après votre demande. Rien n'est dû tant que vous n'acceptez pas notre prix.",
        "Les voyages spéciaux se réservent d'abord sans paiement. Votre place est confirmée lorsque nous la confirmons et recevons votre paiement. Les places sont limitées ; l'inscription sur liste d'attente ne garantit pas une place.",
      ] }] },
      { title: "Prix et paiement", body: [{ list: [
        "Les prix sont en dollars américains. Les prix affichés dans d'autres devises sont des estimations.",
        "Un acompte de 50 % du total bloque vos dates. Les 50 % restants sont dus avant le début du voyage ; nous vous envoyons un rappel et les informations de paiement.",
        "Les permis gorilles et chimpanzés sont payés en totalité à la réservation, car nous les achetons à l'avance auprès des autorités des parcs.",
        "Les réductions « réservation anticipée » s'appliquent aux réservations faites au plus tard à la date indiquée ; les réductions de groupe à partir du nombre de voyageurs indiqué. Elles ne peuvent pas être ajoutées après la réservation.",
        "Les prix peuvent changer avant le paiement complet si les taxes, les droits d'entrée des parcs ou les taux de change évoluent ; nous vous prévenons avant tout changement.",
        "Si un prix affiché sur le site est manifestement erroné, nous vous prévenons dès que nous le remarquons et vous proposons le bon prix ou un remboursement complet.",
      ] }] },
      { title: "Si vous annulez", body: [
        "Prévenez-nous par écrit, depuis votre page de réservation ou par e-mail. Les frais dépendent du nombre de jours avant le premier jour du voyage :",
        { list: [
          "60 jours ou plus : remboursement complet, sauf les permis",
          "De 30 à 59 jours : 50 % du total est facturé (l'acompte)",
          "De 15 à 29 jours : 75 % du total est facturé",
          "14 jours ou moins, ou en cas d'absence : 100 % du total est facturé",
        ] },
        "Les permis gorilles et chimpanzés ne sont pas remboursables une fois achetés, selon les règles de l'autorité des parcs ; le changement de nom sur un permis dépend des règles du parc. Votre page de réservation et l'e-mail de confirmation indiquent ces dates pour votre voyage.",
      ] },
      { title: "Modifications ou annulation de notre part", body: [
        "Nous faisons de notre mieux pour accepter les changements que vous demandez, selon les disponibilités et les éventuels frais supplémentaires. Rarement, nous devons adapter un itinéraire à cause de la météo, de la sécurité, des règles des parcs ou d'événements indépendants de notre volonté ; nous proposons alors une alternative de qualité équivalente.",
        "Si nous devons annuler votre voyage (par exemple la fermeture d'un parc, ou un départ en groupe qui n'atteint pas le nombre minimum de voyageurs), vous pouvez choisir une autre date ou un autre voyage, ou être remboursé intégralement de ce que vous nous avez payé. Nous ne sommes pas responsables des frais payés à des tiers, comme les vols internationaux : une assurance voyage est vivement recommandée.",
      ] },
      { title: "Départs en groupe et voyages spéciaux", body: [
        "Les départs en groupe et les voyages spéciaux sont partagés avec d'autres voyageurs. Nous pouvons réunir plusieurs réservations dans un même groupe et partager les prénoms des voyageurs dans les messages au groupe. Chacun est tenu de respecter le groupe, le programme du guide et les autres voyageurs.",
      ] },
      { title: "Documents de voyage, santé et âge", body: [
        "Vous êtes responsable d'un passeport valide au moins 6 mois après votre voyage, des visas nécessaires (par exemple le visa touristique d'Afrique de l'Est) et des vaccins obligatoires, comme la fièvre jaune lorsque c'est requis.",
        "Le trek des gorilles au Rwanda exige un âge minimum de 15 ans, et d'autres activités des parcs peuvent avoir leurs propres limites. Les enfants doivent voyager avec un parent ou un adulte responsable. Le trek demande une bonne condition physique, et les autorités des parcs peuvent refuser l'entrée à un visiteur visiblement malade.",
      ] },
      { title: "Assurance voyage", body: [
        "Une assurance voyage complète couvrant l'annulation, les urgences médicales et le rapatriement est vivement recommandée pour chaque voyageur.",
      ] },
      { title: "Vos responsabilités", body: [
        "Merci de suivre les instructions des guides et des rangers, de respecter la faune, les communautés locales et les règles des parcs, et de vous comporter de façon à assurer la sécurité de tous. Nous pouvons mettre fin au voyage d'une personne qui met gravement les autres en danger, sans remboursement.",
        "Lorsque vous nous écrivez ou envoyez des fichiers dans votre conversation de réservation, n'envoyez rien d'illégal, d'offensant ou de dangereux. Nous pouvons supprimer un tel contenu.",
      ] },
      { title: "Avis", body: [
        "Si vous rédigez un avis, vous nous autorisez à le publier sur notre site avec votre nom et votre pays. Nous pouvons refuser les avis offensants, sans rapport avec votre voyage ou contenant des informations personnelles sur d'autres personnes.",
      ] },
      { title: "Limitation de responsabilité", body: [
        "Nous choisissons nos partenaires avec soin, mais nous ne sommes pas responsables des pertes, blessures ou retards causés par des événements indépendants de notre volonté, notamment les événements naturels, la maladie, les grèves, les troubles politiques ou les actions de prestataires indépendants. Rien dans ces conditions ne limite une responsabilité que la loi ne permet pas de limiter.",
      ] },
      { title: "Réclamations", body: [
        `Si quelque chose ne va pas pendant votre voyage, prévenez immédiatement votre guide pour qu'une solution soit trouvée sur place. Si le problème n'est pas résolu, écrivez à ${EMAIL} dans les 30 jours suivant votre voyage. Nous répondons sous 14 jours.`,
      ] },
      { title: "Site et contenus", body: [
        "Toutes les photos, textes et contenus de ce site appartiennent à Acacia Safaris Ltd ou à ses partenaires et ne peuvent être copiés sans autorisation. Vos informations personnelles sont utilisées comme décrit dans notre Politique de confidentialité.",
      ] },
      { title: "Droit applicable et litiges", body: [
        "Ces conditions sont régies par le droit de la République du Rwanda. Nous chercherons toujours d'abord une solution amiable, si besoin par la médiation ; à défaut, les tribunaux compétents de Kigali décident. Si vous résidez dans l'Union européenne, vous conservez les protections impératives du droit de la consommation de votre pays.",
      ] },
    ],
  },
  sw: {
    title: "Masharti ya Huduma",
    intro: `Tafadhali soma masharti haya kabla ya kuhifadhi na ${L.name}. Yanaeleza haki na wajibu wako, pamoja na wetu, ili safari yako iende vizuri.`,
    sections: [
      { title: "Kuhusu Sisi na Masharti Haya", body: [
        `${companyLine("leseni ya utalii ya RDB Na.", "namba ya kampuni")} ni mwendeshaji wa ziara aliyepewa leseni na Bodi ya Maendeleo ya Rwanda (RDB). Mawasiliano: ${EMAIL}, ${PHONE}.`,
        `Masharti haya yanahusu kila uhifadhi unaofanywa nasi, kwenye ${SITE}, kwa barua pepe au kwa WhatsApp, pamoja na matumizi ya tovuti yetu. Kwa kuhifadhi unayakubali. Toleo lililochapishwa siku unapohifadhi ndilo linalohusu uhifadhi wako.`,
      ] },
      { title: "Jinsi Uhifadhi Unavyothibitishwa", body: [{ list: [
        "Vifurushi vya ziara na safari za vikundi zilizohifadhiwa kwa bei iliyoorodheshwa huthibitishwa kwa barua pepe, pamoja na tiketi yako na msimbo wa QR.",
        "Ukipendekeza bei ya chini, tunaweza kuikubali, kutoa bei nyingine au kukataa. Bei inawafunga pande zote mbili mara inapokubaliwa na kila upande kwenye ukurasa wako wa uhifadhi; uhifadhi huthibitishwa wakati huo.",
        "Safari zinazoundwa kutoka kwa vivutio hupangiwa bei na timu yetu baada ya ombi lako. Hakuna deni hadi utakapokubali bei yetu.",
        "Safari maalum huhifadhiwa kwanza bila malipo. Nafasi yako inathibitishwa tunapoithibitisha na kupokea malipo yako. Nafasi ni chache; kujiunga na orodha ya kusubiri hakuhakikishii nafasi.",
      ] }] },
      { title: "Bei na Malipo", body: [{ list: [
        "Bei ziko kwa dola za Marekani. Bei zinazoonyeshwa kwa sarafu nyingine ni makadirio tu.",
        "Amana ya 50% ya jumla hushikilia tarehe zako. 50% iliyobaki inalipwa kabla ya safari kuanza; tunakutumia kikumbusho na maelezo ya malipo.",
        "Vibali vya sokwe na sokwe-mtu hulipwa kikamilifu wakati wa kuhifadhi, kwa kuwa tunavinunua mapema kutoka kwa mamlaka za hifadhi.",
        "Punguzo la kuhifadhi mapema linahusu uhifadhi uliofanywa hadi tarehe iliyoonyeshwa; punguzo la kikundi linaanzia idadi ya wasafiri iliyoonyeshwa. Punguzo haliwezi kuongezwa baada ya kuhifadhi.",
        "Bei zinaweza kubadilika kabla ya malipo kamili ikiwa kodi, ada za hifadhi au viwango vya ubadilishaji vitabadilika; tunakujulisha kabla ya mabadiliko yoyote.",
        "Ikiwa bei kwenye tovuti ni wazi kuwa ni kosa, tunakujulisha mara tunapoliona na kukupa bei sahihi au kurejesha pesa zote.",
      ] }] },
      { title: "Ukighairi", body: [
        "Tafadhali tujulishe kwa maandishi, kutoka ukurasa wako wa uhifadhi au kwa barua pepe. Kinachotozwa kinategemea ni siku ngapi kabla ya siku ya kwanza ya safari unaghairi:",
        { list: [
          "Siku 60 au zaidi: unarejeshewa pesa zote, isipokuwa vibali",
          "Siku 30 hadi 59: 50% ya jumla inatozwa (amana)",
          "Siku 15 hadi 29: 75% ya jumla inatozwa",
          "Siku 14 au chini, au usipokuja: 100% ya jumla inatozwa",
        ] },
        "Vibali vya sokwe na sokwe-mtu havirejeshwi mara vikinunuliwa, kama ilivyowekwa na mamlaka ya hifadhi; kubadilisha jina la msafiri kwenye kibali kunategemea kanuni za hifadhi. Ukurasa wako wa uhifadhi na barua pepe ya uthibitisho zinaonyesha tarehe hizi kwa safari yako.",
      ] },
      { title: "Mabadiliko au Kughairi Kutoka Kwetu", body: [
        "Tunajitahidi kukubali mabadiliko unayoomba, kulingana na nafasi zilizopo na gharama zozote za ziada. Mara chache, tunaweza kulazimika kurekebisha ratiba kwa sababu ya hali ya hewa, usalama, kanuni za hifadhi au matukio yaliyo nje ya uwezo wetu; tutatoa mbadala wa ubora unaofanana.",
        "Ikiwa tutalazimika kughairi safari yako (kwa mfano hifadhi ikifungwa, au safari ya kikundi isipofikia idadi ya chini ya wasafiri), unaweza kuchagua tarehe au safari nyingine, au kurejeshewa pesa zote ulizotulipa. Hatuhusiki na gharama ulizolipa kwa wengine, kama tiketi za ndege za kimataifa: bima ya safari inapendekezwa sana.",
      ] },
      { title: "Safari za Vikundi na Safari Maalum", body: [
        "Safari za vikundi na safari maalum hushirikiwa na wasafiri wengine. Tunaweza kuunganisha uhifadhi kadhaa katika kikundi kimoja na kushiriki majina ya kwanza ya wasafiri katika ujumbe wa kikundi. Kila mmoja anatarajiwa kuheshimu kikundi, ratiba ya mwongozaji na wasafiri wengine.",
      ] },
      { title: "Nyaraka za Safari, Afya na Umri", body: [
        "Unawajibika kuwa na pasipoti halali kwa angalau miezi 6 baada ya safari yako, viza unazohitaji (kwa mfano Viza ya Utalii ya Afrika Mashariki) na chanjo zinazotakiwa, kama homa ya manjano pale inapohitajika.",
        "Kutembelea sokwe nchini Rwanda kunahitaji umri wa chini wa miaka 15, na shughuli nyingine za hifadhi zinaweza kuwa na viwango vyake. Watoto lazima wasafiri na mzazi au mtu mzima anayewajibika. Kutembea msituni kunahitaji afya nzuri ya mwili, na mamlaka za hifadhi zinaweza kumkataa mgeni anayeonekana kuwa mgonjwa.",
      ] },
      { title: "Bima ya Safari", body: [
        "Bima kamili ya safari inayohusu kughairi, dharura za kiafya na usafirishaji wa dharura inapendekezwa sana kwa kila msafiri.",
      ] },
      { title: "Wajibu Wako", body: [
        "Tafadhali fuata maelekezo ya waongozaji na askari wa hifadhi, heshimu wanyamapori, jamii za wenyeji na kanuni za hifadhi, na kuwa na tabia inayolinda usalama wa wote. Tunaweza kusitisha safari ya msafiri anayewaweka wengine katika hatari kubwa, bila kurejesha pesa.",
        "Unapotuandikia au kutuma faili katika mazungumzo ya uhifadhi wako, usitume chochote kilicho kinyume cha sheria, cha kukera au chenye madhara. Tunaweza kuondoa maudhui kama hayo.",
      ] },
      { title: "Maoni", body: [
        "Ukiandika maoni, unaturuhusu kuyachapisha kwenye tovuti yetu pamoja na jina lako na nchi yako. Tunaweza kukataa maoni ya kukera, yasiyohusiana na safari yako au yenye taarifa binafsi za watu wengine.",
      ] },
      { title: "Kikomo cha Uwajibikaji", body: [
        "Tunachagua washirika wetu kwa uangalifu, lakini hatuhusiki na hasara, majeraha au kuchelewa kunakosababishwa na matukio yaliyo nje ya uwezo wetu, ikiwemo matukio ya asili, ugonjwa, migomo, machafuko ya kisiasa au vitendo vya watoa huduma huru. Hakuna kitu katika masharti haya kinachopunguza uwajibikaji ambao sheria haiuruhusu kupunguzwa.",
      ] },
      { title: "Malalamiko", body: [
        `Kitu kisipokwenda sawa wakati wa safari yako, mjulishe mwongozaji wako mara moja ili kirekebishwe papo hapo. Kisipotatuliwa, tuandikie kwa ${EMAIL} ndani ya siku 30 baada ya safari yako. Tunajibu ndani ya siku 14.`,
      ] },
      { title: "Tovuti na Maudhui", body: [
        "Picha, maandishi na maudhui yote kwenye tovuti hii ni mali ya Acacia Safaris Ltd au washirika wake na hayawezi kunakiliwa bila ruhusa. Taarifa zako binafsi hutumika kama ilivyoelezwa katika Sera yetu ya Faragha.",
      ] },
      { title: "Sheria Inayotumika na Migogoro", body: [
        "Masharti haya yanaongozwa na sheria za Jamhuri ya Rwanda. Daima tutajaribu kwanza kutatua kutokubaliana kwa amani, ikihitajika kupitia upatanishi; vinginevyo mahakama husika za Kigali zitaamua. Ikiwa unaishi katika Umoja wa Ulaya, unabaki na ulinzi wa lazima wa sheria ya walaji ya nchi yako.",
      ] },
    ],
  },
};
