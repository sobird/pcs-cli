/**
 * rollup.config.js
 * @type {import('rollup').RollupOptions}
 * @see https://cn.rollupjs.org/configuration-options
 * sobird<i@sobird.me> at 2023/09/28 11:30:37 created.
 */
import { defineConfig } from 'rollup';
import { glob } from 'glob';
import { dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import clear from 'rollup-plugin-clear';
// import mdx from '@mdx-js/rollup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const DIST = isProduction ? 'dist' : 'dist';

function input(pattern) {
  return glob.sync(pattern, {
    ignore: ['src/**/*.d.ts'],
    cwd: __dirname,
    absolute: false,
  }).reduce((map, filename) => {
    map[relative(
      'src',
      filename.slice(0, filename.length - extname(filename).length)
    )] = filename;
    return map;
  }, {});
}

const mainInput = input(['src/**/*.{ts,js}']);

export default (env) => {
  return defineConfig([
    // { // es module
    //   input: mainInput,
    //   output: {
    //     //preserveModules: true,
    //     dir: `${DIST}/es`,
    //     format: "es",
    //   },
    //   plugins: plugins({
    //     clear: {
    //       targets: [`${DIST}/es`],
    //     },
    //   }, env),
    // },

    { // cjs module
      input: mainInput,
      output: {
        dir: `${DIST}`,
        format: 'es',
      },
      plugins: [
        clear({
          targets: [DIST],
          watch: false,
        }),
        external({
          includeDependencies: true,
        }),
        nodeResolve({
          preferBuiltins: true
        }),
        commonjs(),
        typescript({
          check: false,
          // declaration: true,
          // tsconfig: "./src/tsconfig.json",
          // noEmitOnError: false,
        }),
        json(),
        copy({
          targets: [
            { src: 'package.json', dest: DIST },
            { src: 'README.md', dest: DIST },
            { src: 'LICENSE', dest: DIST },
          ],
          copyOnce: env.watch
        })
      ],
    },
  ]);
};