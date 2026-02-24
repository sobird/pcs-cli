import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  format: ['esm'],
  shims: true,
  clean: true,
  dts: { resolve: false },
  treeshake: true,
  // minify: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  skipNodeModulesBundle: false,
});
