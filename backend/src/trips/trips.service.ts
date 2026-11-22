import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Trip } from '@prisma/client';
import { toE164 } from '../common/phone';
import { LiveGateway } from '../live/live.gateway';
import { PrismaService } from '../prisma/prisma.service';
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

type TripPrice = { name: string; price: number; unit: string };

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
  constructor(
    private prisma: PrismaService,
    private live: LiveGateway,
  ) {}

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

    const booking = await this.prisma.tripBooking.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.payment !== undefined ? { payment: dto.payment } : {}),
        ...(dto.travelers !== undefined ? { travelers: dto.travelers } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
      },
    });
    this.live.toAdmins('tripBooking', {
      ...booking,
      tripTitle: current.trip.title,
    });
    return booking;
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
}
