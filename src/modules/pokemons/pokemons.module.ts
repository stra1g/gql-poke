import { Module } from '@nestjs/common';
import { PokemonsResolver } from 'src/modules/pokemons/resolvers/pokemons.resolver';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';
import { TypesService } from 'src/modules/pokemons/services/types.service';

@Module({
  providers: [PokemonsService, PokemonsResolver, TypesService],
})
export class PokemonsModule {}
