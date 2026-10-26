// Mock data for the admin panel – replace with API calls once the backend exists.
import { packageList, type TourPackage } from "@/app/(user)/data/packages";
import { destinations } from "@/app/(user)/data/destinations";

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Deposit" | "Paid" | "Refunded";

export type Booking = {
  id: string;
  customer: string;
  email: string;
  country: string;
  packageId: string;
  packageTitle: string;
  startDate: string;
  endDate: string;
  travelers: number;
  amount: number;
  status: BookingStatus;
  payment: PaymentStatus;
  createdAt: string;
  notes?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  trips: number;
  spent: number;
  joined: string;
  vip?: boolean;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  receivedAt: string;
  read: boolean;
  starred?: boolean;
  source: "Contact form" | "Booking request" | "WhatsApp";
};

export type Review = {
  id: string;
  name: string;
  country: string;
  rating: number;
  packageTitle: string;
  text: string;
  date: string;
  status: "Published" | "Pending" | "Hidden";
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  uploadedAt: string;
};

export type AdminPackage = TourPackage & {
  priceValue: number;
  active: boolean;
  bookings: number;
};

export const adminPackages: AdminPackage[] = packageList.map((p, i) => ({
  ...p,
  priceValue: Number(p.price.replace(/[^0-9]/g, "")),
  active: i !== 4,
  bookings: [42, 31, 18, 27, 12, 23][i] ?? 10,
}));

export const adminDestinations = destinations.map((d, i) => ({
  id: d.id,
  title: d.title,
  group: d.group,
  location: d.location,
  image: d.image,
  bestTime: d.bestTime,
  fromKigali: d.fromKigali,
  highlights: d.highlights,
  featured: i < 4,
  visitors: [1240, 860, 640, 520, 470, 390, 350, 300, 280, 210][i] ?? 150,
}));

export type AdminDestination = (typeof adminDestinations)[number];

const people = [
  ["Emma Johnson", "United States"],
  ["Lukas Müller", "Germany"],
  ["Aisha Bello", "Nigeria"],
  ["Sophie Martin", "France"],
  ["James Carter", "United Kingdom"],
  ["Yuki Tanaka", "Japan"],
  ["Carlos Rivera", "Spain"],
  ["Grace Uwase", "Rwanda"],
  ["Olivia Brown", "Canada"],
  ["Noah Williams", "Australia"],
  ["Amara Okafor", "Kenya"],
  ["Liam Smith", "Ireland"],
  ["Mia Rossi", "Italy"],
  ["Daniel Kim", "South Korea"],
] as const;

const statuses: BookingStatus[] = [
  "Confirmed", "Pending", "Completed", "Confirmed", "Cancelled", "Pending",
  "Confirmed", "Completed", "Pending", "Confirmed", "Completed", "Confirmed",
  "Pending", "Completed",
];
const payments: Record<BookingStatus, PaymentStatus> = {
  Pending: "Unpaid",
  Confirmed: "Deposit",
  Completed: "Paid",
  Cancelled: "Refunded",
};

const email = (name: string) =>
  name.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").replace(" ", ".") + "@mail.com";

export const bookings: Booking[] = people.map(([name, country], i) => {
  const pkg = adminPackages[i % adminPackages.length];
  const travelers = (i % 4) + 1;
  const start = new Date(2026, 10 + Math.floor(i / 5), 3 + ((i * 7) % 24));
  const end = new Date(start);
  end.setDate(start.getDate() + parseInt(pkg.days));
  const created = new Date(2026, 9, 26 - i * 2);
  return {
    id: `BK-${(1048 - i).toString()}`,
    customer: name,
    email: email(name),
    country,
    packageId: pkg.id,
    packageTitle: pkg.title,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    travelers,
    amount: pkg.priceValue * travelers,
    status: statuses[i],
    payment: payments[statuses[i]],
    createdAt: created.toISOString(),
    notes: i % 3 === 0 ? "Vegetarian meals requested. Prefers early morning game drives." : undefined,
  };
});

export const customers: Customer[] = people.map(([name, country], i) => ({
  id: `CU-${300 + i}`,
  name,
  email: email(name),
  phone: `+${[1, 49, 234, 33, 44, 81, 34, 250, 1, 61, 254, 353, 39, 82][i]} ${700 + i * 13} ${4100 + i * 37}`,
  country,
  trips: (i % 3) + 1,
  spent: bookings[i].amount * ((i % 3) + 1),
  joined: new Date(2025, i % 12, 4 + i).toISOString(),
  vip: i % 4 === 0,
}));

