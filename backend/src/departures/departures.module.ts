import { Module } from '@nestjs/common';
import { DeparturesController } from './departures.controller';
import { DeparturesService } from './departures.service';

// Group departures (see departures.controller.ts)
@Module({
  controllers: [DeparturesController],
  providers: [DeparturesService],
})
export class DeparturesModule {}
