# packages/

## Responsibility
npm workspace container for runtime packages. It separates API/ingestion, frontend SSR, and websocket fanout into independent Node services wired by Docker Compose.

## Design
Workspace boundary, not shared library layer. Each child package owns its `package.json`, `tsconfig.json`, dependencies, and runtime command surface. Cross-package contracts are runtime protocols: GraphQL HTTP, Redis cache/channel names, and websocket message strings.

## Flow
1. Root Compose starts `server`, `frontend`, `ws`, `mysql`, and `redis`.
2. `server` exposes GraphQL and publishes cache invalidation events.
3. `frontend` consumes GraphQL and Redis from SSR.
4. `ws` converts Redis pub/sub into browser websocket notifications.

## Integration
- Contains: `packages/server/`, `packages/frontend/`, `packages/ws/`.
- Declared by root `package.json` workspace pattern `./packages/*`.
- No shared TypeScript package; duplicate tiny helpers like Redis clients are package-local.
