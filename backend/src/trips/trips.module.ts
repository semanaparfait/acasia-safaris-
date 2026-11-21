import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

// Special trips (see trips.controller.ts)
@Module({
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
