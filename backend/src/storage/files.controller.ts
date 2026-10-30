import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { safeFileName } from '../common/file-name';
import { StorageService } from './storage.service';

// GET /api/files/gallery/3f2a...c9.jpg   (public)
// The buckets are private, so the website loads images through this route.
// Add ?download=<name> to save the file under that name instead of opening it.
@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private storage: StorageService) {}

  @Get(':bucket/:key')
  // File names are unique and never change, so browsers may cache them for a year
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiQuery({ name: 'download', required: false })
  async getFile(
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('download') download?: string,
  ) {
    const file = await this.storage.download(bucket, key);
    return new StreamableFile(file.stream, {
      type: file.contentType,
      disposition: download
        ? `attachment; filename="${safeFileName(download)}"`
        : undefined,
    });
  }
}
