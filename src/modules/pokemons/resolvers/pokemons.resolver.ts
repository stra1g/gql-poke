import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  SortingParams,
  CreatePokemonInput,
  UpdatePokemonInput,
} from 'src/graphql';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';

@Resolver('Pokemon')
export class PokemonsResolver {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Query()
  async findManyPokemon(
    @Args('sortingParams', { nullable: true })
    sortingParams?: SortingParams,
  ) {
    return this.pokemonsService.findAll({
      sortingParams,
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
