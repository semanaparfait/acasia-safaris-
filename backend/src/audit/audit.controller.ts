import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { AuditService } from './audit.service';

// GET /api/audit?before=<date>   (main admin only): Admin > Activity
@ApiTags('Activity')
@Controller('audit')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  list(@Req() request: AdminRequest, @Query('before') before?: string) {
    if (!request.worker.isOwner) {
      throw new ForbiddenException('Only the main admin can see the activity');
    }
    return this.audit.list(before);
  }
}
