import { ConfigService } from '@nestjs/config';
import { LiveGateway } from '../live/live.gateway';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateBookingDto } from './dto/booking.dto';
import { BookingsService } from './bookings.service';

// A 7-day package at $1,000 per adult, lowest accepted $800. Default rates:
// Adult $1,000, Teenager $750, Child $500, Infant $0
const pkg = {
  id: 'p1',
  active: true,
  price: 1000,
  minPrice: 800,
  rates: null,
  _count: { itinerary: 7 },
};

const booking = (changes = {}) => ({
  id: 'b1',
  customer: 'Ana',
  email: 'ana@mail.com',
  accessToken: 'tok',
  ticketCode: null as string | null,
  startDate: new Date('2026-12-01'),
  endDate: new Date('2026-12-07'),
  travelers: 3,
  guests: [],
  payment: 'Unpaid',
  destinations: [],
  status: 'Pending',
  amount: 2500,
  listAmount: 2500,
  offer: null as number | null,
  offerBy: null as string | null,
  package: { title: 'Gorilla trek' },
  ...changes,
});

const setup = () => {
  const prisma = {
    package: { findUnique: jest.fn().mockResolvedValue(pkg) },
    booking: {
      create: jest.fn().mockResolvedValue({ id: 'b1' }),
      findUnique: jest.fn().mockResolvedValue(booking()),
      update: jest.fn(),
    },
    bookingMessage: { count: jest.fn().mockResolvedValue(0) },
  };
  const mail = {
    sendBookingUpdate: jest.fn(),
    sendBookingConfirmation: jest.fn(),
  };
  const live = { toAdmins: jest.fn(), toVisitor: jest.fn() };
  const service = new BookingsService(
    prisma as unknown as PrismaService,
    { notifyNewBooking: jest.fn() } as unknown as WhatsappService,
    mail as unknown as MailService,
    live as unknown as LiveGateway,
    { get: () => 'https://acacia.example' } as unknown as ConfigService,
  );
  return { service, prisma, mail, live };
};

const dto = {
  customer: 'Ana',
  email: 'ana@mail.com',
  country: 'Spain',
  packageId: 'p1',
  startDate: '2026-12-01',
  travelers: 3,
  guests: [
    { label: 'Adult', count: 2 },
    { label: 'Child', count: 1 },
  ],
} as CreateBookingDto;

type Created = { data: Record<string, unknown> };
const createdData = (prisma: ReturnType<typeof setup>['prisma']) =>
  (prisma.booking.create.mock.calls[0] as [Created])[0].data;
const updatedData = (prisma: ReturnType<typeof setup>['prisma']) =>
  (prisma.booking.update.mock.calls[0] as [Created])[0].data;

