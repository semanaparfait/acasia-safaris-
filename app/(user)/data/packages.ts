// Shared tour package data (used by the Tours page and the home page)
export type TourPackage = {
  id: string;
  title: string;
  category: string;
  badge?: string;
  location: string;
  description: string;
  days: string;
  tripType: string;
  lodging: string;
  price: string;
  image: string;
};

export const packageList: TourPackage[] = [
  {
    id: "7-day-gorilla",
    title: "7-Day Gorilla Trekking Adventure",
    category: "Gorilla Trekking",
    badge: "POPULAR",
    location: "Rwanda & Uganda",
    description:
      "Get up close with the majestic mountain gorillas in their natural habitat. An unforgettable experience of a lifetime.",
    days: "7 Days",
    tripType: "Gorilla Trekking",
    lodging: "Luxury Lodges",
    price: "$2,450",
    image:
      "https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg",
  },
  {
    id: "5-day-wildlife",
    title: "5-Day Classic Wildlife Safari",
    category: "Wildlife Safari",
    location: "Tanzania – Serengeti & Ngorongoro",
    description:
      "Witness the Big Five and breathtaking landscapes of the Serengeti and Ngorongoro Crater.",
    days: "5 Days",
    tripType: "Wildlife Safari",
    lodging: "Comfort Lodges",
    price: "$1,850",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "10-day-luxury",
    title: "10-Day Luxury Safari Escape",
    category: "Luxury Escapes",
    location: "Kenya",
    description:
      "Indulge in world-class lodges, private game drives and breathtaking scenery. A perfect blend of comfort and adventure.",
    days: "10 Days",
    tripType: "Wildlife Safari",
    lodging: "Luxury Lodges",
    price: "$4,320",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "7-day-zanzibar",
    title: "7-Day Zanzibar Beach & Safari",
    category: "Wildlife Safari",
    badge: "BEST SELLER",
    location: "Tanzania",
    description:
      "Combine thrilling game drives with relaxing beach holidays on the spice island of Zanzibar.",
    days: "7 Days",
    tripType: "Safari + Beach",
    lodging: "Luxury Resorts",
    price: "$2,980",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "6-day-cultural",
    title: "6-Day Cultural Experiences",
    category: "Cultural Tours",
    location: "Kenya & Tanzania",
    description:
      "Meet local communities, learn their traditions and explore the rich culture of East Africa.",
    days: "6 Days",
    tripType: "Cultural Tour",
    lodging: "Handpicked Stays",
    price: "$1,620",
    image:
      "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "8-day-rwanda",
    title: "8-Day Rwanda Adventure",
    category: "Gorilla Trekking",
    location: "Rwanda",
    description:
      "Explore volcanoes, lakes, wildlife and vibrant culture in the land of a thousand hills.",
    days: "8 Days",
    tripType: "Hiking & Wildlife",
    lodging: "Boutique Lodges",
    price: "$2,750",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80",
  },
];
