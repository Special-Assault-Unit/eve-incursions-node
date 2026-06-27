# packages/frontend/src/pages/

## Responsibility
Route-level data boundary and page composition layer for the Next.js pages router.

## Design
Each route pairs a page component with either `getServerSideProps` or `getStaticProps`. GraphQL documents live beside route files and feed codegen. `_app.tsx` owns global shell; `_document.tsx` customizes HTML document.

## Flow
1. `index.tsx`: SSR reads Redis key `spawns` unless development, falls back to generated `activeSpawns()` query, writes Redis, renders spawn cards, and subscribes to websocket refresh.
2. `history.tsx`: SSR parses `page` query, calls `spawnLogs({page})`, renders grouped UTC/EVE-time history table.
3. `communities.tsx`: SSR calls active communities query and renders community table/list.
4. `rats.tsx`: SSG calls `ratGroups()` and renders grouped Sansha rat cards.
5. `_app.tsx`: imports globals, renders app chrome, and registers/unregisters service worker based on environment.

## Integration
- Depends on `src/lib/graphql.ts`, `graphql-request`, `src/lib/redis.ts`, feature components, and global styles.
- GraphQL endpoint is Compose hostname `http://server:4001`.
- Browser live reload path depends on caddy routing `/ws` to websocket service.
