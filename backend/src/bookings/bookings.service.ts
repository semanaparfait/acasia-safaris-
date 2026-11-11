import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { toBuffer } from 'qrcode';
import { LiveGateway } from '../live/live.gateway';
import { MailService } from '../mail/mail.service';
import { ratesOf } from '../packages/quotation.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import {
  BookingDestinationDto,
  BookingMessageDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './dto/booking.dto';

// Admins see everything: the package, destinations and the conversation,
// plus the lowest price the team accepts and the visitor's private link
const adminInclude = {
  package: {
    select: { id: true, title: true, _count: { select: { itinerary: true } } },
  },
  destinations: true,
  messages: { orderBy: { createdAt: 'asc' as const } },
};
const adminOmit = { floorAmount: false, accessToken: false } as const;

// What a visitor sees on their booking page (no lowest price, no team notes)
const publicSelect = {
  id: true,
  customer: true,
  email: true,
  country: true,
  startDate: true,
  endDate: true,
  travelers: true,
  children: true,
  guests: true,
  amount: true,
  listAmount: true,
  offer: true,
  offerBy: true,
  status: true,
  payment: true,
  createdAt: true,
  ticketCode: true, // only once confirmed: shown as a QR code on the booking page
  checkedInAt: true,
  package: {
    select: {
      id: true,
      title: true,
      image: true,
      location: true,
      _count: { select: { itinerary: true } },
    },
  },
  destinations: true,
  messages: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      sender: true,
      authorName: true,
      text: true,
      offer: true,
      event: true,
      createdAt: true,
    },
  },
} satisfies Prisma.BookingSelect;

const MAX_MESSAGES = 300; // per booking, so a link cannot be used to flood the database
const CLOSED = ['Completed', 'Cancelled']; // no more messages
const CAN_BARGAIN = ['Pending', 'Negotiating']; // price proposals are only for these

type Sender = 'customer' | 'team';
type Guest = { label: string; ages: string; count: number; price: number };

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
const newToken = () => randomBytes(24).toString('hex');

// Ticket codes: 10 letters and digits that cannot be confused (no 0/O, 1/I/L)
const TICKET_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newTicketCode = () =>
  Array.from(
    { length: 10 },
    () => TICKET_LETTERS[randomInt(TICKET_LETTERS.length)],
  ).join('');

// What the QR code holds. The scanner in Admin > Check-in reads it (or the bare code).
export const ticketQrText = (code: string) => `ACACIA:${code}`;
export const ticketCodeFrom = (text: string) =>
  text
    .trim()
    .toUpperCase()
    .replace(/^ACACIA:/, '');

