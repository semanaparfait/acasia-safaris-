import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { Access } from '../common/permissions';
import { GroupsService } from './groups.service';

class GroupMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Write a subject' })
  @MaxLength(150)
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Write a message' })
  @MaxLength(5000)
  body: string;

  // Send it in each traveler's language (French / Swahili), translated automatically
  @IsOptional()
  @IsBoolean()
  translate?: boolean;
}

class WhatsappLinkDto {
  // https://chat.whatsapp.com/… ("" removes it)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  link?: string;
}

// Travel groups (Admin > Groups). Groups from bookings need Bookings access, special trips need
// Trips access: each admin only sees the groups they may see.
//   GET  /api/groups              upcoming groups (?past=1: the last 6 months)
//   GET  /api/groups/<key>        one group, its travelers and the messages sent
//   PUT  /api/groups/<key>/whatsapp   { link }
//   POST /api/groups/<key>/messages   { subject, body, translate? }  -> emails every traveler
// <key> is URL-encoded, e.g. trip%3A3f2a…
@ApiTags('Groups')
@Controller('groups')
@UseGuards(AdminGuard)
@Access('bookings', 'trips')
@ApiBearerAuth()
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get()
  list(@Req() request: AdminRequest, @Query('past') past?: string) {
    return this.groups.list(request.worker, past === '1' || past === 'true');
  }

  @Get(':key')
  findOne(@Req() request: AdminRequest, @Param('key') key: string) {
    return this.groups.findOne(request.worker, key);
  }

  @Put(':key/whatsapp')
  @Audit('Set a travel group WhatsApp link', 'Group')
  setWhatsapp(
    @Req() request: AdminRequest,
    @Param('key') key: string,
    @Body() dto: WhatsappLinkDto,
  ) {
    return this.groups.setWhatsapp(request.worker, key, dto.link);
  }

  @Post(':key/messages')
  @Audit('Emailed a travel group', 'Group')
  send(
    @Req() request: AdminRequest,
    @Param('key') key: string,
    @Body() dto: GroupMessageDto,
  ) {
    return this.groups.send(request.worker, key, dto);
  }
}
