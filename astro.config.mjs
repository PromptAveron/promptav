import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://promptavero.github.io',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [react(), tailwind()],
});
