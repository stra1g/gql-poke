import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { HelloModule } from '@/modules/hello/hello.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonsModule } from '@/modules/pokemons/pokemons.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { GqlThrottlerGuard } from '@/guards/gql-throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 30000,
          limit: 10,
        },
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    HelloModule,
    PokemonsModule,
    PrismaModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database/database_orm.sqlite',
      autoLoadEntities: true,
      synchronize: true,
      migrations: ['../typeorm/migrations/*.ts'],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
