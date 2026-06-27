# packages/frontend/

## Responsibility
Next.js pages-router frontend package. Owns SSR route composition, generated GraphQL SDK consumption, Redis-backed homepage cache reads, public UI components, static assets, and service worker registration.

## Design
Classic Next pages architecture:
- Route modules in `src/pages/` perform SSR/SSG data loading.
- Feature components in `src/components/` render typed GraphQL result shapes.
- `src/lib/graphql.ts` is generated from colocated `.graphql` documents.
- CSS modules style feature components; global CSS/tokens define app shell styles.

## Flow
1. `_app.tsx` loads global CSS, renders nav/retirement notice/footer, and controls service worker registration.
2. SSR/SSG route calls `GraphQLClient('http://server:4001')` and generated `getSdk()`.
3. Homepage first attempts Redis key `spawns` outside development, otherwise calls GraphQL and writes cache.
4. Browser websocket message triggers route replacement, causing SSR data reload.

## Integration
- Depends on server GraphQL API, Redis service hostname, caddy `/ws` route, and static EVE image URLs.
- Codegen configured by `codegen.yml`; output consumed by pages/components.
- Docker dev maps package's Next server from container `3000` to host `4002`.
