import { defineConfig } from 'tsup';

export default defineConfig({
  // bundle:false → esbuild transforms each source file 1:1 instead of merging
  // them. This is the RSC-correct shape for a mixed client/server component
  // library: esbuild preserves each file's `'use client'` directive natively
  // (the directive is only stripped when *bundling* into a shared chunk), so
  // the barrel (dist/index.js) stays pure re-exports and server-importable,
  // client components (GlassToast, providers, the *\/react hooks) keep their
  // directive, and server-safe exports (cn, SUB_BRANDS data, chart-theme,
  // motion/interaction cores) never force a client boundary. Consequence:
  // every relative import + third-party import stays external, so the single
  // installed copy of motion-dom drives the one-frameloop clock (ADR 0028).
  entry: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  format: ['esm'],
  dts: true,
  bundle: false,
  clean: true,
  sourcemap: true,
});
