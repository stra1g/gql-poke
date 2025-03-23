import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePokemonInput } from 'src/modules/pokemons/inputs/create-pokemon.input';
import { UpdatePokemonInput } from 'src/modules/pokemons/inputs/update-pokemon.input';
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

  @Mutation(() => Pokemon)
  async updateOnePokemon(
    @Args('id') id: string,
    @Args('updatePokemonPayload') payload: UpdatePokemonInput,
  ): Promise<Pokemon> {
    return this.pokemonsService.updateById(+id, payload);
  }

  @Mutation(() => Boolean)
  async deleteOnePokemon(@Args('id') id: string): Promise<boolean> {
    await this.pokemonsService.deleteById(+id);
    return true;
  }
}
