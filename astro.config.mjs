import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://conferencia.icimexico.org',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true
  }),
  integrations: [react(), tailwind()],
  vite: {
    optimizeDeps: {
      exclude: ['sharp', '@resvg/resvg-js', 'satori']
    },
    ssr: {
      external: ['sharp', '@resvg/resvg-js', 'satori']
    }
  }
});
