// Opens a database backup (Admin > Backups > Download) and, if asked, loads it into a database.
//
//   npm run db:restore -- path/to/acacia-2026-11-12T02-15-00Z.acb --check
//       Only opens it and shows what is inside. Changes nothing. Do this once a month
//       to be sure the backups (and your BACKUP_ENCRYPTION_KEY) really work.
//
//   npm run db:restore -- path/to/acacia-....acb
//       Loads it into the database in DATABASE_URL. That database must be EMPTY:
//       best is a new Neon branch or database, set up first with  npx prisma migrate deploy
//       Then point the API (DATABASE_URL / DIRECT_URL) to it.
//
// Needs BACKUP_ENCRYPTION_KEY in backend/.env (the same one that made the backup).
import 'dotenv/config';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import {
  SAFE_TABLE,
  backupKey,
  checkCounts,
  loadOrder,
  unpackBackup,
} from '../src/backups/backup-file';

async function main() {
  const args = process.argv.slice(2);
  const path = args.find((a) => !a.startsWith('--'));
  const checkOnly = args.includes('--check');
  if (!path)
    throw new Error(
      'Give the backup file: npm run db:restore -- <file> [--check]',
    );

  const data = unpackBackup(
    readFileSync(path),
    backupKey(process.env.BACKUP_ENCRYPTION_KEY ?? ''),
  );
  const rows = checkCounts(data);
  console.log(
    `Backup made ${data.createdAt}, database version ${data.migration ?? 'unknown'}`,
  );
  for (const [table, count] of Object.entries(data.counts))
    console.log(`  ${table.padEnd(20)} ${count}`);
  console.log(
    `  ${'TOTAL'.padEnd(20)} ${rows} rows: the file is complete and readable.`,
  );
  if (checkOnly) return;

  const prisma = new PrismaClient();
  try {
    const [{ name: target } = { name: null }] = await prisma.$queryRawUnsafe<
      { name: string }[]
    >(
      `SELECT migration_name AS name FROM _prisma_migrations
       WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1`,
    );
    if (target !== data.migration) {
      throw new Error(
        `The database is at version "${target}" but the backup is "${data.migration}". ` +
          "Run the migrations up to the backup's version first (or use the code from that date).",
      );
    }

    const tables = Object.keys(data.tables);
    for (const t of tables)
      if (!SAFE_TABLE.test(t)) throw new Error(`Unexpected table name "${t}"`);

    // Never on top of existing data
    for (const t of tables) {
      const [{ n }] = await prisma.$queryRawUnsafe<{ n: number }[]>(
        `SELECT count(*)::int AS n FROM "${t}"`,
      );
      if (n > 0)
        throw new Error(
          `Table "${t}" is not empty: restore only into an empty database`,
        );
    }

    // Links between tables, so a row is loaded after the rows it points to
    const links = await prisma.$queryRawUnsafe<{ from: string; to: string }[]>(
      `SELECT c.conrelid::regclass::text AS "from", c.confrelid::regclass::text AS "to"
       FROM pg_constraint c WHERE c.contype = 'f' AND c.connamespace = current_schema()::regnamespace`,
    );
    const clean = (name: string) => name.replace(/"/g, '');
    const order = loadOrder(
      tables,
      links.map((l) => [clean(l.from), clean(l.to)]),
    );

    await prisma.$transaction(
      async (tx) => {
        for (const t of order) {
          if (!data.tables[t].length) continue;
          await tx.$executeRawUnsafe(
            `INSERT INTO "${t}" SELECT * FROM json_populate_recordset(NULL::"${t}", $1::json)`,
            JSON.stringify(data.tables[t]),
          );
          console.log(`Loaded ${t}`);
        }
      },
      { timeout: 600_000, maxWait: 10_000 },
    );
    console.log(`Done: ${rows} rows restored.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
