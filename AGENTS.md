# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-27
**Commit:** ff7cefe
**Branch:** master

## OVERVIEW

Retired EVE Online incursions tracker. npm-workspaces monorepo: Apollo/TypeGraphQL API + ESI jobs, tiny Redis-backed websocket relay, Next.js SSR frontend, MariaDB, Redis, Docker Compose.

## STRUCTURE

```text
eve-incursions-node/
|-- packages/server/      # GraphQL API, TypeORM models, ESI sync jobs
|-- packages/frontend/    # Next.js SSR site, GraphQL codegen, UI
|-- packages/ws/          # Redis spawn.change -> websocket fanout
|-- seed/                 # MariaDB seed dump, not app code
|-- caddy/                # caddy-docker-proxy stack
`-- docker-compose*.yml   # base/dev/stage/prod service wiring
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| API boot | `packages/server/src/index.ts` | MySQL wait, `AppDataSource`, TypeGraphQL schema, Apollo on `4001` |
| Scheduled ESI refresh | `packages/server/src/scheduler.ts` | spawn refresh every 5 min/hourly, sovereignty at minute 30 |
| One-off data jobs | `packages/server/src/run.ts`, `packages/server/src/commands/` | `updateSpawns`, `updateSovereignty`, `updateRats`, `calculateHSSpawn`, `updateSystems` |
| Domain/API contract | `packages/server/src/models/`, `packages/server/src/resolvers/` | TypeORM entities double as TypeGraphQL object types |
| ESI/DB/Redis helpers | `packages/server/src/lib/` | `esi.ts`, `data-source.ts`, `redis.ts`, `utils.ts` |
| Realtime bridge | `packages/ws/src/index.ts` | Redis channel `spawn.change`, websocket payload `"spawn.change"` |
| Frontend routes | `packages/frontend/src/pages/` | Next pages router; SSR pages call GraphQL/Redis |
| Generated frontend API | `packages/frontend/src/lib/graphql.ts` | Generated from `src/**/*.graphql`; do not hand-edit |
| Compose runtime | `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, `docker-compose.stage.yml` | Docker-first local/prod model |
| Seed DB | `seed/eve-incursions-seed.sql.gz` | Public game-data MariaDB snapshot |

## CODE MAP

LSP symbol query unavailable in this harness; reference counts below are cheap text refs.

| Symbol / Boundary | Type | Location | Refs | Role |
|-------------------|------|----------|------|------|
| `AppDataSource` | TypeORM datasource | `packages/server/src/lib/data-source.ts` | 18 | DB init/query hub |
| `redis` | Redis client | `packages/server/src/lib/redis.ts`, `packages/frontend/src/lib/redis.ts` | 16 | cache + pub/sub bridge |
| `spawn.change` | Protocol event | `packages/ws/src/index.ts`, server commands | 4 | backend update -> browser refresh |
| `GraphQLClient` / `getSdk` | Frontend API client | `packages/frontend/src/lib/graphql.ts`, pages | 24 | generated typed GraphQL access |
| `@Entity` / `@ObjectType` / `@Resolver` / `@Query` | API schema markers | `packages/server/src/models/`, `packages/server/src/resolvers/` | 38 | schema/entity surface |
| `updateSpawns` | Job/use case | `packages/server/src/commands/updateSpawns.ts` | central | scheduler + one-off spawn refresh |

## CONVENTIONS

- Root `npm test` is a failing placeholder. Use package commands.
- npm workspaces only declare `./packages/*`; no shared TS package.
- Docker Compose is canonical runtime. Services use container hostnames: `server`, `redis`, `mysql`.
- Server TS: Node16 modules, decorators on, strict mode, `strictPropertyInitialization: false`, tests excluded from `tsconfig`.
- Frontend TS: Next/bundler resolution, `allowJs`, `isolatedModules`, `noEmit`, React JSX transform.
- No ESLint/Prettier config found. Preserve local formatting.

## ANTI-PATTERNS (THIS PROJECT)

- Do not promise support or maintenance. README marks repo retired/sunset.
- Do not rely on root `npm test`; it exits with `Error: no test specified`.
- Do not edit `packages/frontend/src/lib/graphql.ts` by hand. Edit `.graphql` documents/schema flow, then run frontend codegen.
- Do not treat `packages/server/src/commands/updateSystems.ts` as an active path without checking its deprecation warning.
- Do not assume `http://localhost` works unless `caddy/` proxy stack is running; direct frontend is `http://localhost:4002`.

## UNIQUE STYLES

- Server model classes combine TypeORM decorators and TypeGraphQL decorators.
- Frontend SSR reads Redis cache and falls back to GraphQL at `http://server:4001`.
- Browser refresh is coarse-grained: websocket message triggers `router.replace(router.asPath)`.
- Service worker prefers network first; offline/cache behavior is secondary.

## COMMANDS

```bash
docker network create caddy
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
cd caddy && docker compose up -d

cd packages/server && npm test
cd packages/server && npm run scheduler
cd packages/server && npm run spawns:update

cd packages/frontend && npm run dev
cd packages/frontend && npm run build
cd packages/frontend && npm run y

cd packages/ws && npm run prod
```

## NOTES

- Ports: server `4001`, frontend host `4002` -> container `3000`, websocket `4003`, MariaDB host `3313`.
- Root `.env` must provide `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`; prod backup can use `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.
- `packages/ws` is intentionally tiny; root guidance covers it unless protocol grows.
- Tests are sparse and server-only: `packages/server/src/lib/esi.test.ts`, `packages/server/src/commands/ensureConstellationData.test.ts`.

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:
- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.
