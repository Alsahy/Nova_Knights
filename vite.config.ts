import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// GitHub Pages serves the site at https://<user>.github.io/<repo>/
// Repo name assumed in Phase 1: mars-base-adventure (change here if the repo is renamed).
export default defineConfig({
  base: process.env.BASE ?? '/mars-base-adventure/', // BASE=./ for a relative build (claude.ai preview link)
  plugins: [preact()],
  build: { target: 'es2020', sourcemap: false },
});
