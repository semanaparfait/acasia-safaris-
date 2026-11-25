import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TranslationsService } from '../translations/translations.service';
import { GalleryService } from './gallery.service';

const setup = () => {
  const galleryAlbum = {
    findMany: jest.fn(),
    findUnique: jest.fn().mockResolvedValue({ id: 'a1' }),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  };
  const galleryItem = {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const storage = { deleteByUrl: jest.fn() };
  const service = new GalleryService(
    { galleryAlbum, galleryItem } as unknown as PrismaService,
    storage as unknown as StorageService,
    {
      refreshLater: jest.fn(),
      localizeAlbum: <T>(a: T) => a,
      localizePhotos: <T>(p: T) => p,
    } as unknown as TranslationsService,
  );
  return { service, galleryAlbum, galleryItem, storage };
};

describe('GalleryService', () => {
  it('shows the chosen cover, else the newest photo', async () => {
    const { service, galleryAlbum, galleryItem } = setup();
    galleryAlbum.findMany.mockResolvedValue([
      {
        id: 'a1',
        name: 'Gorillas',
        coverId: 'p2',
        _count: { photos: 3 },
        photos: [{ image: 'new.jpg' }],
      },
      {
        id: 'a2',
        name: 'Lakes',
        coverId: null,
        _count: { photos: 1 },
        photos: [{ image: 'kivu.jpg' }],
      },
      {
        id: 'a3',
        name: 'Empty',
        coverId: null,
        _count: { photos: 0 },
        photos: [],
      },
    ]);
    galleryItem.findMany.mockResolvedValue([{ id: 'p2', image: 'cover.jpg' }]);

    const albums = await service.albums();
    expect(albums.map((a) => [a.cover, a.photoCount])).toEqual([
      ['cover.jpg', 3],
      ['kivu.jpg', 1],
      [null, 0],
    ]);
  });

  it('refuses a cover from another album', async () => {
    const { service, galleryItem, galleryAlbum } = setup();
    galleryItem.findUnique.mockResolvedValue({ albumId: 'other' });
    await expect(
      service.updateAlbum('a1', { name: 'Gorillas', coverId: 'p9' }),
    ).rejects.toThrow(BadRequestException);
    expect(galleryAlbum.update).not.toHaveBeenCalled();
  });

  it('deletes an album with the files of its photos', async () => {
    const { service, galleryAlbum, galleryItem, storage } = setup();
    galleryItem.findMany.mockResolvedValue([
      { image: 'a.jpg' },
      { image: 'b.jpg' },
    ]);
    const result = await service.removeAlbum('a1');
    expect(galleryAlbum.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    expect(storage.deleteByUrl.mock.calls).toEqual([['a.jpg'], ['b.jpg']]);
    expect(result).toEqual({ deleted: true, photos: 2 });
  });

  it('a photo moved to another album stops being the old cover', async () => {
    const { service, galleryItem, galleryAlbum } = setup();
    galleryItem.findUnique.mockResolvedValue({
      id: 'p1',
      albumId: 'a1',
      image: 'x.jpg',
    });
    await service.update('p1', { title: 'T', albumId: 'a2', image: 'x.jpg' });
    expect(galleryAlbum.updateMany).toHaveBeenCalledWith({
      where: { id: 'a1', coverId: 'p1' },
      data: { coverId: null },
    });
  });

  it('needs an existing album for a photo', async () => {
    const { service, galleryAlbum, galleryItem } = setup();
    galleryAlbum.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ title: 'T', albumId: 'nope', image: 'x.jpg' }),
    ).rejects.toThrow('Choose an album');
    expect(galleryItem.create).not.toHaveBeenCalled();
  });
});
