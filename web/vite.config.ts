import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  optimizeDeps: {
    exclude: ['kwami']
  },
  publicDir: resolve(__dirname, '../assets')
});