// "Mon 1 Dec" (dates are stored at midnight UTC)
const day = (d: Date, year = false) =>
  d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private siteUrl: string;

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsappService,
    private mail: MailService,
    private live: LiveGateway,
    config: ConfigService,
  ) {
    // FRONTEND_URL can hold several addresses: the first one is the website
    this.siteUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
  }

  // ---------- Admin ----------

  findAll() {
    return this.prisma.booking.findMany({
      include: adminInclude,
      omit: adminOmit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: adminInclude,
      omit: adminOmit,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto) {
    const current = await this.findOne(id);
    await this.prisma.booking.update({ where: { id }, data: dto });
    // Confirmed by hand (e.g. a destination trip once its price is set): send the ticket
    if (dto.status === 'Confirmed' && current.status !== 'Confirmed') {
      await this.confirm(id);
    }
    return this.changed(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    this.live.toAdmins('booking:deleted', { id });
    return { deleted: true };
  }

  // The team answers, and can propose a new price with "offer"
  async teamMessage(id: string, dto: BookingMessageDto, authorName: string) {
    const booking = await this.findOne(id);
    await this.addMessage(booking, 'team', authorName, dto);

    const email = dto.offer
      ? {
          subject: `New price for your trip: ${usd(dto.offer)}`,
          heading: 'We have a price for you',
          paragraphs: [
            `${authorName} proposed ${usd(dto.offer)} for your trip.`,
            ...(dto.text?.trim() ? [`"${dto.text.trim()}"`] : []),
            'Open your booking to accept it or to reply.',
          ],
        }
      : {
          subject: 'New message about your trip',
          heading: 'You have a new message',
          paragraphs: [`${authorName} wrote:`, `"${dto.text?.trim()}"`],
        };
    this.emailCustomer(booking, email);
    return this.changed(id);
  }

  // The team accepts the visitor's price proposal
  async teamAccept(id: string, authorName: string) {
    const booking = await this.findOne(id);
    if (booking.offerBy !== 'customer' || !booking.offer) {
      throw new BadRequestException(
        'There is no price from the customer to accept',
      );
    }
    await this.acceptOffer(booking, 'team', authorName, booking.offer);
    await this.confirm(id); // the confirmation email with the QR code ticket
    return this.changed(id);
  }

  // ---------- Check-in (Admin > Check-in scans the QR code) ----------

  async findByTicket(text: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { ticketCode: ticketCodeFrom(text) },
      include: adminInclude,
      omit: adminOmit,
    });
    if (!booking) throw new NotFoundException('No booking has this ticket');
    return booking;
  }

  // Marks the travelers as arrived. Scanning twice is not an error: it says when.
  async checkIn(text: string) {
    const booking = await this.findByTicket(text);
    if (booking.status !== 'Confirmed' && booking.status !== 'Completed') {
      throw new BadRequestException(
        `This booking is ${booking.status.toLowerCase()}: the ticket is not valid`,
      );
    }
    if (booking.checkedInAt) {
      return { booking, alreadyCheckedIn: true };
    }
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date() },
    });
    return { booking: await this.changed(booking.id), alreadyCheckedIn: false };
  }

  // The QR code image for the visitor's booking page
  async ticketQr(token: string) {
    const { ticketCode } = await this.findBookingByToken(token);
    if (!ticketCode)
      throw new NotFoundException('This booking has no ticket yet');
    return this.qrPng(ticketCode);
  }

  // ---------- Website ----------

  async create(dto: CreateBookingDto) {
    const id = await (dto.destinations
      ? this.createForDestinations(dto, dto.destinations)
      : this.createForPackage(dto));

    const booking = await this.findOne(id);
    // Not awaited: the visitor does not wait for the WhatsApp messages
    void this.whatsapp.notifyNewBooking(booking);

    if (booking.status === 'Confirmed') {
      // Booked at the full price: confirmed now, with the QR code ticket
      await this.confirm(id);
    } else {
      this.emailCustomer(booking, {
        subject: 'We received your booking request',
        heading: 'Your booking request is in',
        paragraphs: [
          `Thank you for choosing Acacia Safaris. We received your request for ${booking.package?.title ?? 'your trip'}.`,
          booking.status === 'Negotiating'
            ? `You asked for ${usd(booking.offer ?? 0)}. Our team will answer within 24 hours.`
            : 'Our team will send you a price within 24 hours.',
          'You can follow your booking and write to us at any time from your booking page.',
        ],
      });
    }
    await this.changed(id);
    return {
      ...(await this.findByToken(booking.accessToken)),
      accessToken: booking.accessToken,
    };
  }

  // Destinations have no fixed price: the team proposes one in the conversation
  private async createForDestinations(
    dto: CreateBookingDto,
    destinations: BookingDestinationDto[],
  ) {
    if (!dto.endDate) throw new BadRequestException('endDate is required');
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('endDate cannot be before startDate');
    }

    const booking = await this.prisma.booking.create({
      data: {
        customer: dto.customer,
        email: dto.email,
        phone: dto.phone,
        country: dto.country,
        startDate,
        endDate,
        travelers: dto.travelers,
        children: dto.children,
        notes: dto.notes,
        amount: 0,
        accessToken: newToken(),
        destinations: { create: destinations },
      },
      select: { id: true },
    });
    return booking.id;
  }

  private async createForPackage(dto: CreateBookingDto) {
    // The package must exist and be published
    const pkg = dto.packageId
      ? await this.prisma.package.findUnique({
          where: { id: dto.packageId },
          include: { _count: { select: { itinerary: true } } },
          omit: { minPrice: false },
        })
      : null;
    if (!pkg || !pkg.active) {
      throw new BadRequestException(
        `Package "${dto.packageId}" is not available`,
      );
    }

    // Travelers per price group (Adult, Child...) with the package's prices.
    // Without "guests" (older website) everyone is an adult.
    const rates = ratesOf(pkg);
    const asked = dto.guests ?? [
      { label: rates[0].label, count: dto.travelers },
    ];
    const guests: Guest[] = asked
      .filter((g) => g.count > 0)
      .map((g) => {
        const rate = rates.find((r) => r.label === g.label);
        if (!rate)
          throw new BadRequestException(`Unknown traveler type "${g.label}"`);
        return { ...rate, count: g.count };
      });
    const travelers = guests.reduce((sum, g) => sum + g.count, 0);
    if (travelers < 1 || travelers > 50) {
      throw new BadRequestException('A booking is for 1 to 50 travelers');
    }
    const children = guests
      .filter((g) => g.label !== rates[0].label)
      .reduce((sum, g) => sum + g.count, 0);
    const listAmount = guests.reduce((sum, g) => sum + g.count * g.price, 0);

    // The lowest total the team accepts: every price lowered like the adult price
    const floorAmount =
      pkg.minPrice != null && pkg.price > 0
        ? guests.reduce(
            (sum, g) =>
              sum + g.count * Math.round((g.price * pkg.minPrice!) / pkg.price),
            0,
          )
        : null;

    // A 7-day trip starting on the 1st ends on the 7th
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + pkg._count.itinerary - 1);

    // Asking less than the price starts the bargaining
    const bargains = dto.offer != null && dto.offer < listAmount;

    const booking = await this.prisma.booking.create({
      data: {
        customer: dto.customer,
        email: dto.email,
        phone: dto.phone,
        country: dto.country,
        packageId: pkg.id,
        travelers,
        children,
        notes: dto.notes,
        startDate,
        endDate,
        guests,
        amount: listAmount,
        listAmount,
        floorAmount,
        accessToken: newToken(),
        // Happy with the price: confirmed at once (online payment comes later)
        status: 'Confirmed',
        ...(bargains
          ? {
              status: 'Negotiating',
              offer: dto.offer,
              offerBy: 'customer',
              needsReply: true,
              messages: {
                create: {
                  sender: 'customer',
                  authorName: dto.customer,
                  text:
                    dto.offerNote?.trim() ||
                    'I would like to ask for a better price.',
                  offer: dto.offer,
                  event: 'offer',
                },
              },
            }
          : {}),
      },
      select: { id: true },
    });
    return booking.id;
  }

  // The visitor's booking page: /my-booking/<token>
  async findByToken(token: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { accessToken: token },
      select: publicSelect,
    });
    if (!booking) throw new NotFoundException('This booking link is not valid');
    return booking;
  }

  // The visitor writes, and can propose a price with "offer"
  async customerMessage(token: string, dto: BookingMessageDto) {
    const booking = await this.findBookingByToken(token);
    await this.addMessage(booking, 'customer', booking.customer, dto);
    await this.changed(booking.id);
    return this.findByToken(token);
  }

  // The visitor accepts the team's price, or books at the current price
  async customerAccept(token: string) {
    const booking = await this.findBookingByToken(token);
    const price =
      booking.offerBy === 'team' && booking.offer
        ? booking.offer
        : booking.amount;
    if (!CAN_BARGAIN.includes(booking.status) || price <= 0) {
      throw new BadRequestException('There is no price to accept');
    }
    await this.acceptOffer(booking, 'customer', booking.customer, price);
    await this.confirm(booking.id);
    await this.changed(booking.id);
    return this.findByToken(token);
  }

  // ---------- Shared ----------

  private async findBookingByToken(token: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { accessToken: token },
      omit: adminOmit,
    });
    if (!booking) throw new NotFoundException('This booking link is not valid');
    return booking;
  }

  private async addMessage(
    booking: { id: string; status: string; listAmount: number; amount: number },
    sender: Sender,
    authorName: string,
    dto: BookingMessageDto,
  ) {
    const text = dto.text?.trim() ?? '';
    if (!text && !dto.offer) throw new BadRequestException('Write a message');
    if (CLOSED.includes(booking.status)) {
      throw new BadRequestException(
        `This booking is ${booking.status.toLowerCase()}`,
      );
    }
    if (dto.offer) {
      if (!CAN_BARGAIN.includes(booking.status)) {
        throw new BadRequestException(
          'The price of this booking is already agreed',
        );
      }
      // A visitor asks for less than the full price (destination trips have none yet)
      if (
        sender === 'customer' &&
        booking.listAmount > 0 &&
        dto.offer >= booking.listAmount
      ) {
        throw new BadRequestException(
          `Your offer must be lower than the price (${usd(booking.listAmount)})`,
        );
      }
    }
    const count = await this.prisma.bookingMessage.count({
      where: { bookingId: booking.id },
    });
    if (count >= MAX_MESSAGES) {
      throw new BadRequestException(
        'This conversation is too long. Please contact us by WhatsApp.',
      );
    }

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        needsReply: sender === 'customer',
        ...(dto.offer
          ? { offer: dto.offer, offerBy: sender, status: 'Negotiating' }
          : {}),
        messages: {
          create: {
            sender,
            authorName,
            text:
              text ||
              (sender === 'customer'
                ? 'I would like to propose this price.'
                : 'Here is our price for your trip.'),
            offer: dto.offer,
            event: dto.offer ? 'offer' : null,
          },
        },
      },
    });
  }

  // Both sides agree: the price is saved and the booking is confirmed
  private async acceptOffer(
    booking: { id: string },
    sender: Sender,
    authorName: string,
    price: number,
  ) {
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        amount: price,
        offer: null,
        offerBy: null,
        status: 'Confirmed',
        needsReply: sender === 'customer', // the team should see that the visitor accepted
        messages: {
          create: {
            sender,
            authorName,
            text: `${authorName} accepted the price of ${usd(price)}.`,
            offer: price,
            event: 'accepted',
          },
        },
      },
    });
  }

  // Confirmed: gives the booking its ticket code, then emails the confirmation
  // with everything about the trip and the QR code (not awaited)
  private async confirm(id: string) {
    let ticketCode = (await this.findOne(id)).ticketCode;
    for (let tries = 0; !ticketCode && tries < 5; tries++) {
      const code = newTicketCode();
      try {
        await this.prisma.booking.update({
          where: { id },
          data: { ticketCode: code },
        });
        ticketCode = code;
      } catch (error) {
        // Two bookings got the same code (very unlikely): try another one
        if (!(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ))
          throw error;
      }
    }
    // Not awaited, and never allowed to crash the server: a failed email is only logged
    if (ticketCode) {
      this.sendConfirmation(id, ticketCode).catch((error) =>
        this.logger.error(`Confirmation for booking ${id} failed: ${error}`),
      );
    }
  }

  private async sendConfirmation(id: string, ticketCode: string) {
    const b = await this.prisma.booking.findUnique({
      where: { id },
      omit: adminOmit,
      include: {
        destinations: true,
        package: {
          select: {
            title: true,
            image: true,
            location: true,
            description: true,
            tripType: true,
            lodging: true,
            route: true,
            inclusions: true,
            exclusions: true,
            perks: true,
            whyChoose: true,
            quotation: true,
            itinerary: {
              orderBy: { day: 'asc' },
              select: {
                day: true,
                title: true,
                description: true,
                image: true,
              },
            },
          },
        },
      },
    });
    if (!b) return;

    const guests = Array.isArray(b.guests) ? (b.guests as Guest[]) : [];
    const travelers = guests.length
      ? guests
          .map(
            (g) =>
              `${g.count} ${g.label.toLowerCase()}${g.count > 1 ? 's' : ''}`,
          )
          .join(', ')
      : `${b.travelers} traveler${b.travelers > 1 ? 's' : ''}`;
    const days =
      Math.round((b.endDate.getTime() - b.startDate.getTime()) / 86_400_000) +
      1;
    const deposit = Math.round(b.amount * 0.3);
    const short = (text: string) =>
      text.length > 450 ? `${text.slice(0, 447)}…` : text; // keeps the email under Gmail's size limit

    await this.mail.sendBookingConfirmation({
      to: b.email,
      name: b.customer,
      title: b.package?.title ?? b.destinations.map((d) => d.title).join(' · '),
      image: b.package?.image,
      location: b.package?.location,
      description: b.package?.description,
      tripType: b.package?.tripType,
      lodging: b.package?.lodging,
      route: b.package?.route ?? b.destinations.map((d) => d.title),
      guests,
      perks: b.package?.perks ?? [],
      whyChoose: b.package?.whyChoose ?? [],
      quotationUrl: b.package?.quotation,
      dates: `${day(b.startDate)} – ${day(b.endDate, true)}`,
      duration: `${days} ${days === 1 ? 'day' : 'days'}`,
      travelers,
      price: usd(b.amount),
      payment:
        b.payment === 'Paid'
          ? 'Paid in full'
          : b.payment === 'Deposit'
            ? 'Deposit received'
            : `30% deposit (${usd(deposit)}) holds your dates. We will send you the payment details.`,
      itinerary: (b.package?.itinerary ?? []).map((d) => ({
        ...d,
        description: short(d.description),
      })),
      inclusions: b.package?.inclusions ?? [],
      exclusions: b.package?.exclusions ?? [],
      ticketCode,
      qrPng: await this.qrPng(ticketCode),
      link: `${this.siteUrl}/my-booking/${b.accessToken}`,
    });
  }

  private qrPng(ticketCode: string) {
    return toBuffer(ticketQrText(ticketCode), {
      width: 480,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#12231a', light: '#ffffff' },
    });
  }

  // Pushes the new state of a booking to every open admin panel and to the
  // visitor's booking page, and returns the admin view
  private async changed(id: string) {
    const booking = await this.findOne(id);
    this.live.toAdmins('booking', booking);
    this.live.toVisitor(
      booking.accessToken,
      'booking',
      await this.findByToken(booking.accessToken),
    );
    return booking;
  }

  private emailCustomer(
    booking: { email: string; customer: string; accessToken: string },
    email: { subject: string; heading: string; paragraphs: string[] },
  ) {
    void this.mail.sendBookingUpdate({
      ...email,
      to: booking.email,
      name: booking.customer,
      link: `${this.siteUrl}/my-booking/${booking.accessToken}`,
    });
  }
}
