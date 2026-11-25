import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { bookingPath } from '../bookings/bookings.service';
import { hasAccess } from '../common/permissions';
import { asLang, type Lang } from '../mail/i18n';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { MachineTranslate } from '../translations/machine-translate';

// Travel groups (Admin > Groups): travelers going on the same trip at the same time.
//   - "trip":        everyone booked on a special trip (Admin > Trips)
//   - "departure":   everyone who joined a group departure (Admin > Departures)
//   - "package":     everyone on the same package starting the same day (not a departure)
//   - "destination": everyone going to the same destination starting the same day
// Members are read from the bookings every time (cancelled bookings left out), so a group is
// always up to date. The team adds the group's WhatsApp invite link and emails everyone at once:
// one personal email each (nobody sees the others' addresses), in each traveler's language if asked.

export type GroupType = 'trip' | 'departure' | 'package' | 'destination';

export type GroupMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  travelers: number;
  status: string;
  lang: Lang;
  link: string | null; // their booking page (special trips have none)
};

export type TravelGroupView = {
  key: string;
  type: GroupType;
  name: string;
  place: string | null;
  startDate: string; // "2026-12-20"
  endDate: string | null;
  members: GroupMember[];
  travelers: number;
  whatsappLink: string | null;
  messageCount: number;
  lastMessageAt: string | null;
};

type Worker = { name: string; isOwner: boolean; permissions: string[] };

const DAY = 86_400_000;
const PAST_DAYS = 180; // past groups shown (for "thank you" and photo messages)
const MAX_GROUPS = 300;
// A WhatsApp group invite link -> its clean form, or null when it is not one.
// WhatsApp adds tracking at the end ("?s=sh&p=a&iam=2"): it is dropped.
//   "https://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW?s=sh" -> "https://chat.whatsapp.com/BKq2UURWblPEaPQszZe2uW"
export function cleanWhatsappLink(text: string): string | null {
  let url: URL;
  try {
    url = new URL(text.trim());
  } catch {
    return null;
  }
  const code = url.pathname.replace(/^\/+|\/+$/g, '');
  const ok =
    url.protocol === 'https:' &&
    url.hostname === 'chat.whatsapp.com' &&
    /^[A-Za-z0-9]{10,40}$/.test(code);
  return ok ? `https://chat.whatsapp.com/${code}` : null;
}

const day = (d: Date) => d.toISOString().slice(0, 10);

