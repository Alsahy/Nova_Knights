import { defineConfig } from 'vitest/config';

// Engine, content and sim tests are pure TS: they run in the node environment.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 20000, // whole-game tests play 50 seeded missions; slow on a busy laptop
  },
});
