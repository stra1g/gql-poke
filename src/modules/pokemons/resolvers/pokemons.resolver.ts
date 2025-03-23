import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SortingParams, PaginationParams, FilterParams } from 'src/graphql';
import {
  CreatePokemonInput,
  UpdatePokemonInput,
} from 'src/modules/pokemons/pokemons.input';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';

@Resolver('Pokemon')
export class PokemonsResolver {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Query()
  async findManyPokemon(
    @Args('sortingParams', { nullable: true })
    sortingParams?: SortingParams,
    @Args('filterParams', { nullable: true })
    filterParams?: FilterParams,
  ) {
    return this.pokemonsService.list({
      sortingParams,
      filterParams,
    });
  }

  @Query()
  async paginatePokemon(
    @Args('paginationParams')
    paginationParams: PaginationParams,
    @Args('sortingParams', { nullable: true })
    sortingParams?: SortingParams,
    @Args('filterParams', { nullable: true })
    filterParams?: FilterParams,
  ) {
    return this.pokemonsService.list({
      paginationParams: {
        skip: paginationParams.perPage * (paginationParams.page - 1),
        take: paginationParams.perPage,
      },
      sortingParams,
      filterParams,
    });
  }

  @Mutation()
  async createOnePokemon(
    @Args('createPokemonPayload')
    payload: CreatePokemonInput,
  ) {
    return this.pokemonsService.create(payload);
  }

  @Mutation()
  async updateOnePokemon(
    @Args('id') id: string,
    @Args('updatePokemonPayload') payload: UpdatePokemonInput,
  ) {
    return this.pokemonsService.updateById(+id, payload);
  }

  @Mutation(() => Boolean)
  async deleteOnePokemon(@Args('id') id: string): Promise<boolean> {
    await this.pokemonsService.deleteById(+id);
    return true;
  }
}
