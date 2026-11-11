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
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { GalleryItemDto } from './dto/gallery.dto';
import { GalleryService } from './gallery.service';

// Routes under /api/gallery. Reading is public, changing needs an admin login.
@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Added a gallery photo', 'Photo')
  create(@Body() dto: GalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Edited a gallery photo', 'Photo')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: GalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Deleted a gallery photo', 'Photo')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.remove(id);
  }
}
