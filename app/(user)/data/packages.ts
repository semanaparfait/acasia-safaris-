// Tour packages: the single source of truth for the website and the admin panel.
// This is seed (mock) data. Admins edit it from /admin/packages and the site reads
// the edited copy through usePackages() in ./packageStore. The real tables live in
// backend/prisma/schema.prisma (Package + ItineraryDay; route/inclusions/exclusions/perks
// are text-list columns). The duration is never stored: it is the number of itinerary days.

export type ItineraryDay = {
  title: string;
  description: string;
  image: string;
};

export type TourPackage = {
  id: string;
  title: string;
  category: string;
  badge?: string;
  location: string;
  description: string;
  tripType: string;
  lodging: string;
  image: string;
  price: number; // USD per person, admin only (not shown on the website)
  active: boolean; // drafts are hidden from the website
  route: string[]; // stops in travel order
  itinerary: ItineraryDay[]; // day number = index + 1
  inclusions: string[];
  exclusions: string[];
  perks?: string[];
};

export const packageCategories = [
  "Gorilla Trekking",
  "Wildlife Safari",
  "Luxury Escapes",
  "Cultural Tours",
];

export const packageDays = (p: TourPackage) => p.itinerary.length;
export const daysLabel = (p: TourPackage) => {
  const n = packageDays(p);
  return `${n} ${n === 1 ? "Day" : "Days"}`;
};

// Link to the Tours page with a category or package open:
//   /tour?category=Gorilla%20Trekking   /tour?package=7-day-gorilla
export const tourHref = (opts: { category?: string; package?: string } = {}) => {
  const params = new URLSearchParams();
  if (opts.category && opts.category !== "All Packages") params.set("category", opts.category);
  if (opts.package) params.set("package", opts.package);
  const query = params.toString();
  return query ? `/tour?${query}` : "/tour";
};

const thumb = (id: string) =>
  `https://images.unsplash.com/${id}?w=200&auto=format&fit=crop&q=80`;

