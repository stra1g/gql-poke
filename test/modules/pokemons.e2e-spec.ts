import { PokemonsResolver } from '@/modules/pokemons/resolvers/pokemons.resolver';
import { PokemonsService } from '@/modules/pokemons/services/pokemons.service';
import { PokemonFactory } from '@/modules/prisma/factories/pokemon.factory';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { TypesService } from '@/modules/pokemons/services/types.service';
import { PokeApiService } from '@/modules/pokemons/services/pokeapi.service';
import { HttpModule } from '@nestjs/axios';
import { PokemonsModule } from '@/modules/pokemons/pokemons.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { join } from 'node:path';
import * as request from 'supertest';

describe('Pokemons Resolver (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let pokemonFactory: PokemonFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          typePaths: ['./**/*.graphql'],
          definitions: {
            path: join(process.cwd(), 'src/graphql.ts'),
          },
          context: ({ req, res }) => ({ req, res }),
        }),
        HttpModule,
        CacheModule.register(),
        PokemonsModule,
        PrismaModule,
      ],
      providers: [
        PokemonsResolver,
        PokemonsService,
        PrismaService,
        TypesService,
        PokeApiService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get(PrismaService);
    pokemonFactory = new PokemonFactory(prismaService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  it('should list all pokemons', async () => {
    const LIST_ALL_QUERY = `
      query FindManyPokemon {
        findManyPokemon {
          id,
          created_at,
          name,
          types {
            type_id,
            type {
              name,
              created_at
            }
          }
        }
      }
    `;

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: LIST_ALL_QUERY,
      variables: {},
    });

    expect(response.body.data).toBeDefined();
    expect(response.body.data.findManyPokemon).toBeDefined();
    expect(response.body.data.findManyPokemon).toBeInstanceOf(Array);
    expect(response.body.data.findManyPokemon.length).toBeGreaterThan(0);
    expect(response.body.data.findManyPokemon[0].id).toBeDefined();
    expect(response.body.data.findManyPokemon[0].name).toBeDefined();
    expect(response.body.data.findManyPokemon[0].types).toBeDefined();
    expect(response.body.data.findManyPokemon[0].types).toBeInstanceOf(Array);
    expect(
      response.body.data.findManyPokemon[0].types[0].type_id,
    ).toBeDefined();
    expect(response.body.data.findManyPokemon[0].types[0].type).toBeDefined();
    expect(
      response.body.data.findManyPokemon[0].types[0].type.name,
    ).toBeDefined();
  });

  it('should paginate pokemons', async () => {
    const PAGINATE_QUERY = `
      query PaginatePokemon($paginationParams: PaginationParams) {
        paginatePokemon(paginationParams: $paginationParams) {
          id,
          created_at,
          name,
          types {
            type_id
            type {
              name,
              created_at
            }
          }
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: PAGINATE_QUERY,
        variables: {
          paginationParams: {
            page: 1,
            perPage: 10,
          },
        },
      });

    expect(response.body.data).toBeDefined();
    expect(response.body.data.paginatePokemon).toBeDefined();
    expect(response.body.data.paginatePokemon).toBeInstanceOf(Array);
    expect(response.body.data.paginatePokemon.length).toBeGreaterThan(0);
    expect(response.body.data.paginatePokemon[0].id).toBeDefined();
    expect(response.body.data.paginatePokemon[0].name).toBeDefined();
    expect(response.body.data.paginatePokemon[0].types).toBeDefined();
    expect(response.body.data.paginatePokemon[0].types).toBeInstanceOf(Array);
    expect(
      response.body.data.paginatePokemon[0].types[0].type_id,
    ).toBeDefined();
    expect(response.body.data.paginatePokemon[0].types[0].type).toBeDefined();
    expect(
      response.body.data.paginatePokemon[0].types[0].type.name,
    ).toBeDefined();
  });

  it('should create a pokemon', async () => {
    const CREATE_MUTATION = `
      mutation CreateOnePokemon($createPokemonPayload: CreatePokemonInput) {
        createOnePokemon(createPokemonPayload: $createPokemonPayload) {
          id,
          name,
          types {
            type {
              name
            }
          }
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: CREATE_MUTATION,
        variables: {
          createPokemonPayload: {
            name: 'mynewpokemon',
            types: ['mynewtype', 'main'],
          },
        },
      });

    expect(response.body.data).toBeDefined();
    expect(response.body.data.createOnePokemon).toBeDefined();
    expect(response.body.data.createOnePokemon.id).toBeDefined();
    expect(response.body.data.createOnePokemon.name).toBe('mynewpokemon');
    expect(response.body.data.createOnePokemon.types).toBeDefined();
    expect(response.body.data.createOnePokemon.types).toBeInstanceOf(Array);
    expect(response.body.data.createOnePokemon.types.length).toBe(2);
    expect(response.body.data.createOnePokemon.types[0].type).toBeDefined();
    expect(
      response.body.data.createOnePokemon.types.some(
        (type) => type.type.name === 'mynewtype',
      ),
    ).toBe(true);
    expect(
      response.body.data.createOnePokemon.types.some(
        (type) => type.type.name === 'main',
      ),
    ).toBe(true);
  });

  it('should update a pokemon', async () => {
    const pokemon = await pokemonFactory.create();

    const UPDATE_MUTATION = `
      mutation UpdateOnePokemon($updateOnePokemonId: ID!, $updatePokemonPayload: UpdatePokemonInput) {
        updateOnePokemon(id: $updateOnePokemonId, updatePokemonPayload: $updatePokemonPayload) {
          id,
          name,
          types {
            type {
              name
            }
          }
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: UPDATE_MUTATION,
        variables: {
          updateOnePokemonId: pokemon.id.toString(),
          updatePokemonPayload: {
            name: 'updatedpokemon',
            types: ['newpokemontype'],
          },
        },
      });

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updateOnePokemon).toBeDefined();
    expect(response.body.data.updateOnePokemon.id).toBeDefined();
    expect(response.body.data.updateOnePokemon.name).toBe('updatedpokemon');
    expect(response.body.data.updateOnePokemon.types).toBeDefined();
    expect(response.body.data.updateOnePokemon.types).toBeInstanceOf(Array);
    expect(response.body.data.updateOnePokemon.types.length).toBe(1);
    expect(response.body.data.updateOnePokemon.types[0].type).toBeDefined();
    expect(
      response.body.data.updateOnePokemon.types.some(
        (type) => type.type.name === 'newpokemontype',
      ),
    ).toBe(true);
  });

  it('should delete a pokemon', async () => {
    const pokemon = await pokemonFactory.create();

    const DELETE_MUTATION = `
      mutation DeleteOnePokemon($deleteOnePokemonId: ID!) {
        deleteOnePokemon(id: $deleteOnePokemonId)
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: DELETE_MUTATION,
        variables: {
          deleteOnePokemonId: pokemon.id.toString(),
        },
      });

    expect(response.body.data).toBeDefined();
    expect(response.body.data.deleteOnePokemon).toBe(true);
  });

  it('should import pokemon by id', async () => {
    const IMPORT_MUTATION = `
      mutation ImportPokemonById($importPokemonByIdId: ID!) {
        importPokemonById(id: $importPokemonByIdId) {
          id,
          name,
          types {
            type {
              name
            }
          }
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: IMPORT_MUTATION,
        variables: {
          importPokemonByIdId: '158',
        },
      });

    expect(response.body.data).toBeDefined();
    expect(response.body.data.importPokemonById).toBeDefined();
    expect(response.body.data.importPokemonById.id).toBeDefined();
    expect(response.body.data.importPokemonById.name).toBeDefined();
    expect(response.body.data.importPokemonById.types).toBeDefined();
    expect(response.body.data.importPokemonById.types).toBeInstanceOf(Array);
    expect(response.body.data.importPokemonById.types.length).toBe(1);
    expect(response.body.data.importPokemonById.types[0].type).toBeDefined();
  });
});
