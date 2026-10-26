import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  imports: [RolesModule],
  controllers: [WorkersController],
  providers: [WorkersService],
})
export class WorkersModule {}
