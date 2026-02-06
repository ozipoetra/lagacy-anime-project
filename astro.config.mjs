// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Check if we are building for production
const isBuild = process.argv.includes('build');

export default defineConfig({
  output: 'server',
  // Use Bun locally (Termux friendly), Cloudflare for deployment
  adapter: isBuild ? cloudflare() : Object.null,
  
  build: {
    inlineStylesheets: 'always',
  },
  // Ensure we don't try to use features that break in old browsers
  compressHTML: true,
});