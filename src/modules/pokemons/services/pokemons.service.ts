import { Injectable } from '@nestjs/common';
import { PokemonFields } from 'src/graphql';
import {
  CreatePokemonInput,
  UpdatePokemonInput,
} from 'src/modules/pokemons/pokemons.input';
import { TypesService } from 'src/modules/pokemons/services/types.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

type SortingParams = {
  field: PokemonFields;
  direction: 'asc' | 'desc';
};

type PaginationParams = {
  skip: number;
  take: number;
};

type FilterParams = {
  type?: string;
  name?: string;
};

type ListParams = {
  sortingParams?: SortingParams;
  paginationParams?: PaginationParams;
  filterParams?: FilterParams;
};

@Injectable()
export class PokemonsService {
  constructor(
    private prisma: PrismaService,
    private typesService: TypesService,
  ) {}

  async list(listParams?: ListParams) {
    const { sortingParams, paginationParams, filterParams } = listParams || {};

    return this.prisma.pokemon.findMany({
      where: {
        name: {
          contains: filterParams?.name,
        },
        types: {
          some: {
            type: {
              name: filterParams?.type,
            },
          },
        },
      },
      take: paginationParams?.take,
      skip: paginationParams?.skip,
      include: {
        types: {
          include: {
            type: {
              select: {
                name: true,
                created_at: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortingParams?.field || 'id']: sortingParams?.direction || 'asc',
      },
    });
  }

  async create({ name, types }: CreatePokemonInput) {
    const fetchedTypes = await this.typesService.findOrCreateMany(types);

    return this.prisma.pokemon.create({
      data: {
        name,
        types: {
          create: fetchedTypes.map((type) => ({
            type: {
              connect: { id: type.id },
            },
          })),
        },
      },
      include: {
        types: {
          include: {
            type: true,
          },
        },
      },
    });
  }

  async updateById(id: number, { name, types }: UpdatePokemonInput) {
    const fetchedTypes = await this.typesService.findOrCreateMany(types);

    return this.prisma.pokemon.update({
      where: { id },
      data: {
        name,
        types: {
          deleteMany: {},
          create: fetchedTypes.map((type) => ({
            type: {
              connect: { id: type.id },
            },
          })),
        },
      },
      include: {
        types: {
          include: {
            type: true,
          },
        },
      },
    });
  }

  async deleteById(id: number) {
    return this.prisma.pokemon.delete({ where: { id } });
  }
}
