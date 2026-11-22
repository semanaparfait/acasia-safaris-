import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Trip } from '@prisma/client';
import { randomInt } from 'crypto';
import { ticketCodeFrom, ticketQrPng } from '../bookings/bookings.service';
import { asLang, INTL_LOCALE, type Lang } from '../mail/i18n';
import { MailService } from '../mail/mail.service';
import { toE164 } from '../common/phone';
import { LiveGateway } from '../live/live.gateway';
import { PrismaService } from '../prisma/prisma.service';
import {
  adminTripHtml,
  adminTripSubject,
  adminTripText,
  tripTicketHtml,
  tripTicketSubject,
  tripTicketText,
  type AdminTripEmail,
} from './trip-emails';
import {
  CreateTripBookingDto,
  TripDto,
  UpdateTripBookingDto,
} from './trips.dto';

const today = () => new Date(new Date().toISOString().slice(0, 10));
const day = (d?: string | null) => (d ? new Date(d.slice(0, 10)) : null);
const clean = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);

// Every real currency code ("RWF", "USD", "UGX"…), as known by Node
const CURRENCIES = new Set(Intl.supportedValuesOf('currency'));

// Bookings that hold seats: every one except the cancelled ones
const HOLDS_SEATS = { status: { not: 'Cancelled' } } as const;

type TripPrice = {
  name: string;
  price: number;
  unit: string;
  included?: string[];
  excluded?: string[];
};

// Ticket codes: 10 letters and digits that cannot be confused (no 0/O, 1/I/L),
// like the package bookings' tickets, so Admin > Check-in reads both
const TICKET_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newTicketCode = () =>
  Array.from(
    { length: 10 },
    () => TICKET_LETTERS[randomInt(TICKET_LETTERS.length)],
  ).join('');

