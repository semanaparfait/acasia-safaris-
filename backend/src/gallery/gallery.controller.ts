import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { GalleryItemDto } from './dto/gallery.dto';
import { GalleryService } from './gallery.service';

// Routes under /api/gallery. Reading is public, changing needs an admin login.
@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: GalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: GalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.remove(id);
  }
}
