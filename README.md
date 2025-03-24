# Pokemon GQL Server

<div align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS">
  <img src="https://img.shields.io/badge/GraphQl-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</div>

<table align="center">
  <tr>
    <td align="center" width="120"><img src="https://www.gifcen.com/wp-content/uploads/2024/05/pikachu-gif-5.gif" alt="Pikachu" width="120"></td>
    <td>
      <p>⚡️ This project is a GraphQL API designed to manage Pokémon and their respective types. It provides functionalities to list, create, update, delete, and import Pokémon, as well as filter, sort, and paginate results ⚡️</p>
    </td>
  </tr>
</table>

### Usage of Prisma

In this project, we are using Prisma instead of TypeORM. Although the project initially had some frameworks in TypeORM, it was decided to use Prisma as the main ORM at this point.

## Installation

```bash
npm install
# or
yarn
```

## Set up the environment

```bash
cp .env.example .env
```

## Generate prisma files

```bash
npm run prisma generate
# or
yarn prisma generate

```

## Run database migrations

```bash
npm run prisma migrate dev
# or
yarn prisma migrate dev
```

## Running the app

```bash
npm run start:dev
# or
yarn start:dev
```

Once the application is running, you can access the GraphQL Playground at: http://localhost:4000/graphql

## Unit Tests

```bash
npm run test
# or
yarn test
```

## E2E Tests

```bash
npm run test:e2e
# or
yarn test:e2e
```

## Features

#### List All Pokémon

- Fetch all Pokémon with optional filtering and sorting.
- Uses a cache with a TTL of 20 seconds to improve performance.

#### Paginated Pokémon List

- Fetch Pokémon in a paginated format.
- Supports filtering and sorting.
- Uses a cache with a TTL of 20 seconds to improve performance.

#### Create, Update, and Delete Pokémon

- Create a new Pokémon with a name and types.
- Update an existing Pokémon's name and types.
- Delete a Pokémon by ID.
- After any of these operations, the cache is clean.

#### Import Pokémon by ID

- Import Pokémon data from an external API (PokeAPI) and save it to the database.

#### List All Pokémon

- Fetch all Pokémon with optional filtering and sorting.
- Uses a cache with a TTL of 20 seconds to improve performance.

## Database Migration Script

- Before, the pokemon `type` property was a varchar column inside the `pokemons` table
- Now, we have a many-to-many relationship between pokemons entity and types entity
- Then, we can have multiple types for same pokemon, allowing different abilities!
- The script below was used to make this migration works:

```sql
insert into types (name)
select distinct p.type
from pokemons AS p
where p.type is not null;

insert into pokemon_types (pokemon_id, type_id)
select p.id, t.id
from pokemons as p
         join types as t on p.type = t.name;

update types
set name = lower(name);
```

- After this, the old `type` column was deleted from `pokemons` table.

## Rate Limiting

- Limits API requests to 10 requests per 30 seconds per IP address.
- If the limit is exceeded, the user is blocked until the end of the 30 second window.
- Example:
  If the user makes 10 requests at t = 0s, they will be blocked until t = 30s.
  If the user makes 10 requests at t = 15s, they will be blocked until t = 45s.

## Future improvements

- Add Redis as a Cache Storage:
  - Replace the in-memory cache with Redis for better scalability and performance.
- Enhance Pagination Metadata:
  - Add properties like total_count and has_next_page to the pagination response.
- Expand Pokémon Data:
  - Add more properties (e.g., abilities, stats) to the Pokémon model.
- Improve Error Handling:
  - Add more detailed error messages and logging for better debugging.

---

Made by **@stra1g** 🖤
