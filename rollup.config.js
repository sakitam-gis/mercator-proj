import path from 'path';
import replace from '@rollup/plugin-replace';
import glslify from 'rollup-plugin-glslify';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import analyze from 'rollup-plugin-analyzer';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
const { NODE_ENV, INPUT } = process.env;
const isProduction = NODE_ENV === 'production';

const input = `./${INPUT}`;
const extensions = ['.mjs', '.js', '.json', '.node', '.jsx', '.ts', 'tsx'];

function resolveFile(filePath) {
  return path.join(__dirname, '.', filePath);
}

const generatePackageName = (name) => {
  if (typeof name === 'string') {
    const arr_ = name.split('/');
    const fileName = arr_.pop();
    const ext = fileName.split('.');
    if (ext.length > 1) {
      ext.length -= 1;
    }
    return arr_.join('/') + '/' + ext.join('.');
  }
  return name;
};

const fileName = generatePackageName(pkg.main);

const output = [
  {
    file: isProduction ? `${fileName}.min.js` :  `${fileName}.js`,
    format: 'umd',
    name: pkg.namespace,
    globals: {},
  },
  {
    file: pkg.commonjs,
    format: 'cjs',
    globals: {}
  },
  {
    file: pkg.module,
    format: 'es',
    globals: {}
  },
];

module.exports = [
  {
    input: resolveFile(input),
    output,
    external: [],
    treeshake: isProduction,
    plugins: [
      replace({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
      glslify(),
      json(),
      nodeResolve({
        mainFields: ['module', 'main'], // Default: ['module', 'main']
        browser: true,  // Default: false
        extensions,  // Default: [ '.mjs', '.js', '.json', '.node' ]
        preferBuiltins: true,  // Default: true
      }),
      commonjs(),
      typescript({
        verbosity: -1,
        tsconfig: path.join(__dirname, './tsconfig.json'),
        useTsconfigDeclarationDir: true,
        declaration: true
      }),
      babel({
        extensions: [ '.js', '.ts' ],
        babelHelpers: 'inline' // 'bundled' | 'runtime' | 'inline' | 'external'
      }),
      isProduction ? terser() : false,
      analyze({
        summaryOnly: true,
        limit: 20
      })
    ]
  }
];
