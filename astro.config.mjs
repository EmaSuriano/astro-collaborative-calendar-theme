// @ts-check
import { defineConfig } from 'astro/config';

const isDev = import.meta.env.DEV;

// https://astro.build/config
export default defineConfig({
  site: 'https://emasuriano.github.io',
  base: isDev ? '' : process.env.PAGES_BASE || 'astro-collaborative-calendar-theme',
});
