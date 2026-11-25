import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { MachineTranslate } from '../translations/machine-translate';
import { GroupsService, cleanWhatsappLink, dateRange } from './groups.service';

const soon = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const booking = (changes: Record<string, unknown>) => ({
  id: 'b1',
  customer: 'Anna',
  email: 'anna@example.com',
  phone: '+250788000001',
  travelers: 2,
  status: 'Confirmed',
  locale: 'en',
  accessToken: 'tok1',
  startDate: new Date(`${soon(10)}T00:00:00Z`),
  endDate: new Date(`${soon(16)}T00:00:00Z`),
  departureId: null,
  packageId: 'p1',
  package: { title: 'Gorilla Trek', location: 'Musanze' },
  destinations: [],
  ...changes,
});

const owner = { name: 'Main', isOwner: true, permissions: [] };

const setup = (bookings: unknown[], trips: unknown[] = []) => {
  const prisma = {
    trip: { findMany: jest.fn().mockResolvedValue(trips) },
    booking: { findMany: jest.fn().mockResolvedValue(bookings) },
    travelGroup: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn(),
    },
    groupMessage: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
  };
  const mail = { sendGroupMessage: jest.fn().mockResolvedValue(true) };
  const translator = {
    enabled: true,
    translate: jest.fn((texts: string[], lang: string) =>
      Promise.resolve(texts.map((t) => `[${lang}] ${t}`)),
    ),
  };
  const service = new GroupsService(
    prisma as unknown as PrismaService,
    mail as unknown as MailService,
    translator as unknown as MachineTranslate,
    { get: () => 'https://acacia.example' } as unknown as ConfigService,
  );
  return { service, prisma, mail, translator };
};

describe('GroupsService', () => {
  it('puts travelers on the same package and start day together', async () => {
    const { service } = setup([
      booking({ id: 'b1' }),
      booking({
        id: 'b2',
        customer: 'Ben',
        email: 'ben@example.com',
        travelers: 1,
      }),
      // same package, another day: another group
      booking({
        id: 'b3',
        startDate: new Date(`${soon(30)}T00:00:00Z`),
        endDate: new Date(`${soon(35)}T00:00:00Z`),
      }),
    ]);
    const groups = await service.list(owner);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      key: `package:p1:${soon(10)}`,
      type: 'package',
      travelers: 3,
    });
    expect(groups[0].members.map((m) => m.name)).toEqual(['Anna', 'Ben']);
    expect(groups[0].members[0].link).toBe(
      'https://acacia.example/my-booking/tok1',
    );
  });

  it('groups a departure, and a destination trip by destination and day', async () => {
    const { service } = setup([
      booking({ id: 'b1', departureId: 'd1' }),
      booking({
        id: 'b2',
        packageId: null,
        package: null,
        destinations: [{ title: 'Akagera' }, { title: 'Nyungwe' }],
      }),
    ]);
    const keys = (await service.list(owner)).map((g) => g.key).sort();
    expect(keys).toEqual([
      'departure:d1',
      `destination:${soon(10)}:Akagera`,
      `destination:${soon(10)}:Nyungwe`,
    ]);
  });

  it('only shows trip groups to admins with Trips access', async () => {
    const trip = {
      id: 't1',
      title: 'Christmas trip',
      location: 'Musanze',
      startDate: new Date(`${soon(5)}T00:00:00Z`),
      endDate: new Date(`${soon(9)}T00:00:00Z`),
      bookings: [
        {
          id: 'tb1',
          customer: 'Cleo',
          email: 'c@example.com',
          phone: null,
          travelers: 2,
          status: 'New',
          locale: 'fr',
        },
      ],
    };
    const bookingsOnly = {
      name: 'Sales',
      isOwner: false,
      permissions: ['bookings'],
    };
    const { service, prisma } = setup([booking({})], [trip]);
    const groups = await service.list(bookingsOnly);
    expect(groups.map((g) => g.type)).toEqual(['package']);
    expect(prisma.trip.findMany).not.toHaveBeenCalled();
    await expect(service.findOne(bookingsOnly, 'trip:t1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('emails each traveler separately, in their language when asked', async () => {
    const { service, mail, translator, prisma } = setup([
      booking({ id: 'b1', locale: 'en' }),
      booking({
        id: 'b2',
        customer: 'Chloé',
        email: 'chloe@example.com',
        locale: 'fr',
      }),
    ]);
    const key = `package:p1:${soon(10)}`;
    const result = await service.send(owner, key, {
      subject: 'Pick-up time',
      body: 'We meet at 7am.\n\nBring your passport.',
      translate: true,
    });
    expect(result).toEqual({ sent: 2, failed: 0, languages: ['en', 'fr'] });
    expect(translator.translate).toHaveBeenCalledTimes(1); // once per language
    const calls = mail.sendGroupMessage.mock.calls as [
      Record<string, unknown>,
    ][];
    const [toAnna, toChloe] = calls.map(([email]) => email);
    expect(toAnna).toMatchObject({
      to: 'anna@example.com',
      lang: 'en',
      subject: 'Pick-up time',
      paragraphs: ['We meet at 7am.', 'Bring your passport.'],
    });
    expect(toChloe).toMatchObject({
      to: 'chloe@example.com',
      lang: 'fr',
      subject: '[fr] Pick-up time',
    });
    const saved = prisma.groupMessage.create.mock.calls[0] as [
      { data: Record<string, unknown> },
    ];
    expect(saved[0].data).toEqual(
      expect.objectContaining({
        recipients: 2,
        translated: true,
        sentBy: 'Main',
      }),
    );
  });

  it('only accepts a real WhatsApp group invite link', async () => {
    const { service } = setup([booking({})]);
    await expect(
      service.setWhatsapp(
        owner,
        `package:p1:${soon(10)}`,
        'https://evil.example/join',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('writes the dates of a group', () => {
    expect(dateRange('2026-12-20', '2026-12-26')).toBe('20 Dec – 26 Dec 2026');
    expect(dateRange('2026-12-20', null)).toBe('20 Dec 2026');
  });

  it('accepts a WhatsApp invite link with tracking, and keeps it clean', () => {
    expect(
      cleanWhatsappLink(
        'https://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW?s=sh&p=a&iam=2',
      ),
    ).toBe('https://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW');
    expect(
      cleanWhatsappLink('  https://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW/ '),
    ).toBe('https://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW');
    expect(
      cleanWhatsappLink(
        'https://chat.whatsapp.evil.com/BKq2UURWblPEaPQszZe2uW',
      ),
    ).toBeNull();
    expect(
      cleanWhatsappLink('http://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW'),
    ).toBeNull();
    expect(cleanWhatsappLink('not a link')).toBeNull();
  });
});
