# packages/frontend/src/components/theme-toggle/

## Responsibility
Theme toggle UI component for switching persisted frontend theme state.

## Design
Client-side control component backed by `src/lib/useTheme.ts`. Local CSS module scopes button/presentation styles while CSS variables in `src/styles/tokens.css` define theme values.

## Flow
1. Component reads current theme and setter from `useTheme`.
2. User interaction updates client theme state/persistence.
3. CSS variable state changes visual treatment globally.

## Integration
- Consumed by navigation/app chrome where theme control is displayed.
- Depends on `src/lib/useTheme.ts` and shared CSS tokens.
