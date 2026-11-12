import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { isLang } from '../translations/content';
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { DestinationsService } from './destinations.service';
import { DestinationDto } from './dto/destination.dto';

// Routes under /api/destinations. Reading is public, changing needs an admin login.
@ApiTags('Destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private destinationsService: DestinationsService) {}

  // GET /api/destinations?lang=fr   (translated; no lang = English)
  @Get()
  findAll(@Query('lang') lang?: string) {
    return this.destinationsService.findAll(isLang(lang) ? lang : undefined);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang?: string,
  ) {
    return this.destinationsService.findOneLocalized(
      id,
      isLang(lang) ? lang : undefined,
    );
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Added a destination', 'Destination')
  create(@Body() dto: DestinationDto) {
    return this.destinationsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Edited a destination', 'Destination')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: DestinationDto) {
    return this.destinationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Deleted a destination', 'Destination')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.destinationsService.remove(id);
  }
}