// "RWF 100,000", "$2,450", "€99.50"
export const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('en-US')} ${currency}`;
  }
};

// What a booking costs: "per person" x travelers, "per couple" x couples, "per group" once
// (same as bookingTotal in lib/trips.ts)
export const bookingTotal = (b: {
  price: number;
  unit: string;
  travelers: number;
}) => {
  const unit = b.unit.toLowerCase();
  if (unit.includes('group')) return b.price;
  if (unit.includes('couple')) return b.price * Math.ceil(b.travelers / 2);
  return b.price * b.travelers;
};

// "Wed, 25 Nov 2026" or a range, in the traveler's language
const tripDateText = (
  t: { startDate: Date | null; endDate: Date | null },
  lang: Lang,
) => {
  if (!t.startDate) return null;
  const f = new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return t.endDate && t.endDate.getTime() !== t.startDate.getTime()
    ? f.formatRange(t.startDate, t.endDate)
    : f.format(t.startDate);
};

// On the website: published, and not over yet. Trips without dates stay until hidden.
const onWebsite = (): Prisma.TripWhereInput => ({
  active: true,
  OR: [
    { startDate: null, endDate: null },
    { endDate: { gte: today() } },
    { endDate: null, startDate: { gte: today() } },
  ],
});

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);
  private readonly siteUrl: string;

  constructor(
    private prisma: PrismaService,
    private live: LiveGateway,
    private mail: MailService,
    config: ConfigService,
  ) {
    // FRONTEND_URL can hold several addresses: the first one is the website
    this.siteUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
  }

  // Travelers booked per trip (cancelled bookings do not count)
  private async booked(tripIds: string[]) {
    if (tripIds.length === 0) return new Map<string, number>();
    const rows = await this.prisma.tripBooking.groupBy({
      by: ['tripId'],
      where: { tripId: { in: tripIds }, ...HOLDS_SEATS },
      _sum: { travelers: true },
    });
    return new Map(rows.map((r) => [r.tripId, r._sum.travelers ?? 0]));
  }

  // Website: the seats left (null = no limit), never who booked
  private async withSeatsLeft(trips: Trip[]) {
    const booked = await this.booked(trips.map((t) => t.id));
    return trips.map((t) => ({
      ...t,
      seatsLeft:
        t.seats == null ? null : Math.max(t.seats - (booked.get(t.id) ?? 0), 0),
    }));
  }

  // Admin: the numbers shown on each trip card
  private async withStats(trips: Trip[]) {
    const ids = trips.map((t) => t.id);
    const [booked, counts] = await Promise.all([
      this.booked(ids),
      this.prisma.tripBooking.groupBy({
        by: ['tripId', 'status'],
        where: { tripId: { in: ids } },
        _count: { _all: true },
      }),
    ]);
    return trips.map((t) => {
      const mine = counts.filter((c) => c.tripId === t.id);
      const count = (status?: string) =>
        mine
          .filter((c) =>
            status ? c.status === status : c.status !== 'Cancelled',
          )
          .reduce((s, c) => s + c._count._all, 0);
      const travelers = booked.get(t.id) ?? 0;
      return {
        ...t,
        bookingCount: count(),
        newBookings: count('New'),
        travelers,
        seatsLeft: t.seats == null ? null : Math.max(t.seats - travelers, 0),
      };
    });
  }

  // ---------- Website ----------

  async findPublished() {
    const trips = await this.prisma.trip.findMany({
      where: onWebsite(),
      orderBy: [
        { startDate: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
    return this.withSeatsLeft(trips);
  }

  async findPublishedOne(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, ...onWebsite() },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return (await this.withSeatsLeft([trip]))[0];
  }

  // A visitor reserves a trip. The price is copied from the chosen option.
  async book(tripId: string, dto: CreateTripBookingDto) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, ...onWebsite() },
    });
    if (!trip) throw new NotFoundException('This trip is not open for booking');
    const option = (trip.prices as TripPrice[]).find(
      (p) => p.name === dto.option,
    );
    if (!option) {
      throw new BadRequestException('Please choose one of the price options');
    }
    if (trip.seats != null) {
      const left =
        trip.seats - ((await this.booked([trip.id])).get(trip.id) ?? 0);
      if (left <= 0) throw new BadRequestException('This trip is fully booked');
      if (dto.travelers > left) {
        throw new BadRequestException(
          `Only ${left} ${left === 1 ? 'seat is' : 'seats are'} left on this trip`,
        );
      }
    }
    const booking = await this.prisma.tripBooking.create({
      data: {
        tripId: trip.id,
        customer: dto.customer.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: toE164(dto.phone),
        option: option.name,
        price: option.price,
        unit: option.unit || 'per person',
        currency: trip.currency,
        travelers: dto.travelers,
        message: dto.message?.trim() || null,
        locale: dto.locale ?? 'en',
      },
    });
    // Open admin panels show it at once
    this.live.toAdmins('tripBooking', { ...booking, tripTitle: trip.title });
    void this.notifyAdmins('new', booking.id);
    return { id: booking.id };
  }

  // ---------- Admin ----------

  async findAll() {
    const trips = await this.prisma.trip.findMany({
      orderBy: [
        { startDate: { sort: 'desc', nulls: 'first' } },
        { createdAt: 'desc' },
      ],
    });
    return this.withStats(trips);
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    return (await this.withStats([trip]))[0];
  }

  async create(dto: TripDto) {
    const trip = await this.prisma.trip.create({ data: this.toData(dto) });
    return (await this.withStats([trip]))[0];
  }

  async update(id: string, dto: TripDto) {
    const current = await this.findOne(id);
    if (dto.seats != null && dto.seats < current.travelers) {
      throw new BadRequestException(
        `${current.travelers} travelers already booked: seats cannot be fewer`,
      );
    }
    const trip = await this.prisma.trip.update({
      where: { id },
      data: this.toData(dto),
    });
    return (await this.withStats([trip]))[0];
  }

  async setActive(id: string, active: boolean) {
    const trip = await this.findOne(id);
    if (active && (trip.prices as unknown[]).length === 0) {
      throw new BadRequestException(
        'Add at least one price option before publishing the trip',
      );
    }
    const saved = await this.prisma.trip.update({
      where: { id },
      data: { active },
    });
    return (await this.withStats([saved]))[0];
  }

  async remove(id: string) {
    const trip = await this.findOne(id);
    if (trip.bookingCount > 0) {
      throw new BadRequestException(
        'People booked this trip: hide it from the website instead of deleting it.',
      );
    }
    await this.prisma.trip.delete({ where: { id } });
    return { deleted: true };
  }

  // Who booked the trip, newest first
  async bookings(tripId: string) {
    await this.findOne(tripId);
    return this.prisma.tripBooking.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBooking(id: string, dto: UpdateTripBookingDto) {
    const current = await this.prisma.tripBooking.findUnique({
      where: { id },
      include: { trip: { select: { seats: true, title: true } } },
    });
    if (!current) throw new NotFoundException('Booking not found');

    // Taking a booking back, or adding travelers, needs free seats
    const holdsAfter = (dto.status ?? current.status) !== 'Cancelled';
    const travelersAfter = dto.travelers ?? current.travelers;
    const extra =
      (holdsAfter ? travelersAfter : 0) -
      (current.status !== 'Cancelled' ? current.travelers : 0);
    if (current.trip.seats != null && extra > 0) {
      const used =
        (await this.booked([current.tripId])).get(current.tripId) ?? 0;
      if (used + extra > current.trip.seats) {
        throw new BadRequestException(
          `Not enough seats: ${Math.max(current.trip.seats - used, 0)} left on this trip`,
        );
      }
    }

    // Paid in full: the booking is confirmed, gets its ticket, and the traveler gets
    // the confirmation + receipt by email (the admins are told too)
    const becamePaid = dto.payment === 'Paid' && current.payment !== 'Paid';
    if (becamePaid && (dto.status ?? current.status) === 'Cancelled') {
      throw new BadRequestException(
        'This booking is cancelled: set it back to Confirmed before marking it as paid',
      );
    }

    await this.prisma.tripBooking.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.payment !== undefined ? { payment: dto.payment } : {}),
        ...(dto.travelers !== undefined ? { travelers: dto.travelers } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
        ...(becamePaid
          ? {
              paidAt: new Date(),
              ...(dto.status === undefined && current.status === 'New'
                ? { status: 'Confirmed' }
                : {}),
            }
          : {}),
      },
    });
    if (becamePaid) {
      await this.giveTicket(id);
      // Not awaited: the admin does not wait for the emails
      void this.sendTicket(id)
        .then((sent) => (sent ? this.notifyAdmins('paid', id) : undefined))
        .catch((error) =>
          this.logger.error(`Trip ticket for booking ${id} failed: ${error}`),
        );
    }
    return this.pushBooking(id);
  }

  async removeBooking(id: string) {
    const booking = await this.prisma.tripBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    await this.prisma.tripBooking.delete({ where: { id } });
    this.live.toAdmins('tripBooking:deleted', { id, tripId: booking.tripId });
    return { deleted: true };
  }

  private toData(dto: TripDto) {
    const startDate = day(dto.startDate);
    const endDate = day(dto.endDate);
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('The trip cannot end before it starts');
    }
    const prices = dto.prices
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        price: p.price,
        unit: p.unit?.trim() || 'per person',
        description: p.description?.trim() || '',
        popular: !!p.popular,
        included: clean(p.included),
        excluded: clean(p.excluded),
      }));
    const names = prices.map((p) => p.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      throw new BadRequestException('Two price options have the same name');
    }
    const currency = dto.currency ?? 'USD';
    if (!CURRENCIES.has(currency)) {
      throw new BadRequestException(`Unknown currency: ${currency}`);
    }
    const active = dto.active ?? true;
    if (active && prices.length === 0) {
      throw new BadRequestException(
        'Add at least one price option before publishing the trip',
      );
    }
    return {
      title: dto.title.trim(),
      tagline: dto.tagline?.trim() || null,
      location: dto.location.trim(),
      description: dto.description.trim(),
      startDate,
      endDate,
      duration: dto.duration?.trim() || null,
      groupSize: dto.groupSize?.trim() || null,
      images: clean(dto.images),
      highlights: clean(dto.highlights),
      itinerary: dto.itinerary
        .filter((d) => d.title.trim())
        .map((d) => ({
          title: d.title.trim(),
          description: d.description?.trim() || '',
        })),
      prices,
      currency,
      seats: dto.seats ?? null,
      active,
    };
  }

  // ---------- Tickets, receipts and emails ----------

  // Every open admin panel gets the new state of the booking
  private async pushBooking(id: string) {
    const booking = await this.prisma.tripBooking.findUniqueOrThrow({
      where: { id },
      include: { trip: { select: { title: true } } },
    });
    const { trip, ...plain } = booking;
    this.live.toAdmins('tripBooking', { ...plain, tripTitle: trip.title });
    return plain;
  }

  // A ticket code no other booking (trip or package) has
  private async giveTicket(id: string) {
    const current = await this.prisma.tripBooking.findUniqueOrThrow({
      where: { id },
      select: { ticketCode: true },
    });
    if (current.ticketCode) return current.ticketCode;
    for (let tries = 0; tries < 8; tries++) {
      const code = newTicketCode();
      const usedByPackage = await this.prisma.booking.count({
        where: { ticketCode: code },
      });
      if (usedByPackage) continue;
      try {
        await this.prisma.tripBooking.update({
          where: { id },
          data: { ticketCode: code },
        });
        return code;
      } catch (error) {
        if (!(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ))
          throw error;
      }
    }
    throw new ServiceUnavailableException('Could not make a ticket code');
  }

  // Emails the confirmation, QR code ticket and receipt to the traveler.
  // Returns false when the email could not be sent (e.g. SMTP not set up).
  async sendTicket(id: string) {
    const b = await this.prisma.tripBooking.findUnique({
      where: { id },
      include: { trip: true },
    });
    if (!b) throw new NotFoundException('Booking not found');
    if (b.payment !== 'Paid' || b.status === 'Cancelled') {
      throw new BadRequestException(
        'Only a paid booking that is not cancelled gets a ticket and a receipt',
      );
    }
    const ticketCode = b.ticketCode ?? (await this.giveTicket(id));
    const lang = asLang(b.locale);
    const option = (b.trip.prices as TripPrice[]).find(
      (p) => p.name === b.option,
    );
    const paidOn = (b.paidAt ?? new Date()).toLocaleDateString(
      INTL_LOCALE[lang],
      { day: 'numeric', month: 'long', year: 'numeric' },
    );
    const email = {
      lang,
      name: b.customer,
      email: b.email,
      phone: b.phone,
      tripTitle: b.trip.title,
      tagline: b.trip.tagline,
      image: b.trip.images[0] ?? null,
      location: b.trip.location,
      dates: tripDateText(b.trip, lang),
      duration: b.trip.duration,
      option: b.option,
      unitPrice: formatMoney(b.price, b.currency),
      unit: b.unit,
      travelers: b.travelers,
      total: formatMoney(bookingTotal(b), b.currency),
      included: option?.included ?? [],
      excluded: option?.excluded ?? [],
      ticketCode,
      receiptNo: `TR-${b.id.slice(0, 8).toUpperCase()}`,
      paidOn,
      tripUrl: `${this.siteUrl}${lang === 'en' ? '' : `/${lang}`}/trips/${b.tripId}`,
    };
    const sent = await this.mail.sendHtml({
      to: b.email,
      subject: tripTicketSubject(email),
      text: tripTicketText(email),
      html: tripTicketHtml(email),
      attachments: [
        // Inline (cid), because Gmail does not show data: images
        {
          filename: `Ticket ${ticketCode}.png`,
          content: await ticketQrPng(ticketCode),
          cid: 'ticket-qr',
        },
      ],
    });
    if (sent) {
      await this.prisma.tripBooking.update({
        where: { id },
        data: { receiptSentAt: new Date() },
      });
      await this.pushBooking(id);
    }
    return sent;
  }

  // Admin > Trips > Bookings: "Resend ticket & receipt"
  async resendTicket(id: string) {
    const sent = await this.sendTicket(id);
    if (!sent) {
      throw new ServiceUnavailableException(
        'The email could not be sent. Check the email settings (SMTP) of the server.',
      );
    }
    return this.pushBooking(id);
  }

  // Emails every active admin (personal email if set, else the company one).
  // Never throws: a booking must not fail because a notification did.
  private async notifyAdmins(kind: AdminTripEmail['kind'], id: string) {
    try {
      const b = await this.prisma.tripBooking.findUnique({
        where: { id },
        include: { trip: true },
      });
      if (!b) return;
      const admins = await this.prisma.worker.findMany({
        where: { OR: [{ isAdmin: true }, { isOwner: true }], status: 'Active' },
        select: { email: true, personalEmail: true },
      });
      const to = [
        ...new Set(
          admins.map((a) => a.personalEmail || a.email).filter(Boolean),
        ),
      ];
      if (!to.length) return;
      const taken =
        b.trip.seats != null
          ? `${(await this.booked([b.tripId])).get(b.tripId) ?? 0} / ${b.trip.seats} seats taken`
          : null;
      const email: AdminTripEmail = {
        kind,
        tripTitle: b.trip.title,
        customer: b.customer,
        email: b.email,
        phone: b.phone,
        option: b.option,
        travelers: b.travelers,
        total: formatMoney(bookingTotal(b), b.currency),
        message: b.message,
        ticketCode: b.ticketCode,
        seats: taken,
        link: `${this.siteUrl}/admin/trips/${b.tripId}/bookings`,
      };
      await this.mail.sendHtml({
        to,
        subject: adminTripSubject(email),
        text: adminTripText(email),
        html: adminTripHtml(email),
      });
    } catch (error) {
      this.logger.error(`Admin email for trip booking ${id} failed: ${error}`);
    }
  }

  // ---------- Check-in (Admin > Check-in scans the QR code) ----------

  async findByTicket(text: string) {
    const booking = await this.prisma.tripBooking.findUnique({
      where: { ticketCode: ticketCodeFrom(text) },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            images: true,
          },
        },
      },
    });
    if (!booking) throw new NotFoundException('No booking has this ticket');
    return booking;
  }

  // Marks the travelers as arrived. Scanning twice is not an error: it says when.
  async checkIn(text: string) {
    const booking = await this.findByTicket(text);
    if (booking.status === 'Cancelled') {
      throw new BadRequestException(
        'This booking is cancelled: the ticket is not valid',
      );
    }
    if (booking.checkedInAt) return { booking, alreadyCheckedIn: true };
    await this.prisma.tripBooking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date() },
    });
    await this.pushBooking(booking.id);
    return { booking: await this.findByTicket(text), alreadyCheckedIn: false };
  }
}
