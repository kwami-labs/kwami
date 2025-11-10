import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  // Base public path - use './' for relative paths in production
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Copy the assets folder to the build output
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  // Ensure assets are served correctly
  publicDir: 'assets',
  
  server: {
    port: 3000,
    open: true
  },

  plugins: [
    {
      name: 'copy-agent-management',
      closeBundle() {
        try {
          mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
          copyFileSync(
            resolve(__dirname, 'agent-management-functions.js'),
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

