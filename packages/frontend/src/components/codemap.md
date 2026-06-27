# packages/frontend/src/components/

## Responsibility
Presentational component layer for the app shell, active spawn dashboard, rat statistics, and theme toggle.

## Design
Feature-folder component organization. Components consume generated GraphQL result subtypes directly, use CSS modules for local styling, and share global utility classes for tables/state/security colors.

## Flow
1. Page route fetches typed data.
2. Page passes a slice of generated query result into feature component.
3. Component transforms display-specific fields such as Dotlan URLs, image URLs, chart inputs, or countdown timing.
4. CSS modules and global utility classes determine presentation.

## Integration
- Consumed by `src/pages/*`.
- Depends on generated `src/lib/graphql.ts`, `src/lib/utils.ts`, Chart.js wrappers, `react-timeago`, and `react-countdown`.
- Child maps cover `layout/`, `spawn/`, `rats/`, and `theme-toggle/`.
