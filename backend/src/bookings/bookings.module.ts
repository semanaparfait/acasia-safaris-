import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { SavedRepliesModule } from '../saved-replies/saved-replies.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { QuickReplyController } from './quick-reply.controller';
import { QuickReplyService } from './quick-reply.service';

@Module({
  imports: [WhatsappModule, MailModule, SavedRepliesModule],
  controllers: [BookingsController, QuickReplyController],
  providers: [BookingsService, QuickReplyService],
})
export class BookingsModule {}