@Injectable()
export class GroupsService {
  private readonly siteUrl: string;

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private translator: MachineTranslate,
    config: ConfigService,
  ) {
    this.siteUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
  }

  // ---------- Reading ----------

  // Upcoming groups (not finished yet), or the ones of the last 6 months
  async list(worker: Worker, past = false) {
    const groups = await this.build(worker, past);
    return past
      ? groups.sort((a, b) => b.startDate.localeCompare(a.startDate))
      : groups.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  async findOne(worker: Worker, key: string) {
    const group =
      (await this.build(worker, false)).find((g) => g.key === key) ??
      (await this.build(worker, true)).find((g) => g.key === key);
    if (!group) {
      // Exists but the admin lacks the access, or no such group
      throw new NotFoundException(
        'This group does not exist (or has no traveler any more)',
      );
    }
    const messages = await this.prisma.groupMessage.findMany({
      where: { groupKey: key },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { ...group, messages };
  }

  // ---------- Changing ----------

  async setWhatsapp(worker: Worker, key: string, link: string | undefined) {
    await this.findOne(worker, key);
    const typed = link?.trim() || null;
    const value = typed ? cleanWhatsappLink(typed) : null;
    if (typed && !value) {
      throw new BadRequestException(
        'Paste the group invite link from WhatsApp (it starts with https://chat.whatsapp.com/)',
      );
    }
    await this.prisma.travelGroup.upsert({
      where: { key },
      create: { key, whatsappLink: value },
      update: { whatsappLink: value },
    });
    return this.findOne(worker, key);
  }

  // One personal email to every traveler; translated into each traveler's language if asked
  async send(
    worker: Worker,
    key: string,
    dto: { subject: string; body: string; translate?: boolean },
  ) {
    const group = await this.findOne(worker, key);
    const subject = dto.subject.trim();
    const body = dto.body.trim();
    if (!subject || !body)
      throw new BadRequestException('Write a subject and a message');
    const members = group.members.filter((m) => m.email);
    if (!members.length)
      throw new BadRequestException('Nobody in this group has an email');

    // The message in each language needed (English as written)
    const texts = new Map<Lang, { subject: string; body: string }>([
      ['en', { subject, body }],
    ]);
    const translate = Boolean(dto.translate) && this.translator.enabled;
    if (translate) {
      for (const lang of new Set(members.map((m) => m.lang))) {
        if (lang === 'en' || texts.has(lang)) continue;
        const [s, b] = await this.translator.translate([subject, body], lang);
        texts.set(lang, { subject: s, body: b });
      }
    }

    const groupName = `${group.name} · ${dateRange(group.startDate, group.endDate)}`;
    let sent = 0;
    let failed = 0;
    for (const m of members) {
      const text = texts.get(m.lang) ?? texts.get('en')!;
      const ok = await this.mail.sendGroupMessage({
        lang: texts.has(m.lang) ? m.lang : 'en',
        to: m.email,
        name: m.name,
        group: groupName,
        subject: text.subject,
        paragraphs: text.body
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        whatsappLink: group.whatsappLink,
        link: m.link,
      });
      if (ok) sent++;
      else failed++;
    }

    await this.prisma.travelGroup.upsert({
      where: { key },
      create: { key },
      update: {},
    });
    await this.prisma.groupMessage.create({
      data: {
        groupKey: key,
        groupName,
        subject,
        body,
        translated: translate && texts.size > 1,
        sentBy: worker.name,
        recipients: sent,
        failed,
      },
    });
    return { sent, failed, languages: [...texts.keys()] };
  }

  // ---------- Inside ----------

  private async build(
    worker: Worker,
    past: boolean,
  ): Promise<TravelGroupView[]> {
    const today = new Date(new Date().toISOString().slice(0, 10)); // midnight UTC
    const from = new Date(today.getTime() - PAST_DAYS * DAY);
    const inRange = (end: Date) =>
      past ? end < today && end >= from : end >= today;
    const groups: Omit<
      TravelGroupView,
      'whatsappLink' | 'messageCount' | 'lastMessageAt'
    >[] = [];

    // Special trips
    if (hasAccess(worker, ['trips'])) {
      const trips = await this.prisma.trip.findMany({
        where: { startDate: { not: null } },
        select: {
          id: true,
          title: true,
          location: true,
          startDate: true,
          endDate: true,
          bookings: {
            where: { status: { not: 'Cancelled' } },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              customer: true,
              email: true,
              phone: true,
              travelers: true,
              status: true,
              locale: true,
            },
          },
        },
      });
      for (const t of trips) {
        const end = t.endDate ?? t.startDate!;
        if (!t.bookings.length || !inRange(end)) continue;
        groups.push({
          key: `trip:${t.id}`,
          type: 'trip',
          name: t.title,
          place: t.location,
          startDate: day(t.startDate!),
          endDate: t.endDate ? day(t.endDate) : null,
          members: t.bookings.map((b) => ({
            id: b.id,
            name: b.customer,
            email: b.email,
            phone: b.phone,
            travelers: b.travelers,
            status: b.status,
            lang: asLang(b.locale),
            link: null,
          })),
          travelers: t.bookings.reduce((n, b) => n + b.travelers, 0),
        });
      }
    }

    // Package and destination bookings
    if (hasAccess(worker, ['bookings'])) {
      const bookings = await this.prisma.booking.findMany({
        where: {
          status: { not: 'Cancelled' },
          endDate: past ? { lt: today, gte: from } : { gte: today },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          customer: true,
          email: true,
          phone: true,
          travelers: true,
          status: true,
          locale: true,
          accessToken: true,
          startDate: true,
          endDate: true,
          departureId: true,
          packageId: true,
          package: { select: { title: true, location: true } },
          destinations: { select: { title: true } },
        },
      });
      const byKey = new Map<string, (typeof groups)[number]>();
      const add = (
        key: string,
        type: GroupType,
        name: string,
        place: string | null,
        b: (typeof bookings)[number],
      ) => {
        let group = byKey.get(key);
        if (!group) {
          group = {
            key,
            type,
            name,
            place,
            startDate: day(b.startDate),
            endDate: day(b.endDate),
            members: [],
            travelers: 0,
          };
          byKey.set(key, group);
          groups.push(group);
        }
        if (group.endDate && day(b.endDate) > group.endDate)
          group.endDate = day(b.endDate);
        group.members.push({
          id: b.id,
          name: b.customer,
          email: b.email,
          phone: b.phone,
          travelers: b.travelers,
          status: b.status,
          lang: asLang(b.locale),
          link: b.accessToken
            ? `${this.siteUrl}${bookingPath(b.accessToken, b.locale)}`
            : null,
        });
        group.travelers += b.travelers;
      };
      for (const b of bookings) {
        const start = day(b.startDate);
        if (b.departureId && b.package) {
          add(
            `departure:${b.departureId}`,
            'departure',
            b.package.title,
            b.package.location,
            b,
          );
        } else if (b.packageId && b.package) {
          add(
            `package:${b.packageId}:${start}`,
            'package',
            b.package.title,
            b.package.location,
            b,
          );
        } else {
          for (const d of b.destinations) {
            add(
              `destination:${start}:${d.title}`,
              'destination',
              d.title,
              null,
              b,
            );
          }
        }
      }
    }

    const list = groups.slice(0, MAX_GROUPS);
    const saved = await this.prisma.travelGroup.findMany({
      where: { key: { in: list.map((g) => g.key) } },
      select: {
        key: true,
        whatsappLink: true,
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    });
    const info = new Map(saved.map((s) => [s.key, s]));
    return list.map((g) => {
      const s = info.get(g.key);
      return {
        ...g,
        whatsappLink: s?.whatsappLink ?? null,
        messageCount: s?._count.messages ?? 0,
        lastMessageAt: s?.messages[0]?.createdAt.toISOString() ?? null,
      };
    });
  }
}

// "20 – 26 Dec 2026", "20 Dec 2026"
export function dateRange(start: string, end: string | null) {
  const f = (d: string, year = true) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      ...(year ? { year: 'numeric' } : {}),
      timeZone: 'UTC',
    });
  return end && end !== start ? `${f(start, false)} – ${f(end)}` : f(start);
}
