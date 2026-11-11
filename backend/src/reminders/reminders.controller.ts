import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { RemindersService } from './reminders.service';

// The reminders run by themselves every morning at 8:00 (Kigali).
// POST /api/reminders/run (admin) sends the ones that are due right now, e.g. to test.
@ApiTags('Reminders')
@Controller('reminders')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class RemindersController {
  constructor(private reminders: RemindersService) {}

  @Post('run')
  @HttpCode(200)
  run() {
    return this.reminders.run();
  }
}
