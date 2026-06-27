# packages/server/src/resolvers/

## Responsibility
GraphQL query boundary for frontend reads. Resolver classes expose active spawns, history, communities, rat groups, and high-sec spawn metadata.

## Design
Thin resolver pattern. Resolver methods call TypeORM entity static methods or query builders directly and return decorated model classes. `SpawnLogResolver` wraps generic pagination helper into a concrete GraphQL object type.

## Flow
1. `src/index.ts` passes resolver classes into `buildSchema()`.
2. Apollo receives GraphQL request from frontend SSR/codegen clients.
3. Resolver method queries TypeORM entities.
4. TypeGraphQL serializes model fields and computed getters.

## Integration
- Consumed by frontend `.graphql` documents and generated SDK.
- Depends on `src/models/*` and `src/generic-types/PaginatedResponse.type.ts`.
- New resolver class must be added to resolver list in `src/index.ts`.
