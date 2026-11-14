import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartureDto, UpdateDepartureDto } from './departures.dto';

// Bookings that hold a seat: every one except the cancelled ones
export const HOLDS_SEAT = { status: { not: 'Cancelled' } } as const;

const today = () => new Date(new Date().toISOString().slice(0, 10));

// The last day of a trip: a 3-day trip starting on the 1st ends on the 3rd
const endOf = (start: Date, days: number) => {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + Math.max(days - 1, 0));
  return end;
};

// "france" -> "France", "usa" -> "USA"
const tidyCountry = (c: string) => {
  const s = c.trim();
  return s.length <= 3
    ? s.toUpperCase()
    : s.charAt(0).toUpperCase() + s.slice(1);
};

@Injectable()
export class DeparturesService {
  constructor(private prisma: PrismaService) {}

  // Travelers per departure (cancelled bookings do not count)
  private async taken(ids: string[]) {
    if (ids.length === 0) return new Map<string, number>();
    const rows = await this.prisma.booking.groupBy({
      by: ['departureId'],
      where: { departureId: { in: ids }, ...HOLDS_SEAT },
      _sum: { travelers: true },
    });
    return new Map(rows.map((r) => [r.departureId!, r._sum.travelers ?? 0]));
  }

  // ---------- Website ----------

  // Open departures that have not started, of published packages.
  // Only countries are shown about the other travelers, never names.
  async findOpen(packageId?: string) {
    const departures = await this.prisma.departure.findMany({
      where: {
        open: true,
        startDate: { gt: today() },
        package: { active: true },
        ...(packageId ? { packageId } : {}),
      },
      include: {
        package: { select: { _count: { select: { itinerary: true } } } },
        bookings: {
          where: HOLDS_SEAT,
          select: { country: true, travelers: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
    return departures.map((d) => {
      const travelers = d.bookings.reduce((s, b) => s + b.travelers, 0);
      return {
        id: d.id,
        packageId: d.packageId,
        startDate: d.startDate,
        endDate: endOf(d.startDate, d.package._count.itinerary),
        seats: d.seats,
        seatsLeft: Math.max(d.seats - travelers, 0),
        travelers,
        countries: [
          ...new Set(d.bookings.map((b) => tidyCountry(b.country))),
        ].slice(0, 6),
        note: d.note,
      };
    });
  }

  // ---------- Admin ----------

  async findAll() {
    const departures = await this.prisma.departure.findMany({
      include: {
        package: {
          select: {
            id: true,
            title: true,
            image: true,
            _count: { select: { itinerary: true } },
          },
        },
        _count: { select: { bookings: { where: HOLDS_SEAT } } },
      },
      orderBy: { startDate: 'asc' },
    });
    const taken = await this.taken(departures.map((d) => d.id));
    return departures.map(({ _count, ...d }) => ({
      ...d,
      endDate: endOf(d.startDate, d.package._count.itinerary),
      travelers: taken.get(d.id) ?? 0,
      bookingCount: _count.bookings,
    }));
  }

  async create(dto: CreateDepartureDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: dto.packageId },
    });
    if (!pkg) throw new BadRequestException('This package does not exist');
    const startDate = new Date(dto.startDate.slice(0, 10));
    if (startDate <= today()) {
      throw new BadRequestException('A departure must start after today');
    }
    try {
      await this.prisma.departure.create({
        data: {
          packageId: dto.packageId,
          startDate,
          seats: dto.seats,
          note: dto.note?.trim() || null,
          open: dto.open ?? true,
        },
      });
    } catch (e) {
      this.sameDate(e);
    }
    return this.findAll();
  }

  async update(id: string, dto: UpdateDepartureDto) {
    const current = await this.prisma.departure.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Departure not found');
    // Travelers already booked the date: it cannot move under them
    if (
      dto.startDate &&
      dto.startDate.slice(0, 10) !==
        current.startDate.toISOString().slice(0, 10)
    ) {
      const booked = await this.prisma.booking.count({
        where: { departureId: id, ...HOLDS_SEAT },
      });
      if (booked > 0) {
        throw new BadRequestException(
          'Travelers have already joined this departure: its date cannot change. Close it and create a new one.',
        );
      }
    }
    try {
      await this.prisma.departure.update({
        where: { id },
        data: {
          ...(dto.startDate
            ? { startDate: new Date(dto.startDate.slice(0, 10)) }
            : {}),
          ...(dto.seats !== undefined ? { seats: dto.seats } : {}),
          ...(dto.note !== undefined ? { note: dto.note.trim() || null } : {}),
          ...(dto.open !== undefined ? { open: dto.open } : {}),
        },
      });
    } catch (e) {
      this.sameDate(e);
    }
    return this.findAll();
  }

  async remove(id: string) {
    const booked = await this.prisma.booking.count({
      where: { departureId: id, ...HOLDS_SEAT },
    });
    if (booked > 0) {
      throw new BadRequestException(
        'Travelers have joined this departure: close it instead of deleting it.',
      );
    }
    await this.prisma.departure.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Departure not found');
    });
    return this.findAll();
  }

  private sameDate(e: unknown): never {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      throw new ConflictException(
        'This package already has a departure on that date',
      );
    }
    throw e;
  }
}
