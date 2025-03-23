import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PokemonsResolver } from 'src/modules/pokemons/resolvers/pokemons.resolver';
import { PokeApiService } from 'src/modules/pokemons/services/pokeapi.service';
import { PokemonsService } from 'src/modules/pokemons/services/pokemons.service';
import { TypesService } from 'src/modules/pokemons/services/types.service';

@Module({
  imports: [HttpModule],
  providers: [PokemonsService, PokemonsResolver, TypesService, PokeApiService],
})
export class PokemonsModule {}
