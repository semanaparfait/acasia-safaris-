import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { DestinationsModule } from './destinations/destinations.module';
import { GalleryModule } from './gallery/gallery.module';
import { LiveModule } from './live/live.module';
import { MessagesModule } from './messages/messages.module';
import { PackagesModule } from './packages/packages.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatesModule } from './rates/rates.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RolesModule } from './roles/roles.module';
import { StorageModule } from './storage/storage.module';
import { WorkersModule } from './workers/workers.module';

// The root module: every feature module is listed here.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    // Request limits per visitor: 120 per minute everywhere, much less on login,
    // password reset and the website forms (see common/limits.ts)
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
      errorMessage:
        'Too many attempts. Please wait a few minutes and try again.',
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    LiveModule,
    StorageModule,
    PackagesModule,
    DestinationsModule,
    WorkersModule,
    RolesModule,
    BookingsModule,
    MessagesModule,
    ReviewsModule,
    GalleryModule,
    RatesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
