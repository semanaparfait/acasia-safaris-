// The questions on /faq, in each language. Also given to Google as structured data
// (FAQPage), so keep the answers short, true and up to date.
// Prices and rules here (permits, visas) change from time to time: check them once a year.
// Booking rules must match lib/helpers.ts (DEPOSIT_RATE) and lib/cancellation.ts.
import type { Locale } from "@/i18n/routing";

export type FaqItem = { q: string; a: string };
export type FaqSection = { id: string; title: string; items: FaqItem[] };

const en: FaqSection[] = [
  {
    id: "booking",
    title: "Booking with us",
    items: [
      {
        q: "How do I book a safari?",
        a: "Choose a package and press \"Book now\", join a group departure, or plan a tailor-made trip on the booking page. You get a private link to your booking page by email, where you see your price and talk with our team. Nothing is charged when you send the request.",
      },
      {
        q: "How much do I pay, and when?",
        a: "A deposit of 50% confirms your booking. The rest is paid before the trip starts. You can pay by bank transfer, card (Visa, Mastercard), Mobile Money (MTN, Airtel), PayPal or cash in our Kigali office.",
      },
      {
        q: "Can I change or cancel my booking?",
        a: "Yes. Cancel 60 days or more before the trip and everything is refunded except gorilla and other park permits. From 30 to 59 days before, 50% is charged; from 15 to 29 days, 75%; 14 days or less, 100%. The exact dates for your trip are on your booking page. Want different dates? Ask us on your booking page and we check what the lodges and permits allow.",
      },
      {
        q: "Can I travel alone?",
        a: "Of course. Book a private trip, or join one of our group departures: a fixed date shared with a small group of travelers, which costs less for solo travelers.",
      },
      {
        q: "Can I ask for a different price?",
        a: "Yes. When you book a package you can propose your own price. Our team answers on your booking page.",
      },
    ],
  },
  {
    id: "gorillas",
    title: "Gorilla trekking",
    items: [
      {
        q: "How much is a gorilla permit?",
        a: "In Rwanda's Volcanoes National Park a permit costs USD 1,500 per person (set by the Rwanda Development Board). It includes about one hour with a gorilla family. Permits are limited, so we book them as soon as your deposit is paid. In the busy season, book 3 to 6 months ahead.",
      },
      {
        q: "Is there a minimum age?",
        a: "Yes, you must be 15 or older on the day of the trek. For families with younger children we plan other activities, such as a canopy walk in Nyungwe Forest or a cultural village visit.",
      },
      {
        q: "How hard is the trek?",
        a: "From 1 to 6 hours return, on steep and often muddy slopes at 2,500 to 3,000 m. You need a reasonable level of fitness. Local porters (a small fee, paid on the day) carry your bag and help you on the hardest parts, and the rangers match groups to their pace.",
      },
    ],
  },
  {
    id: "travel",
    title: "Visas & travel",
    items: [
      {
        q: "Do I need a visa for Rwanda?",
        a: "Every nationality can get a visa on arrival at Kigali airport or apply online before travelling (irembo.gov.rw). Citizens of many countries, including African Union, Commonwealth and Francophonie members, pay no visa fee for 30 days. Visiting Uganda and Kenya too? The East African Tourist Visa (USD 100) covers all three for 90 days. Tell us your nationality and we check it for you.",
      },
      {
        q: "Which vaccinations do I need?",
        a: "A yellow fever certificate is required if you arrive from, or passed through, a country with yellow fever. Your doctor or travel clinic will advise on the others, such as malaria tablets for some areas. Please check about 6 weeks before you travel.",
      },
      {
        q: "When is the best time to visit?",
        a: "The dry seasons, June to September and December to February, are the easiest for trekking and game drives. The green seasons (March to May and October to November) are quieter, with lush scenery and some lower lodge prices; it rains, but rarely all day.",
      },
      {
        q: "Is Rwanda safe?",
        a: "Rwanda is one of the safest and cleanest countries in Africa. Our guides are with you throughout the trip and we follow every park rule.",
      },
    ],
  },
  {
    id: "onTrip",
    title: "On your trip",
    items: [
      {
        q: "What should I pack?",
        a: "Waterproof hiking boots, a rain jacket, long trousers and long sleeves, garden gloves for the gorilla trek, a warm layer for the mountain evenings, sunscreen, insect repellent and binoculars. Plastic bags are not allowed in Rwanda, so pack in a bag or a suitcase.",
      },
      {
        q: "What is included in the price?",
        a: "Each package lists exactly what is included and what is not. Usually: your private vehicle and driver-guide, lodges, the meals listed, park fees and the activities in the itinerary. Flights, visas, travel insurance, drinks and tips are usually not included.",
      },
      {
        q: "Which money should I bring?",
        a: "The local currency is the Rwandan franc. US dollars (notes from 2013 or later) are widely accepted, cards work in Kigali and most lodges, and there are ATMs in the towns. A little cash is useful for tips and markets.",
      },
    ],
  },
];

