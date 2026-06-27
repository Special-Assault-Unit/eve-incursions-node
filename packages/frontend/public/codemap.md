# packages/frontend/public/

## Responsibility
Static asset root for icons, EVE images, manifest/robots files, offline HTML, and service worker.

## Design
Direct-public Next assets. Most images are consumed by CSS/components via `/images/...`; `sw.js` implements navigation-only network-first offline fallback using `offline.html`.

## Flow
1. Browser requests static files directly from Next public root.
2. Production `_app.tsx` registers `/sw.js`.
3. Service worker install caches `offline.html`.
4. Navigation fetches try network first and fall back to cached offline page on network errors.

## Integration
- Consumed by frontend components, browser manifest handling, and service worker registration.
- Caddy dev labels add cache-control for common static image extensions.
