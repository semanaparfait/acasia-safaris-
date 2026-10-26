// Fills the database with the starting data from seed-data.ts.
// Run with:  npm run db:seed
// Safe to run again: existing rows are updated, not duplicated.
import { PrismaClient } from '@prisma/client';
import { destinations, packages, workers } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  for (const { itinerary, ...pkg } of packages) {
    const days = itinerary.map((d, index) => ({ ...d, day: index + 1 }));
    const data = { ...pkg, perks: pkg.perks ?? [] };

    await prisma.package.upsert({
      where: { id: pkg.id },
      create: { ...data, itinerary: { create: days } },
      update: { ...data, itinerary: { deleteMany: {}, create: days } },
    });
  }
  console.log(`✔ ${packages.length} packages`);

  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: { id: destination.id },
      create: destination,
      update: destination,
    });
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
