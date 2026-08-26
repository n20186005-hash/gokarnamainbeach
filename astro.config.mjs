import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// ಉತ್ಪಾದನಾ ಡೊಮೇನ್ ಅನ್ನು ಇಲ್ಲಿ ಮಾತ್ರ ನಮೂದಿಸಿ. ಖಾಲಿ ಇದ್ದರೂ build ಕೆಲಸ ಮಾಡುತ್ತದೆ.
const SITE = '';

export default defineConfig({
  site: SITE || undefined,
  output: 'server',
  adapter: cloudflare(),
  integrations: SITE ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
