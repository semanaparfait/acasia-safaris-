import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { TeamController } from './team.controller';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  imports: [RolesModule],
  controllers: [WorkersController, TeamController],
  providers: [WorkersService],
})
export class WorkersModule {}
