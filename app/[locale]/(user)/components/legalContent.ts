// The Privacy Policy and Terms of Service in English, French and Swahili.
// A body is paragraphs (text) and lists ({ list: [...] }). The email address is made a link.
// The English version prevails if the versions differ (a note says so on the other languages).

export type LegalBlock = string | { list: string[] };
export type LegalDoc = {
  title: string;
  intro: string;
  sections: { title: string; body: LegalBlock[] }[];
};
type Lang = "en" | "fr" | "sw";

export const LEGAL_UPDATED = "2026-11-12"; // shown in the reader's date format

export const PRIVACY: Record<Lang, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    intro: "At Acacia Safaris Ltd, your privacy matters to us. This policy explains what information we collect, how we use it and the choices you have.",
    sections: [
      { title: "Information We Collect", body: [
        "When you contact us, make a booking or subscribe to our newsletter, we may collect:",
        { list: [
          "Your name, email address and phone number",
          "Travel details such as dates, number of travelers and preferences",
          "Passport details needed for permits, lodges and flights",
          "Dietary, medical or accessibility needs you choose to share",
          "Basic technical data such as browser type and pages visited",
        ] },
      ] },
      { title: "How We Use Your Information", body: [{ list: [
        "To answer your questions and plan your trip",
        "To make reservations, buy permits and arrange transfers on your behalf",
        "To keep you informed before and during your travels",
        "To send newsletters and offers, only if you have subscribed",
        "To improve our website and services",
      ] }] },
      { title: "Sharing Your Information", body: ["We never sell your personal data. We only share the details needed with trusted partners who help deliver your trip, such as lodges, airlines, park authorities and guides, or when required by law."] },
      { title: "Data Security", body: ["We take reasonable technical and organisational measures to protect your information from loss, misuse or unauthorised access. However, no method of transmission over the internet is completely secure."] },
      { title: "How Long We Keep Data", body: ["We keep your information only as long as needed to provide our services, meet legal and accounting obligations, or resolve disputes."] },
      { title: "Cookies", body: ["Our website may use cookies to remember your preferences and understand how visitors use the site. You can disable cookies in your browser settings, although some features may not work as expected."] },
      { title: "Your Rights", body: ["You can ask to see, correct or delete the personal information we hold about you, or unsubscribe from our emails at any time. Just contact us using the details below."] },
      { title: "Changes to This Policy", body: ["We may update this policy from time to time. The latest version will always be available on this page, with the date it was last updated."] },
      { title: "Contact Us", body: ["For any privacy questions, email us at info@acaciasafaris.com or write to Acacia Safaris Ltd, Kigali, Rwanda."] },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    intro: "Chez Acacia Safaris Ltd, votre vie privée compte pour nous. Cette politique explique quelles informations nous collectons, comment nous les utilisons et les choix dont vous disposez.",
    sections: [
      { title: "Informations collectées", body: [
        "Lorsque vous nous contactez, réservez ou vous abonnez à notre newsletter, nous pouvons collecter :",
        { list: [
          "Votre nom, votre adresse e-mail et votre numéro de téléphone",
          "Les détails de votre voyage : dates, nombre de voyageurs et préférences",
          "Les informations de passeport nécessaires aux permis, lodges et vols",
          "Les besoins alimentaires, médicaux ou d'accessibilité que vous choisissez de partager",
          "Des données techniques de base, comme le type de navigateur et les pages consultées",
        ] },
      ] },
      { title: "Utilisation de vos informations", body: [{ list: [
        "Pour répondre à vos questions et organiser votre voyage",
        "Pour effectuer les réservations, acheter les permis et organiser les transferts en votre nom",
        "Pour vous tenir informé avant et pendant votre voyage",
        "Pour vous envoyer newsletters et offres, uniquement si vous y êtes abonné",
        "Pour améliorer notre site et nos services",
      ] }] },
      { title: "Partage de vos informations", body: ["Nous ne vendons jamais vos données personnelles. Nous ne partageons que les informations nécessaires avec des partenaires de confiance qui participent à votre voyage (lodges, compagnies aériennes, autorités des parcs, guides), ou lorsque la loi l'exige."] },
      { title: "Sécurité des données", body: ["Nous prenons des mesures techniques et organisationnelles raisonnables pour protéger vos informations contre la perte, l'utilisation abusive ou l'accès non autorisé. Aucune transmission sur Internet n'est toutefois totalement sûre."] },
      { title: "Durée de conservation", body: ["Nous conservons vos informations uniquement le temps nécessaire pour fournir nos services, respecter nos obligations légales et comptables ou régler un litige."] },
      { title: "Cookies", body: ["Notre site peut utiliser des cookies pour mémoriser vos préférences et comprendre comment il est utilisé. Vous pouvez désactiver les cookies dans votre navigateur, mais certaines fonctions risquent de ne pas fonctionner correctement."] },
      { title: "Vos droits", body: ["Vous pouvez demander à consulter, corriger ou supprimer les informations personnelles que nous détenons sur vous, ou vous désabonner de nos e-mails à tout moment. Il suffit de nous contacter avec les coordonnées ci-dessous."] },
      { title: "Modifications de cette politique", body: ["Nous pouvons mettre à jour cette politique de temps en temps. La dernière version est toujours disponible sur cette page, avec sa date de mise à jour."] },
      { title: "Nous contacter", body: ["Pour toute question sur la confidentialité, écrivez-nous à info@acaciasafaris.com ou à Acacia Safaris Ltd, Kigali, Rwanda."] },
    ],
  },
  sw: {
    title: "Sera ya Faragha",
    intro: "Katika Acacia Safaris Ltd, faragha yako ni muhimu kwetu. Sera hii inaeleza taarifa tunazokusanya, jinsi tunavyozitumia na chaguo ulizonazo.",
    sections: [
      { title: "Taarifa Tunazokusanya", body: [
        "Unapowasiliana nasi, kuweka safari au kujiunga na jarida letu, tunaweza kukusanya:",
        { list: [
          "Jina lako, barua pepe na namba ya simu",
          "Maelezo ya safari kama tarehe, idadi ya wasafiri na mapendeleo",
          "Taarifa za pasipoti zinazohitajika kwa vibali, malazi na ndege",
          "Mahitaji ya chakula, afya au ufikiaji unayochagua kutuambia",
          "Taarifa za msingi za kiufundi kama aina ya kivinjari na kurasa ulizotembelea",
        ] },
      ] },
      { title: "Jinsi Tunavyotumia Taarifa Zako", body: [{ list: [
        "Kujibu maswali yako na kupanga safari yako",
        "Kufanya uhifadhi, kununua vibali na kupanga usafiri kwa niaba yako",
        "Kukujulisha kabla na wakati wa safari yako",
        "Kukutumia majarida na ofa, ikiwa tu umejiunga",
        "Kuboresha tovuti na huduma zetu",
      ] }] },
      { title: "Kushiriki Taarifa Zako", body: ["Hatuuzi kamwe taarifa zako binafsi. Tunashiriki tu maelezo yanayohitajika na washirika wanaoaminika wanaosaidia kufanikisha safari yako, kama malazi, mashirika ya ndege, mamlaka za hifadhi na waongozaji, au pale sheria inapotaka."] },
      { title: "Usalama wa Taarifa", body: ["Tunachukua hatua za kiufundi na za kiutawala zinazofaa kulinda taarifa zako dhidi ya upotevu, matumizi mabaya au kufikiwa bila ruhusa. Hata hivyo, hakuna njia ya kutuma taarifa mtandaoni iliyo salama kabisa."] },
      { title: "Muda Tunaohifadhi Taarifa", body: ["Tunahifadhi taarifa zako kwa muda unaohitajika tu kutoa huduma zetu, kutimiza wajibu wa kisheria na wa kihasibu, au kutatua migogoro."] },
      { title: "Vidakuzi (Cookies)", body: ["Tovuti yetu inaweza kutumia vidakuzi kukumbuka mapendeleo yako na kuelewa jinsi wageni wanavyoitumia. Unaweza kuzima vidakuzi kwenye mipangilio ya kivinjari chako, ingawa baadhi ya huduma huenda zisifanye kazi ipasavyo."] },
      { title: "Haki Zako", body: ["Unaweza kuomba kuona, kusahihisha au kufuta taarifa zako binafsi tulizonazo, au kujiondoa kwenye barua pepe zetu wakati wowote. Wasiliana nasi kupitia maelezo yaliyo hapa chini."] },
      { title: "Mabadiliko ya Sera Hii", body: ["Tunaweza kusasisha sera hii mara kwa mara. Toleo la karibuni litapatikana kwenye ukurasa huu kila wakati, pamoja na tarehe lilipobadilishwa."] },
      { title: "Wasiliana Nasi", body: ["Kwa maswali yoyote kuhusu faragha, tuandikie kwa info@acaciasafaris.com au kwa Acacia Safaris Ltd, Kigali, Rwanda."] },
    ],
  },
};