export const packageList: TourPackage[] = [
  {
    id: "7-day-gorilla",
    title: "7-Day Gorilla Trekking Adventure",
    category: "Gorilla Trekking",
    badge: "POPULAR",
    location: "Rwanda & Uganda",
    description:
      "Get up close with the majestic mountain gorillas in their natural habitat. An unforgettable experience of a lifetime.",
    tripType: "Gorilla Trekking",
    lodging: "Luxury Lodges",
    image:
      "https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg",
    price: 2450,
    active: true,
    route: ["Kigali (Rwanda)", "Volcanoes NP", "Akagera NP", "Kigali Departure"],
    itinerary: [
      {
        title: "Kigali Arrival & Luxury Stay",
        description:
          "Arrive in Kigali, meet your guide and enjoy a luxury lodge stay with city views.",
        image: thumb("photo-1578895210405-907db486c111"),
      },
      {
        title: "Kigali → Volcanoes NP",
        description:
          "Travel to Volcanoes National Park and settle in for your gorilla trek briefing.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Gorilla Trekking Experience",
        description: "Track mountain gorillas in the misty forests with expert guides.",
        image: thumb("photo-1576487248805-acf45f536b43"),
      },
      {
        title: "Golden Monkey & Cultural Tour",
        description:
          "Visit golden monkeys and experience local culture in the community.",
        image: thumb("photo-1540573133985-87b6da6d54a9"),
      },
      {
        title: "Fly to Akagera National Park",
        description:
          "Fly to Akagera and enjoy an afternoon game drive in Rwanda's wildlife haven.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Big Five Safari & Lake Boat Cruise",
        description: "Spot the Big Five and enjoy a scenic boat cruise on Lake Ihema.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Return to Kigali & Departure",
        description: "Drive back to Kigali for your international flight.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "Private helicopter transfers",
      "3-5 star lodges & camps",
      "All meals",
      "Expert safari guides",
    ],
    exclusions: [
      "International flights",
      "Visas",
      "Personal travel insurance",
      "Tips & gratuities",
    ],
  },
  {
    id: "5-day-wildlife",
    title: "5-Day Classic Wildlife Safari",
    category: "Wildlife Safari",
    location: "Tanzania – Serengeti & Ngorongoro",
    description:
      "Witness the Big Five and breathtaking landscapes of the Serengeti and Ngorongoro Crater.",
    tripType: "Wildlife Safari",
    lodging: "Comfort Lodges",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80",
    price: 1850,
    active: true,
    route: ["Serengeti NP", "Ngorongoro Rim", "Arusha / Departure"],
    itinerary: [
      {
        title: "Arrival & Fly to Serengeti National Park",
        description:
          "Board a scenic bush flight directly to Serengeti. Settle into your tented camp with savannah views.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Full-Day Great Migration & Big Cat Game Drive",
        description:
          "Sunrise game drive tracking lion prides, cheetahs, leopards, and large herds of wildebeest across central Serengeti.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Journey to Ngorongoro Conservation Area",
        description:
          "Game drive through Olduvai Gorge en route to the rim of Ngorongoro Crater. Stay at a crater-rim lodge.",
        image: thumb("photo-1582719478250-c89cae4dc85b"),
      },
      {
        title: "Ngorongoro Crater Floor Big Five Expedition",
        description:
          "Descend 600m into the crater floor for an intensive game drive. Spot endangered black rhinos and flamingo lakes.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Farewell Bush Breakfast & Return Transfer",
        description:
          "Final morning game drive, bush breakfast under an acacia tree, and return transfer to Arusha.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "Private 4x4 Land Cruiser with pop-up roof",
      "All national park & crater entry fees",
      "Full-board lodge stay",
      "Expert certified naturalist guide",
    ],
    exclusions: [
      "International flights",
      "Visa fees",
      "Optional balloon safari ($550)",
      "Driver guide tips",
    ],
  },
  {
    id: "10-day-luxury",
    title: "10-Day Luxury Safari Escape",
    category: "Luxury Escapes",
    location: "Kenya",
    description:
      "Indulge in world-class lodges, private game drives and breathtaking scenery. A perfect blend of comfort and adventure.",
    tripType: "Wildlife Safari",
    lodging: "Luxury Lodges",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
    price: 4320,
    active: true,
    route: ["Nairobi", "Maasai Mara", "Laikipia", "Samburu", "Amboseli", "Nairobi Departure"],
    itinerary: [
      {
        title: "VIP Arrival & Giraffe Manor",
        description:
          "Private airport meet-and-greet and an overnight at Giraffe Manor, breakfast with Rothschild giraffes.",
        image: thumb("photo-1582719478250-c89cae4dc85b"),
      },
      {
        title: "Charter Flight to the Maasai Mara",
        description:
          "Fly to the Mara and check into a luxury tented camp overlooking the plains. Sundowner game drive.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Private Big Five Game Drives",
        description:
          "Full day in a private vehicle tracking lions, leopards and elephants with a dedicated guide.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Sunrise Hot Air Balloon & Champagne Breakfast",
        description:
          "Float over the Mara at dawn, then a champagne bush breakfast and an afternoon at leisure.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Fly to Laikipia Plateau",
        description:
          "Scenic flight to a private conservancy with views of Mount Kenya and a spa afternoon.",
        image: thumb("photo-1566073771259-6a8506099945"),
      },
      {
        title: "Ol Pejeta Rhino Sanctuary",
        description:
          "Meet the last northern white rhinos and visit the chimpanzee sanctuary with conservationists.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Samburu Special Five",
        description:
          "Spot Grevy's zebra, reticulated giraffe and gerenuk along the Ewaso Nyiro river.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Fly to Amboseli",
        description:
          "Fly south to Amboseli for an evening game drive beneath Mount Kilimanjaro.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Elephants of Amboseli & Private Dinner",
        description:
          "Morning with Amboseli's great tuskers, then a private candlelit dinner in the bush.",
        image: thumb("photo-1582719478250-c89cae4dc85b"),
      },
      {
        title: "Return to Nairobi & Departure",
        description:
          "Charter flight back to Nairobi, day room and VIP transfer for your international flight.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "5-star lodges & tented camps",
      "All charter flights",
      "All gourmet meals & premium drinks",
      "Private vehicle & guide",
    ],
    exclusions: [
      "International flights",
      "Visas",
      "Personal travel insurance",
    ],
    perks: [
      "Hot air balloon safari",
      "Private candlelit bush dinner",
      "Spa treatment at Laikipia",
      "VIP airport meet-and-greet",
    ],
  },
  {
    id: "7-day-zanzibar",
    title: "7-Day Zanzibar Beach & Safari",
    category: "Wildlife Safari",
    badge: "BEST SELLER",
    location: "Tanzania",
    description:
      "Combine thrilling game drives with relaxing beach holidays on the spice island of Zanzibar.",
    tripType: "Safari + Beach",
    lodging: "Luxury Resorts",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    price: 2980,
    active: true,
    route: ["Arusha", "Tarangire", "Ngorongoro", "Zanzibar"],
    itinerary: [
      {
        title: "Arrival in Arusha",
        description: "Meet your guide at Kilimanjaro Airport and relax at a coffee-farm lodge.",
        image: thumb("photo-1578895210405-907db486c111"),
      },
      {
        title: "Tarangire Elephant Safari",
        description: "Game drive among baobabs and some of Tanzania's largest elephant herds.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Ngorongoro Crater",
        description: "Descend into the crater for a full day of Big Five game viewing.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Fly to Zanzibar & Stone Town",
        description: "Short flight to Zanzibar and a guided walk through historic Stone Town.",
        image: thumb("photo-1540555700478-4be289fbecef"),
      },
      {
        title: "Spice Farm & Beach Afternoon",
        description: "Taste cloves, vanilla and cinnamon on a spice tour, then unwind on the beach.",
        image: thumb("photo-1514432324607-a09d9b4aefdd"),
      },
      {
        title: "Dhow Cruise & Snorkelling",
        description: "Sail a traditional dhow to Mnemba Atoll for snorkelling and a seafood lunch.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Departure",
        description: "Free morning at the resort before your transfer to Zanzibar airport.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "Safari vehicle & guide",
      "Park entry fees",
      "Domestic flight to Zanzibar",
      "Beach resort with breakfast",
    ],
    exclusions: ["International flights", "Visas", "Lunches & dinners in Zanzibar"],
  },
  {
    id: "6-day-cultural",
    title: "6-Day Cultural Experiences",
    category: "Cultural Tours",
    location: "Kenya & Tanzania",
    description:
      "Meet local communities, learn their traditions and explore the rich culture of East Africa.",
    tripType: "Cultural Tour",
    lodging: "Handpicked Stays",
    image:
      "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800&auto=format&fit=crop&q=80",
    price: 1620,
    active: false,
    route: ["Nairobi", "Maasai Village", "Arusha", "Lake Eyasi"],
    itinerary: [
      {
        title: "Nairobi Arrival & Bomas of Kenya",
        description: "Discover the music and dance of Kenya's many communities at Bomas of Kenya.",
        image: thumb("photo-1578895210405-907db486c111"),
      },
      {
        title: "Maasai Village Stay",
        description: "Live with a Maasai family, join the jumping dance and learn traditional beadwork.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Cross to Arusha Cultural Heritage Centre",
        description: "Drive into Tanzania and explore East African art, crafts and history.",
        image: thumb("photo-1544005313-94ddf0286df2"),
      },
      {
        title: "Mto wa Mbu Village Cycling",
        description: "Cycle through banana farms and markets, and share a home-cooked lunch.",
        image: thumb("photo-1514432324607-a09d9b4aefdd"),
      },
      {
        title: "Hadzabe Bushmen at Lake Eyasi",
        description: "Join one of Africa's last hunter-gatherer communities on a morning hunt.",
        image: thumb("photo-1540573133985-87b6da6d54a9"),
      },
      {
        title: "Departure",
        description: "Return to Arusha for your onward flight.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "Certified local cultural guides",
      "All village & community fees",
      "Ground transport",
      "Breakfast & dinner daily",
    ],
    exclusions: ["International flights", "Visas", "Personal souvenir purchases"],
  },
  {
    id: "8-day-rwanda",
    title: "8-Day Rwanda Adventure",
    category: "Gorilla Trekking",
    location: "Rwanda",
    description:
      "Explore volcanoes, lakes, wildlife and vibrant culture in the land of a thousand hills.",
    tripType: "Hiking & Wildlife",
    lodging: "Boutique Lodges",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80",
    price: 2750,
    active: true,
    route: ["Kigali", "Nyungwe NP", "Lake Kivu", "Volcanoes NP", "Kigali Departure"],
    itinerary: [
      {
        title: "Kigali City Tour",
        description: "Visit the Kigali Genocide Memorial, Kimironko market and Nyamirambo.",
        image: thumb("photo-1578895210405-907db486c111"),
      },
      {
        title: "Drive to Nyungwe Forest",
        description: "Scenic drive south via the King's Palace in Nyanza to Nyungwe.",
        image: thumb("photo-1540573133985-87b6da6d54a9"),
      },
      {
        title: "Chimpanzee Tracking & Canopy Walk",
        description: "Track chimpanzees at dawn, then walk the canopy walkway above the forest.",
        image: thumb("photo-1576487248805-acf45f536b43"),
      },
      {
        title: "Lake Kivu Coffee & Boat Trip",
        description: "Visit a coffee washing station and cruise to the islands of Lake Kivu.",
        image: thumb("photo-1514432324607-a09d9b4aefdd"),
      },
      {
        title: "Drive to Volcanoes NP",
        description: "Follow the Congo-Nile trail north to Musanze and the Virunga volcanoes.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Gorilla Trekking",
        description: "Spend an unforgettable hour with a mountain gorilla family.",
        image: thumb("photo-1576487248805-acf45f536b43"),
      },
      {
        title: "Mount Bisoke Crater Hike",
        description: "Climb to Bisoke's crater lake for views across the Virungas.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Return to Kigali & Departure",
        description: "Drive back to Kigali for your international flight.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "Gorilla & chimpanzee permits",
      "Boutique lodges with full board",
      "Private vehicle & guide",
      "Park entry fees",
    ],
    exclusions: ["International flights", "Visas", "Tips & gratuities"],
  },
  {
    id: "7-day-rwanda-luxury-villa",
    title: "7-Day Ultra-Luxury Rwanda Villa Escape",
    category: "Luxury Escapes",
    location: "Singita & One&Only Villas, Rwanda",
    description:
      "Private helicopter flights, dedicated villa butler service, heated plunge pools, private chefs and exclusive wildlife access.",
    tripType: "Gorilla & Safari",
    lodging: "Private Villas",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    price: 8850,
    active: true,
    route: ["Kigali", "Kinigi (Volcanoes)", "Akagera NP", "Kigali Departure"],
    itinerary: [
      {
        title: "VIP Helicopter Arrival & Kigali Retreat Villa",
        description:
          "Helicopter transfer from Kigali International Airport. Sommelier welcome reception and private spa massage.",
        image: thumb("photo-1582719478250-c89cae4dc85b"),
      },
      {
        title: "Scenic Flight to One&Only Gorilla's Nest",
        description:
          "Helicopter flight to Kinigi. Settle into your forest treehouse suite with a private plunge pool.",
        image: thumb("photo-1566073771259-6a8506099945"),
      },
      {
        title: "VIP Gorilla Trekking & In-Villa Sommelier Dining",
        description:
          "Private guided gorilla trekking, then a 5-course wine pairing dinner by your private chef.",
        image: thumb("photo-1576487248805-acf45f536b43"),
      },
      {
        title: "Singita Kwitonda & Kataza House Sanctuary",
        description:
          "Transfer to Singita Kwitonda Lodge with dedicated butler service and volcanic views.",
        image: thumb("photo-1582719478250-c89cae4dc85b"),
      },
      {
        title: "Wilderness Charter Flight to Magashi Camp",
        description:
          "Private charter to Akagera NP and a luxury tented suite overlooking Lake Rwanyakazinga.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Private Big Five Game Drive & Champagne Boat Cruise",
        description:
          "Exclusive sunrise Big Five game drive followed by a private sunset boat cruise.",
        image: thumb("photo-1534567153574-2b12153a87f0"),
      },
      {
        title: "Helicopter Return & VIP Airport Escort",
        description:
          "Farewell breakfast, scenic flight to Kigali and VIP lounge escort before departure.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
    ],
    inclusions: [
      "5-star luxury villa suites",
      "Private helicopter transfers",
      "All gourmet meals & vintage wine",
      "VIP gorilla trekking permits",
    ],
    exclusions: [
      "International long-haul flights",
      "Personal visa processing",
      "Premium imported champagne",
    ],
    perks: [
      "Dedicated private butler & sommelier",
      "Private heated plunge pool & spa valet",
      "Direct helicopter airport transfers",
      "Unlimited vintage wine & spirits",
    ],
  },
  {
    id: "7-day-rwanda-cultural",
    title: "7-Day Rwanda Cultural & Heritage Tour",
    category: "Cultural Tours",
    location: "Rwanda",
    description:
      "Royal drum ceremonies, Intore warrior dances, artisan workshops and meaningful community exchanges.",
    tripType: "Cultural Tour",
    lodging: "Handpicked Stays",
    image:
      "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800&auto=format&fit=crop&q=80",
    price: 2650,
    active: true,
    route: ["Kigali", "Nyanza & Huye", "Lake Kivu", "Musanze (Intore)"],
    itinerary: [
      {
        title: "Kigali Arrival & Heritage City Tour",
        description:
          "Meet your guide, visit Nyamirambo Women's Center and enjoy dinner with local hosts.",
        image: thumb("photo-1578895210405-907db486c111"),
      },
      {
        title: "Royal King's Palace & Nyanza Heritage",
        description:
          "Explore the ancient Royal Palace and meet the sacred horned Inyambo cattle.",
        image: thumb("photo-1540573133985-87b6da6d54a9"),
      },
      {
        title: "Ethnographic Museum & Imigongo Art Workshop",
        description:
          "Tour Huye Ethnographic Museum and create Imigongo art with local women cooperatives.",
        image: thumb("photo-1544005313-94ddf0286df2"),
      },
      {
        title: "Lake Kivu Arabica Coffee & Tea Trail",
        description:
          "Boat cruise to organic coffee plantations for a harvesting & roasting masterclass.",
        image: thumb("photo-1514432324607-a09d9b4aefdd"),
      },
      {
        title: "Iby'iwacu Cultural Village & Intore Dance",
        description:
          "Royal Intore warrior dances, drumming, archery and traditional medicine walks in Musanze.",
        image: thumb("photo-1516426122078-c23e76319801"),
      },
      {
        title: "Community Farming Day",
        description:
          "Work alongside a farming cooperative and share a traditional meal with your hosts.",
        image: thumb("photo-1547471080-7cc2caa01a7e"),
      },
      {
        title: "Inema Art Gallery & Departure",
        description:
          "Visit Kigali's contemporary art galleries and craft markets before your airport transfer.",
        image: thumb("photo-1580618672591-eb180b1a973f"),
      },
    ],
    inclusions: [
      "Certified local cultural guides",
      "All museum & village entry fees",
      "Traditional Intore dance show",
      "Imigongo workshop materials",
    ],
    exclusions: [
      "International flights",
      "Personal souvenir purchases",
      "Visas",
      "Gratuities for performers",
    ],
  },
];
