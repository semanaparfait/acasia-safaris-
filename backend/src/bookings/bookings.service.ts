import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import {
  BookingDestinationDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './dto/booking.dto';

// Show the package title and duration, and the destinations, with each booking
const withDetails = {
  package: {
    select: { id: true, title: true, _count: { select: { itinerary: true } } },
  },
  destinations: true,
};

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsappService,
  ) {}

  findAll() {
    return this.prisma.booking.findMany({
      include: withDetails,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: withDetails,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async create(dto: CreateBookingDto) {
    const booking = await (dto.destinations
      ? this.createForDestinations(dto, dto.destinations)
      : this.createForPackage(dto));

    // Not awaited: the visitor does not wait for the WhatsApp messages
    void this.whatsapp.notifyNewBooking(booking);
    return booking;
  }

  // Destinations have no fixed price: the amount stays 0 until the admin sets it
  private createForDestinations(
    dto: CreateBookingDto,
    destinations: BookingDestinationDto[],
  ) {
    if (!dto.endDate) throw new BadRequestException('endDate is required');
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('endDate cannot be before startDate');
    }

    return this.prisma.booking.create({
      data: {
        customer: dto.customer,
        email: dto.email,
        phone: dto.phone,
        country: dto.country,
        startDate,
        endDate,
        travelers: dto.travelers,
        children: dto.children,
        notes: dto.notes,
        amount: 0,
        destinations: { create: destinations },
      },
      include: withDetails,
    });
  }

  private async createForPackage(dto: CreateBookingDto) {
    // The package must exist and be published
    const pkg = dto.packageId
      ? await this.prisma.package.findUnique({
          where: { id: dto.packageId },
          include: { _count: { select: { itinerary: true } } },
        })
      : null;
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
        customer: dto.customer,
        email: dto.email,
        phone: dto.phone,
        country: dto.country,
        packageId: pkg.id,
        travelers: dto.travelers,
        children: dto.children,
        notes: dto.notes,
        startDate,
        endDate,
        amount: pkg.price * dto.travelers,
      },
      include: withDetails,
    });
  }

  async update(id: string, dto: UpdateBookingDto) {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: dto,
      include: withDetails,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    return { deleted: true };
  }
}
