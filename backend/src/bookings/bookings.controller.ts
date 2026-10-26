import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

// Routes under /api/bookings
@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // POST /api/bookings   (website: anyone can request a booking)
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // Everything below is admin only

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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.remove(id);
  }
}
