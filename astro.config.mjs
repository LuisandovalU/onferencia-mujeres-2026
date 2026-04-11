import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://conferencia-mujeres-2026.vercel.app',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true
  }),
  integrations: [react(), tailwind()],
  vite: {
    optimizeDeps: {
      exclude: ['@napi-rs/canvas', 'sharp', '@resvg/resvg-js', 'opentype.js']
    },
    ssr: {
      external: ['@napi-rs/canvas', 'sharp', '@resvg/resvg-js', 'opentype.js']
    }
  }
});
