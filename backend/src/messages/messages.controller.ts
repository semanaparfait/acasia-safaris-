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
import { AdminGuard } from '../common/admin.guard';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

// Routes under /api/messages
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // POST /api/messages   (website contact form: public)
  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  // Everything below is admin only

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.findOne(id);
  }

  // PATCH /api/messages/3   body: { "read": true }
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.remove(id);
  }
}
