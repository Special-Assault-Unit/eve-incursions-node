# packages/server/src/generic-types/

## Responsibility
Reusable TypeGraphQL type factory utilities.

## Design
Generic class factory pattern. `PaginatedResponse.type.ts` creates a concrete object type class from an item class so resolvers can expose `items`, `total`, and `hasMore` with correct GraphQL metadata.

## Flow
1. Resolver imports `PaginatedResponse` factory.
2. Resolver defines local class extending `PaginatedResponse(EntityClass)`.
3. TypeGraphQL sees concrete subclass and emits schema object type.

## Integration
- Used by `src/resolvers/SpawnLogResolver.ts`.
- Depends on TypeGraphQL decorators and runtime class values.
