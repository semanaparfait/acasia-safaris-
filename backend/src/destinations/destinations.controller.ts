import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { DestinationsService } from './destinations.service';
import { DestinationDto } from './dto/destination.dto';

// Routes under /api/destinations. Reading is public, changing needs an admin login.
@Controller('destinations')
export class DestinationsController {
  constructor(private destinationsService: DestinationsService) {}

  @Get()
  findAll() {
    return this.destinationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.destinationsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: DestinationDto) {
    return this.destinationsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: DestinationDto) {
    return this.destinationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.destinationsService.remove(id);
  }
}
