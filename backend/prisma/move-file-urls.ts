// The API moved to a new address: uploaded photos and PDFs are saved in the database with
// the OLD address in their URL (https://old-host/api/files/<bucket>/<key>). This replaces it
// with the new one everywhere: every text, text list and JSON column of every table.
//
//   npm run db:move-urls -- https://acacia-api.onrender.com https://new-api.example.com
//
// Dry run first (shows what would change, changes nothing):
//   npm run db:move-urls -- https://acacia-api.onrender.com https://new-api.example.com --dry
//
// Uses DATABASE_URL (run it where that points to the live database, e.g. on the server).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clean = (url: string | undefined) => {
  const value = url?.trim().replace(/\/+$/, '') ?? '';
  if (!/^https?:\/\/[^/\s]+$/.test(value)) {
    throw new Error(
      `"${url}" is not an address like https://example.com (no path)`,
    );
  }
  return value;
};

async function main() {
  const [, , oldArg, newArg, flag] = process.argv;
  const from = clean(oldArg);
  const to = clean(newArg);
  const dry = flag === '--dry';
  if (from === to) throw new Error('The old and new addresses are the same');

  // Every column that can hold a URL: text, varchar, text[] and jsonb, in the app's tables
  const columns = await prisma.$queryRaw<
    { table: string; column: string; type: string }[]
  >`SELECT table_name AS "table", column_name AS "column", udt_name AS "type"
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name <> '_prisma_migrations'
      AND udt_name IN ('text', 'varchar', '_text', '_varchar', 'jsonb', 'json')`;

  const like = `%${from}/api/files/%`;
  let total = 0;
  for (const { table, column, type } of columns) {
    const t = `"${table.replace(/"/g, '""')}"`;
    const c = `"${column.replace(/"/g, '""')}"`;
    // Lists and JSON are compared as text, then rebuilt with the new address
    const asText =
      type.startsWith('_') || type.startsWith('json') ? `${c}::text` : c;
    const rebuilt = type.startsWith('_')
      ? `ARRAY(SELECT replace(x, $1, $2) FROM unnest(${c}) AS x)`
      : type.startsWith('json')
        ? `replace(${c}::text, $1, $2)::${type}`
        : `replace(${c}, $1, $2)`;

    const [{ count }] = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT count(*) AS count FROM ${t} WHERE ${asText} LIKE $1`,
      like,
    );
    if (!count) continue;
    total += Number(count);
    console.log(`${table}.${column}: ${count} row(s)`);
    if (!dry) {
      // Only the "/api/files/" part is replaced, so other links to the old host stay as they are
      await prisma.$executeRawUnsafe(
        `UPDATE ${t} SET ${c} = ${rebuilt} WHERE ${asText} LIKE $3`,
        `${from}/api/files/`,
        `${to}/api/files/`,
        like,
      );
    }
  }
  console.log(
    total === 0
      ? `Nothing points to ${from} any more.`
      : dry
        ? `${total} row(s) would change (dry run: nothing changed).`
        : `Done: ${total} row(s) now use ${to}.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
