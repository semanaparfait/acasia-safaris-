import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  SAFE_TABLE,
  backupKey,
  backupName,
  checkCounts,
  packBackup,
  unpackBackup,
  type BackupData,
} from './backup-file';

const PREFIX = 'acacia-';
const MIN_KEPT = 7; // always keep at least the last 7 backups, whatever their age

export type BackupResult = {
  at: string;
  ok: boolean;
  file?: string;
  size?: number;
  rows?: number;
  tables?: number;
  error?: string;
};

// A copy of the whole database every night, encrypted, in a private storage bucket.
// - Made at 02:15 (Kigali), and by hand from Admin > Backups.
// - Checked: the file is downloaded again, decrypted and its rows counted before it counts as OK.
// - Kept 30 days (BACKUP_KEEP_DAYS), never fewer than the last 7.
// - A failure is emailed to the main admin and written in Admin > Activity.
// Neon also keeps its own history of the database (point-in-time restore): this is a second,
// independent copy, which still exists if the Neon project itself is lost.
// To restore: see "Backups" in backend/README.md (npm run db:restore).
@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);
  private readonly bucket: string;
  private readonly keepDays: number;
  private readonly secret: string;
  private running = false;
  last: BackupResult | null = null;

  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private storage: StorageService,
    private mail: MailService,
    private audit: AuditService,
  ) {
    this.bucket = (config.get<string>('BACKUP_BUCKET') ?? 'backups').trim();
    this.keepDays = Number(config.get<string>('BACKUP_KEEP_DAYS')) || 30;
    this.secret = config.get<string>('BACKUP_ENCRYPTION_KEY') ?? '';
    const off = this.disabledReason();
    if (off) this.logger.warn(`Database backups are off: ${off}`);
  }

  // Why backups cannot run, or null when they can
  disabledReason(): string | null {
    if (!this.storage.configured)
      return 'storage is not set up (the AWS_* values)';
    if (this.secret.trim().length < 32) {
      return 'BACKUP_ENCRYPTION_KEY is missing or shorter than 32 characters';
    }
    return null;
  }

  @Cron('15 2 * * *', { name: 'database-backup', timeZone: 'Africa/Kigali' })
  async nightly() {
    if (!this.disabledReason()) await this.run().catch(() => undefined); // already reported
  }

  async run(): Promise<BackupResult> {
    const off = this.disabledReason();
    if (off) throw new Error(`Backups are off: ${off}`);
    if (this.running) throw new Error('A backup is already running');
    this.running = true;
    const at = new Date();
    try {
      const key = backupKey(this.secret);
      const data = await this.export(at);
      const file = backupName(at);
      const body = packBackup(data, key);
      await this.storage.putPrivate(this.bucket, file, body);

      // The check: read it back exactly as a restore would
      const copy = unpackBackup(
        await this.storage.getPrivate(this.bucket, file),
        key,
      );
      const rows = checkCounts(copy);
      if (rows !== checkCounts(data))
        throw new Error('The stored copy does not match the database');

      await this.prune();
      this.last = {
        at: at.toISOString(),
        ok: true,
        file,
        size: body.length,
        rows,
        tables: Object.keys(copy.tables).length,
      };
      void this.audit.record({
        workerName: 'System',
        action: 'Database backup made and checked',
        details: { file, rows, size: body.length },
      });
      this.logger.log(
        `Backup ${file}: ${rows} rows, ${body.length} bytes, checked`,
      );
      return this.last;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.last = { at: at.toISOString(), ok: false, error: message };
      this.logger.error(`Backup failed: ${message}`);
      void this.audit.record({
        workerName: 'System',
        action: 'Database backup FAILED',
        details: { error: message },
      });
      await this.alert(message);
      throw error;
    } finally {
      this.running = false;
    }
  }

  // The backups in the bucket, newest first
  async list() {
    if (!this.storage.configured) return [];
    const files = await this.storage.listPrivate(this.bucket, PREFIX);
    return files.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async download(file: string) {
    if (!file.startsWith(PREFIX) || file.includes('/'))
      throw new Error('Unknown backup');
    return this.storage.getPrivate(this.bucket, file);
  }

  async status() {
    const off = this.disabledReason();
    let files: Awaited<ReturnType<BackupsService['list']>> = [];
    let error: string | undefined;
    try {
      files = await this.list();
    } catch (e) {
      error = `Cannot read the "${this.bucket}" bucket: ${e instanceof Error ? e.message : e}`;
    }
    return {
      enabled: !off,
      reason: off,
      bucket: this.bucket,
      keepDays: this.keepDays,
      running: this.running,
      last: this.last,
      error,
      files,
    };
  }

  // ---------- Inside ----------

  // Every table of the app (not Prisma's own migration table), as JSON rows
  private async export(at: Date): Promise<BackupData> {
    const tables = await this.prisma.$queryRawUnsafe<{ name: string }[]>(
      `SELECT tablename AS name FROM pg_tables
       WHERE schemaname = current_schema() AND tablename <> '_prisma_migrations'
       ORDER BY tablename`,
    );
    const data: BackupData = {
      format: 'acacia-backup',
      version: 1,
      createdAt: at.toISOString(),
      migration: await this.lastMigration(),
      counts: {},
      tables: {},
    };
    // One snapshot: all tables read in the same transaction
    await this.prisma.$transaction(
      async (tx) => {
        for (const { name } of tables) {
          if (!SAFE_TABLE.test(name))
            throw new Error(`Unexpected table name "${name}"`);
          const [{ rows }] = await tx.$queryRawUnsafe<{ rows: unknown[] }[]>(
            `SELECT coalesce(json_agg(t), '[]'::json) AS rows FROM "${name}" t`,
          );
          data.tables[name] = rows;
          data.counts[name] = rows.length;
        }
      },
      { isolationLevel: 'RepeatableRead', timeout: 120_000, maxWait: 10_000 },
    );
    return data;
  }

  private async lastMigration() {
    const rows = await this.prisma.$queryRawUnsafe<{ name: string }[]>(
      `SELECT migration_name AS name FROM _prisma_migrations
       WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1`,
    );
    return rows[0]?.name ?? null;
  }

  // Deletes backups older than keepDays, keeping at least the last MIN_KEPT
  private async prune() {
    const files = await this.list();
    const limit = Date.now() - this.keepDays * 86_400_000;
    for (const old of files
      .slice(MIN_KEPT)
      .filter((f) => f.date.getTime() < limit)) {
      await this.storage.deletePrivate(this.bucket, old.key);
    }
  }

  private async alert(message: string) {
    const owner = await this.prisma.worker
      .findFirst({ where: { isOwner: true }, select: { personalEmail: true } })
      .catch(() => null);
    await this.mail.sendAlert({
      to: [owner?.personalEmail ?? '', process.env.OWNER_PERSONAL_EMAIL ?? ''],
      subject: 'The database backup failed',
      lines: [
        `Tonight's backup of the website database did not work: ${message}`,
        'The website keeps running. Open Admin > Backups and press "Back up now" to try again; if it fails again, check the storage settings (AWS_*, BACKUP_BUCKET, BACKUP_ENCRYPTION_KEY).',
      ],
    });
  }
}
