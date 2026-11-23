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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard } from '../common/admin.guard';
import { SavedRepliesService } from './saved-replies.service';

class SavedReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text: string;
}

// Routes under /api/saved-replies (admins only)
@ApiTags('Saved replies')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('saved-replies')
export class SavedRepliesController {
  constructor(private savedReplies: SavedRepliesService) {}

  @Get()
  findAll() {
    return this.savedReplies.findAll();
  }

  @Post()
  @Audit('Added a saved reply')
  create(@Body() dto: SavedReplyDto) {
    return this.savedReplies.create(dto);
  }

  @Patch(':id')
  @Audit('Edited a saved reply')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SavedReplyDto) {
    return this.savedReplies.update(id, dto);
  }

  @Delete(':id')
  @Audit('Deleted a saved reply')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.savedReplies.remove(id);
  }
}
