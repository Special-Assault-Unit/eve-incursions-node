# packages/frontend/src/styles/

## Responsibility
Global styling layer: design tokens, reset/base styles, shared table styles, prose styles, footer styles, and homepage layout module.

## Design
Hybrid CSS strategy. Global CSS files define cross-route classes and variables; component folders use CSS modules for feature-local styling.

## Flow
1. `_app.tsx` imports `tokens.css`, `globals.css`, `tables.css`, and `footer.css` globally.
2. Pages/components import CSS modules where local scope is needed.
3. Shared classes such as table wrappers, state/security labels, and container layout are applied by route components.

## Integration
- Consumed by `_app.tsx`, pages, and feature components.
- Coordinates with `theme-toggle`/`useTheme` through CSS custom properties.
