import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { SavedRepliesService } from '../saved-replies/saved-replies.service';
import { escapeHtml as h } from '../trips/trip-emails';
import { BookingsService } from './bookings.service';
import type { BookingMessageDto } from './dto/booking.dto';

// Quick reply: when a customer writes on their booking page, every admin gets an email
// with a personal link to answer without logging in.
// The link opens /reply/<token> on the website; a new device must type the admin's PIN.
// Replies go into the same conversation as the admin panel (and the activity log).
// Still no answer after REMIND_AFTER_HOURS: one reminder email.
const REMIND_AFTER_HOURS = 3;
@Injectable()
export class QuickReplyService {
  private readonly logger = new Logger(QuickReplyService.name);
  private siteUrl: string;

  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
    private bookings: BookingsService,
    private mail: MailService,
    private audit: AuditService,
    private savedReplies: SavedRepliesService,
    config: ConfigService,
  ) {
    this.siteUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
    // Alert the team when a customer writes
    bookings.onCustomerMessage((bookingId, dto) => {
      void this.alertTeam(bookingId, dto);
    });
  }

  // ---------- The link page ----------

  // Before the PIN: only who the link is for (nothing about the customer)
  async open(token: string, deviceToken?: string) {
    const { worker, bookingId } = await this.auth.readReplyLink(token);
    const trusted = await this.auth.isReplyDevice(deviceToken, worker.id);
    if (!trusted) {
      const { set } = await this.auth.hasReplyPin(worker.id);
      return { trusted: false as const, workerName: worker.name, pinSet: set };
    }
    return this.trusted(worker.name, bookingId);
  }

  // Checks the PIN -> the device token (for the cookie) and the conversation
  async unlock(token: string, pin: string, ip?: string) {
    const { worker, bookingId } = await this.auth.readReplyLink(token);
    const deviceToken = await this.auth.checkReplyPin(worker, pin, ip);
    return {
      deviceToken,
      result: await this.trusted(worker.name, bookingId),
    };
  }

  // The admin answers (or proposes a price), exactly like from the admin panel
  async reply(
    token: string,
    deviceToken: string | undefined,
    dto: BookingMessageDto,
    ip?: string,
  ) {
    const { worker, bookingId } = await this.auth.readReplyLink(token);
    await this.requireDevice(deviceToken, worker.id);
    const booking = await this.bookings.teamMessage(
      bookingId,
      dto,
      worker.name,
    );
    void this.audit.record({
      worker,
      action: dto.offer
        ? 'Sent a price to the customer (quick reply)'
        : 'Wrote to the customer (quick reply)',
      target: `Booking #${booking.id.slice(0, 8).toUpperCase()} (${booking.customer})`,
      details: dto,
      ip,
    });
    return this.trusted(worker.name, bookingId);
  }

  // Accept the customer's price proposal
  async accept(token: string, deviceToken: string | undefined, ip?: string) {
    const { worker, bookingId } = await this.auth.readReplyLink(token);
    await this.requireDevice(deviceToken, worker.id);
    const booking = await this.bookings.teamAccept(bookingId, worker.name);
    void this.audit.record({
      worker,
      action: "Accepted the customer's price (quick reply)",
      target: `Booking #${booking.id.slice(0, 8).toUpperCase()} (${booking.customer})`,
      ip,
    });
    return this.trusted(worker.name, bookingId);
  }

  private async requireDevice(
    deviceToken: string | undefined,
    workerId: string,
  ) {
    if (!(await this.auth.isReplyDevice(deviceToken, workerId))) {
      throw new UnauthorizedException('Please type your PIN again');
    }
  }

  // The conversation for an admin who passed the PIN; opening it counts as "seen"
  private async trusted(workerName: string, bookingId: string) {
    await this.bookings.markSeen(bookingId, workerName).catch(() => null);
    return {
      trusted: true as const,
      workerName,
      booking: await this.view(bookingId),
      savedReplies: await this.savedReplies.findAll(),
    };
  }

  // What the link page shows: the trip and the conversation (no payments or notes)
  private async view(bookingId: string) {
    const b = await this.bookings.findOne(bookingId);
    return {
      id: b.id,
      customer: b.customer,
      country: b.country,
      trip:
        b.package?.title ??
        (b.destinations.map((d) => d.title).join(', ') || 'Custom trip'),
      startDate: b.startDate,
      endDate: b.endDate,
      travelers: b.travelers,
      status: b.status,
      listAmount: b.listAmount,
      amount: b.amount,
      floorAmount: b.floorAmount,
      offer: b.offer,
      offerBy: b.offerBy,
      needsReply: b.needsReply,
      messages: b.messages,
    };
  }

  // ---------- The alert ----------

  // Every 15 minutes: a conversation still waiting 3 hours after the customer's last
  // message gets one reminder (a new customer message starts the 3 hours again)
  @Cron('*/15 * * * *', { name: 'chat-reply-reminders' })
  async remindTeam() {
    const before = new Date(Date.now() - REMIND_AFTER_HOURS * 3_600_000);
    const waiting = await this.prisma.booking.findMany({
      where: {
        needsReply: true,
        status: { notIn: ['Completed', 'Cancelled'] },
      },
      select: {
        id: true,
        replyReminderAt: true,
        messages: {
          where: { sender: 'customer' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, text: true, offer: true },
        },
      },
    });
    for (const b of waiting) {
      const last = b.messages[0];
      if (!last || last.createdAt > before) continue;
      if (b.replyReminderAt && b.replyReminderAt >= last.createdAt) continue;
      await this.prisma.booking.update({
        where: { id: b.id },
        data: { replyReminderAt: new Date() },
      });
      await this.alertTeam(
        b.id,
        { text: last.text, offer: last.offer ?? undefined },
        last.createdAt,
      );
    }
  }

  // waitingSince: set for a reminder ("still waiting since ...")
  private async alertTeam(
    bookingId: string,
    dto: BookingMessageDto,
    waitingSince?: Date,
  ) {
    try {
      const booking = await this.bookings.findOne(bookingId);
      const admins = await this.prisma.worker.findMany({
        where: { isAdmin: true, status: 'Active' },
        select: {
          id: true,
          name: true,
          email: true,
          personalEmail: true,
          tokenVersion: true,
        },
      });
      if (!admins.length) return;

      const trip =
        booking.package?.title ??
        (booking.destinations.map((d) => d.title).join(', ') || 'Custom trip');
      const text = dto.text?.trim() ?? '';
      const offer = dto.offer ? `$${dto.offer.toLocaleString('en-US')}` : null;
      const panel = `${this.siteUrl}/admin/messages`;
      await Promise.all(
        admins.map(async (admin) => {
          const token = await this.auth.replyLink(
            admin.id,
            admin.tokenVersion,
            booking.id,
          );
          const link = `${this.siteUrl}/reply/${token}`;
          const to = admin.personalEmail || admin.email;
          if (!to) return;
          const hours = waitingSince
            ? Math.max(
                1,
                Math.round((Date.now() - waitingSince.getTime()) / 3_600_000),
              )
            : 0;
          const subject = waitingSince
            ? `⏰ Still waiting: ${booking.customer} wrote ${hours} hours ago (${trip})`
            : offer
              ? `💬 ${booking.customer} proposes ${offer} for ${trip}`
              : `💬 ${booking.customer} wrote about ${trip}`;
          await this.mail.sendHtml({
            to,
            subject,
            text: [
              waitingSince
                ? `Nobody has answered ${booking.customer} yet (${trip}). They wrote ${hours} hours ago:`
                : `${booking.customer} (${trip}) wrote on their booking page:`,
              offer ? `Proposed price: ${offer}` : '',
              text ? `"${text}"` : '',
              `Reply now (no login, your PIN on a new device): ${link}`,
              `This link is only for you (${admin.name}) and works for 48 hours. Do not forward it.`,
              `Or open the admin panel: ${panel}`,
            ]
              .filter(Boolean)
              .join('\n\n'),
            html: alertHtml({
              name: admin.name,
              customer: booking.customer,
              trip,
              text,
              offer,
              link,
              panel,
              waitingHours: waitingSince ? hours : undefined,
            }),
          });
        }),
      );
    } catch (error) {
      this.logger.error(`Quick-reply alert failed: ${error}`);
    }
  }
}

