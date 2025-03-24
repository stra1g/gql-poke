import { faker } from '@faker-js/faker';
import { BaseFactory } from './base.factory';
import { Pokemon } from '@prisma/client';
import { PrismaService } from '@/modules/prisma/prisma.service';

export class PokemonFactory extends BaseFactory<Pokemon> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data?: Partial<Pokemon>): Promise<Pokemon> {
    const types = [faker.word.noun(), faker.word.noun()];

    const pokemon = await this.prisma.pokemon.create({
      data: {
        name: data?.name || faker.internet.displayName(),
        types: {
          create: types.map((name) => ({ type: { create: { name } } })),
        },
      },
    });

    return pokemon;
  }
}
