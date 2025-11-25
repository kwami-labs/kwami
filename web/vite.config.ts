import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  assetsInclude: ['**/*.glsl', '**/*.yaml', '**/*.mp3', '**/*.mp4', '**/*.wav', '**/*.flac'],
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
    },
    hmr: {
      overlay: false
    }
  },
  build: {
    target: 'es2022', // Support top-level await
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-gsap': ['gsap'],
          'vendor-i18n': ['i18next', 'i18next-browser-languagedetector'],
          'media-players': [
            './src/media/MusicPlayer.ts',
            './src/media/VideoPlayer.ts',
            './src/media/VoicePlayer.ts'
          ],
          'managers': [
            './src/managers/ScrollManager.ts',
            './src/managers/SidebarNavigator.ts',
            './src/managers/ModeSwitcher.ts',
            './src/managers/ActionButtonManager.ts',
            './src/managers/CursorLight.ts'
          ]
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true
  },
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
