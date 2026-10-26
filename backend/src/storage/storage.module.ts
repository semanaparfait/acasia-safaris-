import { Global, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';

// @Global() so other modules (e.g. gallery) can use StorageService to delete files
@Global()
@Module({
  controllers: [UploadsController, FilesController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
