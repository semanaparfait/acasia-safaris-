import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { bookingPath, ticketQrPng } from '../bookings/bookings.service';
import { EMAIL_TEXTS, INTL_LOCALE, asLang } from '../mail/i18n';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const DAY = 86_400_000;
const DEPOSIT_RATE = 0.5; // same as DEPOSIT_RATE in bookings.service.ts

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

// What the reminders need from a booking: who, which trip, and the private link
const withTrip = {
  include: {
    package: { select: { title: true } },
    destinations: { select: { title: true } },
  },
  omit: { accessToken: false },
} as const;

// Automatic emails to travelers, sent every morning (8:00, Kigali time) in their language.
// Each booking remembers when each email was sent, so nobody gets the same one twice.
//  1. Trip reminder: 7 days before the trip, with the QR code ticket.
//  2. Balance reminder: from 14 days before the trip, when only the deposit is paid
//     (sent again a week later while still unpaid).
//  3. After the trip: "How was it?", with a link to leave a review; the booking becomes Completed.
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private siteUrl: string;
  private running = false;

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    config: ConfigService,
  ) {
    this.siteUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
  }

  @Cron('0 8 * * *', { name: 'traveler-reminders', timeZone: 'Africa/Kigali' })
  async daily() {
    await this.run().catch(() => undefined); // already logged
  }

  // Also started by hand: POST /api/reminders/run (admin)
  async run() {
    if (this.running) return { skipped: 'already running' };
    this.running = true;
    try {
      const result = {
        tripReminders: await this.tripReminders(),
        balanceReminders: await this.balanceReminders(),
        reviewRequests: await this.reviewRequests(),
      };
      this.logger.log(`Reminders sent: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Reminders failed: ${error}`);
      throw error;
    } finally {
      this.running = false;
    }
  }

  private link(token: string, locale: string, hash = '') {
    return `${this.siteUrl}${bookingPath(token, locale)}${hash}`;
  }

  private day(date: Date, locale: string) {
    return date.toLocaleDateString(INTL_LOCALE[asLang(locale)], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  private title(b: {
    package: { title: string } | null;
    destinations: { title: string }[];
  }) {
    return b.package?.title ?? b.destinations.map((d) => d.title).join(' · ');
  }

  // 1. "Your trip is coming", 7 days before, with the QR code
  async tripReminders() {
    const now = Date.now();
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'Confirmed',
        tripReminderAt: null,
        ticketCode: { not: null },
        startDate: { gt: new Date(now), lte: new Date(now + 7 * DAY) },
      },
      ...withTrip,
    });
    let sent = 0;
    for (const b of bookings) {
      // Booked during the last week: the confirmation with the QR code was just sent
      const justBooked =
        b.createdAt.getTime() > b.startDate.getTime() - 7 * DAY;
      if (!justBooked && b.ticketCode) {
        const lang = asLang(b.locale);
        const T = EMAIL_TEXTS[lang].tripSoon;
        const title = this.title(b);
        const dates = `${this.day(b.startDate, b.locale)} – ${this.day(b.endDate, b.locale)}`;
        await this.mail.sendBookingUpdate({
          lang,
          to: b.email,
          name: b.customer,
          subject: T.subject(title),
          heading: T.heading,
          paragraphs: [T.intro(title, dates), T.qr, T.bring, T.questions],
          link: this.link(b.accessToken, b.locale),
          qrPng: await ticketQrPng(b.ticketCode),
          ticketCode: b.ticketCode,
        });
        sent++;
      }
      await this.prisma.booking.update({
        where: { id: b.id },
        data: { tripReminderAt: new Date() },
      });
    }
    return sent;
  }

  // 2. The remaining 50%, from 14 days before the trip (again a week later while unpaid)
  async balanceReminders() {
    const now = Date.now();
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'Confirmed',
        payment: 'Deposit',
        amount: { gt: 0 },
        startDate: { gt: new Date(now), lte: new Date(now + 14 * DAY) },
        OR: [
          { balanceReminderAt: null },
          { balanceReminderAt: { lt: new Date(now - 7 * DAY) } },
        ],
      },
      ...withTrip,
    });
    for (const b of bookings) {
      const lang = asLang(b.locale);
      const T = EMAIL_TEXTS[lang].balance;
      const remaining = usd(b.amount - Math.round(b.amount * DEPOSIT_RATE));
      await this.mail.sendBookingUpdate({
        lang,
        to: b.email,
        name: b.customer,
        subject: T.subject(remaining),
        heading: T.heading,
        paragraphs: [
          T.intro(this.title(b), this.day(b.startDate, b.locale)),
          T.due(remaining),
          T.paid,
        ],
        link: this.link(b.accessToken, b.locale),
      });
      await this.prisma.booking.update({
        where: { id: b.id },
        data: { balanceReminderAt: new Date() },
      });
    }
    return bookings.length;
  }

  // 3. After the trip: "How was it?" (trips that ended in the last 14 days)
  async reviewRequests() {
    const today = new Date(new Date().toISOString().slice(0, 10)); // midnight UTC
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: ['Confirmed', 'Completed'] },
        reviewRequestAt: null,
        reviewedAt: null,
        endDate: { lt: today, gte: new Date(today.getTime() - 14 * DAY) },
      },
      ...withTrip,
    });
    for (const b of bookings) {
      const lang = asLang(b.locale);
      const T = EMAIL_TEXTS[lang].review;
      await this.mail.sendBookingUpdate({
        lang,
        to: b.email,
        name: b.customer,
        subject: T.subject,
        heading: T.heading,
        paragraphs: [T.intro(this.title(b)), T.ask],
        link: this.link(b.accessToken, b.locale, '#review'),
        button: T.button,
      });
      await this.prisma.booking.update({
        where: { id: b.id },
        data: { reviewRequestAt: new Date(), status: 'Completed' },
      });
    }
    return bookings.length;
  }
}
