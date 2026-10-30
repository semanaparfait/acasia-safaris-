import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PackageDto, QuotationEmailDto } from './dto/package.dto';

// Anyone can ask for a quotation email, so the form cannot be used to flood
// one inbox, or to use up the sending limit of the mail account
const HOUR = 60 * 60 * 1000;
const MAX_EMAILS_PER_ADDRESS = 3; // per hour
const MAX_EMAILS_TOTAL = 100; // per hour

// Always return the itinerary with each package, sorted Day 1, Day 2, ...
const withItinerary = { itinerary: { orderBy: { day: 'asc' as const } } };

// Turns the itinerary list from the request into rows with a day number.
function toDays(dto: PackageDto) {
  return dto.itinerary.map((d, index) => ({ ...d, day: index + 1 }));
}

@Injectable()
export class PackagesService {
  private recentEmails: { to: string; at: number }[] = [];

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private mail: MailService,
  ) {}

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

  create(dto: PackageDto) {
    // The database gives the new package a UUID
    return this.prisma.package.create({
      data: {
        ...dto,
        perks: dto.perks ?? [],
        itinerary: { create: toDays(dto) },
      },
      include: withItinerary,
    });
  }

  async update(id: string, dto: PackageDto) {
    const current = await this.findOne(id); // 404 if it does not exist

    const updated = await this.prisma.package.update({
      where: { id },
      data: {
        ...dto,
        perks: dto.perks ?? [],
        // Simplest way to save an edited itinerary: remove the old days, add the new ones
        itinerary: { deleteMany: {}, create: toDays(dto) },
      },
      include: withItinerary,
    });

    // A replaced or removed quotation PDF is not needed anymore
    if (dto.quotation !== undefined && dto.quotation !== current.quotation) {
      await this.storage.deleteByUrl(current.quotation);
    }
    return updated;
  }

  async remove(id: string) {
    const pkg = await this.findOne(id);
    // Itinerary days are deleted automatically (onDelete: Cascade in the schema)
    await this.prisma.package.delete({ where: { id } });

    // Remove its uploaded files from the "tourpackages" bucket
    for (const url of [
      pkg.image,
      pkg.quotation,
      ...pkg.itinerary.map((d) => d.image),
    ]) {
      await this.storage.deleteByUrl(url);
    }
    return { deleted: true };
  }

  // The request is saved first, so the admin sees it under Messages even if the email fails
  async emailQuotation(id: string, dto: QuotationEmailDto) {
    const pkg = await this.findOne(id);
    if (!pkg.active || !pkg.quotation) {
      throw new NotFoundException('This package has no quotation yet');
    }

    const to = dto.email.toLowerCase().trim();
    const name = dto.name.trim();
    this.checkEmailLimit(to);

    await this.prisma.message.create({
      data: {
        name,
        email: to,
        subject: `Quotation request: ${pkg.title}`,
        body: `${name} asked for the quotation of ${pkg.title} by email.`,
        source: 'Quotation request',
      },
    });
    await this.mail.sendQuotation({
      to,
      name,
      packageTitle: pkg.title,
      pdfUrl: pkg.quotation,
    });
    return { sent: true };
  }

  private checkEmailLimit(to: string) {
    const now = Date.now();
    this.recentEmails = this.recentEmails.filter((e) => now - e.at < HOUR);

    const forAddress = this.recentEmails.filter((e) => e.to === to).length;
    if (
      forAddress >= MAX_EMAILS_PER_ADDRESS ||
      this.recentEmails.length >= MAX_EMAILS_TOTAL
    ) {
      throw new HttpException(
        'Too many requests. Please try again later or download the quotation.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.recentEmails.push({ to, at: now });
  }
}
