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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard } from '../common/admin.guard';
import { TripActiveDto, TripDto } from './trips.dto';
import { TripsService } from './trips.service';

// Special trips planned by the team, each with price options and what they cover.
//   GET    /api/trips              website: published trips that have not ended
//   GET    /api/trips/<id>         website: one published trip
//   GET    /api/trips/all          admin: every trip, drafts and past ones too
//   GET    /api/trips/all/<id>     admin
//   POST   /api/trips              admin
//   PUT    /api/trips/<id>         admin: the whole trip
//   PATCH  /api/trips/<id>/active  admin: publish / hide
//   DELETE /api/trips/<id>         admin
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
  @ApiBearerAuth()
  findAll() {
    return this.trips.findAll();
  }

  @Get('all/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.findOne(id);
  }

  @Get(':id')
  findPublishedOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.findPublishedOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Created a trip', 'Trip')
  create(@Body() dto: TripDto) {
    return this.trips.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Edited a trip', 'Trip')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: TripDto) {
    return this.trips.update(id, dto);
  }

  @Patch(':id/active')
  @UseGuards(AdminGuard)
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
  @ApiBearerAuth()
  @Audit('Deleted a trip', 'Trip')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.remove(id);
  }
}
