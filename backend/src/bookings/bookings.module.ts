import { Module } from '@nestjs/common';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [WhatsappModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
