# packages/frontend/src/lib/

## Responsibility
Frontend support layer for generated GraphQL access, Redis SSR cache client, route/display utilities, and theme state hook.

## Design
- `graphql.ts`: generated SDK/types from `codegen.yml`; do not edit manually.
- `redis.ts`: singleton ioredis client for SSR cache access.
- `utils.ts`: pure string/class helpers such as Dotlan URL transforms.
- `useTheme.ts`: browser hook for theme persistence/application.

## Flow
1. Route data functions instantiate `GraphQLClient` and pass it to generated `getSdk()`.
2. Homepage SSR reads/writes Redis through `redis.ts` around GraphQL fallback.
3. Components call utility functions to generate class names and external map URLs.
4. Theme UI calls `useTheme` to synchronize UI state and document theme.

## Integration
- Consumed by pages and feature components.
- Depends on `graphql-request`, generated GraphQL documents/schema, ioredis, and browser storage APIs for theme hook.
