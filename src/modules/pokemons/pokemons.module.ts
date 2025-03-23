import { Module } from '@nestjs/common';
import { PokemonsResolver } from 'src/modules/pokemons/resolvers/pokemons.resolver';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';

@Module({
  providers: [PokemonsService, PokemonsResolver],
})
export class PokemonsModule {}
