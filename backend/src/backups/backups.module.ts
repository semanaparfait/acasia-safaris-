import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';

// Nightly encrypted database backups (see backups.service.ts)
@Module({
  imports: [MailModule],
  controllers: [BackupsController],
  providers: [BackupsService],
})
export class BackupsModule {}
