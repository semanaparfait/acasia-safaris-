import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DestinationDto } from './dto/destination.dto';
import { TranslationsService } from '../translations/translations.service';
import type { Lang } from '../translations/content';

@Injectable()
export class DestinationsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private translations: TranslationsService,
  ) {}

  // In the visitor's language (no lang = English, as the admin panel uses it)
  async findAll(lang?: Lang) {
    const destinations = await this.prisma.destination.findMany({
      omit: { translations: false },
      orderBy: { createdAt: 'asc' },
    });
    return destinations.map((d) =>
      this.translations.localizeDestination(d, lang),
    );
  }

  async findOneLocalized(id: string, lang?: Lang) {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
      omit: { translations: false },
    });
    if (!destination)
      throw new NotFoundException(`Destination "${id}" not found`);
    return this.translations.localizeDestination(destination, lang);
  }

  async findOne(id: string) {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
    });
    if (!destination)
      throw new NotFoundException(`Destination "${id}" not found`);
    return destination;
  }

  async create(dto: DestinationDto) {
    // The database gives the new destination a UUID
    const destination = await this.prisma.destination.create({ data: dto });
    this.translations.refreshLater('destination', destination.id); // French + Swahili, in the background
    return destination;
  }

  async update(id: string, dto: DestinationDto) {
    await this.findOne(id);
    const destination = await this.prisma.destination.update({
      where: { id },
      data: dto,
    });
    this.translations.refreshLater('destination', id); // only new or changed texts are translated
    return destination;
  }

  async remove(id: string) {
    const destination = await this.findOne(id);
    await this.prisma.destination.delete({ where: { id } });
    await this.storage.deleteByUrl(destination.image);
    return { deleted: true };
  }
}
