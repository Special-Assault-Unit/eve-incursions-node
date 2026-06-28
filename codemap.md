# Repository Atlas: eve-incursions-node

## Project Responsibility
Retired EVE Online incursions tracker. Docker-first npm workspace with three runtime services: TypeGraphQL/Apollo API and ESI ingestion jobs, Next.js pages-router SSR frontend, and Redis-backed websocket relay.

## System Entry Points
- `docker-compose.yml`: production-like service graph for `server`, `frontend`, `ws`, `mysql`, `redis`, plus optional `caddy` profile and app init service.
- `docker-compose.dev.yml`: development commands and port publishing overlay.
- `packages/server/src/index.ts`: GraphQL API process on port `4001`.
- `packages/server/src/scheduler.ts`: periodic ESI ingestion process.
- `packages/server/src/run.ts`: one-off command dispatcher for data jobs.
- `packages/frontend/src/pages/_app.tsx`: shared Next.js shell, global CSS, service worker policy.
- `packages/frontend/src/pages/index.tsx`: live incursion dashboard SSR and websocket refresh path.
- `packages/ws/src/index.ts`: websocket fanout for Redis `spawn.change` events.

## Directory Map
| Directory | Responsibility Summary | Detailed Map |
|-----------|------------------------|--------------|
| `packages/` | npm workspace boundary for three independent services. | [View Map](packages/codemap.md) |
| `packages/server/` | API, TypeORM domain model, ESI ingestion, scheduler, and Redis invalidation. | [View Map](packages/server/codemap.md) |
| `packages/server/src/commands/` | Application service layer for ESI synchronization and derived data updates. | [View Map](packages/server/src/commands/codemap.md) |
| `packages/server/src/lib/` | Infrastructure adapters for TypeORM, Redis, ESI HTTP, and utility transforms. | [View Map](packages/server/src/lib/codemap.md) |
| `packages/server/src/models/` | Persistence model and GraphQL object schema layer. | [View Map](packages/server/src/models/codemap.md) |
| `packages/server/src/resolvers/` | GraphQL query boundary backed by TypeORM models. | [View Map](packages/server/src/resolvers/codemap.md) |
| `packages/frontend/` | Next.js SSR app, generated GraphQL client, public UI, and service worker. | [View Map](packages/frontend/codemap.md) |
| `packages/frontend/src/pages/` | Route-level data loading and page composition. | [View Map](packages/frontend/src/pages/codemap.md) |
| `packages/frontend/src/components/` | Presentational feature components for layout, spawns, rats, and theme control. | [View Map](packages/frontend/src/components/codemap.md) |
| `packages/frontend/src/lib/` | Frontend infrastructure: Redis SSR client, generated GraphQL SDK, utilities, theme hook. | [View Map](packages/frontend/src/lib/codemap.md) |
| `packages/frontend/public/` | Static assets and network-first offline service worker. | [View Map](packages/frontend/public/codemap.md) |
| `packages/ws/` | Minimal Redis-to-WebSocket process for live refresh notifications. | [View Map](packages/ws/codemap.md) |

## Cross-Service Flow
1. Scheduler or one-off command calls CCP ESI via `packages/server/src/lib/esi.ts`.
2. Command service mutates MySQL through TypeORM entities and `AppDataSource`.
3. Spawn changes delete frontend Redis key `spawns` and publish Redis channel `spawn.change`.
4. `packages/ws` subscribes to `spawn.change` and broadcasts websocket payload `"spawn.change"`.
5. Frontend homepage websocket handler calls `router.replace(router.asPath)`.
6. Next SSR reloads data from Redis cache or GraphQL API at `http://server:4001`.

## Runtime Topology
- Compose service hostnames are part of app contracts: `server`, `redis`, `mysql`.
- Published ports default to localhost: frontend `4002`, API `4001`, websocket `4003`, MariaDB `3313`.
- Optional Caddy profile routes `/api*` to API, `/ws` to websocket, and `/*` to frontend using `PUBLIC_HOST`.

## Maintenance Notes
- Root `npm test` runs available workspace tests; use `npm run typecheck` for TypeScript checks.
- `packages/frontend/src/lib/graphql.ts` is generated; change `*.graphql` documents and run codegen.
- No migrations are wired; TypeORM `synchronize` is false and seed DB is external.
- Repository is retired; documentation should describe current behavior, not support promises.
