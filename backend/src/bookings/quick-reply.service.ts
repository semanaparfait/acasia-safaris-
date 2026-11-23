import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { escapeHtml as h } from '../trips/trip-emails';
import { BookingsService } from './bookings.service';
import type { BookingMessageDto } from './dto/booking.dto';

// Quick reply: when a customer writes on their booking page, every admin gets an email
// with a personal link to answer without logging in.
// The link opens /reply/<token> on the website; a new device must type the admin's PIN.
// Replies go into the same conversation as the admin panel (and the activity log).
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
    return {
      trusted: true as const,
      workerName: worker.name,
      booking: await this.view(bookingId),
    };
  }

  // Checks the PIN -> the device token (for the cookie) and the conversation
  async unlock(token: string, pin: string, ip?: string) {
    const { worker, bookingId } = await this.auth.readReplyLink(token);
    const deviceToken = await this.auth.checkReplyPin(worker, pin, ip);
    return {
      deviceToken,
      result: {
        trusted: true as const,
        workerName: worker.name,
        booking: await this.view(bookingId),
      },
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
    return {
      trusted: true as const,
      workerName: worker.name,
      booking: await this.view(bookingId),
    };
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
    return {
      trusted: true as const,
      workerName: worker.name,
      booking: await this.view(bookingId),
    };
  }

  private async requireDevice(
    deviceToken: string | undefined,
    workerId: string,
  ) {
    if (!(await this.auth.isReplyDevice(deviceToken, workerId))) {
      throw new UnauthorizedException('Please type your PIN again');
    }
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

  private async alertTeam(bookingId: string, dto: BookingMessageDto) {
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
          const subject = offer
            ? `💬 ${booking.customer} proposes ${offer} for ${trip}`
            : `💬 ${booking.customer} wrote about ${trip}`;
          await this.mail.sendHtml({
            to,
            subject,
            text: [
              `${booking.customer} (${trip}) wrote on their booking page:`,
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
}) {
  const first = a.name.split(/\s+/)[0];
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0a120b;max-width:560px">
  <p style="margin:0 0 6px;color:#5e6960">Hi ${h(first)},</p>
  <p style="margin:0 0 14px"><strong>${h(a.customer)}</strong> wrote on their booking page about <strong>${h(a.trip)}</strong>:</p>
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
