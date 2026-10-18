import type React from "react";
import { PawPrint, Mountain, Trees, Waves, Landmark, Bird, Zap, Gem, Flower2 } from "lucide-react";

export type Destination = {
  id: string;
  title: string;
  description: string;
  group: string;
  icon: React.ElementType;
  location: string;
  image: string;
  highlights: string[];
  bestTime: string;
  fromKigali: string;
};

export const PIN = "https://i.pinimg.com/1200x";
const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const destinations: Destination[] = [
  {
    id: "gorillas",
    title: "Gorilla Trekking",
    description: "Spend an unforgettable hour with a wild mountain gorilla family in the misty bamboo forests.",
    group: "Wildlife",
    icon: PawPrint,
    location: "Volcanoes National Park",
    image: `${PIN}/68/01/19/6801199e33bc9eaa9f4777a21ee25a45.jpg`,
    highlights: ["Gorilla families", "Golden monkeys", "Dian Fossey hike"],
    bestTime: "Jun – Sep, Dec – Feb",
    fromKigali: "2.5 hrs",
  },
  {
    id: "wildlife",
    title: "Wildlife Safari",
    description: "Rwanda's Big Five savannah, with lions, elephants and rhinos roaming open plains and lakes.",
    group: "Wildlife",
    icon: PawPrint,
    location: "Akagera National Park",
    image: `${PIN}/2b/aa/0f/2baa0f0b1c59deec862d2a8a6b300ae8.jpg`,
    highlights: ["Big Five", "Boat safari", "Night drives"],
    bestTime: "Jun – Sep",
    fromKigali: "2.5 hrs",
  },
  {
    id: "rainforest",
    title: "Rainforest",
    description: "One of Africa's oldest rainforests, home to chimpanzees and a thrilling canopy walkway.",
    group: "Nature",
    icon: Trees,
    location: "Nyungwe National Park",
    image: `${PIN}/0f/84/de/0f84dec8e96fc7763eb982ef71295fe8.jpg`,
    highlights: ["Canopy walkway", "Chimpanzees", "Waterfall trail"],
    bestTime: "Jun – Sep",
    fromKigali: "5 hrs",
  },
  {
    id: "lakes",
    title: "Lakes",
    description: "Relax on sandy shores, explore islands by boat and watch the sunset over calm waters.",
    group: "Nature",
    icon: Waves,
    location: "Rubavu · Karongi · Muhazi · Bugesera",
    image: `${PIN}/51/a9/a8/51a9a84199c37fc7ade67a32a8b6df39.jpg`,
    highlights: ["Island boat trips", "Beaches", "Kayaking"],
    bestTime: "All year",
    fromKigali: "1 – 3.5 hrs",
  },
  {
    id: "volcanoes",
    title: "Volcano Hiking",
    description: "Climb dormant volcanoes for crater lakes, alpine meadows and views across the Virungas.",
    group: "Nature",
    icon: Mountain,
    location: "Bisoke · Karisimbi · Muhabura",
    image: "https://i.pinimg.com/736x/f9/9e/2f/f99e2fdce5cee014a440d0ee3eedce76.jpg",
    highlights: ["Bisoke crater lake", "Karisimbi summit", "Twin lakes view"],
    bestTime: "Jun – Sep, Dec – Feb",
    fromKigali: "2.5 hrs",
  },
  {
    id: "culture",
    title: "Cultural Heritage",
    description: "Step into Rwanda's royal past at the traditional King's Palace in Nyanza.",
    group: "Culture",
    icon: Landmark,
    location: "King's Palace, Nyanza",
    image: `${PIN}/80/8d/91/808d91821c1f5c2342c222215223cbc6.jpg`,
    highlights: ["Royal palace", "Inyambo cattle", "Intore dance"],
    bestTime: "All year",
    fromKigali: "2 hrs",
  },
  {
    id: "memorials",
    title: "Memorial Sites",
    description: "Pay respect to the victims of the 1994 Genocide against the Tutsi and learn Rwanda's story of renewal.",
    group: "Culture",
    icon: Flower2,
    location: "Kigali · Nyamata · Murambi",
    image: UNSPLASH("photo-1516410529446-2c777cb7366d"),
    highlights: ["Kigali Genocide Memorial", "Nyamata", "Murambi"],
    bestTime: "All year",
    fromKigali: "In & near Kigali",
  },
  {
    id: "birds",
    title: "Birdwatching",
    description: "Over 700 species, from Kigali's urban wetlands to rare Albertine Rift endemics.",
    group: "Wildlife",
    icon: Bird,
    location: "Nyandungu · Akagera · Nyungwe",
    image: UNSPLASH("photo-1444464666168-49d633b86797"),
    highlights: ["700+ species", "Shoebill", "Rift endemics"],
    bestTime: "Nov – Apr",
    fromKigali: "From 20 min",
  },
  {
    id: "adventure",
    title: "Adventure",
    description: "Get your heart racing with zip-lining, mountain biking and kayaking across the country.",
    group: "Adventure",
    icon: Zap,
    location: "Across Rwanda",
    image: UNSPLASH("photo-1530866495561-507c9faab2ed"),
    highlights: ["Zip-line", "Mountain biking", "Kayaking"],
    bestTime: "Jun – Sep, Dec – Feb",
    fromKigali: "Varies",
  },
  {
    id: "luxury",
    title: "Luxury Retreats",
    description: "Hand-picked luxury lodges, lakeside resorts and boutique hotels to match your journey.",
    group: "Luxury",
    icon: Gem,
    location: "Lodges · Resorts · Kigali",
    image: UNSPLASH("photo-1582719478250-c89cae4dc85b"),
    highlights: ["Eco-lodges", "Lakeside resorts", "5-star hotels"],
    bestTime: "All year",
    fromKigali: "Countrywide",
  },
];
