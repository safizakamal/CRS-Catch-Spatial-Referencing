import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command, mode}) => {
  // Configurable base path:
  // - Defaults to '/crs-catch/' for production builds (GitHub Pages repository named crs-catch)
  // - Can be overridden dynamically via VITE_BASE_PATH or BASE_PATH env variables
  // - Defaults to '/' during local development
  const isProd = command === 'build' || mode === 'production';
  const base = process.env.VITE_BASE_PATH || process.env.BASE_PATH || (isProd ? '/crs-catch/' : '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
