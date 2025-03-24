import { PokemonsResolver } from '@/modules/pokemons/resolvers/pokemons.resolver';
import { PokeApiService } from '@/modules/pokemons/services/pokeapi.service';
import { PokemonsService } from '@/modules/pokemons/services/pokemons.service';
import { TypesService } from '@/modules/pokemons/services/types.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [PokemonsService, PokemonsResolver, TypesService, PokeApiService],
})
export class PokemonsModule {}
