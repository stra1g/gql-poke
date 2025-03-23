import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePokemonInput } from 'src/modules/pokemons/inputs/create-pokemon.input';
import { Pokemon } from 'src/modules/pokemons/models/pokemon.model';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';

@Resolver(() => Pokemon)
export class PokemonsResolver {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Query(() => [Pokemon])
  async findManyPokemon() {
    return this.pokemonsService.findAll();
  }

  @Mutation(() => Pokemon)
  async createOnePokemon(
    @Args('createPokemonPayload')
    payload: CreatePokemonInput,
  ): Promise<Pokemon> {
    return this.pokemonsService.create(payload);
  }
}
