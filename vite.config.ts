import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// GitHub Pages serves the site at https://<user>.github.io/<repo>/
// Repo name assumed in Phase 1: mars-base-adventure (change here if the repo is renamed).
export default defineConfig({
  base: '/mars-base-adventure/',
  plugins: [preact()],
  build: { target: 'es2020', sourcemap: false },
});
