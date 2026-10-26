import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackageDto } from './dto/package.dto';

// Always return the itinerary with each package, sorted Day 1, Day 2, ...
const withItinerary = { itinerary: { orderBy: { day: 'asc' as const } } };

// Turns the itinerary list from the request into rows with a day number.
function toDays(dto: PackageDto) {
  return dto.itinerary.map((d, index) => ({ ...d, day: index + 1 }));
}

// "7-Day Gorilla Trek!" -> "7-day-gorilla-trek"
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  // Website: only published packages
  findPublished() {
    return this.prisma.package.findMany({
      where: { active: true },
      include: withItinerary,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Admin: everything, drafts included
  findAll() {
    return this.prisma.package.findMany({
      include: withItinerary,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: withItinerary,
    });
    if (!pkg) throw new NotFoundException(`Package "${id}" not found`);
    return pkg;
  }

  async create(dto: PackageDto) {
    let id = slugify(dto.title);
    // If the id is taken, add a short suffix
    if (await this.prisma.package.findUnique({ where: { id } })) {
      id = `${id}-${Date.now().toString(36)}`;
    }

    return this.prisma.package.create({
      data: {
        ...dto,
        id,
        perks: dto.perks ?? [],
        itinerary: { create: toDays(dto) },
      },
      include: withItinerary,
    });
  }

  async update(id: string, dto: PackageDto) {
    await this.findOne(id); // 404 if it does not exist

    return this.prisma.package.update({
      where: { id },
      data: {
        ...dto,
        perks: dto.perks ?? [],
        // Simplest way to save an edited itinerary: remove the old days, add the new ones
        itinerary: { deleteMany: {}, create: toDays(dto) },
      },
      include: withItinerary,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Itinerary days are deleted automatically (onDelete: Cascade in the schema)
    await this.prisma.package.delete({ where: { id } });
    return { deleted: true };
  }
}
