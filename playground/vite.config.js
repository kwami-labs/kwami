import { defineConfig } from 'vite';
import { resolve } from 'path';

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
  }
});