describe('BookingsService', () => {
  it('works out the price and the lowest price from the travelers', async () => {
    const { service, prisma } = setup();
    await service.create(dto);

    const data = createdData(prisma);
    expect(data.listAmount).toBe(2500); // 2 x 1000 + 1 x 500
    expect(data.amount).toBe(2500);
    expect(data.floorAmount).toBe(2000); // 2 x 800 + 1 x 400
    expect(data.travelers).toBe(3);
    expect(data.children).toBe(1);
    expect(data.endDate).toEqual(new Date('2026-12-07'));
    expect(data.status).toBe('Confirmed'); // happy with the price: confirmed at once
  });

  it('starts bargaining when the visitor offers less', async () => {
    const { service, prisma, mail } = setup();
    await service.create({ ...dto, offer: 2100, offerNote: 'Students' });

    const data = createdData(prisma);
    expect(data).toMatchObject({
      status: 'Negotiating',
      offer: 2100,
      offerBy: 'customer',
      needsReply: true,
    });
    expect(data.messages).toEqual({
      create: expect.objectContaining({
        text: 'Students',
        offer: 2100,
      }) as object,
    });
    expect(mail.sendBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        link: 'https://acacia.example/my-booking/tok',
      }),
    );
  });

  it('refuses a traveler type the package does not have', async () => {
    const { service } = setup();
    await expect(
      service.create({ ...dto, guests: [{ label: 'Pirate', count: 1 }] }),
    ).rejects.toThrow('Unknown traveler type');
  });

  it('refuses a visitor offer that is not lower than the price', async () => {
    const { service } = setup();
    await expect(
      service.customerMessage('tok', { offer: 2500 }),
    ).rejects.toThrow('lower than the price');
  });

  it('does not take new offers once the price is agreed', async () => {
    const { service, prisma } = setup();
    prisma.booking.findUnique.mockResolvedValue(
      booking({ status: 'Confirmed' }),
    );
    await expect(
      service.customerMessage('tok', { offer: 2000 }),
    ).rejects.toThrow('already agreed');
  });

  it('a team counter-offer waits for the visitor and emails them', async () => {
    const { service, prisma, mail } = setup();
    await service.teamMessage(
      'b1',
      { offer: 2300, text: 'Best we can do' },
      'Yassel',
    );

    expect(updatedData(prisma)).toMatchObject({
      offer: 2300,
      offerBy: 'team',
      status: 'Negotiating',
      needsReply: false,
    });
    expect(mail.sendBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'New price for your trip: $2,300' }),
    );
  });

  it('the visitor accepts the team price: saved and confirmed', async () => {
    const { service, prisma } = setup();
    prisma.booking.findUnique.mockResolvedValue(
      booking({ status: 'Negotiating', offer: 2300, offerBy: 'team' }),
    );
    await service.customerAccept('tok');

    expect(updatedData(prisma)).toMatchObject({
      amount: 2300,
      offer: null,
      status: 'Confirmed',
    });
  });

  it('the team cannot accept when the visitor made no offer', async () => {
    const { service } = setup();
    await expect(service.teamAccept('b1', 'Yassel')).rejects.toThrow(
      'no price from the customer',
    );
  });

  it('confirms at once when the visitor is happy with the price', async () => {
    const { service, prisma, mail } = setup();
    prisma.booking.findUnique.mockResolvedValue(
      booking({ status: 'Confirmed' }),
    );
    await service.create(dto);

    expect(createdData(prisma).status).toBe('Confirmed');
    // The ticket code is saved before the answer, so the booking page shows the QR code
    const ticket = (prisma.booking.update.mock.calls as [Created][]).find(
      ([c]) => 'ticketCode' in c.data,
    );
    expect(ticket?.[0].data.ticketCode).toMatch(/^[A-HJKMNP-Z2-9]{10}$/);
    expect(mail.sendBookingUpdate).not.toHaveBeenCalled(); // the confirmation replaces it
  });

  it('pushes every change live to the admins and the visitor', async () => {
    const { service, live } = setup();
    await service.teamMessage('b1', { text: 'Hello' }, 'Yassel');

    expect(live.toAdmins).toHaveBeenCalledWith('booking', expect.anything());
    expect(live.toVisitor).toHaveBeenCalledWith(
      'tok',
      'booking',
      expect.anything(),
    );
  });

  it('does not let a cancelled booking check in', async () => {
    const { service, prisma } = setup();
    prisma.booking.findUnique.mockResolvedValue(
      booking({ status: 'Cancelled', ticketCode: 'ABCDEFGHJK' }),
    );
    await expect(service.checkIn('ACACIA:abcdefghjk')).rejects.toThrow(
      'not valid',
    );
  });

  it('says when a ticket was already scanned', async () => {
    const { service, prisma } = setup();
    prisma.booking.findUnique.mockResolvedValue(
      booking({ status: 'Confirmed', checkedInAt: new Date() }),
    );
    const result = await service.checkIn('ABCDEFGHJK');
    expect(result.alreadyCheckedIn).toBe(true);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it('emails a French visitor in French, with the French page link', async () => {
    const { service, prisma, mail } = setup();
    prisma.booking.findUnique.mockResolvedValue(
      booking({ status: 'Negotiating', offer: 2100, locale: 'fr' }),
    );
    await service.create({ ...dto, offer: 2100, locale: 'fr' });

    expect(createdData(prisma).locale).toBe('fr');
    expect(mail.sendBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        lang: 'fr',
        subject: 'Nous avons bien reçu votre demande de réservation',
        link: 'https://acacia.example/fr/my-booking/tok',
      }),
    );
  });
});
