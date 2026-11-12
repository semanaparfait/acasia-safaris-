import { randomBytes } from 'crypto';
import {
  backupKey,
  backupName,
  checkCounts,
  loadOrder,
  packBackup,
  unpackBackup,
  type BackupData,
} from './backup-file';

const data = (): BackupData => ({
  format: 'acacia-backup',
  version: 1,
  createdAt: '2026-11-12T00:15:00.000Z',
  migration: '20261112120000_account_lockout',
  counts: { Package: 2, Booking: 1 },
  tables: {
    Package: [
      { id: 'p1', title: 'Gorilla Trek' },
      { id: 'p2', title: 'Kivu' },
    ],
    Booking: [{ id: 'b1', packageId: 'p1', customer: 'Ana' }],
  },
});

describe('backup files', () => {
  const key = backupKey(randomBytes(32).toString('hex'));

  it('encrypts, then opens to the same data', () => {
    const file = packBackup(data(), key);
    expect(file.toString('utf8')).not.toContain('Gorilla Trek'); // unreadable without the key
    expect(unpackBackup(file, key)).toEqual(data());
  });

  it('refuses a wrong key and a changed file', () => {
    const file = packBackup(data(), key);
    expect(() => unpackBackup(file, backupKey('x'.repeat(40)))).toThrow(
      /wrong BACKUP_ENCRYPTION_KEY/,
    );
    const changed = Buffer.from(file);
    changed[changed.length - 1] ^= 1;
    expect(() => unpackBackup(changed, key)).toThrow(/damaged/);
    expect(() => unpackBackup(Buffer.from('hello'), key)).toThrow(
      /not an Acacia backup/,
    );
  });

  it('needs a long encryption key', () => {
    expect(() => backupKey('short')).toThrow(/32 characters/);
  });

  it('counts the rows and finds missing ones', () => {
    expect(checkCounts(data())).toBe(3);
    const broken = data();
    broken.tables.Booking = [];
    expect(() => checkCounts(broken)).toThrow(/Booking/);
  });

  it('loads tables after the tables they point to', () => {
    const order = loadOrder(
      ['Booking', 'BookingMessage', 'Package', 'Worker'],
      [
        ['Booking', 'Package'],
        ['Booking', 'Worker'],
        ['BookingMessage', 'Booking'],
      ],
    );
    expect(order.indexOf('Package')).toBeLessThan(order.indexOf('Booking'));
    expect(order.indexOf('Worker')).toBeLessThan(order.indexOf('Booking'));
    expect(order.indexOf('Booking')).toBeLessThan(
      order.indexOf('BookingMessage'),
    );
  });

  it('names files by date', () => {
    expect(backupName(new Date('2026-11-12T00:15:00Z'))).toBe(
      'acacia-2026-11-12T00-15-00Z.acb',
    );
  });
});