function alertHtml(a: {
  name: string;
  customer: string;
  trip: string;
  text: string;
  offer: string | null;
  link: string;
  panel: string;
  waitingHours?: number; // a reminder: nobody answered yet
}) {
  const first = a.name.split(/\s+/)[0];
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0a120b;max-width:560px">
  <p style="margin:0 0 6px;color:#5e6960">Hi ${h(first)},</p>
  ${
    a.waitingHours
      ? `<p style="margin:0 0 14px;color:#9B2C2C"><strong>Nobody has answered ${h(a.customer)} yet.</strong> They wrote about <strong>${h(a.trip)}</strong> ${a.waitingHours} hours ago:</p>`
      : `<p style="margin:0 0 14px"><strong>${h(a.customer)}</strong> wrote on their booking page about <strong>${h(a.trip)}</strong>:</p>`
  }
  ${a.offer ? `<p style="margin:0 0 10px;color:#8e7345;font-weight:bold">Proposed price: ${h(a.offer)}</p>` : ''}
  ${a.text ? `<p style="margin:0 0 18px;padding:12px 16px;background:#f7f5f0;border-left:3px solid #c5a86d;border-radius:4px;white-space:pre-line">${h(a.text)}</p>` : ''}
  <p style="margin:0 0 18px">
    <a href="${h(a.link)}" style="display:inline-block;background:#12231a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">Reply now</a>
  </p>
  <p style="margin:0 0 6px;color:#5e6960;font-size:12px">No login needed. On a new phone or computer you type your 4 digit quick-reply PIN once.</p>
  <p style="margin:0 0 6px;color:#9B2C2C;font-size:12px">This link is only for you and works for 48 hours. Please do not forward this email.</p>
  <p style="margin:12px 0 0;color:#5e6960;font-size:12px">Or answer from the <a href="${h(a.panel)}" style="color:#1f5a42">admin panel</a>.</p>
</div>`;
}
