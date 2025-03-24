import { PokeApiService } from '@/modules/pokemons/services/pokeapi.service';
import { PokemonsService } from '@/modules/pokemons/services/pokemons.service';
import { TypesService } from '@/modules/pokemons/services/types.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PokemonFields } from '@/src/graphql';

describe('PokemonsService', () => {
  let service: PokemonsService;
  let mockTypesService: Partial<TypesService>;
  let mockPokeApiService: Partial<PokeApiService>;

  const mockPrismaService = {
    pokemon: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    mockTypesService = {
      findOrCreateMany: jest.fn().mockResolvedValue([]),
    };

    mockPokeApiService = {
      getPokemonById: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TypesService, useValue: mockTypesService },
        { provide: PokeApiService, useValue: mockPokeApiService },
      ],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  describe('list', () => {
    it('should return a list of pokemons with filters and sorting', async () => {
      const mockPokemons = [
        { id: 1, name: 'Pikachu', types: [] },
        { id: 2, name: 'Bulbasaur', types: [] },
      ];
      mockPrismaService.pokemon.findMany.mockResolvedValue(mockPokemons);

      const result = await service.list({
        filterParams: { name: 'Pikachu' },
        sortingParams: { field: PokemonFields.name, direction: 'asc' },
      });

      expect(result).toEqual(mockPokemons);
      expect(mockPrismaService.pokemon.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Pikachu' },
          types: { some: { type: { name: undefined } } },
        },
        take: undefined,
        skip: undefined,
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
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new pokemon with types', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };
      const mockTypes = [{ id: 1, name: 'Electric', created_at: new Date() }];
      mockTypesService.findOrCreateMany = jest
        .fn()
        .mockResolvedValue(mockTypes);
      mockPrismaService.pokemon.create.mockResolvedValue(mockPokemon);

      const result = await service.create({
        name: 'Pikachu',
        types: ['Electric'],
      });

      expect(result).toEqual(mockPokemon);
      expect(mockTypesService.findOrCreateMany).toHaveBeenCalledWith([
        'Electric',
      ]);
      expect(mockPrismaService.pokemon.create).toHaveBeenCalledWith({
        data: {
          name: 'Pikachu',
          types: {
            create: [{ type: { connect: { id: 1 } } }],
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
    });
  });

  describe('updateById', () => {
    it('should update a pokemon by id with new types', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };
      const mockTypes = [{ id: 1, name: 'Electric', created_at: new Date() }];
      mockTypesService.findOrCreateMany = jest
        .fn()
        .mockResolvedValue(mockTypes);
      mockPrismaService.pokemon.update.mockResolvedValue(mockPokemon);

      const result = await service.updateById(1, {
        name: 'Pikachu',
        types: ['Electric'],
      });

      expect(result).toEqual(mockPokemon);
      expect(mockTypesService.findOrCreateMany).toHaveBeenCalledWith([
        'Electric',
      ]);
      expect(mockPrismaService.pokemon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Pikachu',
          types: {
            deleteMany: {},
            create: [{ type: { connect: { id: 1 } } }],
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
    });
  });

  describe('deleteById', () => {
    it('should delete a pokemon by id', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };
      mockPrismaService.pokemon.delete.mockResolvedValue(mockPokemon);

      const result = await service.deleteById(1);

      expect(result).toEqual(mockPokemon);
      expect(mockPrismaService.pokemon.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('updateOrCreate', () => {
    it('should update an existing pokemon if id exists', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };
      const mockTypes = [{ id: 1, name: 'Electric', created_at: new Date() }];
      mockTypesService.findOrCreateMany = jest
        .fn()
        .mockResolvedValue(mockTypes);
      mockPrismaService.pokemon.upsert.mockResolvedValue(mockPokemon);

      const result = await service.updateOrCreate(1, {
        name: 'Pikachu',
        types: ['Electric'],
      });

      expect(result).toEqual(mockPokemon);
      expect(mockPrismaService.pokemon.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: {
          name: 'Pikachu',
          types: {
            deleteMany: {},
            create: [{ type: { connect: { id: 1 } } }],
          },
        },
        create: {
          id: 1,
          name: 'Pikachu',
          types: {
            create: [{ type: { connect: { id: 1 } } }],
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
    });
  });

  describe('importPokemonById', () => {
    it('should import a pokemon by id from PokeAPI', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: ['Electric'] };
      mockPokeApiService.getPokemonById = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Pikachu',
        types: [{ type: { name: 'Electric' } }],
      });
      mockPrismaService.pokemon.upsert.mockResolvedValue(mockPokemon);

      const result = await service.importPokemonById(1);

      expect(result).toEqual(mockPokemon);
      expect(mockPokeApiService.getPokemonById).toHaveBeenCalledWith(1);
      expect(mockPrismaService.pokemon.upsert).toHaveBeenCalled();
    });
  });
});
