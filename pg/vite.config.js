import { defineConfig } from 'vite';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

export default defineConfig({
  // Base public path - use './' for relative paths in production
  base: './',

  resolve: {
    alias: {
      'kwami': resolve(__dirname, '../kwami/index.ts'),
      '@': resolve(__dirname, './src')
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },

  // Public directory for static assets
  publicDir: resolve(__dirname, './public'),

  plugins: [
    // Agent management functions are now handled as TypeScript modules
  ]
});

