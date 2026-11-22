import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

// Special trips (see trips.controller.ts)
@Module({
  imports: [MailModule],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
