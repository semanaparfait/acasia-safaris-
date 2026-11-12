import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { BackupsService } from './backups.service';

// Admin > Backups
//   GET  /api/backups                  the backups and the last result
//   POST /api/backups/run              make one now (and check it)
//   GET  /api/backups/<file>/download  the encrypted file (main admin only)
@ApiTags('Backups')
@Controller('backups')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class BackupsController {
  constructor(private backups: BackupsService) {}

  @Get()
  status() {
    return this.backups.status();
  }

  @Post('run')
  @HttpCode(200)
  @Audit('Made a database backup')
  async run() {
    try {
      return await this.backups.run();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'The backup failed',
      );
    }
  }

  @Get(':file/download')
  @Audit('Downloaded a database backup')
  async download(
    @Param('file') file: string,
    @Req() req: AdminRequest,
    @Res() res: Response,
  ) {
    if (!req.worker.isOwner) {
      throw new ForbiddenException('Only the main admin can download backups');
    }
    let body: Buffer;
    try {
      body = await this.backups.download(file);
    } catch {
      throw new BadRequestException('This backup cannot be found');
    }
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.replace(/[^\w.-]/g, '')}"`,
      'Cache-Control': 'no-store',
    });
    res.send(body);
  }
}
