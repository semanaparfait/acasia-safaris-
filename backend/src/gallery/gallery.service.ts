import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { GalleryItemDto } from './dto/gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  findAll() {
    return this.prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Gallery item ${id} not found`);
    return item;
  }

  create(dto: GalleryItemDto) {
    return this.prisma.galleryItem.create({ data: dto });
  }

  async update(id: number, dto: GalleryItemDto) {
    const old = await this.findOne(id);
    const item = await this.prisma.galleryItem.update({
      where: { id },
      data: dto,
    });
    // The photo was replaced: remove the old file from the bucket
    if (old.image !== dto.image) await this.storage.deleteByUrl(old.image);
    return item;
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.prisma.galleryItem.delete({ where: { id } });
    await this.storage.deleteByUrl(item.image);
    return { deleted: true };
  }
}
