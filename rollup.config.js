/**
 * rollup.config.js
 *
 * @type {import('rollup').RollupOptions}
 * @see https://cn.rollupjs.org/configuration-options
 * sobird<i@sobird.me> at 2023/09/28 11:30:37 created.
 */
import { dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { glob } from 'glob';
import { defineConfig } from 'rollup';
import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy';
import external from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
// import mdx from '@mdx-js/rollup';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const DIST = isProduction ? 'dist' : 'dist';

export default (env) => {
  return defineConfig([
    {
      input: 'bin/pcs.ts',
      output: {
        dir: DIST,
        format: 'es',
      },
      plugins: [
        clear({
          targets: [DIST],
          watch: false,
        }),
        replace({
          delimiters: ['', ''],
          values: {
            '#!/usr/bin/env tsx': '#!/usr/bin/env node',
            // '"actions": "./index.ts"': '"actions": "./dist/index.js"',
          },
          preventAssignment: true,
        }),
        external({
          includeDependencies: true,
        }),
        nodeResolve({
          preferBuiltins: true,
        }),
        commonjs(),
        json({
          namedExports: true, // 支持具名导出 name、version
          compact: true,
        }),
        typescript({
          check: false,
          // declaration: true,
          // tsconfig: "./src/tsconfig.json",
          // noEmitOnError: false,
          strictRequires: true,
        }),
        // terser(),

        copy({
          targets: [
            { src: 'package.json', dest: DIST },
            { src: 'README.md', dest: DIST },
            { src: 'LICENSE', dest: DIST },
          ],
          copyOnce: env.watch,
        }),
      ],
    },
  ]);
};
