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
import { Access } from '../common/permissions';
import { GalleryAlbumDto, GalleryItemDto } from './dto/gallery.dto';
import { GalleryService } from './gallery.service';

// Routes under /api/gallery. Reading is public, changing needs an admin with Gallery access.
//   GET    /api/gallery                 every photo (each with its albumId)
//   GET    /api/gallery/albums          every album, with photoCount and cover (a photo URL)
//   POST   /api/gallery/albums          { name, description }
//   PUT    /api/gallery/albums/<id>     { name, description, coverId? }
//   DELETE /api/gallery/albums/<id>     the album and all its photos
//   POST   /api/gallery                 a photo { title, albumId, location?, image }
@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  // ---------- Albums ----------

  @Get('albums')
  albums() {
    return this.galleryService.albums();
  }

  @Post('albums')
  @UseGuards(AdminGuard)
  @Access('gallery')
  @ApiBearerAuth()
  @Audit('Created a gallery album', 'Album')
  createAlbum(@Body() dto: GalleryAlbumDto) {
    return this.galleryService.createAlbum(dto);
  }

  @Put('albums/:id')
  @UseGuards(AdminGuard)
  @Access('gallery')
  @ApiBearerAuth()
  @Audit('Edited a gallery album', 'Album')
  updateAlbum(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GalleryAlbumDto,
  ) {
    return this.galleryService.updateAlbum(id, dto);
  }

  @Delete('albums/:id')
  @UseGuards(AdminGuard)
  @Access('gallery')
  @ApiBearerAuth()
  @Audit('Deleted a gallery album and its photos', 'Album')
  removeAlbum(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.removeAlbum(id);
  }

  // ---------- Photos ----------

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  @Access('gallery')
  @ApiBearerAuth()
  @Audit('Added a gallery photo', 'Photo')
  create(@Body() dto: GalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @Access('gallery')
  @ApiBearerAuth()
  @Audit('Edited a gallery photo', 'Photo')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: GalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Access('gallery')
  @ApiBearerAuth()
  @Audit('Deleted a gallery photo', 'Photo')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.remove(id);
  }
}
