# SERVER PACKAGE KNOWLEDGE

## OVERVIEW

GraphQL API plus ESI ingestion jobs. Owns canonical domain models, database access, Redis events, scheduled updates, and one-off maintenance commands.

## STRUCTURE

```text
packages/server/
|-- src/index.ts          # Apollo/TypeGraphQL API entry
|-- src/scheduler.ts      # periodic update jobs
|-- src/run.ts            # command dispatcher
|-- src/commands/         # ESI sync + derived-data jobs
|-- src/models/           # TypeORM entities + TypeGraphQL object types
|-- src/resolvers/        # GraphQL query surface
|-- src/lib/              # DB, Redis, ESI, utility helpers
`-- src/generic-types/    # reusable GraphQL response types
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/change GraphQL query | `src/resolvers/*Resolver.ts`, `src/models/*.ts` | Register new resolver in `src/index.ts` |
| Change DB shape | `src/models/*.ts` | `entities` glob loads `../models/*.ts`; migrations list empty |
| Change ESI fetch behavior | `src/lib/esi.ts`, `src/commands/` | `esiRequest<T>` sets required User-Agent |
| Change active spawn logic | `src/commands/updateSpawns.ts`, `src/models/Spawn.ts` | Also affects Redis `spawn.change` and frontend cache refresh |
| Change scheduler timing | `src/scheduler.ts` | Node-schedule cron strings live inline |
| Add one-off command | `src/run.ts`, `package.json` scripts | Dispatch by `process.argv[2]`, then disconnect Redis and destroy datasource |
| Paginated response pattern | `src/generic-types/PaginatedResponse.type.ts`, `src/resolvers/SpawnLogResolver.ts` | Generic type helper wrapped by concrete resolver response |
| Tests | `src/lib/esi.test.ts`, `src/commands/ensureConstellationData.test.ts` | Vitest, explicit imports, module mocks |

## CONVENTIONS

- API boot waits for MySQL port `3306`, initializes `AppDataSource`, builds schema from resolver class list, then serves Apollo on `4001`.
- `AppDataSource` reads `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`; `synchronize: false`, no migrations.
- Model classes usually extend `BaseEntity` and carry both `@Entity` and `@ObjectType`.
- Lazy relations are common: `Promise<Constellation>`, `Promise<InfluenceLogEntry[]>`, etc.
- Command functions are exported from `src/commands/*.ts` and reused by scheduler/run scripts.
- Tests mock module boundaries with `vi.mock(...)` and `vi.hoisted(...)`; avoid hitting real ESI, DB, or Redis in unit tests.
- Formatting is mixed but compact: no formatter config; preserve surrounding quote/import style.

## ANTI-PATTERNS

- Do not run root `npm test`; use `cd packages/server && npm test`.
- Do not assume tests compile through `tsconfig`; `**/*.test.ts` is excluded.
- Do not add migrations expecting them to run; `migrations: []` and no migration script exist.
- Do not bypass `src/lib/esi.ts` for CCP ESI calls; it centralizes base URL and User-Agent.
- Do not forget Redis cleanup in one-off commands; current `run.ts` disconnects Redis and destroys datasource.

## COMMANDS

```bash
npm start                  # watch API via nodemon + ts-node --swc
npm run single             # API once
npm run scheduler          # periodic ESI jobs
npm run spawns:update      # run updateSpawns
npm run sov:update         # run updateSovereignty
npm run rats:update        # run updateRats
npm run hsspawn:calculate  # run calculateHSSpawn
npm run systems:update     # deprecated/stubbed path; inspect before use
npm test                   # vitest run
npm run prod               # API + scheduler via concurrently
```

## NOTES

- `updateSpawns()` runs every 5 minutes; `updateSpawns(true)` hourly; `updateSovereignty()` at minute 30.
- `spawn.change` is shared protocol with `packages/ws` and frontend refresh behavior.
- `Spawn` has computed GraphQL fields: `stagingSystem`, `influenceLogArray`, `lastStateChangeDate`.
- Coverage is sparse: most resolvers, scheduler, runner, and models lack tests.
