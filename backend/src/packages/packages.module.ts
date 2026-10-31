import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { QuotationService } from './quotation.service';

@Module({
  imports: [MailModule],
  controllers: [PackagesController],
  providers: [PackagesService, QuotationService],
})
export class PackagesModule {}
