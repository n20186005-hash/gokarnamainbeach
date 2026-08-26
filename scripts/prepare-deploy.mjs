// Auto-build hook for CI platforms that run `pnpm install` but skip the
// configured Build command (verified on the deploy platform: only
// `pnpm install --frozen-lockfile` then `npx wrangler deploy` runs, so
// `dist/server/wrangler.json` never gets generated and wrangler cannot find
// the `@astrojs/cloudflare/entrypoints/server` entry point).
//
// Runs `astro build` from `postinstall` when no build output exists yet, or
// when CI/DEPLOY env vars are set. Local dev installs with an existing
// `dist/server/wrangler.json` skip the rebuild to stay fast.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const entry = 'dist/server/wrangler.json';
const force = Boolean(process.env.CI || process.env.DEPLOY);

if (!force && existsSync(entry)) {
  console.log('prepare-deploy: build output already present, skipping auto-build.');
  process.exit(0);
}

console.log('prepare-deploy: running `astro build` so wrangler can find its entry point...');
const result = spawnSync('npx astro build', { stdio: 'inherit', shell: true });

if (result.status !== 0) {
  console.error('prepare-deploy: `astro build` failed; wrangler deploy will not find an entry point.');
  process.exit(result.status ?? 1);
}
process.exit(0);
