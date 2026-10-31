import { HttpException, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PackagesService } from './packages.service';
import { QuotationService } from './quotation.service';

const pkg = (changes = {}) => ({
  id: 'p1',
  title: 'Gorilla Trek',
  active: true,
  image: 'a.png',
  quotation: 'http://api/api/files/tourpackages/q.pdf',
  quotationManual: false,
  itinerary: [],
  ...changes,
});

const setup = (found = pkg()) => {
  const prisma = {
    package: {
      create: jest.fn().mockResolvedValue(found),
      findUnique: jest.fn().mockResolvedValue(found),
      update: jest.fn().mockResolvedValue(found),
    },
    message: { create: jest.fn() },
  };
  const storage = {
    deleteByUrl: jest.fn(),
    save: jest.fn().mockResolvedValue({ url: 'made.pdf' }),
  };
  const mail = { sendQuotation: jest.fn() };
  const quotations = { build: jest.fn().mockResolvedValue(Buffer.from('pdf')) };
  const service = new PackagesService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    mail as unknown as MailService,
    quotations as unknown as QuotationService,
  );
  return { service, prisma, storage, mail, quotations };
};

const form = {
  perks: [],
  itinerary: [{ title: 't', description: '', image: '' }],
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

  it('makes the PDF of a new package', async () => {
    const { service, storage, quotations } = setup(pkg({ quotation: null }));
    await service.create(form as never);

    expect(quotations.build).toHaveBeenCalledTimes(1);
    expect(storage.save).toHaveBeenCalledTimes(1);
  });

  it('still saves a new package if its PDF cannot be made', async () => {
    const { service, quotations } = setup(pkg({ quotation: null }));
    quotations.build.mockRejectedValue(new Error('no image'));

    await expect(service.create(form as never)).resolves.toBeDefined();
  });

  it('remakes a generated PDF when the package is saved', async () => {
    const { service, storage, quotations } = setup();
    await service.update('p1', {
      ...form,
      quotation: pkg().quotation,
    } as never);

    expect(quotations.build).toHaveBeenCalledTimes(1);
    expect(storage.deleteByUrl).toHaveBeenCalledWith(pkg().quotation);
  });

  it('leaves a PDF the admin uploaded alone', async () => {
    const { service, storage, quotations } = setup(
      pkg({ quotationManual: true }),
    );
    await service.update('p1', {
      ...form,
      quotation: pkg().quotation,
    } as never);

    expect(quotations.build).not.toHaveBeenCalled();
    expect(storage.deleteByUrl).not.toHaveBeenCalled();
  });

  it('keeps an uploaded PDF and deletes the old one', async () => {
    const { service, prisma, storage, quotations } = setup();
    await service.update('p1', { ...form, quotation: 'new.pdf' } as never);

    expect(quotations.build).not.toHaveBeenCalled();
    expect(storage.deleteByUrl).toHaveBeenCalledWith(pkg().quotation);
    const [call] = prisma.package.update.mock.calls[0] as [
      { data: { quotationManual: boolean } },
    ];
    expect(call.data.quotationManual).toBe(true);
  });

  it('does not bring back a PDF the admin removed', async () => {
    const { service, quotations } = setup();
    await service.update('p1', { ...form, quotation: null } as never);

    expect(quotations.build).not.toHaveBeenCalled();
  });
});
