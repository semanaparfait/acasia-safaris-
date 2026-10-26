import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingsModule } from './bookings/bookings.module';
import { DestinationsModule } from './destinations/destinations.module';
import { MessagesModule } from './messages/messages.module';
import { PackagesModule } from './packages/packages.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkersModule } from './workers/workers.module';

// The root module: every feature module is listed here.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    PrismaModule,
    PackagesModule,
    DestinationsModule,
    WorkersModule,
    BookingsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
