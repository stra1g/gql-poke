import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

type SortingParams = {
  field: string;
  direction: 'asc' | 'desc';
};

type ListParams = {
  sortingParams?: SortingParams;
};

@Injectable()
export class PokemonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(listParams?: ListParams) {
    const { sortingParams } = listParams || {};
    return this.prisma.pokemon.findMany({
      orderBy: {
        [sortingParams?.field || 'id']: sortingParams?.direction || 'asc',
      },
    });
  }

  async create(data: Prisma.PokemonCreateInput) {
    return this.prisma.pokemon.create({ data });
  }

  async updateById(id: number, data: Prisma.PokemonUpdateInput) {
    return this.prisma.pokemon.update({ where: { id }, data });
  }

  async deleteById(id: number) {
    return this.prisma.pokemon.delete({ where: { id } });
  }
}
