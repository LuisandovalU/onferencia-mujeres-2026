import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://conferencia.icimexico.org',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  integrations: [react(), tailwind()],
  vite: {
    ssr: {
      noExternal: ['@napi-rs/canvas', '@stripe/stripe-js', '@stripe/react-stripe-js']
    }
  }
});
