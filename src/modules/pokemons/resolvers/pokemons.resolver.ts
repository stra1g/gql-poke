import { Query, Resolver } from '@nestjs/graphql';
import { Pokemon } from 'src/modules/pokemons/models/pokemon.model';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';

@Resolver(() => Pokemon)
export class PokemonsResolver {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Query(() => [Pokemon])
  async findManyPokemon() {
    return this.pokemonsService.findAll();
  }
}
