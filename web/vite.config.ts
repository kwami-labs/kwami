import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  assetsInclude: ['**/*.glsl', '**/*.mp3', '**/*.mp4', '**/*.wav', '**/*.flac'],
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
