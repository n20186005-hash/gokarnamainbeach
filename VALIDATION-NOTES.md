# Delivery validation notes

## What was verified in this sandbox

The repository-level verifier passes with `node scripts/verify.mjs`. It checks exact package specifiers, the pinned pnpm/Node declarations, the single production-domain configuration point, graceful empty-site behavior, conditional sitemap integration, required content sections, Kannada/India Google Maps locale parameters, attraction + FAQ structured data, standalone legal routes, GA4 consent gating, forbidden placeholder strings, absence of an invalid workspace file, and the current Astro Cloudflare Worker entrypoint.

The source tree was also scanned for the forbidden placeholder domains, browser-extension protocol, and non-Kannada map-locale marker requested for delivery; none are present in runtime source/config files.

## What could not be certified here

This execution sandbox cannot reach the npm registry. The clean-install gate stops before package installation while Corepack tries to obtain the pinned `pnpm@11.24.0` package, with `ECONNREFUSED` to `registry.npmjs.org`. The sandbox runtime itself is Node 22.16.0, while the project correctly pins Node 24.19.0.

Because a real pnpm installation cannot run here, a truthful, synchronized `pnpm-lock.yaml` cannot be generated or validated in this environment. No synthetic lockfile is included. For the same reason, `pnpm check`, `pnpm build`, and generated-output/sitemap greps cannot honestly be certified as passed in this sandbox.

The sandbox also blocks direct binary downloads from Wikimedia Commons. Real photographs therefore remain HTTPS Wikimedia Commons references with creator/license attribution instead of being copied into `public/images/`. Logo and favicon assets are local.

## Required release gate in a network-enabled clean environment

Use Node 24.19.0, then run:

```sh
corepack enable
corepack prepare pnpm@11.24.0 --activate
pnpm install
# Commit the generated pnpm-lock.yaml once.

rm -rf node_modules dist .astro
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm verify

grep -RInE "example$(printf '.com')|local$(printf 'host')|chrome-$(printf 'extension://')" dist && exit 1 || true
```

When `SITE` in `astro.config.mjs` is still empty, sitemap generation is intentionally disabled and no sitemap should be expected. After the final production domain is entered in that one field, rebuild and verify that every generated sitemap URL uses that real domain and that no fabricated `lastmod` values were added.

If fully local photo assets are mandatory for production, download the three credited Wikimedia Commons files from the URLs documented in `PHOTO-CREDITS.md`, place them under `public/images/`, update the corresponding image paths, and retain the visible CC BY-SA attribution.
