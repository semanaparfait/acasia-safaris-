import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../common/admin.guard';
import { StorageService } from './storage.service';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/uploads/gallery   (admin)
// Send the image as multipart/form-data in a field called "file".
// Returns { bucket, key, url } — save the url in the package / destination / gallery item.
@Controller('uploads')
@UseGuards(AdminGuard)
export class UploadsController {
  constructor(private storage: StorageService) {}

  @Post(':bucket')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE } }))
  upload(
    @Param('bucket') bucket: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file)
      throw new BadRequestException('Send the image in a "file" field');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images can be uploaded');
    }
    return this.storage.upload(bucket, file);
  }
}
