# packages/ws/

## Responsibility
Websocket relay package. Converts backend Redis pub/sub notifications into browser websocket messages for coarse-grained frontend refresh.

## Design
Minimal event bridge. One TypeScript entry point starts a `ws` server and a Redis subscriber. No shared protocol library; event name and payload string are hard-coded.

## Flow
1. Process starts `WebSocketServer` on port `4003`.
2. Redis client connects to Compose hostname `redis`.
3. Subscriber listens to channel `spawn.change`.
4. On matching message, server iterates connected clients and sends string `"spawn.change"`.

## Integration
- Produced events come from `packages/server/src/commands/updateSpawns.ts`.
- Consumed by frontend homepage via `react-use-websocket` at `/ws` through caddy.
- Package scripts run `tsx src/index.ts` directly in dev/prod.
