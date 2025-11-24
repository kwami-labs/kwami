// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

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
      title: 'Kwami.io - Mint Your Unique KWAMI NFT',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Create and mint your unique KWAMI NFT on Solana blockchain. Each KWAMI has unique DNA and lives forever on-chain.'
        },
        { property: 'og:title', content: 'Kwami.io - Mint Your Unique KWAMI NFT' },
        { property: 'og:description', content: 'Create and mint your unique KWAMI NFT on Solana blockchain' },
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
      qwamiTokenProgramId: process.env.NUXT_PUBLIC_QWAMI_TOKEN_PROGRAM_ID || '',
      arweaveGateway: process.env.NUXT_PUBLIC_ARWEAVE_GATEWAY || 'https://arweave.net',
    }
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  // Build configuration
  build: {
    transpile: [
      '@solana/web3.js',
      '@coral-xyz/anchor',
      '@metaplex-foundation/js',
      '@metaplex-foundation/mpl-token-metadata',
    ],
  },

  // Vite configuration for Web3 compatibility
  vite: {
    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
        kwami: fileURLToPath(new URL('../kwami/index.ts', import.meta.url)),
      },
      conditions: ['browser', 'module', 'import', 'default'],
      mainFields: ['browser', 'module', 'main'],
    },
    optimizeDeps: {
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
        defaultIsModuleExports: 'auto',
        requireReturnsDefault: 'auto',
      },
      rollupOptions: {
        external: [],
      },
    },
  },

  // Nitro configuration
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    experimental: {
      websocket: true, // Enable WebSocket support
    },
    devServer: {
      watch: ['server/**/*.ts'],
    },
    publicAssets: [
      {
        dir: '../assets',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        baseURL: 'assets'
      }
    ],
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    shim: false,
  },
})