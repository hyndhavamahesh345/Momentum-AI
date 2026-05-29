import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';
import { aliases } from './plugins/aliases';
import { apiRoutesPlugin } from './plugins/apiRoutes';
import { layoutWrapperPlugin } from './plugins/layouts';

export default defineConfig({
  plugins: [
    apiRoutesPlugin(),
    babel({
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: /node_modules/,
      babelConfig: {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
        plugins: ['styled-jsx/babel'],
      },
    }),
    reactRouter(),
    tsconfigPaths(),
    aliases(),
    layoutWrapperPlugin(),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  clearScreen: false,
  server: {
    host: '0.0.0.0',
    port: 4000,
    hmr: {
      overlay: false,
    },
  },
});
