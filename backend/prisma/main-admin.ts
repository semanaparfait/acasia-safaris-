// Inserts (or updates) the main admin from backend/.env:
//   OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD, OWNER_PHONE
// Run with:  npm run admin:main
// Only touches the main admin, no other data.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// The main admin can log in, cannot be deleted, and manages the other admins.
// Running it again updates their password; a new email moves the role to that person.
async function main() {
  const name = process.env.OWNER_NAME?.trim();
  const email = process.env.OWNER_EMAIL?.toLowerCase().trim();
  const password = process.env.OWNER_PASSWORD ?? '';
  const phone = process.env.OWNER_PHONE?.trim() ?? '';

  if (!email || !password) {
    throw new Error('Set OWNER_EMAIL and OWNER_PASSWORD in backend/.env first');
  }
  if (password.length < 8) {
    throw new Error('OWNER_PASSWORD must be at least 8 characters');
  }

  const passwordHash = await hash(password, 10);
  const admin = {
    isAdmin: true,
    isOwner: true,
    status: 'Active',
    passwordHash,
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
  };

  await prisma.worker.upsert({
    where: { email },
    update: admin,
    create: {
      ...admin,
      email,
      name: name || email,
      phone,
      role: 'Admin',
      languages: [],
    },
  });
  // Only one main admin
  await prisma.worker.updateMany({
    where: { isOwner: true, email: { not: email } },
    data: { isOwner: false },
  });
  console.log(
    `✔ Main admin: ${email}. Log in at http://localhost:3000/admin/login`,
  );
}

main()
  .catch((error: Error) => {
    console.error('✖ ' + error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
