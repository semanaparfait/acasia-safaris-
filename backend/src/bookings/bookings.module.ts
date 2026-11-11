import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [WhatsappModule, MailModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
