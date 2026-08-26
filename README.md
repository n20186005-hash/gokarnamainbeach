# Gokarna Main Beach — Astro attraction guide

A Kannada-only, independent nonprofit visitor information site for Gokarna Main Beach, Uttara Kannada, Karnataka.

## Stack

- Astro 7
- Tailwind CSS 4 through the Vite plugin
- TypeScript 6.0.x (kept on the supported major used by `@astrojs/check`; TypeScript 7 is deliberately not used)
- Cloudflare Workers adapter
- pnpm pinned through `packageManager`
- Node.js 24 LTS pinned in both `engines` and `.node-version`
- No database, login or CMS

## Production domain

There is exactly one production-domain configuration point: `SITE` in `astro.config.mjs`. It is intentionally empty in this delivery. With it empty, canonical and `og:url` are omitted and the sitemap integration is disabled. Fill only that value after a production domain is chosen, then rebuild; all absolute site URLs derive from Astro's `site` value.

## Privacy and analytics

GA4 measurement ID `G-HXM22WWPKP` is present but not loaded until the visitor explicitly enables analytics on `/cookies/`. Cookie preferences are stored locally in the browser. Privacy policy, terms and cookie settings are standalone pages, not dialogs.

## Images

The pages use real Gokarna Main Beach photography from Wikimedia Commons with visible creator/license attribution. See `PHOTO-CREDITS.md` for source and license details. The delivery sandbox blocked outbound downloads, so the photographs remain remote references rather than bundled binaries.

## Verification

`node scripts/verify.mjs` performs repository-level checks for exact dependency specifiers, the single domain configuration, conditional sitemap, required content sections, map locale, structured data, analytics consent gating and forbidden placeholder schemes.

In a network-enabled environment with the pinned Node and pnpm versions, the intended release verification is:

```sh
rm -rf node_modules dist .astro
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm verify
```

If a production `SITE` is configured, inspect generated sitemap files after `pnpm build`. If `SITE` remains empty, no sitemap should be emitted by design.

## Delivery sandbox limitation

`pnpm-lock.yaml` is intentionally **not** fabricated in this source package. This sandbox cannot reach the npm registry, so Corepack cannot obtain the pinned pnpm binary and a synchronized lockfile cannot be generated or verified here. See `VALIDATION-NOTES.md` for the exact release gate and the recorded limitation. The same sandbox restriction prevents bundling the credited Wikimedia Commons photo binaries locally; the source currently uses their HTTPS image URLs.
