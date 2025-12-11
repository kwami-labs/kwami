import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'bn.js': 'bn.js',
      'buffer': 'buffer',
      'kwami': fileURLToPath(new URL('../kwami/index.ts', import.meta.url)),
    }
  },
  define: {
    'process.env.ANCHOR_BROWSER': JSON.stringify(true),
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: ['bn.js', 'buffer'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'solana': ['@solana/web3.js', '@solana/spl-token'],
          'metaplex': ['@metaplex-foundation/js', '@metaplex-foundation/mpl-token-metadata'],
          'anchor': ['@coral-xyz/anchor'],
          'three': ['three']
        }
      }
    }
  }
})
