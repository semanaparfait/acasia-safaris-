import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { Access } from '../common/permissions';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';
import { FormLimit } from '../common/limits';

// Routes under /api/messages
@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // POST /api/messages   (website contact form: public)
  @Post()
  @FormLimit()
  create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  // Everything below is admin only

  @Get()
  @UseGuards(AdminGuard)
  @Access('messages')
  @ApiBearerAuth()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @Access('messages')
  @ApiBearerAuth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.findOne(id);
  }

  // PATCH /api/messages/3   body: { "read": true }
  @Patch(':id')
  @UseGuards(AdminGuard)
  @Access('messages')
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Access('messages')
  @ApiBearerAuth()
  @Audit('Deleted a message', 'Message')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.remove(id);
  }
}
