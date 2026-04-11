import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
