# packages/server/src/lib/

## Responsibility
Infrastructure adapter layer for backend runtime: database connection, Redis client, ESI HTTP client, and string formatting utilities.

## Design
- `data-source.ts`: singleton `AppDataSource` configured for MySQL and model glob loading.
- `redis.ts`: singleton ioredis client using Compose hostname `redis`.
- `esi.ts`: typed fetch adapter for CCP ESI with shared base URL and User-Agent.
- `utils.ts`: pure formatting helper used by command services.

## Flow
1. Entry point initializes `AppDataSource` before using entities.
2. Commands call `esiRequest<T>()` or typed wrappers for ESI data.
3. Commands use Redis for cache deletion and event publication.
4. Runner disconnects Redis and destroys datasource after one-off commands.

## Integration
- Consumed by `src/index.ts`, `src/scheduler.ts`, `src/run.ts`, `src/commands/*`, and computed entity fields.
- Depends on Node global `fetch`, env vars for MySQL, and Docker service hostname `redis`.
- Tested partially by `esi.test.ts`; DB and Redis adapters are not unit-covered.
