import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BookingsService } from './bookings.service';
import { ChatFilesService } from './chat-files.service';

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const PDF = Buffer.from('%PDF-1.7\n...');
const DOCX = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);

const file = (originalname: string, buffer: Buffer) =>
  ({ originalname, buffer, size: buffer.length }) as Express.Multer.File;

const setup = () => {
  const storage = {
    putPrivate: jest.fn(),
    deletePrivate: jest.fn().mockResolvedValue(undefined),
    streamPrivate: jest.fn().mockResolvedValue({ stream: 'S' }),
    configured: true,
  };
  const bookings = {
    onRemoved: jest.fn(),
    openChatByToken: jest.fn().mockResolvedValue('b1'),
    openChat: jest.fn().mockResolvedValue('b1'),
    bookingIdByToken: jest.fn().mockResolvedValue('b1'),
    customerMessage: jest.fn().mockResolvedValue({ id: 'b1' }),
    teamMessage: jest.fn().mockResolvedValue({ id: 'b1' }),
  };
  const prisma = {
    bookingMessage: { findFirst: jest.fn() },
    package: { findUnique: jest.fn() },
  };
  const service = new ChatFilesService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    bookings as unknown as BookingsService,
    { get: () => undefined } as unknown as ConfigService,
  );
  return { service, storage, bookings, prisma };
};

describe('ChatFilesService', () => {
  it('saves a customer photo in the private chat bucket and sends it', async () => {
    const { service, storage, bookings } = setup();
    await service.customerFile('tok', file('Passport.JPG', JPEG), {
      text: 'Here',
    });
    const [bucket, key, , type] = storage.putPrivate.mock.calls[0] as string[];
    expect(bucket).toBe('chat');
    expect(key).toMatch(/^bookings\/b1\/[0-9a-f-]{36}\.jpg$/);
    expect(type).toBe('image/jpeg');
    expect(bookings.customerMessage).toHaveBeenCalledWith(
      'tok',
      { text: 'Here' },
      [expect.objectContaining({ name: 'Passport.JPG', type: 'image/jpeg' })],
    );
  });

  it('explains a missing storage bucket instead of a server error', async () => {
    const { service, storage, bookings } = setup();
    storage.putPrivate.mockRejectedValue(
      Object.assign(new Error('The specified bucket does not exist'), {
        name: 'NoSuchBucket',
      }),
    );
    await expect(
      service.customerFile('tok', file('photo.jpg', JPEG), {}),
    ).rejects.toThrow('the private storage bucket "chat" does not exist');
    expect(bookings.customerMessage).not.toHaveBeenCalled();
  });

  it('refuses a file pretending to be a photo', async () => {
    const { service, storage } = setup();
    await expect(
      service.customerFile('tok', file('evil.jpg', PDF), {}),
    ).rejects.toThrow(BadRequestException);
    expect(storage.putPrivate).not.toHaveBeenCalled();
  });

  it('lets only the team send office documents', async () => {
    const { service } = setup();
    await expect(
      service.customerFile('tok', file('plan.docx', DOCX), {}),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.teamFile('b1', file('plan.docx', DOCX), {}, 'Jean'),
    ).resolves.toBeDefined();
  });

  it('removes the file when the message cannot be saved', async () => {
    const { service, storage, bookings } = setup();
    bookings.customerMessage.mockRejectedValue(new Error('too long'));
    await expect(
      service.customerFile('tok', file('a.pdf', PDF), {}),
    ).rejects.toThrow('too long');
    expect(storage.deletePrivate).toHaveBeenCalled();
  });

  it('only serves files that belong to the booking', async () => {
    const { service, prisma, storage } = setup();
    await expect(service.download('b1', '../other/x.jpg')).rejects.toThrow(
      NotFoundException,
    );
    prisma.bookingMessage.findFirst.mockResolvedValue(null);
    await expect(
      service.download('b1', '3f2a9c1e-0000-4000-8000-000000000000.jpg'),
    ).rejects.toThrow(NotFoundException);
    expect(storage.streamPrivate).not.toHaveBeenCalled();
  });

  it('sends a package quotation as a link', async () => {
    const { service, prisma, bookings } = setup();
    prisma.package.findUnique.mockResolvedValue({
      title: '7-Day Gorilla Trek!',
      quotation: 'https://api.example/api/files/tourpackages/q.pdf',
    });
    await service.teamQuotation('b1', 'p1', {}, 'Jean');
    expect(bookings.teamMessage).toHaveBeenCalledWith('b1', {}, 'Jean', [
      expect.objectContaining({
        name: '7-Day Gorilla Trek - Quotation.pdf',
        url: 'https://api.example/api/files/tourpackages/q.pdf',
      }),
    ]);
  });
});
