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
  price: number; // USD per person (admin only, not shown on the website)
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

export type Worker = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // name of a Role
  languages: string[];
  status: WorkerStatus;
  joined: string;
  notes?: string | null;
  photo?: string | null;
  isAdmin: boolean; // second role: can log in to the admin panel
  isOwner?: boolean; // the main admin: cannot be deleted, manages the other admins
  hasPassword?: boolean; // the password itself is never sent to the browser
};

// What the admin form sends. "password" is only sent when setting a new one.
export type WorkerInput = Omit<Worker, "id" | "hasPassword" | "isOwner"> & { password?: string };

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Deposit" | "Paid" | "Refunded";

export type Booking = {
  id: string;
  customer: string;
  email: string;
  phone?: string | null;
  country: string;
  packageId: string | null;
  package: { id: string; title: string } | null;
  startDate: string;
  endDate: string;
  travelers: number;
  amount: number;
  status: BookingStatus;
  payment: PaymentStatus;
  notes?: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  body: string;
  source: "Contact form" | "Booking request" | "WhatsApp";
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
