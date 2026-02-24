import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'bin/cli.ts',
  ],
  format: ['esm'],
  shims: true,
  clean: true,
  dts: false,
  treeshake: true,
  minify: 'terser',
});
