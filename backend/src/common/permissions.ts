import { ForbiddenException, SetMetadata } from '@nestjs/common';

// What each admin may open in the admin panel. The main admin (isOwner) has everything
// and is the only one who gives or removes access (Admin > Workers > Edit).
// The same list is on the website: lib/permissions.ts
export const PERMISSIONS = [
  'statistics', // Statistics (website visitors)
  'bookings', // Bookings, customers, booking conversations, the dashboard figures
  'calendar', // Calendar & reminders, the morning agenda email
  'departures', // Group departures
  'checkin', // Scanning tickets on the day
  'messages', // Messages from the contact form
  'packages', // Tour packages & quotations
  'trips', // Special trips and their bookings
  'destinations', // Destinations
  'reviews', // Reviews
  'gallery', // Gallery
  'workers', // Workers & roles
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  statistics: 'Statistics',
  bookings: 'Bookings & customers',
  calendar: 'Calendar',
  departures: 'Departures',
  checkin: 'Check-in',
  messages: 'Messages',
  packages: 'Tour packages & quotations',
  trips: 'Trips',
  destinations: 'Destinations',
  reviews: 'Reviews',
  gallery: 'Gallery',
  workers: 'Workers & roles',
};

export const ACCESS_KEY = 'access';
export const OWNER_KEY = 'ownerOnly';

// On a controller or a route, after @UseGuards(AdminGuard): the admin needs ONE of these.
// A route's own @Access replaces its controller's.
export const Access = (...keys: Permission[]) => SetMetadata(ACCESS_KEY, keys);

// Only the main admin (backups, activity log, jobs run by hand)
export const OwnerOnly = () => SetMetadata(OWNER_KEY, true);

type Who = { isOwner: boolean; permissions: string[] };

export const hasAccess = (worker: Who, keys: readonly string[]) =>
  worker.isOwner || keys.some((k) => worker.permissions.includes(k));

// Throws a 403 that says what is missing
export function checkAccess(worker: Who, ...keys: Permission[]) {
  if (hasAccess(worker, keys)) return;
  const names = keys.map((k) => PERMISSION_LABELS[k]).join(' or ');
  throw new ForbiddenException(
    `You do not have access to ${names}. Ask the main admin to give it to you.`,
  );
}

// Prisma filter: the active admins who should hear about something (emails, WhatsApp alerts)
export const adminsWithAccess = (key: Permission) => ({
  status: 'Active',
  OR: [{ isOwner: true }, { isAdmin: true, permissions: { has: key } }],
});

// Every area, in order, for a worker (the main admin has all of them)
export const accessOf = (worker: Who): Permission[] =>
  worker.isOwner
    ? [...PERMISSIONS]
    : PERMISSIONS.filter((k) => worker.permissions.includes(k));
