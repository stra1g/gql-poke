import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TypesService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateMany(types: string[]) {
    return Promise.all(
      types.map((type) =>
        this.prisma.types.upsert({
          where: {
            name: type.toLowerCase(),
          },
          update: {},
          create: {
            name: type.toLowerCase(),
          },
        }),
      ),
    );
  }
}
