import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

// Show the package title and duration with each booking
const withPackage = {
  package: {
    select: { id: true, title: true, _count: { select: { itinerary: true } } },
  },
};

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.booking.findMany({
      include: withPackage,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: withPackage,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async create(dto: CreateBookingDto) {
    // The package must exist and be published
    const pkg = await this.prisma.package.findUnique({
      where: { id: dto.packageId },
      include: { _count: { select: { itinerary: true } } },
    });
    if (!pkg || !pkg.active) {
      throw new BadRequestException(
        `Package "${dto.packageId}" is not available`,
      );
    }

    // A 7-day trip starting on the 1st ends on the 7th
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + pkg._count.itinerary - 1);

    return this.prisma.booking.create({
      data: {
        ...dto,
        startDate,
        endDate,
        amount: pkg.price * dto.travelers,
      },
      include: withPackage,
    });
  }

  async update(id: number, dto: UpdateBookingDto) {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: dto,
      include: withPackage,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    return { deleted: true };
  }
}
