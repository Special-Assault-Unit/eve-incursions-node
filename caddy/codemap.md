# caddy/

## Responsibility
Reverse-proxy deployment wrapper for caddy-docker-proxy. Provides local/prod host routing when the external `caddy` network is running.

## Design
Compose-only infrastructure module. Application services expose caddy labels in root compose overlays; this folder supplies proxy runtime, Docker socket access, and network attachment.

## Flow
1. User creates external Docker network `caddy`.
2. `caddy/docker-compose.yml` starts proxy container on that network.
3. Service labels from `docker-compose.dev.yml` or prod overlays define route targets.
4. Requests to `localhost` route to frontend, API, websocket, or cached static assets.

## Integration
- Depends on Docker socket and external `caddy` network.
- Consumes caddy labels from root compose files.
- Optional for direct dev ports; required for `http://localhost` proxy behavior.
