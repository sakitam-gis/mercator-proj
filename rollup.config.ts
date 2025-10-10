import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import type { RollupOptions } from 'rollup';
import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import glslify from 'rollup-plugin-glslify';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';

const rq = createRequire(import.meta.url);
const pkg = rq('./package.json');
const ROOT = fileURLToPath(import.meta.url);
const DEV = process.env.NODE_ENV === 'development';
const MINIFY = process.env.MINIFY;
const PROD = !DEV;

const r = (p: string) => resolve(ROOT, '..', p);

const umdExternal = [];
const external = [
  ...Object.keys(pkg.dependencies),
  ...umdExternal,
  // 处理 gl-matrix 的子路径导入
  /^gl-matrix(\/.*)?$/,
];

console.log(external);

const plugins = [
  alias({
    entries: [{ find: '@', replacement: r('./src') }],
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    preventAssignment: true,
  }),
  glslify(),
  json({
    namedExports: true,
  }),
  commonjs(),
  nodeResolve({ preferBuiltins: false }),
  esbuild({ target: 'node14' }),
  sourcemaps(),
];

const esmBuild: RollupOptions = {
  input: r('src/index.ts'),
  output: {
    format: 'esm',
    file: pkg.module,
    sourcemap: true,
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning);
  },
};

const cjsBuild: RollupOptions = {
  input: r('src/index.ts'),
  output: {
    format: 'cjs',
    file: pkg.commonjs,
    sourcemap: 'inline',
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning);
  },
};

const toSpliced = (array, start, end, insert) => {
  array.splice(start, end, insert);
  return array;
};

const umdBuild: RollupOptions = {
  input: r('src/index.ts'),
  output: {
    format: 'umd',
    dir: undefined,
    name: pkg.namespace,
    sourcemap: !MINIFY,
    globals: {},
    file: MINIFY ? toSpliced(pkg.main.split('.'), pkg.main.split('.').length - 1, 0, 'min').join('.') : pkg.main,
  },
  external: umdExternal,
  plugins: [...plugins, ...(MINIFY ? [terser()] : [])],
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning);
  },
};

const typesBuild: RollupOptions = {
  input: r('src/index.ts'),
  output: {
    format: 'esm',
    file: pkg.types,
    sourcemap: true,
  },
  external,
  plugins: [glslify(), dts({ respectExternal: true })],
};

const config = defineConfig([]);

config.push(esmBuild);
config.push(umdBuild);

if (PROD) {
  config.push(cjsBuild);
}

config.push(typesBuild);

export default config;
