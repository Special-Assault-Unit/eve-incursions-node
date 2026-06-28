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

- Root `npm test` runs available workspace tests; use `npm run typecheck` for TypeScript checks.
- npm workspaces only declare `./packages/*`; no shared TS package.
- Docker Compose is canonical runtime. Services use container hostnames: `server`, `redis`, `mysql`.
- Server TS: Node16 modules, decorators on, strict mode, `strictPropertyInitialization: false`, tests excluded from `tsconfig`.
- Frontend TS: Next/bundler resolution, `allowJs`, `isolatedModules`, `noEmit`, React JSX transform.
- No ESLint/Prettier config found. Preserve local formatting.

## ANTI-PATTERNS (THIS PROJECT)

- Do not promise support or maintenance. README marks repo retired/sunset.
- Do not require frontend `next build` or GraphQL codegen in the fast baseline unless live app infrastructure is available.
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

npm run typecheck
npm test

cd packages/server && npm test
cd packages/server && npm run scheduler
cd packages/server && npm run spawns:update

cd packages/frontend && npm run dev
cd packages/frontend && npm run build
cd packages/frontend && npm run y

cd packages/ws && npm run prod
```

## QUALITY GATES

- Use root-level checks as the canonical verification path for humans, agents, and CI.
- Run `npm run typecheck` before declaring TypeScript/package changes complete.
- Run `npm test` before declaring behavior changes complete; this currently runs package tests that exist and skips packages without tests.
- GitHub Actions mirrors the fast baseline: install dependencies, typecheck all workspaces, then run available tests.
- Do not add broad lint/formatter churn unless a dedicated decision issue approves it.
- Do not make Docker Compose E2E, `next build`, or GraphQL codegen mandatory in the fast baseline without first proving they run without live app infrastructure.
- See `docs/quality-gates.md` for the current command contract and exclusions.

## DECISION ISSUES

Use GitHub issues as lightweight decision records for non-trivial work blocks. The goal is to preserve why a change exists, not to add bureaucracy.

Before implementation, create or reuse a Decision Issue when any of these apply:
- The change affects CI, tests, deployment, tooling, agent workflow, or repository process.
- The change spans multiple packages or architectural boundaries.
- The change changes data shape, GraphQL/API contracts, database entities, or runtime topology.
- The change involves tradeoffs or rejected alternatives.
- Future maintainers may reasonably ask, "why was this done?"
- The work is expected to produce multiple commits, a branch, or a PR.

Do not create a Decision Issue for:
- Typo fixes.
- Obvious single-file bug fixes.
- Small test additions following existing patterns.
- Generated-only updates.
- Mechanical dependency patch bumps without policy or compatibility impact.

When a Decision Issue is warranted:
1. Search existing open issues first with `gh issue list --search`.
2. Reuse a matching issue if one exists.
3. If none exists and GitHub CLI is authenticated, create one before implementation.
4. Use the structure from `.github/ISSUE_TEMPLATE/decision.md`.
5. Reference the issue from the PR description or commit body with `Refs #N` or `Closes #N`.
6. Apply a `decision` label when available; do not block work if the repo has no such label.

Keep issues concise. Prefer one issue per work theme, not one issue per commit.

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
