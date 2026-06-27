# packages/frontend/src/

## Responsibility
Frontend source root for Next route modules, UI components, generated/API helpers, and CSS assets.

## Design
Pages-router source layout. Routes own data fetching and pass generated GraphQL result types into pure-ish presentational components.

## Flow
1. Next invokes page data functions (`getServerSideProps`, `getStaticProps`).
2. Page returns typed props from generated SDK calls or Redis cache.
3. Page composes feature components and shared styles.

## Integration
- Child maps cover route/data boundaries, feature components, library helpers, and styles.
- Consumed by Next.js build/runtime configured in package root.
