import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { DestinationsModule } from './destinations/destinations.module';
import { GalleryModule } from './gallery/gallery.module';
import { MessagesModule } from './messages/messages.module';
import { PackagesModule } from './packages/packages.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RolesModule } from './roles/roles.module';
import { StorageModule } from './storage/storage.module';
import { WorkersModule } from './workers/workers.module';

// The root module: every feature module is listed here.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    PrismaModule,
    AuthModule,
    StorageModule,
    PackagesModule,
    DestinationsModule,
    WorkersModule,
    RolesModule,
    BookingsModule,
    MessagesModule,
    ReviewsModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
