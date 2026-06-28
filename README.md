# EVE Incursions

Tracker for [EVE Online](https://www.eveonline.com/) incursions — live spawn status,
influence history, spawn history, community list and Sansha rat stats. Data is pulled
from CCP's [ESI API](https://esi.evetech.net/).

> **Status: retired.** This project is being sunset and is no longer maintained.
> It is published as-is for anyone who wants to read, fork, or self-host it. I will
> **not** be providing any support, fixes, reviews, or help with setup, and I will not
> be responding to issues or pull requests. You are entirely on your own — please do
> not contact me for assistance. See the [LICENSE](LICENSE) for the (lack of) warranty.

## Architecture

A npm-workspaces monorepo with three services, wired together with Docker Compose:

| Package           | What it is                              | Port (host) |
| ----------------- | --------------------------------------- | ----------- |
| `packages/server` | GraphQL API + ESI scrapers (TypeScript) | `4001`      |
| `packages/ws`     | WebSocket server (push live updates)    | `4003`      |
| `packages/frontend` | Next.js site (SSR)                    | `4002`      |

Backing services: **MariaDB** (`3313` on host) and **Redis** (internal). The stack can run
behind any external reverse proxy. An optional
[caddy-docker-proxy](https://github.com/lucaslorentz/caddy-docker-proxy) service is
available through the `caddy` Compose profile.

## Prerequisites

- Docker + Docker Compose
- A root `.env` file (see below)

## Configuration

Create a `.env` in the repo root (it is gitignored):

```env
MYSQL_HOST=mysql
MYSQL_USER=root
MYSQL_PASSWORD=your-db-password
MYSQL_DB=eve-incursions

# Optional: hostname used by the bundled Caddy profile.
# Leave as localhost for local development, or set during deployment.
PUBLIC_HOST=localhost

# Optional: Discord webhook notifications for matching incursion regions.
# Omit either variable to disable notifications.
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
NOTIFICATION_FILTERS=[{"regionNames":["Innsmother"]}]
```

`MYSQL_HOST` is the compose service name (`mysql`) when running in Docker.
The app ports bind to `127.0.0.1` by default so a host-level reverse proxy can sit in
front of them. Override `SERVER_BIND`, `FRONTEND_BIND`, `WS_BIND`, or `MYSQL_BIND` only
when you intentionally want wider exposure.

Discord notifications match region names exactly, case-insensitively. The v1 notifier
sends one message when a matching incursion starts and one when it ends.

## Run it locally

The base `docker-compose.yml` is the production-like runtime. The development overlay
`docker-compose.dev.yml` switches services to watch/dev commands and publishes local
ports.

```bash
# Bring up the dev stack (installs deps, then starts all services)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Then open:

- **http://localhost:4002** — the frontend directly, or
- **http://localhost** — via Caddy if you enable the `caddy` profile

> Note: hit port **4002** for the frontend. `http://localhost` only works through the
> bundled proxy when the `caddy` profile is enabled.

To run the bundled reverse proxy too:

```bash
COMPOSE_PROFILES=caddy docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Seed the data

A fresh MariaDB starts empty, so the homepage will have nothing to show until it is
populated. `seed/eve-incursions-seed.sql.gz` is a gzipped MariaDB dump of all 11 tables
(systems, spawns, communities, rat stats, etc.), taken on 2026-06-26. It contains only
public EVE/game data — no user data. Pipe it into the running `mysql` container:

```bash
gunzip -c seed/eve-incursions-seed.sql.gz | \
  docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T mysql \
  mariadb -uroot -p"$MYSQL_PASSWORD" eve-incursions
```

## Useful commands

```bash
DC="docker compose -f docker-compose.yml -f docker-compose.dev.yml"

$DC up                       # start everything (foreground)
$DC up -d                    # start detached
$DC logs -f frontend         # tail a service
$DC exec frontend sh         # shell into a container
$DC down                     # stop the stack
```

Server scripts (run inside the `server` container, or from `packages/server`):

| Script                  | Purpose                              |
| ----------------------- | ------------------------------------ |
| `npm start`             | GraphQL API (watch mode)             |
| `npm run scheduler`     | Periodic ESI update jobs             |
| `npm run spawns:update` | One-off: refresh active spawns       |
| `npm run systems:update`| One-off: refresh system data         |
| `npm run sov:update`    | One-off: refresh sovereignty         |
| `npm run rats:update`   | One-off: refresh rat stats           |
| `npm test`              | Vitest                               |

## Production

`docker-compose.yml` defines the production-like app runtime. It does not hard-code a
deployment domain and can sit behind Nginx, Caddy, Traefik, Cloudflare Tunnel, or another
reverse proxy.

To use the bundled Caddy reverse proxy, set `PUBLIC_HOST` and enable the `caddy` profile:

```bash
PUBLIC_HOST=example.com COMPOSE_PROFILES=caddy docker compose up -d
```

Without that profile, point your host-level reverse proxy at the local published ports:
frontend `127.0.0.1:4002`, API `127.0.0.1:4001`, and websocket `127.0.0.1:4003`.

## Tech stack

Next.js · React · TypeScript · GraphQL · MariaDB · Redis · Docker · Chart.js