const fr: FaqSection[] = [
  {
    id: "booking",
    title: "Réserver avec nous",
    items: [
      {
        q: "Comment réserver un safari ?",
        a: "Choisissez un circuit et appuyez sur « Réserver », rejoignez un départ en groupe, ou créez un voyage sur mesure sur la page de réservation. Vous recevez par e-mail un lien privé vers votre page de réservation, où vous voyez votre prix et parlez avec notre équipe. Rien n'est facturé à l'envoi de la demande.",
      },
      {
        q: "Combien dois-je payer, et quand ?",
        a: "Un acompte de 50 % confirme votre réservation. Le solde est payé avant le début du voyage. Vous pouvez payer par virement, carte (Visa, Mastercard), Mobile Money (MTN, Airtel), PayPal ou en espèces à notre bureau de Kigali.",
      },
      {
        q: "Puis-je modifier ou annuler ma réservation ?",
        a: "Oui. Annulez 60 jours ou plus avant le voyage et tout est remboursé, sauf les permis gorilles et autres permis de parc. De 30 à 59 jours avant, 50 % sont facturés ; de 15 à 29 jours, 75 % ; 14 jours ou moins, 100 %. Les dates exactes de votre voyage figurent sur votre page de réservation. D'autres dates ? Demandez-nous sur votre page de réservation et nous vérifions ce que permettent les lodges et les permis.",
      },
      {
        q: "Puis-je voyager seul ?",
        a: "Bien sûr. Réservez un voyage privé ou rejoignez l'un de nos départs en groupe : une date fixe partagée avec un petit groupe de voyageurs, moins chère pour une personne seule.",
      },
      {
        q: "Puis-je proposer un autre prix ?",
        a: "Oui. En réservant un circuit, vous pouvez proposer votre prix. Notre équipe répond sur votre page de réservation.",
      },
    ],
  },
  {
    id: "gorillas",
    title: "Trek des gorilles",
    items: [
      {
        q: "Combien coûte un permis gorilles ?",
        a: "Au parc national des Volcans, au Rwanda, le permis coûte 1 500 USD par personne (fixé par le Rwanda Development Board). Il comprend environ une heure avec une famille de gorilles. Les permis sont limités : nous les réservons dès le paiement de votre acompte. En haute saison, réservez 3 à 6 mois à l'avance.",
      },
      {
        q: "Y a-t-il un âge minimum ?",
        a: "Oui, il faut avoir 15 ans ou plus le jour du trek. Pour les familles avec de plus jeunes enfants, nous prévoyons d'autres activités, comme la passerelle de la canopée à Nyungwe ou la visite d'un village culturel.",
      },
      {
        q: "Le trek est-il difficile ?",
        a: "De 1 à 6 heures aller-retour, sur des pentes raides et souvent boueuses, entre 2 500 et 3 000 m. Une condition physique correcte est nécessaire. Des porteurs locaux (une petite somme, payée sur place) portent votre sac et vous aident dans les passages difficiles, et les rangers forment les groupes selon le rythme de chacun.",
      },
    ],
  },
  {
    id: "travel",
    title: "Visas et voyage",
    items: [
      {
        q: "Ai-je besoin d'un visa pour le Rwanda ?",
        a: "Toutes les nationalités peuvent obtenir un visa à l'arrivée à l'aéroport de Kigali ou le demander en ligne avant le départ (irembo.gov.rw). Les citoyens de nombreux pays, dont les membres de l'Union africaine, du Commonwealth et de la Francophonie, ne paient pas de frais de visa pour 30 jours. Vous visitez aussi l'Ouganda et le Kenya ? Le visa touristique est-africain (100 USD) couvre les trois pays pendant 90 jours. Indiquez-nous votre nationalité et nous vérifions pour vous.",
      },
      {
        q: "Quels vaccins faut-il ?",
        a: "Un certificat de vaccination contre la fièvre jaune est exigé si vous arrivez d'un pays où elle est présente, ou si vous y avez transité. Votre médecin ou un centre de vaccination vous conseillera pour le reste, comme un traitement antipaludique pour certaines régions. Renseignez-vous environ 6 semaines avant le départ.",
      },
      {
        q: "Quelle est la meilleure période ?",
        a: "Les saisons sèches, de juin à septembre et de décembre à février, sont les plus faciles pour les treks et les safaris. Les saisons vertes (mars à mai et octobre à novembre) sont plus calmes, avec des paysages luxuriants et parfois des lodges moins chers ; il pleut, mais rarement toute la journée.",
      },
      {
        q: "Le Rwanda est-il sûr ?",
        a: "Le Rwanda est l'un des pays les plus sûrs et les plus propres d'Afrique. Nos guides vous accompagnent pendant tout le voyage et nous respectons toutes les règles des parcs.",
      },
    ],
  },
  {
    id: "onTrip",
    title: "Pendant le voyage",
    items: [
      {
        q: "Que faut-il emporter ?",
        a: "Des chaussures de randonnée imperméables, une veste de pluie, un pantalon et des manches longues, des gants de jardinage pour le trek des gorilles, une couche chaude pour les soirées en montagne, de la crème solaire, un anti-moustique et des jumelles. Les sacs plastique sont interdits au Rwanda : prévoyez un sac ou une valise.",
      },
      {
        q: "Qu'est-ce qui est inclus dans le prix ?",
        a: "Chaque circuit indique précisément ce qui est inclus ou non. En général : votre véhicule privé et votre chauffeur-guide, les lodges, les repas indiqués, les droits d'entrée des parcs et les activités du programme. Les vols, visas, assurance voyage, boissons et pourboires ne sont généralement pas inclus.",
      },
      {
        q: "Quelle monnaie apporter ?",
        a: "La monnaie locale est le franc rwandais. Les dollars américains (billets de 2013 ou plus récents) sont largement acceptés, les cartes fonctionnent à Kigali et dans la plupart des lodges, et il y a des distributeurs en ville. Un peu d'espèces est utile pour les pourboires et les marchés.",
      },
    ],
  },
];

