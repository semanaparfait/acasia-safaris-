import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { StorageService } from './storage.service';

// GET /api/files/gallery/3f2a...c9.jpg   (public)
// The buckets are private, so the website loads images through this route.
@Controller('files')
export class FilesController {
  constructor(private storage: StorageService) {}

  @Get(':bucket/:key')
  // File names are unique and never change, so browsers may cache them for a year
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async getFile(@Param('bucket') bucket: string, @Param('key') key: string) {
    const file = await this.storage.download(bucket, key);
    return new StreamableFile(file.stream, { type: file.contentType });
  }
}
