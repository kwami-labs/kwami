import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    fs: {
      // Allow importing local IDLs / generated artifacts from sibling packages in this monorepo.
      allow: [path.resolve(__dirname, '..')],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'rpc-websockets',
      'eventemitter3',
      'bn.js',
      'jayson',
      'jayson/lib/client/browser',
      'bs58',
      'buffer-layout',
      '@solana/buffer-layout',
      'superstruct',
      'borsh',
      '@coral-xyz/anchor',
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
      transformMixedEsModules: true,
    },
  },
})
