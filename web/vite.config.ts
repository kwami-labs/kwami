import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const define = {
    'import.meta.env.GCP_OAUTH_CID': JSON.stringify(env.GCP_OAUTH_CID ?? ''),
    'import.meta.env.GCP_YOUTUBE_API_KEY': JSON.stringify(env.GCP_YOUTUBE_API_KEY ?? ''),
  };

  return {
    assetsInclude: ['**/*.glsl', '**/*.yaml', '**/*.mp3', '**/*.mp4', '**/*.wav', '**/*.flac'],
    publicDir: 'public',
    server: {
      fs: {
        allow: ['..'],
      },
      hmr: {
        overlay: false,
      },
    },
    define,
    build: {
      target: 'es2022', // Support top-level await
      minify: 'terser',
      cssMinify: true,
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['console.debug'],
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-three': ['three'],
            'vendor-gsap': ['gsap'],
            'vendor-i18n': ['i18next', 'i18next-browser-languagedetector'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 600,
      reportCompressedSize: true,
    },
    plugins: [
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  };
});