export const messages: Message[] = [
  {
    id: "m1",
    name: "Hannah Lee",
    email: "hannah.lee@mail.com",
    subject: "Gorilla permits for December",
    body: "Hi! We are a family of four planning to visit Rwanda in late December. Are gorilla permits still available for the 27th? Our kids are 15 and 17. Thank you!",
    receivedAt: "2026-10-26T08:12:00",
    read: false,
    starred: true,
    source: "Contact form",
  },
  {
    id: "m2",
    name: "Marco Bianchi",
    email: "marco.b@mail.com",
    subject: "Honeymoon package customisation",
    body: "Ciao, we loved the 10-Day Luxury Safari Escape. Could you add two nights at Lake Kivu and a private dinner? Budget is flexible.",
    receivedAt: "2026-10-25T17:40:00",
    read: false,
    source: "Booking request",
  },
  {
    id: "m3",
    name: "Fatima Diallo",
    email: "fatima.d@mail.com",
    subject: "Airport pickup",
    body: "Hello, my flight lands at Kigali at 23:45 on Nov 12. Do you offer late-night airport pickup to our lodge?",
    receivedAt: "2026-10-25T09:05:00",
    read: true,
    source: "WhatsApp",
  },
  {
    id: "m4",
    name: "Peter Novak",
    email: "p.novak@mail.com",
    subject: "Group discount for 12 people",
    body: "We are a hiking club of 12 people interested in Volcano Hiking and Nyungwe. Do you offer group pricing? Dates are flexible in June.",
    receivedAt: "2026-10-24T14:22:00",
    read: true,
    starred: true,
    source: "Contact form",
  },
  {
    id: "m5",
    name: "Chloé Dubois",
    email: "chloe.dubois@mail.com",
    subject: "Visa question",
    body: "Bonjour, do French citizens need a visa beforehand or can we get it on arrival? Merci!",
    receivedAt: "2026-10-23T11:30:00",
    read: true,
    source: "Contact form",
  },
  {
    id: "m6",
    name: "Samuel Osei",
    email: "samuel.osei@mail.com",
    subject: "Photography safari",
    body: "I'm a wildlife photographer looking for a 6–8 day trip with long game drives in Akagera. Can you arrange a vehicle with a roof hatch?",
    receivedAt: "2026-10-22T19:48:00",
    read: true,
    source: "Booking request",
  },
];

export const reviews: Review[] = [
  { id: "r1", name: "Emma Johnson", country: "United States", rating: 5, packageTitle: "7-Day Gorilla Trekking Adventure", text: "Absolutely life-changing. Our guide Eric knew every gorilla by name. Lodges were stunning.", date: "2026-10-20", status: "Published" },
  { id: "r2", name: "Lukas Müller", country: "Germany", rating: 5, packageTitle: "5-Day Classic Wildlife Safari", text: "Perfectly organised from airport pickup to the last game drive. We saw lions on day one!", date: "2026-10-18", status: "Published" },
  { id: "r3", name: "Sophie Martin", country: "France", rating: 4, packageTitle: "6-Day Cultural Experiences", text: "Beautiful cultural visits and warm people. One transfer ran a bit late but the team handled it well.", date: "2026-10-15", status: "Pending" },
  { id: "r4", name: "Yuki Tanaka", country: "Japan", rating: 5, packageTitle: "10-Day Luxury Safari Escape", text: "Luxury in every detail. The private dinner by the lake was the highlight of our honeymoon.", date: "2026-10-12", status: "Pending" },
  { id: "r5", name: "James Carter", country: "United Kingdom", rating: 3, packageTitle: "8-Day Rwanda Adventure", text: "Great hikes but the itinerary felt rushed on days 4–5. Would love a slower pace option.", date: "2026-10-09", status: "Hidden" },
  { id: "r6", name: "Grace Uwase", country: "Rwanda", rating: 5, packageTitle: "7-Day Zanzibar Beach & Safari", text: "The perfect combination of adventure and relaxation. Highly recommend Acacia Safaris!", date: "2026-10-05", status: "Published" },
];

export const gallery: GalleryItem[] = [
  ...adminPackages.map((p) => ({ id: `g-${p.id}`, title: p.title, category: p.category, image: p.image, uploadedAt: "2026-10-01" })),
  ...adminDestinations.slice(0, 6).map((d) => ({ id: `g-${d.id}`, title: d.title, category: d.group, image: d.image, uploadedAt: "2026-09-18" })),
];

// Monthly revenue (USD) and bookings for the last 12 months
export const monthlyStats = [
  { month: "Nov", revenue: 38200, bookings: 14 },
  { month: "Dec", revenue: 52400, bookings: 21 },
  { month: "Jan", revenue: 47100, bookings: 18 },
  { month: "Feb", revenue: 41800, bookings: 16 },
  { month: "Mar", revenue: 29600, bookings: 11 },
  { month: "Apr", revenue: 24300, bookings: 9 },
  { month: "May", revenue: 33900, bookings: 13 },
  { month: "Jun", revenue: 61200, bookings: 24 },
  { month: "Jul", revenue: 74800, bookings: 29 },
  { month: "Aug", revenue: 79300, bookings: 31 },
  { month: "Sep", revenue: 66500, bookings: 26 },
  { month: "Oct", revenue: 58700, bookings: 23 },
];

export const activity = [
  { id: "a1", text: "New booking request from Hannah Lee", time: "12 min ago", type: "booking" },
  { id: "a2", text: "Emma Johnson left a 5★ review", time: "1 hr ago", type: "review" },
  { id: "a3", text: "Payment received for BK-1046 ($5,550)", time: "3 hrs ago", type: "payment" },
  { id: "a4", text: "BK-1044 was cancelled by customer", time: "Yesterday", type: "cancel" },
  { id: "a5", text: "Package “8-Day Rwanda Adventure” updated", time: "2 days ago", type: "update" },
] as const;

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
