import { Global, Module } from '@nestjs/common';
import { MachineTranslate } from './machine-translate';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';

// French and Swahili versions of packages and destinations (see translations.service.ts).
// Global: the packages and destinations services use it after each save.
@Global()
@Module({
  controllers: [TranslationsController],
  providers: [TranslationsService, MachineTranslate],
  exports: [TranslationsService],
})
export class TranslationsModule {}
