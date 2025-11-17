import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  optimizeDeps: {
    exclude: ['kwami']
  }
});
