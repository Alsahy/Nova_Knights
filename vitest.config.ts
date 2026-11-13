import { defineConfig } from 'vitest/config';

// Engine, content and sim tests are pure TS: they run in the node environment.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
