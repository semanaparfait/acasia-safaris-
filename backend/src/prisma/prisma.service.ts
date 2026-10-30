import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// One shared database connection for the whole app.
// Inject it in any service:  constructor(private prisma: PrismaService) {}
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Never return password hashes, unless a query asks for them explicitly with
    //   omit: { passwordHash: false }   (only the login does that)
    super({ omit: { worker: { passwordHash: true, tokenVersion: true } } });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
