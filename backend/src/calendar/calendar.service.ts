import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { agendaEmail } from './agenda-email';
import { DAY, buildAgenda, isEmpty, kigaliDay } from './agenda';
import { ReminderDto } from './calendar.dto';

const withBooking = {
  booking: { select: { id: true, customer: true } },
} as const;

// Admin > Calendar: the team's own to-dos, and the morning email with the day's agenda.
// Trips, returns and balances are not stored: they come from the bookings.
@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly adminUrl: string;

  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private mail: MailService,
  ) {
    this.adminUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
  }

  // From 3 months ago to 18 months ahead, plus every older one not done yet
  list() {
    const now = Date.now();
    return this.prisma.adminReminder.findMany({
      where: {
        OR: [
          {
            date: {
              gte: new Date(now - 92 * DAY),
              lte: new Date(now + 550 * DAY),
            },
          },
          { done: false },
        ],
      },
      include: withBooking,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  create(dto: ReminderDto, by: string) {
    return this.prisma.adminReminder.create({
      data: { ...this.fields(dto), createdBy: by },
      include: withBooking,
    });
  }

  async update(id: string, dto: ReminderDto) {
    await this.find(id);
    return this.prisma.adminReminder.update({
      where: { id },
      data: this.fields(dto),
      include: withBooking,
    });
  }

  async setDone(id: string, done: boolean, by: string) {
    await this.find(id);
    return this.prisma.adminReminder.update({
      where: { id },
      data: done
        ? { done, doneAt: new Date(), doneBy: by }
        : { done, doneAt: null, doneBy: null },
      include: withBooking,
    });
  }

  async remove(id: string) {
    await this.find(id);
    await this.prisma.adminReminder.delete({ where: { id } });
    return { deleted: true };
  }

  // ---------- The morning email ----------

  @Cron('0 7 * * *', { name: 'admin-agenda', timeZone: 'Africa/Kigali' })
  async morning() {
    await this.sendAgenda().catch((error) =>
      this.logger.error(`Morning agenda failed: ${error}`),
    );
  }

  // To every active admin, or only to one (the "Email me today's agenda" button).
  // Nothing is sent on a day with nothing to do, unless asked by hand.
  async sendAgenda(only?: { email: string; name: string }) {
    const today = kigaliDay();
    const agenda = await this.agenda(today);
    if (!only && isEmpty(agenda)) return { sent: 0, empty: true };

    const admins = only
      ? [only]
      : await this.prisma.worker.findMany({
          where: { isAdmin: true, status: 'Active' },
          select: { email: true, name: true },
        });
    let sent = 0;
    for (const admin of admins) {
      const mail = agendaEmail(agenda, admin.name.split(' ')[0], this.adminUrl);
      if (await this.mail.sendHtml({ to: admin.email, ...mail })) sent++;
    }
    this.logger.log(`Morning agenda sent to ${sent} admin(s)`);
    return { sent, empty: isEmpty(agenda) };
  }

  private async agenda(today: string) {
    const midnight = Date.parse(`${today}T00:00:00Z`);
    const bookings = await this.prisma.booking.findMany({
      // Trips around today, and anything still waiting for the team
      where: {
        OR: [
          {
            startDate: { lte: new Date(midnight + 16 * DAY) },
            endDate: { gte: new Date(midnight - DAY) },
          },
          { status: 'Pending' },
          { needsReply: true },
        ],
      },
      select: {
        id: true,
        customer: true,
        travelers: true,
        startDate: true,
        endDate: true,
        status: true,
        payment: true,
        amount: true,
        needsReply: true,
        package: { select: { title: true } },
        destinations: { select: { title: true } },
      },
    });
    const reminders = await this.prisma.adminReminder.findMany({
      where: { done: false, date: { lte: new Date(midnight) } },
      include: { booking: { select: { customer: true } } },
    });
    return buildAgenda(bookings, reminders, today);
  }

  private fields(dto: ReminderDto) {
    return {
      title: dto.title.trim(),
      date: new Date(`${dto.date}T00:00:00Z`),
      time: dto.time || null,
      notes: dto.notes?.trim() || null,
      bookingId: dto.bookingId || null,
    };
  }

  private async find(id: string) {
    const reminder = await this.prisma.adminReminder.findUnique({
      where: { id },
    });
    if (!reminder)
      throw new NotFoundException('This reminder no longer exists');
    return reminder;
  }
}
