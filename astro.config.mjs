// @ts-check
import { defineConfig } from 'astro/config';

const isDev = import.meta.env.DEV;
const pagesBase = /** @type {any} */ (globalThis).process?.env?.PAGES_BASE;

// https://astro.build/config
export default defineConfig({
  site: 'https://emasuriano.github.io',
  base: isDev ? '' : pagesBase || 'astro-collaborative-calendar-theme',
});
