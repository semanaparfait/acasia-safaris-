// The backup file format, shared by the server (BackupsService) and the restore script
// (prisma/restore-backup.ts). No database or network here, so it is easy to test.
//
// A backup file = "ACB1" + iv (12 bytes) + auth tag (16 bytes) + AES-256-GCM( gzip( JSON ) )
// The JSON: { format, version, createdAt, migration, counts: { Table: rows }, tables: { Table: [...] } }
// Without the encryption key the file cannot be read, and any change to it is detected.
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { gunzipSync, gzipSync } from 'zlib';

const MAGIC = Buffer.from('ACB1');
const IV_BYTES = 12;
const TAG_BYTES = 16;

export type BackupData = {
  format: 'acacia-backup';
  version: 1;
  createdAt: string;
  migration: string | null; // the last database migration applied when it was made
  counts: Record<string, number>;
  tables: Record<string, unknown[]>;
};

// The 32-byte key, made from BACKUP_ENCRYPTION_KEY (any long random text)
export function backupKey(secret: string) {
  if (secret.trim().length < 32) {
    throw new Error(
      'BACKUP_ENCRYPTION_KEY must be at least 32 characters long',
    );
  }
  return createHash('sha256').update(secret.trim()).digest();
}

export function packBackup(data: BackupData, key: Buffer): Buffer {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([
    cipher.update(gzipSync(Buffer.from(JSON.stringify(data)))),
    cipher.final(),
  ]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), body]);
}

export function unpackBackup(file: Buffer, key: Buffer): BackupData {
  if (
    file.length < MAGIC.length + IV_BYTES + TAG_BYTES ||
    !file.subarray(0, 4).equals(MAGIC)
  ) {
    throw new Error('This is not an Acacia backup file');
  }
  const iv = file.subarray(4, 4 + IV_BYTES);
  const tag = file.subarray(4 + IV_BYTES, 4 + IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let json: Buffer;
  try {
    json = gunzipSync(
      Buffer.concat([
        decipher.update(file.subarray(4 + IV_BYTES + TAG_BYTES)),
        decipher.final(),
      ]),
    );
  } catch {
    throw new Error(
      'Cannot open the backup: wrong BACKUP_ENCRYPTION_KEY, or the file is damaged',
    );
  }
  const data = JSON.parse(json.toString('utf8')) as BackupData;
  if (data.format !== 'acacia-backup' || !data.tables) {
    throw new Error('This is not an Acacia backup file');
  }
  return data;
}

// Every table has as many rows as its count says
export function checkCounts(data: BackupData) {
  const wrong = Object.entries(data.counts).filter(
    ([table, count]) => (data.tables[table]?.length ?? -1) !== count,
  );
  if (wrong.length)
    throw new Error(`Rows missing in: ${wrong.map(([t]) => t).join(', ')}`);
  return Object.values(data.counts).reduce((sum, n) => sum + n, 0);
}

// Tables in an order that respects their links (a booking after its package...),
// from [table, table it points to] pairs. Used to load a backup into an empty database.
export function loadOrder(
  tables: string[],
  links: [string, string][],
): string[] {
  const order: string[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (table: string) => {
    if (done.has(table) || visiting.has(table)) return; // a loop: keep going, the database will say
    visiting.add(table);
    for (const [from, to] of links)
      if (from === table && to !== table && tables.includes(to)) visit(to);
    visiting.delete(table);
    done.add(table);
    order.push(table);
  };
  [...tables].sort().forEach(visit);
  return order;
}

// "acacia-2026-11-12T02-15-00Z.acb"
export const backupName = (date: Date) =>
  `acacia-${date.toISOString().slice(0, 19).replace(/:/g, '-')}Z.acb`;

// Names checked before use: they come from the database catalogue, but are put in SQL
export const SAFE_TABLE = /^[A-Za-z_][A-Za-z0-9_]*$/;
