import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/circadian/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-dom'],
  sourcemap: true,
});
