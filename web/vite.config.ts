import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  assetsInclude: ['**/*.glsl', '**/*.mp3', '**/*.mp4', '**/*.wav', '**/*.flac'],
  resolve: {
    alias: {
      'kwami': resolve(__dirname, '../kwami/index.ts')
    }
  },
  optimizeDeps: {
    exclude: ['kwami']
  },
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  }
});
