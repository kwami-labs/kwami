import { defineConfig, createLogger } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const logger = createLogger()
const originalWarning = logger.warn

logger.warn = (msg, options) => {
  if (msg.includes('Sourcemap for') && msg.includes('points to missing source files')) return
  originalWarning(msg, options)
}

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      buffer: 'buffer',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      util: 'util',
    },
  },
  
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  
  optimizeDeps: {
    // Force dependency pre-bundling so CJS deps (like @solana/buffer-layout) don't get served as-is via /@fs
    force: true,
    include: [
      // Polyfills
      'buffer',
      'stream-browserify',
      'util',

      // Solana stack (helps prevent CJS/ESM named export runtime errors)
      '@solana/web3.js',
      '@solana/buffer-layout',
      '@solana/buffer-layout/lib/Layout.js',

      // Previously problematic CJS deps
      'rpc-websockets',
      'eventemitter3',
      'bn.js',
      'jayson/lib/client/browser',
    ],
    exclude: [
      // React-based wallet deps we don't want Vite to try bundling for a Vue app
      '@fractalwagmi/popup-connection',
      '@keystonehq/sdk',
      'qrcode.react',
      'react-modal',
      'react-qr-reader',
    ],
    needsInterop: [
      '@solana/buffer-layout',
      '@solana/buffer-layout/lib/Layout.js',
      'rpc-websockets',
      'eventemitter3',
      'bn.js',
      'jayson',
      'jayson/lib/client/browser',
    ],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
    },
  },
  
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Only keep React externals; let Vite bundle the polyfills for stream/crypto/path
      external: ['react', 'react-dom'],
    },
  },
})
