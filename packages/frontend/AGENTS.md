# FRONTEND PACKAGE KNOWLEDGE

## OVERVIEW

Next.js pages-router SSR site. Owns public UI, Redis-backed SSR cache reads, generated GraphQL client/types, websocket-triggered refresh, theme/layout chrome.

## STRUCTURE

```text
packages/frontend/
|-- src/pages/             # routes and page data boundaries
|-- src/pages/*.graphql    # GraphQL documents for codegen
|-- src/components/spawn/  # active spawn dashboard UI
|-- src/components/rats/   # Sansha rat stats UI
|-- src/components/layout/ # nav, footer, retirement notice
|-- src/lib/               # generated GraphQL SDK, Redis, utils, theme hook
|-- src/styles/            # globals, tokens, tables, prose, page modules
`-- public/                # static assets, service worker, icons/images
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Homepage/live spawns | `src/pages/index.tsx`, `src/components/spawn/` | SSR cache -> GraphQL fallback -> websocket refresh |
| Spawn history | `src/pages/history.tsx`, `src/pages/history.graphql` | Paginated GraphQL data |
| Community list | `src/pages/communities.tsx`, `src/pages/communities.graphql` | SSR GraphQL route |
| Rat stats | `src/pages/rats.tsx`, `src/pages/rats.graphql`, `src/components/rats/` | Static-ish rat tables/cards |
| App shell | `src/pages/_app.tsx`, `src/components/layout/` | nav/footer/retirement notice/service worker registration |
| Theme behavior | `src/lib/useTheme.ts`, `src/components/theme-toggle/`, `src/styles/tokens.css` | CSS variables and local hook |
| Generated API types | `src/lib/graphql.ts`, `codegen.yml`, `schema.graphql` | Generated SDK/types from `src/**/*.graphql` |
| Redis cache | `src/lib/redis.ts`, SSR pages | Container hostname `redis` |

## CONVENTIONS

- Pages router, not app router. Route files live directly under `src/pages`.
- SSR pages use `getServerSideProps`; homepage reads Redis key `spawns` except in development.
- GraphQL calls use `graphql-request` plus generated `getSdk` from `src/lib/graphql.ts`.
- GraphQL documents sit beside pages as `*.graphql`; codegen output is centralized in `src/lib/graphql.ts`.
- Component styling uses CSS modules for feature components and shared CSS files in `src/styles/`.
- Live updates use `react-use-websocket`; message handler refreshes current route with `router.replace(router.asPath)`.
- Public service worker is registered in production and unregistered in development from `_app.tsx`.

## ANTI-PATTERNS

- Do not hand-edit `src/lib/graphql.ts`; run `npm run y` after changing `.graphql` documents/schema flow.
- Do not assume browser code can use Redis; Redis reads happen in SSR paths/helpers.
- Do not switch to Next app-router patterns without a deliberate migration; this package is pages-router.
- Do not expect frontend dev at port `4002` without Docker Compose mapping; raw `next dev` defaults to `3000`.
- Do not document `packages/frontend/README.md` as current architecture; it is create-next-app boilerplate.

## COMMANDS

```bash
npm run dev     # next dev
npm run build   # next build
npm start       # next start
npm run y       # graphql-codegen --config codegen.yml
```

## NOTES

- Docker dev maps host `4002` to container `3000`.
- Frontend queries server at `http://server:4001` inside Compose.
- Websocket URL is `wss://<current-host>/ws`; caddy routes `/ws` to `packages/ws`.
- `src/components/spawn/` and `src/components/rats/` are feature clusters; keep data-shape changes aligned with `.graphql` documents.
- Service worker comment says network-first. Cache/offline behavior is intentionally secondary.
