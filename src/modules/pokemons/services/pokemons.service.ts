import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PokemonFields } from 'src/graphql';
import { PrismaService } from 'src/modules/prisma/prisma.service';

type SortingParams = {
  field: PokemonFields;
  direction: 'asc' | 'desc';
};

type PaginationParams = {
  skip: number;
  take: number;
};

type ListParams = {
  sortingParams?: SortingParams;
  paginationParams?: PaginationParams;
};

@Injectable()
export class PokemonsService {
  constructor(private prisma: PrismaService) {}

  async list(listParams?: ListParams) {
    const { sortingParams, paginationParams } = listParams || {};
    return this.prisma.pokemon.findMany({
      take: paginationParams?.take,
      skip: paginationParams?.skip,
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
