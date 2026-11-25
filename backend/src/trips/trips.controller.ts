import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard } from '../common/admin.guard';
import { Access, OwnerOnly } from '../common/permissions';
import { FormLimit } from '../common/limits';
import {
  CreateTripBookingDto,
  JoinWaitlistDto,
  TripActiveDto,
  TripDto,
  TripReviewDto,
  UpdateTripBookingDto,
} from './trips.dto';
import { TripsService } from './trips.service';

// Special trips planned by the team, each with price options and what they cover.
//   GET    /api/trips              website: published trips that have not ended
//   GET    /api/trips/<id>         website: one published trip
//   GET    /api/trips/all          admin: every trip, drafts and past ones too
//   GET    /api/trips/all/<id>     admin
//   POST   /api/trips              admin
//   PUT    /api/trips/<id>         admin: the whole trip
//   PATCH  /api/trips/<id>/active  admin: publish / hide
//   DELETE /api/trips/<id>         admin (refused once people booked it)
// Bookings:
//   POST   /api/trips/<id>/bookings          website: reserve a seat
//   GET    /api/trips/all/<id>/bookings      admin: who booked
//   PATCH  /api/trips/bookings/<bookingId>   admin: status, payment, travelers, notes
//   DELETE /api/trips/bookings/<bookingId>   admin
//   POST   /api/trips/bookings/<bookingId>/send-ticket  admin: email the ticket and receipt again
// Paid bookings get a ticket: GET /api/trips/tickets/<code>, POST /api/trips/tickets/<code>/check-in
// The PDF ticket: GET /api/trips/tickets/pdf/<token> (traveler), GET /api/trips/bookings/<id>/ticket.pdf (admin)
// Waitlist, reminders and reviews:
//   POST   /api/trips/<id>/waitlist              website: wait for a seat (full trips)
//   GET    /api/trips/all/<id>/waitlist          admin
//   POST   /api/trips/all/<id>/waitlist/notify   admin: email the people waiting (if seats are free)
//   DELETE /api/trips/waitlist/<entryId>         admin
//   POST   /api/trips/reminders/run              admin: send today's reminders and review requests now
//   GET    /api/trips/review/<token>             website: the review page
//   POST   /api/trips/review/<token>             website: send the review
@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private trips: TripsService) {}

  @Get()
  findPublished() {
    return this.trips.findPublished();
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  findAll() {
    return this.trips.findAll();
  }

  @Get('all/:id')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.findOne(id);
  }

  @Get('all/:id/bookings')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  bookings(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.bookings(id);
  }

  @Post(':id/bookings')
  @FormLimit()
  book(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTripBookingDto,
  ) {
    return this.trips.book(id, dto);
  }

  @Patch('bookings/:bookingId')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Changed a trip booking', 'TripBooking')
  updateBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: UpdateTripBookingDto,
  ) {
    return this.trips.updateBooking(bookingId, dto);
  }

  @Delete('bookings/:bookingId')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Deleted a trip booking', 'TripBooking')
  removeBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.trips.removeBooking(bookingId);
  }

  // Paid bookings: email the confirmation, QR code ticket and receipt again
  @Post('bookings/:bookingId/send-ticket')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Emailed a trip ticket and receipt', 'TripBooking')
  sendTicket(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.trips.resendTicket(bookingId);
  }

  // The printable PDF ticket. The traveler's private link (from the emails):
  @Get('tickets/pdf/:token')
  async ticketPdfByToken(@Param('token') token: string) {
    return this.pdfFile(await this.trips.ticketPdfByToken(token));
  }

  // The same PDF for the team (Admin > Trips > Bookings), e.g. to print it at the office
  @Get('bookings/:bookingId/ticket.pdf')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  async ticketPdf(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.pdfFile(await this.trips.ticketPdf(bookingId));
  }

  // Opens in the browser (ready to print); "Save" keeps the file name
  private pdfFile({ pdf, fileName }: { pdf: Buffer; fileName: string }) {
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `inline; filename="${fileName.replace(/[^\w .-]/g, '')}"`,
      length: pdf.length,
    });
  }

  // Admin > Check-in: the QR code holds "ACACIA:<code>" (or type the code)
  @Get('tickets/:code')
  @UseGuards(AdminGuard)
  @Access('checkin', 'trips')
  @ApiBearerAuth()
  findTicket(@Param('code') code: string) {
    return this.trips.findByTicket(code);
  }

  @Post('tickets/:code/check-in')
  @UseGuards(AdminGuard)
  @Access('checkin', 'trips')
  @ApiBearerAuth()
  @Audit('Checked in trip travelers', 'TripBooking')
  checkIn(@Param('code') code: string) {
    return this.trips.checkIn(code);
  }

  @Post(':id/waitlist')
  @FormLimit()
  joinWaitlist(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: JoinWaitlistDto,
  ) {
    return this.trips.joinWaitlist(id, dto);
  }

  @Get('all/:id/waitlist')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  waitlist(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.waitlist(id);
  }

  @Post('all/:id/waitlist/notify')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Emailed the waitlist of a trip', 'Trip')
  async notifyWaitlist(@Param('id', ParseUUIDPipe) id: string) {
    return { sent: await this.trips.notifyWaitlist(id) };
  }

  @Delete('waitlist/:entryId')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Removed someone from a trip waitlist', 'Trip')
  removeFromWaitlist(@Param('entryId', ParseUUIDPipe) entryId: string) {
    return this.trips.removeFromWaitlist(entryId);
  }

  @Post('reminders/run')
  @UseGuards(AdminGuard)
  @OwnerOnly()
  @ApiBearerAuth()
  @Audit('Sent the trip reminders')
  runReminders() {
    return this.trips.runReminders();
  }

  @Get('review/:token')
  reviewInfo(@Param('token') token: string) {
    return this.trips.reviewInfo(token);
  }

  @Post('review/:token')
  @FormLimit()
  submitReview(@Param('token') token: string, @Body() dto: TripReviewDto) {
    return this.trips.submitReview(token, dto);
  }

  @Get(':id')
  findPublishedOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.findPublishedOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Created a trip', 'Trip')
  create(@Body() dto: TripDto) {
    return this.trips.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Edited a trip', 'Trip')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: TripDto) {
    return this.trips.update(id, dto);
  }

  @Patch(':id/active')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Published or hid a trip', 'Trip')
  setActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TripActiveDto,
  ) {
    return this.trips.setActive(id, dto.active);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Access('trips')
  @ApiBearerAuth()
  @Audit('Deleted a trip', 'Trip')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.remove(id);
  }
}
