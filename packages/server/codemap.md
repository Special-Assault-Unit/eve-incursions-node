# packages/server/

## Responsibility
Backend service package. Owns GraphQL API, TypeORM entity schema, ESI ingestion jobs, scheduled refresh process, one-off maintenance commands, Redis cache invalidation, and spawn-change event publishing.

## Design
Layered TypeScript service:
- Entry points in `src/index.ts`, `src/scheduler.ts`, and `src/run.ts`.
- Infrastructure adapters in `src/lib/`.
- Application services in `src/commands/`.
- Entities double as TypeGraphQL object types in `src/models/`.
- Resolver classes expose read queries in `src/resolvers/`.

## Flow
1. API process waits for MySQL, initializes `AppDataSource`, builds TypeGraphQL schema, starts Apollo on `4001`.
2. Scheduler process waits for MySQL, initializes `AppDataSource`, then schedules `updateSpawns()` and `updateSovereignty()`.
3. One-off `run.ts` initializes DB, dispatches command by `process.argv[2]`, disconnects Redis, and destroys datasource.
4. Commands call ESI, persist TypeORM entities, invalidate Redis keys, and publish `spawn.change` where relevant.

## Integration
- Consumed by frontend through GraphQL endpoint `http://server:4001`.
- Consumed by websocket package through Redis channel `spawn.change`.
- Depends on MariaDB env vars `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`.
- Package scripts define dev, scheduler, one-off jobs, tests, and production combined API+scheduler.
