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
    include: [
      'buffer',
      'stream-browserify',
      'util',
      'rpc-websockets',
      'eventemitter3',
      'bn.js',
      'jayson/lib/client/browser',
    ],
    exclude: [
      '@solana/web3.js',
      '@metaplex-foundation/js',
      '@fractalwagmi/popup-connection',
      '@keystonehq/sdk',
      'qrcode.react',
      'react-modal',
      'react-qr-reader',
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
      external: ['stream', 'crypto', 'fs', 'path', 'react', 'react-dom'],
    },
  },
})
