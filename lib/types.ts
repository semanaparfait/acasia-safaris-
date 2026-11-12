// Shapes of the data the API returns (see backend/prisma/schema.prisma).
// Every id is a UUID string, e.g. "3f2a9c1e-5b7d-4e2a-9c1e-5b7d4e2a9c1e".
// Dates arrive as ISO strings, e.g. "2026-12-01T00:00:00.000Z".

export type ItineraryDay = {
  id?: string;
  day?: number; // 1, 2, 3 ... (set by the server from the order)
  title: string;
  description: string;
  image: string;
};

// One row of the prices table in the quotation PDF
export type Rate = { label: string; ages: string; price: number };

export type TourPackage = {
  id: string;
  title: string;
  category: string;
  badge?: string | null;
  location: string;
  description: string;
  tripType: string;
  lodging: string;
  image: string;
  price: number; // USD per adult (shown in the quotation and when booking)
  minPrice?: number | null; // lowest adult price accepted when bargaining (admins only, never sent to the website)
  quotation?: string | null; // URL of the quotation PDF
  quotationManual?: boolean; // true = the admin uploaded it, false = made from the package
  rates?: Rate[] | null; // prices in the PDF; empty = defaultRates in helpers.ts
  fairPrice: string[]; // reasons for "Why this price is fair"
  whyChoose: string[]; // reasons for "Why people choose this trip"
  active: boolean; // false = draft, hidden from the website
  route: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  perks: string[];
};

// What the admin form sends when creating or editing a package
export type PackageInput = Omit<TourPackage, "id">;

export type Destination = {
  id: string;
  title: string;
  description: string;
  group: string;
  location: string;
  image: string;
  highlights: string[];
  bestTime: string;
  fromKigali: string;
  featured: boolean;
  // Choices on the booking form. Empty = the defaults for the group (see tripOptions in helpers.ts).
  travelStyles: string[];
  accommodations: string[];
  budgets: string[];
};

export type DestinationInput = Omit<Destination, "id">;

// Worker roles are managed in Admin > Roles
export type Role = {
  id: string;
  name: string; // e.g. "Tour Guide"
  description: string;
  workerCount?: number; // how many workers have this role
};

export type RoleInput = { name: string; description: string };
export type WorkerStatus = "Active" | "On leave" | "Inactive";

export type SocialNetwork = "youtube" | "instagram" | "x" | "tiktok" | "snapchat" | "facebook";
export type Socials = Partial<Record<SocialNetwork, string>>; // full links, only the ones used

export type Worker = {
  id: string;
  name: string;
  email: string; // company email, made from the first name (e.g. jean@acaciasafaris.com). Used to log in
  personalEmail?: string | null; // the worker's own email: the forgot-password code is sent here
  phone: string;
  role: string; // name of a Role
  languages: string[];
  status: WorkerStatus;
  joined: string;
  notes?: string | null; // private, admins only
  photo?: string | null;
  // About us page
  showOnWebsite?: boolean;
  companyRole?: string | null; // title on the website, e.g. "CEO & Founder"
  bio?: string | null; // shown to visitors
  socials?: Socials;
  isAdmin: boolean; // second role: can log in to the admin panel
  isOwner?: boolean; // the main admin: cannot be deleted, manages the other admins
  hasPassword?: boolean; // the password itself is never sent to the browser
};

// What the admin form sends. "password" is only sent when setting a new one.
// The company email is not sent: the server makes it from the first name.
export type WorkerInput = Omit<Worker, "id" | "hasPassword" | "isOwner" | "email" | "personalEmail"> & {
  personalEmail: string;
  password?: string;
};

// A worker as visitors see them on the About us page (GET /api/team)
export type TeamMember = {
  id: string;
  name: string;
  companyRole: string | null;
  photo: string | null;
  bio: string | null;
  personalEmail: string | null;
  phone: string;
  languages: string[];
  socials: Socials;
};

export type BookingStatus = "Pending" | "Negotiating" | "Confirmed" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Deposit" | "Paid" | "Refunded";

// One destination of a booking, with what the visitor chose for it
export type BookingDestination = {
  id?: string;
  title: string;
  travelStyle: string;
  accommodation: string;
  budget: string;
};

export type Booking = {
  id: string;
  customer: string;
  email: string;
  phone?: string | null;
  country: string;
  packageId: string | null;
  package: { id: string; title: string } | null;
  destinations: BookingDestination[]; // empty for a package booking
  startDate: string;
  endDate: string;
  travelers: number; // adults + children
  children: number;
  amount: number; // 0 until the admin sets the price of a destination trip
  status: BookingStatus;
  payment: PaymentStatus;
  notes?: string | null;
  createdAt: string;

  // Price and bargaining
  guests?: Guest[] | null; // package bookings: travelers per price group
  listAmount: number; // the full price when booked
  floorAmount?: number | null; // lowest total the team accepts (admins only)
  offer?: number | null; // a price proposal waiting for an answer
  offerBy?: "customer" | "team" | null; // who made it
  needsReply?: boolean; // the customer wrote last
  accessToken?: string; // the visitor's link: /my-booking/<accessToken>
  messages: BookingMessage[];

  // Ticket: made when the booking is confirmed (QR code in the email and on the booking page)
  ticketCode?: string | null;
  checkedInAt?: string | null; // when the QR code was scanned in Admin > Check-in
  reviewedAt?: string | null; // the traveler reviewed the trip from their booking page
};

// Travelers in one price group of a package, e.g. 2 adults at $1,450
export type Guest = { label: string; ages: string; count: number; price: number };

// One message of the conversation on a booking
export type BookingMessage = {
  id: string;
  sender: "customer" | "team";
  authorName: string;
  text: string;
  offer?: number | null; // a price proposed with this message
  event?: "offer" | "accepted" | null;
  createdAt: string;
};

// What a visitor sees on their booking page (GET /api/bookings/track/<token>)
export type PublicBooking = Omit<
  Booking,
  "phone" | "packageId" | "package" | "notes" | "floorAmount" | "needsReply" | "accessToken"
> & {
  package: { id: string; title: string; image: string; location: string; _count: { itinerary: number } } | null;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  body: string;
  source: "Contact form" | "Booking request" | "WhatsApp" | "Quotation request" | "Newsletter";
  read: boolean;
  starred: boolean;
  receivedAt: string;
};

export type MessageInput = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  body: string;
  source?: Message["source"];
};

export type ReviewStatus = "Pending" | "Published" | "Hidden";

export type Review = {
  id: string;
  name: string;
  country: string;
  rating: number;
  packageTitle?: string | null;
  text: string;
  status: ReviewStatus;
  createdAt: string;
};

export const galleryCategories = ["Wildlife", "Landscapes", "Culture", "People"] as const;

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  location?: string | null;
  image: string;
  createdAt: string;
};

export type GalleryInput = Omit<GalleryItem, "id" | "createdAt">;

// Storage buckets in Neon (see backend/src/storage/storage.service.ts)
export type Bucket = "tourpackages" | "destinations" | "gallery" | "workers";
