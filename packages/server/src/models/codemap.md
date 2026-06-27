# packages/server/src/models/

## Responsibility
Domain schema layer for MariaDB persistence and GraphQL object exposure. Model classes represent incursions, map topology, communities, rats, spawn logs, influence logs, and derived API objects.

## Design
Active Record style with TypeORM `BaseEntity`. Most persistence classes combine `@Entity` with TypeGraphQL `@ObjectType`, so database schema and GraphQL object schema are co-located. Relations use lazy `Promise<T>` associations.

## Flow
1. TypeORM loads model files from `AppDataSource.entities` glob.
2. Resolvers return model instances directly from `BaseEntity` static methods.
3. TypeGraphQL resolves decorated fields, including computed getters.
4. `Spawn` computed getters traverse lazy relations and query logs to derive staging system, influence history array, and last state-change date.

## Integration
- Consumed by `src/resolvers/*Resolver.ts` as GraphQL return types.
- Mutated by `src/commands/*` during ESI ingestion.
- Relies on `AppDataSource` for computed queries in `Spawn`.
- External DB shape is seeded by `seed/eve-incursions-seed.sql.gz`; no migrations are wired.
