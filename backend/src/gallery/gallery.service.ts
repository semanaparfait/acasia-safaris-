import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { GalleryAlbumDto, GalleryItemDto } from './dto/gallery.dto';

// The gallery page: albums (a name, a description, a cover photo) and their photos.
// Photos are uploaded to the "gallery" bucket; deleting a photo or an album deletes the files.
@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // ---------- Albums ----------

  // Every album with its number of photos and the picture of its card
  async albums() {
    const albums = await this.prisma.galleryAlbum.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { photos: true } },
        photos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { image: true },
        },
      },
    });
    const covers = await this.prisma.galleryItem.findMany({
      where: {
        id: { in: albums.flatMap((a) => (a.coverId ? [a.coverId] : [])) },
      },
      select: { id: true, image: true },
    });
    return albums.map(({ _count, photos, ...album }) => ({
      ...album,
      photoCount: _count.photos,
      cover:
        covers.find((c) => c.id === album.coverId)?.image ??
        photos[0]?.image ??
        null,
    }));
  }

  async album(id: string) {
    const album = await this.prisma.galleryAlbum.findUnique({ where: { id } });
    if (!album) throw new NotFoundException(`Album ${id} not found`);
    return album;
  }

  createAlbum(dto: GalleryAlbumDto) {
    return this.prisma.galleryAlbum.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() ?? '',
      },
    });
  }

  async updateAlbum(id: string, dto: GalleryAlbumDto) {
    await this.album(id);
    if (dto.coverId) {
      const photo = await this.prisma.galleryItem.findUnique({
        where: { id: dto.coverId },
        select: { albumId: true },
      });
      if (photo?.albumId !== id) {
        throw new BadRequestException(
          'The cover must be a photo of this album',
        );
      }
    }
    return this.prisma.galleryAlbum.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() ?? '',
        coverId: dto.coverId ?? null,
      },
    });
  }

  // The album and every photo in it (their files too)
  async removeAlbum(id: string) {
    await this.album(id);
    const photos = await this.prisma.galleryItem.findMany({
      where: { albumId: id },
      select: { image: true },
    });
    await this.prisma.galleryAlbum.delete({ where: { id } }); // the photos go with it
    for (const photo of photos) await this.storage.deleteByUrl(photo.image);
    return { deleted: true, photos: photos.length };
  }

  // ---------- Photos ----------

  findAll() {
    return this.prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Gallery item ${id} not found`);
    return item;
  }

  async create(dto: GalleryItemDto) {
    await this.checkAlbum(dto.albumId);
    return this.prisma.galleryItem.create({ data: dto });
  }

  async update(id: string, dto: GalleryItemDto) {
    const old = await this.findOne(id);
    await this.checkAlbum(dto.albumId);
    const item = await this.prisma.galleryItem.update({
      where: { id },
      data: dto,
    });
    // Moved to another album: it is not the old album's cover any more
    if (old.albumId !== dto.albumId) await this.forgetCover(old.albumId, id);
    // The photo was replaced: remove the old file from the bucket
    if (old.image !== dto.image) await this.storage.deleteByUrl(old.image);
    return item;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.prisma.galleryItem.delete({ where: { id } });
    await this.forgetCover(item.albumId, id);
    await this.storage.deleteByUrl(item.image);
    return { deleted: true };
  }

  private async checkAlbum(albumId: string) {
    const found = await this.prisma.galleryAlbum.findUnique({
      where: { id: albumId },
      select: { id: true },
    });
    if (!found) throw new BadRequestException('Choose an album for the photo');
  }

  private forgetCover(albumId: string, photoId: string) {
    return this.prisma.galleryAlbum.updateMany({
      where: { id: albumId, coverId: photoId },
      data: { coverId: null },
    });
  }
}
