import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

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
    {
      name: 'copy-agent-management',
      closeBundle() {
        try {
          mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
          copyFileSync(
            resolve(__dirname, 'src/agent-management-functions.js'),
            resolve(__dirname, 'dist/agent-management-functions.js')
          );
          console.log('✓ Copied agent-management-functions.js to dist/');
        } catch (err) {
          console.error('Failed to copy agent-management-functions.js:', err);
        }
      }
    }
  ]
});

