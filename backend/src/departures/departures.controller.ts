import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard } from '../common/admin.guard';
import { CreateDepartureDto, UpdateDepartureDto } from './departures.dto';
import { DeparturesService } from './departures.service';

// Group departures: a package on a fixed date that anyone can join.
//   GET    /api/departures?packageId=<id>   website: open departures with seats left
//   GET    /api/departures/all              admin: every departure with travelers booked
//   POST   /api/departures                  admin
//   PATCH  /api/departures/<id>             admin: seats, note, open/closed, date (while empty)
//   DELETE /api/departures/<id>             admin: only while nobody joined
// Travelers join with POST /api/bookings and "departureId".
@ApiTags('Departures')
@Controller('departures')
export class DeparturesController {
  constructor(private departures: DeparturesService) {}

  @Get()
  findOpen(
    @Query('packageId', new ParseUUIDPipe({ optional: true }))
    packageId?: string,
  ) {
    return this.departures.findOpen(packageId);
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAll() {
    return this.departures.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Created a group departure', 'Departure')
  create(@Body() dto: CreateDepartureDto) {
    return this.departures.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Changed a group departure', 'Departure')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartureDto,
  ) {
    return this.departures.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Deleted a group departure', 'Departure')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departures.remove(id);
  }
}