export const TERMS: Record<Lang, LegalDoc> = {
  en: {
    title: "Terms of Service",
    intro: "Please read these terms carefully before booking with Acacia Safaris Ltd. They explain your rights and responsibilities, and ours, so your journey runs smoothly.",
    sections: [
      { title: "About These Terms", body: ["These terms apply to all bookings and services provided by Acacia Safaris Ltd (\"we\", \"us\"). By making a booking or using our website, you agree to them."] },
      { title: "Bookings & Payments", body: [{ list: [
        "A booking made at the listed price is confirmed at once, by email, with your QR code ticket. A booking with a price offer is confirmed when we agree on the price.",
        "A deposit of 50% of the total holds your dates. The remaining 50% is due before your trip starts; we send you a reminder and the payment details.",
        "Gorilla and chimpanzee permits must be paid in full at the time of booking, as they are bought in advance from park authorities.",
        "Prices are in US dollars. Other currencies shown on the website are estimates. Prices may change if taxes, park fees or exchange rates change before you pay.",
      ] }] },
      { title: "Cancellations & Refunds", body: [
        "If you need to cancel, please tell us in writing, from your booking page or by email. What you pay depends on how many days before the first day of the trip you cancel:",
        { list: [
          "60 days or more: full refund, except permits",
          "30 to 59 days: 50% of the total is charged (the deposit)",
          "15 to 29 days: 75% of the total is charged",
          "14 days or less, or if you do not come: 100% of the total is charged",
        ] },
        "Gorilla and chimpanzee permits cannot be refunded once bought, as set by the park authority. Your booking page and confirmation email show these dates for your trip.",
      ] },
      { title: "Changes to Your Trip", body: ["We will do our best to accommodate changes you request, subject to availability and any extra costs. In rare cases we may need to adjust an itinerary because of weather, safety or circumstances beyond our control. We will always offer a suitable alternative."] },
      { title: "Travel Documents & Health", body: ["You are responsible for having a valid passport, visas and any required vaccinations (such as yellow fever). Gorilla trekking requires a reasonable level of fitness, and you may be refused entry to a park if you are visibly unwell."] },
      { title: "Travel Insurance", body: ["Comprehensive travel insurance covering cancellation, medical emergencies and evacuation is strongly recommended for all travelers."] },
      { title: "Your Responsibilities", body: ["We ask all guests to follow the instructions of guides and rangers, respect wildlife, local communities and park rules, and behave in a way that keeps everyone safe."] },
      { title: "Limitation of Liability", body: ["We carefully select our partners, but we are not responsible for loss, injury or delay caused by events beyond our reasonable control, including natural events, strikes, political unrest or the actions of independent suppliers."] },
      { title: "Website Use", body: ["All photos, text and content on this website belong to Acacia Safaris Ltd or its partners and may not be copied without permission."] },
      { title: "Governing Law", body: ["These terms are governed by the laws of the Republic of Rwanda."] },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    intro: "Veuillez lire attentivement ces conditions avant de réserver avec Acacia Safaris Ltd. Elles expliquent vos droits et responsabilités, ainsi que les nôtres, pour que votre voyage se passe au mieux.",
    sections: [
      { title: "À propos de ces conditions", body: ["Ces conditions s'appliquent à toutes les réservations et à tous les services fournis par Acacia Safaris Ltd (« nous »). En réservant ou en utilisant notre site, vous les acceptez."] },
      { title: "Réservations et paiements", body: [{ list: [
        "Une réservation au prix affiché est confirmée immédiatement par e-mail, avec votre billet QR code. Une réservation avec une offre de prix est confirmée lorsque nous nous mettons d'accord sur le prix.",
        "Un acompte de 50 % du total réserve vos dates. Les 50 % restants sont à régler avant le début du voyage ; nous vous envoyons un rappel et les détails du paiement.",
        "Les permis gorilles et chimpanzés doivent être payés intégralement à la réservation, car ils sont achetés à l'avance auprès des autorités des parcs.",
        "Les prix sont en dollars américains. Les autres devises affichées sur le site sont des estimations. Les prix peuvent changer si les taxes, les droits d'entrée des parcs ou les taux de change évoluent avant votre paiement.",
      ] }] },
      { title: "Annulations et remboursements", body: [
        "Si vous devez annuler, merci de nous prévenir par écrit, depuis la page de votre réservation ou par e-mail. Le montant facturé dépend du nombre de jours avant le premier jour du voyage :",
        { list: [
          "60 jours ou plus : remboursement intégral, sauf les permis",
          "30 à 59 jours : 50 % du total est facturé (l'acompte)",
          "15 à 29 jours : 75 % du total est facturé",
          "14 jours ou moins, ou en cas d'absence : 100 % du total est facturé",
        ] },
        "Les permis gorilles et chimpanzés ne sont pas remboursables une fois achetés, selon les règles de l'autorité du parc. La page de votre réservation et l'e-mail de confirmation indiquent ces dates pour votre voyage.",
      ] },
      { title: "Modifications de votre voyage", body: ["Nous ferons notre possible pour répondre à vos demandes de modification, selon les disponibilités et les éventuels frais supplémentaires. Dans de rares cas, nous pouvons devoir adapter un itinéraire en raison de la météo, de la sécurité ou de circonstances indépendantes de notre volonté. Nous vous proposerons toujours une alternative adaptée."] },
      { title: "Documents de voyage et santé", body: ["Vous êtes responsable d'avoir un passeport valide, les visas et les vaccins requis (comme la fièvre jaune). La randonnée vers les gorilles demande une bonne condition physique, et l'accès à un parc peut vous être refusé si vous êtes visiblement malade."] },
      { title: "Assurance voyage", body: ["Une assurance voyage complète couvrant l'annulation, les urgences médicales et le rapatriement est vivement recommandée pour tous les voyageurs."] },
      { title: "Vos responsabilités", body: ["Nous demandons à tous nos voyageurs de suivre les consignes des guides et des rangers, de respecter la faune, les communautés locales et les règles des parcs, et d'adopter un comportement qui assure la sécurité de tous."] },
      { title: "Limitation de responsabilité", body: ["Nous choisissons nos partenaires avec soin, mais nous ne sommes pas responsables des pertes, blessures ou retards causés par des événements indépendants de notre volonté, notamment catastrophes naturelles, grèves, troubles politiques ou actions de prestataires indépendants."] },
      { title: "Utilisation du site", body: ["Toutes les photos, textes et contenus de ce site appartiennent à Acacia Safaris Ltd ou à ses partenaires et ne peuvent être copiés sans autorisation."] },
      { title: "Droit applicable", body: ["Ces conditions sont régies par le droit de la République du Rwanda."] },
    ],
  },
  sw: {
    title: "Masharti ya Huduma",
    intro: "Tafadhali soma masharti haya kwa makini kabla ya kuweka safari na Acacia Safaris Ltd. Yanaeleza haki na wajibu wako, na wetu, ili safari yako iende vizuri.",
    sections: [
      { title: "Kuhusu Masharti Haya", body: ["Masharti haya yanahusu safari na huduma zote zinazotolewa na Acacia Safaris Ltd (\"sisi\"). Kwa kuweka safari au kutumia tovuti yetu, unakubali masharti haya."] },
      { title: "Kuweka Safari na Malipo", body: [{ list: [
        "Safari iliyowekwa kwa bei iliyoorodheshwa inathibitishwa mara moja kwa barua pepe, pamoja na tiketi yako ya QR code. Safari yenye pendekezo la bei inathibitishwa tukikubaliana bei.",
        "Amana ya 50% ya jumla inashikilia tarehe zako. 50% iliyobaki inalipwa kabla safari haijaanza; tunakutumia ukumbusho na maelezo ya malipo.",
        "Vibali vya sokwe na sokwe-mtu lazima vilipwe vyote wakati wa kuweka safari, kwa kuwa vinanunuliwa mapema kutoka kwa mamlaka za hifadhi.",
        "Bei ziko kwa dola za Marekani. Sarafu nyingine zinazoonyeshwa kwenye tovuti ni makadirio. Bei zinaweza kubadilika kodi, ada za hifadhi au viwango vya kubadilisha fedha vikibadilika kabla ya malipo.",
      ] }] },
      { title: "Kughairi na Kurejeshewa Fedha", body: [
        "Ukihitaji kughairi, tafadhali tujulishe kwa maandishi, kupitia ukurasa wa safari yako au kwa barua pepe. Kiasi unacholipa kinategemea idadi ya siku kabla ya siku ya kwanza ya safari:",
        { list: [
          "Siku 60 au zaidi: unarejeshewa fedha zote, isipokuwa vibali",
          "Siku 30 hadi 59: 50% ya jumla inatozwa (amana)",
          "Siku 15 hadi 29: 75% ya jumla inatozwa",
          "Siku 14 au chini, au usipofika: 100% ya jumla inatozwa",
        ] },
        "Vibali vya sokwe na sokwe-mtu havirejeshewi fedha baada ya kununuliwa, kwa mujibu wa mamlaka ya hifadhi. Ukurasa wa safari yako na barua pepe ya uthibitisho zinaonyesha tarehe hizi kwa safari yako.",
      ] },
      { title: "Mabadiliko ya Safari Yako", body: ["Tutajitahidi kukubali mabadiliko unayoomba, kulingana na upatikanaji na gharama za ziada. Mara chache tunaweza kulazimika kubadilisha ratiba kwa sababu ya hali ya hewa, usalama au mambo yaliyo nje ya uwezo wetu. Tutakupa mbadala unaofaa kila wakati."] },
      { title: "Hati za Safari na Afya", body: ["Unawajibika kuwa na pasipoti halali, viza na chanjo zinazohitajika (kama homa ya manjano). Kutembelea sokwe kunahitaji afya nzuri ya mwili, na unaweza kukataliwa kuingia hifadhini ikiwa unaonekana kuwa mgonjwa."] },
      { title: "Bima ya Safari", body: ["Bima kamili ya safari inayojumuisha kughairi, dharura za matibabu na usafirishaji wa dharura inapendekezwa sana kwa wasafiri wote."] },
      { title: "Wajibu Wako", body: ["Tunaomba wageni wote wafuate maelekezo ya waongozaji na askari wa hifadhi, waheshimu wanyamapori, jamii za wenyeji na sheria za hifadhi, na watende kwa namna inayoweka kila mtu salama."] },
      { title: "Ukomo wa Dhima", body: ["Tunachagua washirika wetu kwa makini, lakini hatuwajibiki kwa hasara, majeraha au ucheleweshaji unaosababishwa na matukio yaliyo nje ya uwezo wetu, ikiwemo majanga ya asili, migomo, machafuko ya kisiasa au vitendo vya watoa huduma huru."] },
      { title: "Matumizi ya Tovuti", body: ["Picha, maandishi na maudhui yote kwenye tovuti hii ni mali ya Acacia Safaris Ltd au washirika wake na hayaruhusiwi kunakiliwa bila ruhusa."] },
      { title: "Sheria Inayotumika", body: ["Masharti haya yanaongozwa na sheria za Jamhuri ya Rwanda."] },
    ],
  },
};
