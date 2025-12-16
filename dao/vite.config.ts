import { defineConfig, createLogger } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
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
  plugins: [
    vue(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'crypto'],
      globals: {
        Buffer: true,
        process: true,
        global: true,
      },
      protocolImports: true,
      overrides: {
        buffer: 'buffer/',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),

      // Force browser polyfills instead of Vite externalizing Node core modules.
      buffer: 'buffer/',
      util: 'util/',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      process: 'process',

      // Also cover `node:` protocol imports.
      'node:buffer': 'buffer/',
      'node:util': 'util/',
      'node:stream': 'stream-browserify',
      'node:crypto': 'crypto-browserify',
      'node:process': 'process',
    },
  },

  define: {
    // Solana / Anchor stack expects this in browser builds.
    'process.env.ANCHOR_BROWSER': JSON.stringify(true),
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
