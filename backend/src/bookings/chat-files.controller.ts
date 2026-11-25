import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { Access } from '../common/permissions';
import { ChatLimit } from '../common/limits';
import { ChatFilesService, MAX_CHAT_FILE } from './chat-files.service';

// The text that may come with a file (multipart form field "text")
class FileMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;
}

class QuotationMessageDto extends FileMessageDto {
  @IsUUID()
  packageId: string;
}

const upload = () =>
  UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_CHAT_FILE } }),
  );

// Photos and files in the booking chat. Send as multipart/form-data: "file" (+ optional "text").
@ApiTags('Bookings')
@Controller('bookings')
export class ChatFilesController {
  constructor(private chatFiles: ChatFilesService) {}

  // ---------- The customer (their private link) ----------

  // POST /api/bookings/track/<token>/files   -> a photo or PDF from the customer
  @Post('track/:token/files')
  @ChatLimit()
  @ApiConsumes('multipart/form-data')
  @upload()
  customerFile(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: FileMessageDto,
  ) {
    return this.chatFiles.customerFile(token, file, dto);
  }

  // GET /api/bookings/track/<token>/files/<key>
  @Get('track/:token/files/:key')
  @SkipThrottle()
  @Header('Cache-Control', 'private, max-age=86400')
  @Header('X-Content-Type-Options', 'nosniff')
  async customerDownload(
    @Param('token') token: string,
    @Param('key') key: string,
  ) {
    const file = await this.chatFiles.customerDownload(token, key);
    return new StreamableFile(file.stream, {
      type: file.type,
      disposition: file.disposition,
    });
  }

  // ---------- The team (admin login) ----------

  // POST /api/bookings/<id>/files   -> a photo or document from the team (emails the customer)
  @Post(':id/files')
  @UseGuards(AdminGuard)
  @Access('bookings')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Audit('Sent a file to the customer', 'Booking')
  @upload()
  teamFile(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: FileMessageDto,
    @Req() request: AdminRequest,
  ) {
    return this.chatFiles.teamFile(id, file, dto, request.worker.name);
  }

  // POST /api/bookings/<id>/quotation   body: { "packageId": "...", "text"?: "..." }
  @Post(':id/quotation')
  @UseGuards(AdminGuard)
  @Access('bookings')
  @ApiBearerAuth()
  @Audit('Sent a quotation to the customer', 'Booking')
  teamQuotation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: QuotationMessageDto,
    @Req() request: AdminRequest,
  ) {
    const { packageId, ...message } = dto;
    return this.chatFiles.teamQuotation(
      id,
      packageId,
      message,
      request.worker.name,
    );
  }

  // GET /api/bookings/<id>/files/<key>
  @Get(':id/files/:key')
  @UseGuards(AdminGuard)
  @Access('bookings')
  @SkipThrottle()
  @Header('Cache-Control', 'private, max-age=86400')
  @Header('X-Content-Type-Options', 'nosniff')
  async teamDownload(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('key') key: string,
  ) {
    const file = await this.chatFiles.download(id, key);
    return new StreamableFile(file.stream, {
      type: file.type,
      disposition: file.disposition,
    });
  }
}
