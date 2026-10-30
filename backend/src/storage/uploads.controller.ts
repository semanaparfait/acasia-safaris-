import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BUCKETS } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../common/admin.guard';
import { StorageService } from './storage.service';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// A real PDF starts with "%PDF-", whatever the browser says the file is
const isPdf = (file: Express.Multer.File) =>
  file.mimetype === 'application/pdf' &&
  file.buffer.subarray(0, 5).toString() === '%PDF-';

// POST /api/uploads/gallery   (admin)
// Send the image as multipart/form-data in a field called "file".
// The "tourpackages" bucket also takes PDFs (the package quotation).
// Returns { bucket, key, url } — save the url in the package / destination / gallery item.
@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private storage: StorageService) {}

  @Post(':bucket')
  // For Swagger: show a file picker and the list of buckets
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'bucket', enum: BUCKETS })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE } }))
  upload(
    @Param('bucket') bucket: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('Send the file in a "file" field');
    const allowed =
      file.mimetype.startsWith('image/') ||
      (bucket === 'tourpackages' && isPdf(file));
    if (!allowed) {
      throw new BadRequestException(
        bucket === 'tourpackages'
          ? 'Only images and PDF files can be uploaded'
          : 'Only images can be uploaded',
      );
    }
    return this.storage.upload(bucket, file);
  }
}
