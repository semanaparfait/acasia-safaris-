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
  create(@Body() dto: GalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: GalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.remove(id);
  }
}
