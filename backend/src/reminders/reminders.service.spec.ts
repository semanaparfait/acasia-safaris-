import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from './reminders.service';

const DAY = 86_400_000;

// Making the QR code image can be slow on a busy machine
jest.setTimeout(30_000);

const booking = (changes = {}) => ({
  id: 'b1',
  customer: 'Ana',
  email: 'ana@mail.com',
  accessToken: 'tok',
  locale: 'en',
  ticketCode: 'AC7K2M9QXP',
  amount: 2000,
  startDate: new Date(Date.now() + 6 * DAY),
  endDate: new Date(Date.now() + 12 * DAY),
  createdAt: new Date(Date.now() - 30 * DAY),
  package: { title: 'Gorilla Trek' },
  destinations: [],
  ...changes,
});

const setup = () => {
  const prisma = {
    booking: { findMany: jest.fn().mockResolvedValue([]), update: jest.fn() },
  };
  const mail = { sendBookingUpdate: jest.fn() };
  const service = new RemindersService(
    prisma as unknown as PrismaService,
    mail as unknown as MailService,
    { get: () => 'https://acacia.example' } as unknown as ConfigService,
  );
  return { service, prisma, mail };
};

type Sent = {
  subject: string;
  link: string;
  qrPng?: Buffer;
  paragraphs: string[];
  lang: string;
  button?: string;
};
const sent = (mail: ReturnType<typeof setup>['mail']) =>
  (mail.sendBookingUpdate.mock.calls[0] as [Sent])[0];

describe('RemindersService', () => {
  it('reminds 7 days before the trip, with the QR code, only once', async () => {
    const { service, prisma, mail } = setup();
    prisma.booking.findMany.mockResolvedValue([booking()]);

    expect(await service.tripReminders()).toBe(1);
    expect(sent(mail).subject).toBe('Your trip is coming: Gorilla Trek');
    expect(sent(mail).qrPng).toBeInstanceOf(Buffer);
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: { tripReminderAt: expect.any(Date) as Date },
    });
  });

  it('does not remind someone who booked this week (they just got the ticket)', async () => {
    const { service, prisma, mail } = setup();
    prisma.booking.findMany.mockResolvedValue([
      booking({ createdAt: new Date(Date.now() - DAY / 2) }),
    ]);

    expect(await service.tripReminders()).toBe(0);
    expect(mail.sendBookingUpdate).not.toHaveBeenCalled();
    expect(prisma.booking.update).toHaveBeenCalled(); // marked, so never sent later
  });

  it('asks for the remaining 50%, in the visitor language', async () => {
    const { service, prisma, mail } = setup();
    prisma.booking.findMany.mockResolvedValue([booking({ locale: 'fr' })]);

    await service.balanceReminders();
    expect(sent(mail).lang).toBe('fr');
    expect(sent(mail).subject).toBe('Rappel : solde restant de $1,000');
    expect(sent(mail).link).toBe('https://acacia.example/fr/my-booking/tok');
  });

  it('asks how the trip was, links to the review form and completes the booking', async () => {
    const { service, prisma, mail } = setup();
    prisma.booking.findMany.mockResolvedValue([booking()]);

    await service.reviewRequests();
    expect(sent(mail).button).toBe('Leave a review');
    expect(sent(mail).link).toBe(
      'https://acacia.example/my-booking/tok#review',
    );
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: { reviewRequestAt: expect.any(Date) as Date, status: 'Completed' },
    });
  });
});
