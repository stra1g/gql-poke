import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SortingParams, PaginationParams, FilterParams } from 'src/graphql';
import {
  CreatePokemonInput,
  UpdatePokemonInput,
} from '@/modules/pokemons/pokemons.input';
import { PokemonsService } from '@/modules/pokemons/services/pokemons.service';

@Resolver('Pokemon')
export class PokemonsResolver {
  protected readonly FIND_MANY_CACHE_KEY_PREFIX = 'findManyPokemonResponse';
  protected readonly PAGINATE_CACHE_KEY_PREFIX = 'paginatePokemonResponse';
  protected readonly DEFAULT_CACHE_TTL = 20 * 1000;

  constructor(
    private readonly pokemonsService: PokemonsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Query()
  async findManyPokemon(
    @Args('sortingParams', { nullable: true })
    sortingParams?: SortingParams,
    @Args('filterParams', { nullable: true })
    filterParams?: FilterParams,
  ) {
    const cacheKey = this.generateCacheKey(
      this.FIND_MANY_CACHE_KEY_PREFIX,
      sortingParams,
      filterParams,
    );

    const cachedPokemons = await this.cacheManager.get(cacheKey);

    if (cachedPokemons) return cachedPokemons;

    const pokemons = await this.pokemonsService.list({
      sortingParams,
      filterParams,
    });

    await this.cacheManager.set(cacheKey, pokemons, this.DEFAULT_CACHE_TTL);

    return pokemons;
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
    const cacheKey = this.generateCacheKey(
      this.PAGINATE_CACHE_KEY_PREFIX,
      sortingParams,
      filterParams,
      paginationParams,
    );

    const cachedPokemons = await this.cacheManager.get(cacheKey);

    if (cachedPokemons) return cachedPokemons;

    const pokemons = await this.pokemonsService.list({
      paginationParams: {
        skip: paginationParams.perPage * (paginationParams.page - 1),
        take: paginationParams.perPage,
      },
      sortingParams,
      filterParams,
    });

    await this.cacheManager.set(cacheKey, pokemons, this.DEFAULT_CACHE_TTL);

    return pokemons;
  }

  private generateCacheKey(
    prefix: string,
    sortingParams?: SortingParams,
    filterParams?: FilterParams,
    paginationParams?: PaginationParams,
  ): string {
    const sortingKey = sortingParams
      ? `sort:${sortingParams.field}:${sortingParams.direction}`
      : 'sort:default';

    const filterKeyParts = [];
    if (filterParams?.name) filterKeyParts.push(`name:${filterParams.name}`);

    if (filterParams?.type) filterKeyParts.push(`type:${filterParams.type}`);

    const filterKey =
      filterKeyParts.length > 0
        ? `filter:${filterKeyParts.join(':')}`
        : 'filter:default';

    const paginationKey = paginationParams
      ? `page:${paginationParams.page}:perPage:${paginationParams.perPage}`
      : 'page:none';

    return `${prefix}:${sortingKey}:${filterKey}:${paginationKey}`;
  }

  @Mutation()
  async createOnePokemon(
    @Args('createPokemonPayload')
    payload: CreatePokemonInput,
  ) {
    const pokemon = await this.pokemonsService.create(payload);

    await this.cacheManager.clear();

    return pokemon;
  }

  @Mutation()
  async updateOnePokemon(
    @Args('id') id: string,
    @Args('updatePokemonPayload') payload: UpdatePokemonInput,
  ) {
    const pokemon = await this.pokemonsService.updateById(+id, payload);

    await this.cacheManager.clear();

    return pokemon;
  }

  @Mutation(() => Boolean)
  async deleteOnePokemon(@Args('id') id: string): Promise<boolean> {
    await this.pokemonsService.deleteById(+id);

    await this.cacheManager.clear();

    return true;
  }

  @Mutation()
  async importPokemonById(@Args('id') id: string) {
    const pokemon = await this.pokemonsService.importPokemonById(+id);

    await this.cacheManager.clear();

    return pokemon;
  }
}
