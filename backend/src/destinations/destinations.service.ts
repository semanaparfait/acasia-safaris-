import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DestinationDto } from './dto/destination.dto';

@Injectable()
export class DestinationsService {
  constructor(private prisma: PrismaService) {}

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
    // id from the title plus a short suffix, e.g. "lake-kivu-m3k9x2"
    const id = `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    return this.prisma.destination.create({ data: { ...dto, id } });
  }

  async update(id: string, dto: DestinationDto) {
    await this.findOne(id);
    return this.prisma.destination.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.destination.delete({ where: { id } });
    return { deleted: true };
  }
}