const sw: FaqSection[] = [
  {
    id: "booking",
    title: "Kuhifadhi nafasi nasi",
    items: [
      {
        q: "Ninahifadhije safari?",
        a: "Chagua kifurushi na ubonyeze \"Hifadhi sasa\", jiunge na safari ya kikundi, au panga safari yako mwenyewe kwenye ukurasa wa kuhifadhi. Utapokea kwa barua pepe kiungo cha faragha cha ukurasa wa nafasi yako, ambapo utaona bei yako na kuzungumza na timu yetu. Hakuna malipo unapotuma ombi.",
      },
      {
        q: "Ninalipa kiasi gani, na lini?",
        a: "Amana ya 50% inathibitisha nafasi yako. Kiasi kilichobaki hulipwa kabla safari haijaanza. Unaweza kulipa kwa uhamisho wa benki, kadi (Visa, Mastercard), Mobile Money (MTN, Airtel), PayPal au pesa taslimu ofisini kwetu Kigali.",
      },
      {
        q: "Naweza kubadilisha au kughairi nafasi yangu?",
        a: "Ndiyo. Ukighairi siku 60 au zaidi kabla ya safari, unarudishiwa kila kitu isipokuwa vibali vya sokwe na vibali vingine vya hifadhi. Siku 30 hadi 59 kabla, 50% hutozwa; siku 15 hadi 29, 75%; siku 14 au chini, 100%. Tarehe kamili za safari yako ziko kwenye ukurasa wa nafasi yako. Unataka tarehe nyingine? Tuulize kwenye ukurasa wa nafasi yako nasi tutaangalia kinachowezekana kwa malazi na vibali.",
      },
      {
        q: "Naweza kusafiri peke yangu?",
        a: "Bila shaka. Hifadhi safari binafsi, au jiunge na moja ya safari zetu za kikundi: tarehe maalum ukiwa na kikundi kidogo cha wasafiri, ambayo ni nafuu zaidi kwa msafiri mmoja.",
      },
      {
        q: "Naweza kupendekeza bei nyingine?",
        a: "Ndiyo. Unapohifadhi kifurushi unaweza kupendekeza bei yako. Timu yetu hujibu kwenye ukurasa wa nafasi yako.",
      },
    ],
  },
  {
    id: "gorillas",
    title: "Kutembelea sokwe",
    items: [
      {
        q: "Kibali cha sokwe kinagharimu kiasi gani?",
        a: "Katika Hifadhi ya Taifa ya Volkano nchini Rwanda, kibali kinagharimu USD 1,500 kwa mtu (kimewekwa na Rwanda Development Board). Kinajumuisha takriban saa moja na familia ya sokwe. Vibali ni vichache, kwa hiyo tunavihifadhi mara tu amana yako inapolipwa. Katika msimu wenye wageni wengi, hifadhi miezi 3 hadi 6 mapema.",
      },
      {
        q: "Kuna umri wa chini?",
        a: "Ndiyo, lazima uwe na miaka 15 au zaidi siku ya matembezi. Kwa familia zenye watoto wadogo tunapanga shughuli nyingine, kama kutembea juu ya miti katika msitu wa Nyungwe au kutembelea kijiji cha kitamaduni.",
      },
      {
        q: "Matembezi ni magumu kiasi gani?",
        a: "Kuanzia saa 1 hadi 6 kwenda na kurudi, kwenye miteremko mikali na mara nyingi yenye matope, kwenye mwinuko wa mita 2,500 hadi 3,000. Unahitaji afya ya mwili ya wastani. Wapagazi wa eneo hilo (ada ndogo, hulipwa siku hiyo) hubeba begi lako na kukusaidia sehemu ngumu, na walinzi hupanga vikundi kulingana na kasi ya kila mmoja.",
      },
    ],
  },
  {
    id: "travel",
    title: "Viza na usafiri",
    items: [
      {
        q: "Nahitaji viza kuingia Rwanda?",
        a: "Raia wa kila nchi wanaweza kupata viza wanapowasili uwanja wa ndege wa Kigali au kuiomba mtandaoni kabla ya kusafiri (irembo.gov.rw). Raia wa nchi nyingi, zikiwemo wanachama wa Umoja wa Afrika, Jumuiya ya Madola na Francophonie, hawalipi ada ya viza kwa siku 30. Unatembelea pia Uganda na Kenya? Viza ya Utalii ya Afrika Mashariki (USD 100) inatumika katika nchi zote tatu kwa siku 90. Tuambie uraia wako nasi tutakuangalia.",
      },
      {
        q: "Nahitaji chanjo gani?",
        a: "Cheti cha chanjo ya homa ya manjano kinahitajika ukitoka, au ukipitia, nchi yenye homa ya manjano. Daktari wako au kliniki ya wasafiri atakushauri kuhusu nyingine, kama dawa za malaria kwa baadhi ya maeneo. Tafadhali angalia takriban wiki 6 kabla ya kusafiri.",
      },
      {
        q: "Wakati gani ni bora kutembelea?",
        a: "Misimu ya kiangazi, Juni hadi Septemba na Desemba hadi Februari, ni rahisi zaidi kwa matembezi na kuangalia wanyama. Misimu ya kijani (Machi hadi Mei na Oktoba hadi Novemba) ina wageni wachache, mandhari ya kijani na wakati mwingine bei nafuu za malazi; mvua hunyesha, lakini mara chache siku nzima.",
      },
      {
        q: "Je, Rwanda ni salama?",
        a: "Rwanda ni mojawapo ya nchi salama na safi zaidi barani Afrika. Waongozaji wetu wako nawe safari nzima na tunafuata kila sheria ya hifadhi.",
      },
    ],
  },
  {
    id: "onTrip",
    title: "Wakati wa safari",
    items: [
      {
        q: "Nibebe nini?",
        a: "Viatu vya kutembea visivyopitisha maji, koti la mvua, suruali ndefu na mikono mirefu, glovu za bustani kwa matembezi ya sokwe, nguo ya joto kwa jioni za milimani, mafuta ya kuzuia jua, dawa ya kufukuza wadudu na darubini. Mifuko ya plastiki hairuhusiwi Rwanda, kwa hiyo tumia begi au sanduku.",
      },
      {
        q: "Bei inajumuisha nini?",
        a: "Kila kifurushi kinaonyesha wazi kinachojumuishwa na kisichojumuishwa. Kwa kawaida: gari lako binafsi na dereva-mwongozaji, malazi, milo iliyoorodheshwa, ada za hifadhi na shughuli za ratiba. Tiketi za ndege, viza, bima ya safari, vinywaji na bakshishi kwa kawaida havijumuishwi.",
      },
      {
        q: "Nilete pesa gani?",
        a: "Sarafu ya nchi ni faranga ya Rwanda. Dola za Marekani (noti za mwaka 2013 au baadaye) zinakubalika sehemu nyingi, kadi zinafanya kazi Kigali na katika nyumba nyingi za wageni, na kuna ATM mijini. Pesa taslimu kidogo ni muhimu kwa bakshishi na masoko.",
      },
    ],
  },
];

export const FAQ: Record<Locale, FaqSection[]> = { en, fr, sw };
