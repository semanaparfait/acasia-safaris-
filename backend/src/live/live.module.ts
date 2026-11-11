import { Global, Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';

// @Global() so any service can push live updates with LiveGateway
@Global()
@Module({
  providers: [LiveGateway],
  exports: [LiveGateway],
})
export class LiveModule {}
