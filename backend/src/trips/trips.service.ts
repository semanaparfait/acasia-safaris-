import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TripDto } from './trips.dto';

const today = () => new Date(new Date().toISOString().slice(0, 10));
const day = (d?: string | null) => (d ? new Date(d.slice(0, 10)) : null);
const clean = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);

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
  constructor(private prisma: PrismaService) {}

  // ---------- Website ----------

  findPublished() {
    return this.prisma.trip.findMany({
      where: onWebsite(),
      orderBy: [
        { startDate: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
  }

  async findPublishedOne(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, ...onWebsite() },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  // ---------- Admin ----------

  findAll() {
    return this.prisma.trip.findMany({
      orderBy: [
        { startDate: { sort: 'desc', nulls: 'first' } },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  create(dto: TripDto) {
    return this.prisma.trip.create({ data: this.toData(dto) });
  }

  async update(id: string, dto: TripDto) {
    await this.findOne(id);
    return this.prisma.trip.update({ where: { id }, data: this.toData(dto) });
  }

  async setActive(id: string, active: boolean) {
    const trip = await this.findOne(id);
    if (active && (trip.prices as unknown[]).length === 0) {
      throw new BadRequestException(
        'Add at least one price option before publishing the trip',
      );
    }
    return this.prisma.trip.update({ where: { id }, data: { active } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.trip.delete({ where: { id } });
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
      active,
    };
  }
}
