import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DestinationDto } from './dto/destination.dto';

@Injectable()
export class DestinationsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  findAll() {
    return this.prisma.destination.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
    });
    if (!destination)
      throw new NotFoundException(`Destination "${id}" not found`);
    return destination;
  }

  create(dto: DestinationDto) {
    // The database gives the new destination a UUID
    return this.prisma.destination.create({ data: dto });
  }

  async update(id: string, dto: DestinationDto) {
    await this.findOne(id);
    return this.prisma.destination.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const destination = await this.findOne(id);
    await this.prisma.destination.delete({ where: { id } });
    await this.storage.deleteByUrl(destination.image);
    return { deleted: true };
  }
}
