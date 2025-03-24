import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsResolver } from '@/modules/pokemons/resolvers/pokemons.resolver';
import { PokemonsService } from '@/modules/pokemons/services/pokemons.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CreatePokemonInput,
  UpdatePokemonInput,
} from '@/modules/pokemons/pokemons.input';

describe('PokemonsResolver', () => {
  let resolver: PokemonsResolver;
  let mockPokemonsService: Partial<PokemonsService>;
  let mockCacheManager: Partial<Cache>;

  beforeEach(async () => {
    mockPokemonsService = {
      list: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      importPokemonById: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonsResolver,
        { provide: PokemonsService, useValue: mockPokemonsService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    resolver = module.get<PokemonsResolver>(PokemonsResolver);
  });

  describe('findManyPokemon', () => {
    it('should return cached pokemons if available', async () => {
      const mockCachedPokemons = [
        { id: 1, name: 'Pikachu', types: [] },
        { id: 2, name: 'Bulbasaur', types: [] },
      ];

      mockCacheManager.get = jest.fn().mockResolvedValue(mockCachedPokemons);

      const result = await resolver.findManyPokemon();

      expect(result).toEqual(mockCachedPokemons);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockPokemonsService.list).not.toHaveBeenCalled();
    });

    it('should fetch and cache pokemons if no cache is available', async () => {
      const mockPokemons = [
        { id: 1, name: 'Pikachu', types: [] },
        { id: 2, name: 'Bulbasaur', types: [] },
      ];

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockPokemonsService.list = jest.fn().mockResolvedValue(mockPokemons);

      const result = await resolver.findManyPokemon();

      expect(result).toEqual(mockPokemons);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockPokemonsService.list).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        mockPokemons,
        20000,
      );
    });
  });

  describe('paginatePokemon', () => {
    it('should return cached paginated pokemons if available', async () => {
      const mockCachedPokemons = [
        { id: 1, name: 'Pikachu', types: [] },
        { id: 2, name: 'Bulbasaur', types: [] },
      ];

      mockCacheManager.get = jest.fn().mockResolvedValue(mockCachedPokemons);

      const result = await resolver.paginatePokemon(
        { page: 1, perPage: 10 },
        undefined,
        undefined,
      );

      expect(result).toEqual(mockCachedPokemons);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockPokemonsService.list).not.toHaveBeenCalled();
    });

    it('should fetch and cache paginated pokemons if no cache is available', async () => {
      const mockPokemons = [
        { id: 1, name: 'Pikachu', types: [] },
        { id: 2, name: 'Bulbasaur', types: [] },
      ];

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockPokemonsService.list = jest.fn().mockResolvedValue(mockPokemons);

      const result = await resolver.paginatePokemon(
        { page: 1, perPage: 10 },
        undefined,
        undefined,
      );

      expect(result).toEqual(mockPokemons);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockPokemonsService.list).toHaveBeenCalledWith({
        paginationParams: { skip: 0, take: 10 },
        sortingParams: undefined,
        filterParams: undefined,
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        mockPokemons,
        20000,
      );
    });
  });

  describe('createOnePokemon', () => {
    it('should create a pokemon and clear the cache', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };
      const mockPayload: CreatePokemonInput = {
        name: 'Pikachu',
        types: ['Electric'],
      };

      mockPokemonsService.create = jest.fn().mockResolvedValue(mockPokemon);

      const result = await resolver.createOnePokemon(mockPayload);

      expect(result).toEqual(mockPokemon);
      expect(mockPokemonsService.create).toHaveBeenCalledWith(mockPayload);
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('updateOnePokemon', () => {
    it('should update a pokemon and clear the cache', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };
      const mockPayload: UpdatePokemonInput = {
        name: 'Pikachu',
        types: ['Electric'],
      };

      mockPokemonsService.updateById = jest.fn().mockResolvedValue(mockPokemon);

      const result = await resolver.updateOnePokemon('1', mockPayload);

      expect(result).toEqual(mockPokemon);
      expect(mockPokemonsService.updateById).toHaveBeenCalledWith(
        1,
        mockPayload,
      );
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('deleteOnePokemon', () => {
    it('should delete a pokemon and clear the cache', async () => {
      mockPokemonsService.deleteById = jest.fn().mockResolvedValue(undefined);

      const result = await resolver.deleteOnePokemon('1');

      expect(result).toBe(true);
      expect(mockPokemonsService.deleteById).toHaveBeenCalledWith(1);
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('importPokemonById', () => {
    it('should import a pokemon and clear the cache', async () => {
      const mockPokemon = { id: 1, name: 'Pikachu', types: [] };

      mockPokemonsService.importPokemonById = jest
        .fn()
        .mockResolvedValue(mockPokemon);

      const result = await resolver.importPokemonById('1');

      expect(result).toEqual(mockPokemon);
      expect(mockPokemonsService.importPokemonById).toHaveBeenCalledWith(1);
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });
});
