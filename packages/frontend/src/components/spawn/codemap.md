# packages/frontend/src/components/spawn/

## Responsibility
Active incursion dashboard component cluster. Renders spawn cards, staging/system topology, influence chart, high-sec spawn summary, state badges, countdowns, and EVE/Dotlan external links.

## Design
Typed presentational composition over `ActiveSpawnsQuery`. `Spawn` is the aggregate card component; `Chart` handles influence history visualization; `Systems`/`System` render constellation system lists; `LastHsSpawn` renders derived metadata.

## Flow
1. `pages/index.tsx` sorts `activeSpawns` by staging security and passes each item into `Spawn`.
2. `Spawn` computes state-dependent lifetime, influence percent, EVE image URL, Dotlan links, and progress bar width.
3. `Chart` receives `spawn.influenceLogArray` from server computed field.
4. `Systems` renders constellation systems and security/type metadata.

## Integration
- Consumed only by homepage route.
- Depends on generated GraphQL active-spawn types, `dotlanTransform`, `classNames`, Chart.js, `react-timeago`, and `react-countdown`.
- Data shape is controlled by `src/pages/index.graphql` and server `Spawn` GraphQL fields.
