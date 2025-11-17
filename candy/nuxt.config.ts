// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
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

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  // Vite configuration for Web3 compatibility
  vite: {
    define: {
      'process.env': {},
    },
    optimizeDeps: {
      include: [
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@coral-xyz/anchor',
      ],
      esbuildOptions: {
        target: 'esnext',
      }
    },
    build: {
      target: 'esnext',
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
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    shim: false,
  },
})