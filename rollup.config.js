import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import litSass from '@ponday/rollup-plugin-lit-sass';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({ clean: true }),
  json(),
  litSass(),
  babel({ babelHelpers: 'bundled' }),
  dev && serve(serveopts),
  !dev && terser(),
];

export default [
  {
    watch: {
      chokidar: {
        usePolling: true,
      },
    },
    input: 'src/tadothermostat-popup-card.ts',
    output: {
      format: 'es',
      file: 'dist/tadothermostat-popup-card-dev.js',
    },
    plugins: [...plugins],
  },
];
