// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Avoid dev manifest fetch 404s
  experimental: {
    appManifest: false,
  },

  // Disable SSR for Web3 compatibility
  ssr: false,

  // App configuration
  app: {
    head: {
      title: 'KWAMI DAO - Governance for KWAMI NFT Holders',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'KWAMI DAO governance platform. Connect with your KWAMI NFT to participate in governance using QWAMI tokens.'
        },
        { property: 'og:title', content: 'KWAMI DAO - Governance Platform' },
        { property: 'og:description', content: 'Decentralized governance for KWAMI NFT holders' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      solanaNetwork: process.env.NUXT_PUBLIC_SOLANA_NETWORK || 'devnet',
      solanaRpcUrl: process.env.NUXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      kwamiNftProgramId: process.env.NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID || '',
      qwamiTokenMint: process.env.NUXT_PUBLIC_QWAMI_TOKEN_MINT || '',
      kwamiCollectionAddress: process.env.NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS || '',
    }
  },

  // Nitro preset for Render.com
  nitro: {
    preset: 'node-server',
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    externals: {
      inline: [
        'whatwg-url',
        'tr46',
        'webidl-conversions',
      ],
    },
  },

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  // Vite configuration for Web3 compatibility
  vite: {
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
        util: 'util',
        kwami: fileURLToPath(new URL('../kwami/index.ts', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: [
        'buffer',
        'stream-browserify',
        'util',
      ],
      exclude: [
        '@solana/web3.js',
        '@coral-xyz/anchor',
        '@metaplex-foundation/js',
        '@irys/query',
        'whatwg-url',
        'tr46',
        'webidl-conversions',
      ],
      esbuildOptions: {
        target: 'esnext',
        define: {
          global: 'globalThis',
        },
      }
    },
    build: {
      target: 'esnext',
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: ['stream', 'crypto', 'fs', 'path'],
      },
    },
  },


  // TypeScript configuration
  typescript: {
    strict: true,
    shim: false,
  },
})

