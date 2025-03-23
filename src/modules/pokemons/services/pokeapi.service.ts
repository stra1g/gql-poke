import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { AxiosError } from 'axios';

type PokeAPIPokemonResponse = {
  id: number;
  name: string;
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
};

@Injectable()
export class PokeApiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly timeoutMs = 5000;

  constructor(private readonly httpService: HttpService) {}

  async getPokemonById(id: number): Promise<PokeAPIPokemonResponse> {
    const url = `${this.baseUrl}/pokemon/${id}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url).pipe(timeout(this.timeoutMs)),
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException(`Pokémon with ID ${id} does not exist.`);
        }

        throw new ServiceUnavailableException(
          'PokeAPI is currently unavailable.',
        );
      }

      if (error.name === 'TimeoutError') {
        throw new ServiceUnavailableException('PokeAPI response is too slow.');
      }

      throw new ServiceUnavailableException(
        'An unexpected error occurred while fetching Pokémon data.',
      );
    }
  }
}
