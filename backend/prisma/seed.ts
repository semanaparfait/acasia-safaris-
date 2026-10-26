// Fills the database with the starting data from seed-data.ts.
// Run with:  npm run db:seed
// Safe to run again: existing rows are updated, not duplicated.
// Ids are UUIDs made by the database, so packages and destinations are matched by title.
import { PrismaClient } from '@prisma/client';
import { destinations, gallery, packages, reviews, workers } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  for (const { itinerary, ...pkg } of packages) {
    const days = itinerary.map((d, index) => ({ ...d, day: index + 1 }));
    const data = { ...pkg, perks: pkg.perks ?? [] };

    const existing = await prisma.package.findFirst({
      where: { title: pkg.title },
    });
    if (existing) {
      await prisma.package.update({
        where: { id: existing.id },
        data: { ...data, itinerary: { deleteMany: {}, create: days } },
      });
    } else {
      await prisma.package.create({
        data: { ...data, itinerary: { create: days } },
      });
    }
  }
  console.log(`✔ ${packages.length} packages`);

  for (const destination of destinations) {
    const existing = await prisma.destination.findFirst({
      where: { title: destination.title },
    });
    if (existing) {
      await prisma.destination.update({
        where: { id: existing.id },
        data: destination,
      });
    } else {
      await prisma.destination.create({ data: destination });
    }
  }
  console.log(`✔ ${destinations.length} destinations`);

  for (const worker of workers) {
    const data = { ...worker, joined: new Date(worker.joined) };
    await prisma.worker.upsert({
      where: { email: worker.email },
      create: data,
      update: data,
    });
  }
  console.log(`✔ ${workers.length} workers`);

  // Reviews and gallery have no natural unique key, so only add them to an empty table
  if ((await prisma.review.count()) === 0) {
    await prisma.review.createMany({ data: reviews });
    console.log(`✔ ${reviews.length} reviews`);
  }

  if ((await prisma.galleryItem.count()) === 0) {
    // Reversed so the first photo in the list is the newest (shown first)
    for (const item of [...gallery].reverse()) {
      await prisma.galleryItem.create({ data: item });
    }
    console.log(`✔ ${gallery.length} gallery photos`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
