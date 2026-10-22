# Gokarna Main Beach guide

Independent visitor guide at https://gokarnamainbeach.com with a Kannada home, English home and three English topic pages. Existing Kannada legal pages remain separate routes.

## Build

Use Node 24.19.0 and pnpm 11.24.0 as pinned in the project. Install with `pnpm install --frozen-lockfile`, then run `pnpm check`, `pnpm build` and `pnpm verify`. The committed lockfile is required. Existing postinstall prepares the Astro build on a fresh install; deploy commands also build first.

The Astro Cloudflare adapter retains server rendering. `src/worker.mjs` applies canonical protocol/host redirects before delegating to the adapter, including prerendered static assets. Error responses are 404 and noindex. Only the five indexable visitor pages appear in the sitemap; legal pages stay noindex. The deployment entry and assets directory are generated under `dist/server/wrangler.json` and `dist/client`. Build output is ignored and regenerated; do not serve the server directory as public static files.

## Sources and images

The district source supports place identity, temple tradition and nearby beach topics. Dated Maps hours/reviews are third-party information, not guaranteed access. Unverified fees, facility operation and transport distances are qualified rather than asserted. Photo sources and exact original/derivative mappings are in PHOTO-CREDITS.md and public/images/manifest.json; each image has visible attribution. Original site copyright does not supersede their CC BY-SA licences.

## Weather and sea level

Existing API routes fetch Open-Meteo model data at request time, with a ten-minute server cache. Weather cache keys include language. Both widgets retain full current/day/advice or graph/turning-point displays and can recover from an unavailable first request. Model timestamps, refresh failure and limited coastal accuracy are visible. These are model estimates, not swimming-safety or navigation guidance.

## Analytics

The existing GA4 ID is unchanged. The existing cookie page controls its immediate runtime state; unreadable storage fails closed, refusal is retained in the tab where possible, and shared-storage events update open tabs. The privacy/cookie pages distinguish GA controls from Google Maps and Cloudflare delivery/security/Web Analytics. There is no separate preference-storage feature.

Production release and desktop/mobile interaction acceptance require a separate check of the actual deployed revision.
