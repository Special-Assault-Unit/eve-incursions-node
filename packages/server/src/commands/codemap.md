# packages/server/src/commands/

## Responsibility
Application service layer for mutating game data. Synchronizes active incursions, sovereignty, rats, system/constellation metadata, and derived high-sec spawn calculations.

## Design
Command functions are exported async units reused by scheduler and one-off dispatcher. They combine external ESI reads, TypeORM persistence, and Redis side effects without separate repository classes.

## Flow
1. `updateSpawns()` fetches `/incursions/`, ensures constellation/system data, opens DB transaction, upserts active spawns, appends `SpawnLog` and `InfluenceLogEntry`, marks ended spawns, deletes Redis key `spawns`, then publishes `spawn.change`.
2. `ensureConstellationData()` deduplicates constellation IDs, fetches missing region/constellation data, and refreshes system security/name data in a transaction.
3. `updateSovereignty()` and `updateRats()` populate auxiliary model data consumed by resolvers/pages.
4. `calculateHSSpawn()` computes derived high-sec spawn state for API/frontend display.

## Integration
- Called by `src/scheduler.ts` on cron schedules.
- Called by `src/run.ts` through command names matching package scripts.
- Depends on `src/lib/esi.ts`, `src/lib/redis.ts`, `src/lib/data-source.ts`, and entity classes.
- `updateSpawns()` integrates with websocket package through Redis channel `spawn.change`.
