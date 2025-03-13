import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    Logger.log('Connected to Prisma', 'PrismaService');
  }

  async onModuleDestroy() {
    Logger.log('Closing Prisma Connection', 'PrismaService');
    await this.$disconnect();
  }
}
