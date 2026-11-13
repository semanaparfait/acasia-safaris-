import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { ReminderDoneDto, ReminderDto } from './calendar.dto';
import { CalendarService } from './calendar.service';

// Admin > Calendar
//   GET    /api/calendar/reminders            the team's to-dos
//   POST   /api/calendar/reminders            add one
//   PUT    /api/calendar/reminders/<id>       change it
//   PATCH  /api/calendar/reminders/<id>/done  { done: true } ticks it
//   DELETE /api/calendar/reminders/<id>
//   POST   /api/calendar/agenda/email         email today's agenda to me now
@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private calendar: CalendarService) {}

  @Get('reminders')
  list() {
    return this.calendar.list();
  }

  @Post('reminders')
  @Audit('Added a calendar reminder')
  create(@Body() dto: ReminderDto, @Req() req: AdminRequest) {
    return this.calendar.create(dto, req.worker.name);
  }

  @Put('reminders/:id')
  @Audit('Edited a calendar reminder')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReminderDto) {
    return this.calendar.update(id, dto);
  }

  @Patch('reminders/:id/done')
  setDone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReminderDoneDto,
    @Req() req: AdminRequest,
  ) {
    return this.calendar.setDone(id, dto.done, req.worker.name);
  }

  @Delete('reminders/:id')
  @Audit('Deleted a calendar reminder')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendar.remove(id);
  }

  @Post('agenda/email')
  @HttpCode(200)
  emailMe(@Req() req: AdminRequest) {
    return this.calendar.sendAgenda({
      email: req.worker.email,
      name: req.worker.name,
    });
  }
}
