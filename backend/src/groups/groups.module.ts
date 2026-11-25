import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

// Travel groups: travelers on the same trip at the same time (Admin > Groups)
@Module({
  imports: [MailModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
