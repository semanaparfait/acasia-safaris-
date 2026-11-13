import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

// Admin > Calendar: to-dos and the morning agenda email (see calendar.service.ts)
@Module({
  imports: [MailModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
