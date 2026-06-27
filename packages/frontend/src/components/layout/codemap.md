# packages/frontend/src/components/layout/

## Responsibility
Shared app chrome components: navigation and retirement notice.

## Design
Stateless React components with local CSS modules. They sit above route content through `_app.tsx` and communicate project status/navigation rather than owning data fetching.

## Flow
1. `_app.tsx` renders `Nav` before route content.
2. `_app.tsx` renders `RetirementNotice` inside the main container before active page component.
3. Component CSS modules scope layout/chrome styling.

## Integration
- Consumed by `src/pages/_app.tsx`.
- Depends on route URLs and global CSS tokens.
