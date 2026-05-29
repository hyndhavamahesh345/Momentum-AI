import path from 'node:path';
import fs from 'node:fs';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch (err) {
  // ignore
}
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
    proxy: {
      '^/api/(goals|insights|momentum|tasks)': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
