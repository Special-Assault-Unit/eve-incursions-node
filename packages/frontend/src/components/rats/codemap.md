# packages/frontend/src/components/rats/

## Responsibility
Sansha rat statistics component cluster. Renders rat cards, attack profile, defensive EHP/resistances, EWAR metadata, and damage type rows.

## Design
Small component decomposition around nested `RatGroupsQuery` data. `Rat` aggregates child stat panels; `Attack`, `Defense`, `DamageTypesRow`, `DamageTypeCol`, and `Ewar` render specific stat families using one shared CSS module.

## Flow
1. `pages/rats.tsx` loads `ratGroups()` at build/static generation time.
2. Page sorts rats by name within each group.
3. `Rat` renders ship image from `/images/renders/256/{graphicId}.jpg` and delegates stat sections.
4. Damage/EWAR components format nested scalar arrays into rows/badges.

## Integration
- Consumed by `src/pages/rats.tsx`.
- Depends on generated rat group types and static render images under `public/images/renders/`.
- Data source is server `RatResolver` and `Rats` model group structure.
