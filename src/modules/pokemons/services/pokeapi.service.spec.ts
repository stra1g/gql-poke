import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PokeApiService } from '@/modules/pokemons/services/pokeapi.service';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';

describe('PokeApiService', () => {
  let service: PokeApiService;
  let mockHttpService: Partial<HttpService>;

  beforeEach(async () => {
    mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokeApiService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<PokeApiService>(PokeApiService);
  });

  describe('getPokemonById', () => {
    it('should return pokemon data when the API call is successful', async () => {
      const mockPokemonResponse = {
        id: 1,
        name: 'Pikachu',
        types: [
          {
            slot: 1,
            type: {
              name: 'Electric',
              url: 'https://pokeapi.co/api/v2/type/13/',
            },
          },
        ],
      };

      mockHttpService.get = jest
        .fn()
        .mockReturnValue(
          of({ data: mockPokemonResponse, status: 200, statusText: 'OK' }),
        );

      const result = await service.getPokemonById(1);

      expect(result).toEqual(mockPokemonResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/1',
      );
    });

    it('should throw NotFoundException when the API returns 404', async () => {
      const mockAxiosError = new AxiosError(
        'Not Found',
        '404',
        undefined,
        undefined,
        {
          headers: {},
          config: {
            headers: {} as any,
          },
          data: {
            message: 'Not Found',
          },
          status: 404,
          statusText: 'Not Found',
        },
      );

      mockHttpService.get = jest
        .fn()
        .mockReturnValue(throwError(() => mockAxiosError));

      await expect(service.getPokemonById(999)).rejects.toThrow(
        new NotFoundException('Pokémon with ID 999 does not exist.'),
      );
    });

    it('should throw ServiceUnavailableException when the API times out', async () => {
      const mockTimeoutError = {
        name: 'TimeoutError',
        message: 'Request timed out',
      };

      mockHttpService.get = jest
        .fn()
        .mockReturnValue(throwError(() => mockTimeoutError));

      await expect(service.getPokemonById(1)).rejects.toThrow(
        new ServiceUnavailableException('PokeAPI response is too slow.'),
      );
    });

    it('should throw ServiceUnavailableException when the API is unavailable', async () => {
      const mockAxiosError = new AxiosError(
        'Internal Server Error',
        '500',
        undefined,
        undefined,
        {
          headers: {},
          config: {
            headers: {} as any,
          },
          data: {
            message: 'Internal Server Error',
          },
          status: 500,
          statusText: 'Internal Server Error',
        },
      );

      mockHttpService.get = jest
        .fn()
        .mockReturnValue(throwError(() => mockAxiosError));

      await expect(service.getPokemonById(1)).rejects.toThrow(
        new ServiceUnavailableException('PokeAPI is currently unavailable.'),
      );
    });

    it('should throw ServiceUnavailableException for unexpected errors', async () => {
      const mockError = new Error('Unexpected error');

      mockHttpService.get = jest
        .fn()
        .mockReturnValue(throwError(() => mockError));

      await expect(service.getPokemonById(1)).rejects.toThrow(
        new ServiceUnavailableException(
          'An unexpected error occurred while fetching Pokémon data.',
        ),
      );
    });
  });
});
