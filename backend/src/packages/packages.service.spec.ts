import { HttpException, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PackagesService } from './packages.service';

const pkg = (changes = {}) => ({
  id: 'p1',
  title: 'Gorilla Trek',
  active: true,
  image: 'a.png',
  quotation: 'http://api/api/files/tourpackages/q.pdf',
  itinerary: [],
  ...changes,
});

const setup = (found = pkg()) => {
  const prisma = {
    package: {
      findUnique: jest.fn().mockResolvedValue(found),
      update: jest.fn().mockResolvedValue(found),
    },
    message: { create: jest.fn() },
  };
  const storage = { deleteByUrl: jest.fn() };
  const mail = { sendQuotation: jest.fn() };
  const service = new PackagesService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    mail as unknown as MailService,
  );
  return { service, prisma, storage, mail };
};

const visitor = { name: ' Jane ', email: 'Jane@Example.com' };

describe('PackagesService quotation', () => {
  it('saves the request and emails the quotation', async () => {
    const { service, prisma, mail } = setup();
    await service.emailQuotation('p1', visitor);

    expect(prisma.message.create).toHaveBeenCalledTimes(1);
    expect(mail.sendQuotation).toHaveBeenCalledWith({
      to: 'jane@example.com',
      name: 'Jane',
      packageTitle: 'Gorilla Trek',
      pdfUrl: 'http://api/api/files/tourpackages/q.pdf',
    });
  });

  it('keeps the request when the email fails', async () => {
    const { service, prisma, mail } = setup();
    mail.sendQuotation.mockRejectedValue(new Error('smtp down'));

    await expect(service.emailQuotation('p1', visitor)).rejects.toThrow();
    expect(prisma.message.create).toHaveBeenCalledTimes(1);
  });

  it('refuses a package without a quotation', async () => {
    const { service, mail } = setup(pkg({ quotation: null }));

    await expect(service.emailQuotation('p1', visitor)).rejects.toThrow(
      NotFoundException,
    );
    expect(mail.sendQuotation).not.toHaveBeenCalled();
  });

  it('refuses a draft package', async () => {
    const { service } = setup(pkg({ active: false }));
    await expect(service.emailQuotation('p1', visitor)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('stops after 3 emails to one address in an hour', async () => {
    const { service, mail } = setup();
    for (let i = 0; i < 3; i++) await service.emailQuotation('p1', visitor);

    await expect(service.emailQuotation('p1', visitor)).rejects.toThrow(
      HttpException,
    );
    expect(mail.sendQuotation).toHaveBeenCalledTimes(3);
  });

  it('deletes the old PDF only when the quotation changes', async () => {
    const { service, storage } = setup();
    const dto = {
      perks: [],
      itinerary: [{ title: 't', description: '', image: '' }],
    };

    await service.update('p1', {
      ...dto,
      quotation: pkg().quotation,
    } as never);
    expect(storage.deleteByUrl).not.toHaveBeenCalled();

    await service.update('p1', { ...dto, quotation: 'new.pdf' } as never);
    expect(storage.deleteByUrl).toHaveBeenCalledWith(pkg().quotation);
  });
});
