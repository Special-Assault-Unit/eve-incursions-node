# packages/ws/src/

## Responsibility
Source root for websocket relay process.

## Design
Single-file adapter. `index.ts` holds both websocket server setup and Redis subscription handler.

## Flow
1. Create `WebSocketServer({port: 4003})`.
2. Create Redis client with host `redis`.
3. Subscribe to `spawn.change`.
4. Broadcast `"spawn.change"` to every connected websocket client when Redis emits that channel.

## Integration
- Depends on `ws` and `ioredis` packages.
- Runtime endpoint is exposed directly on host `4003` in dev and via caddy `/ws` route.
