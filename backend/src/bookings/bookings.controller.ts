import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { BookingsService } from './bookings.service';
import {
  AddPaymentDto,
  TripReviewDto,
  BookingMessageDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './dto/booking.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { ChatLimit, FormLimit } from '../common/limits';

// Routes under /api/bookings
@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // POST /api/bookings   (website: anyone can request a booking)
  // Package bookings send "guests" and may send "offer" (a lower price) to start bargaining.
  // Returns the booking with its accessToken: the visitor's page is /my-booking/<accessToken>
  @Post()
  @FormLimit()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // The visitor's booking page. The token in the link is the key: no login.
  // GET /api/bookings/track/<token>
  @Get('track/:token')
  findByToken(@Param('token') token: string) {
    return this.bookingsService.findByToken(token);
  }

  // GET /api/bookings/track/<token>/calendar.ics   -> "Add to calendar" (.ics file)
  @Get('track/:token/calendar.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header(
    'Content-Disposition',
    'attachment; filename="acacia-safaris-trip.ics"',
  )
  async tripIcs(@Param('token') token: string) {
    return this.bookingsService.tripIcs(token);
  }

  // GET /api/bookings/track/<token>/qr   -> the ticket QR code (PNG), once confirmed
  @Get('track/:token/qr')
  @SkipThrottle()
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'private, max-age=86400')
  async ticketQr(@Param('token') token: string) {
    return new StreamableFile(await this.bookingsService.ticketQr(token));
  }

  // POST /api/bookings/track/<token>/messages   body: { "text": "...", "offer"?: 6000 }
  @Post('track/:token/messages')
  @ChatLimit()
  customerMessage(
    @Param('token') token: string,
    @Body() dto: BookingMessageDto,
  ) {
    return this.bookingsService.customerMessage(token, dto);
  }

  // POST /api/bookings/track/<token>/accept   -> accepts the team's price (or the current one)
  // POST /api/bookings/track/<token>/review   body: { "rating": 5, "text": "..." }
  // After the trip; goes to Admin > Reviews as Pending
  @Post('track/:token/review')
  @FormLimit()
  @HttpCode(200)
  customerReview(@Param('token') token: string, @Body() dto: TripReviewDto) {
    return this.bookingsService.customerReview(token, dto);
  }

  @Post('track/:token/accept')
  @ChatLimit()
  @HttpCode(200)
  customerAccept(@Param('token') token: string) {
    return this.bookingsService.customerAccept(token);
  }

  // Everything below is admin only

  // Admin > Check-in: GET /api/bookings/ticket/<code or scanned "ACACIA:<code>">
  @Get('ticket/:code')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findByTicket(@Param('code') code: string) {
    return this.bookingsService.findByTicket(code);
  }

  // POST /api/bookings/ticket/<code>/check-in   -> { booking, alreadyCheckedIn }
  @Post('ticket/:code/check-in')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Checked in travelers', 'Ticket')
  checkIn(@Param('code') code: string) {
    return this.bookingsService.checkIn(code);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  // PATCH /api/bookings/12   body: { "status": "Confirmed", "payment": "Deposit" }
  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Changed a booking (status, payment or price)', 'Booking')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  // POST /api/bookings/12/messages   body: { "text": "...", "offer"?: 6600 }  (emails the visitor)
  @Post(':id/messages')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Wrote to the customer / sent a price', 'Booking')
  teamMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BookingMessageDto,
    @Req() request: AdminRequest,
  ) {
    return this.bookingsService.teamMessage(id, dto, request.worker.name);
  }

  // POST /api/bookings/12/accept   -> accepts the visitor's price and confirms the booking
  @Post(':id/accept')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit("Accepted the customer's price", 'Booking')
  teamAccept(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AdminRequest,
  ) {
    return this.bookingsService.teamAccept(id, request.worker.name);
  }

  // POST /api/bookings/12/payments   body: { "amount": 1500, "method": "Bank transfer", "paidAt"?: "2026-11-13", "reference"?: "..." }
  @Post(':id/payments')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Recorded a payment', 'Booking')
  addPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPaymentDto,
    @Req() request: AdminRequest,
  ) {
    return this.bookingsService.addPayment(id, dto, request.worker.name);
  }

  // DELETE /api/bookings/12/payments/<paymentId>   (a payment entered by mistake)
  @Delete(':id/payments/:paymentId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Removed a payment', 'Booking')
  removePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.bookingsService.removePayment(id, paymentId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Deleted a booking', 'Booking')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.remove(id);
  }
}
