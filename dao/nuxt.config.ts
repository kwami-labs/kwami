// https://nuxt.com/docs/api/configuration/nuxt-config
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
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: ['@solana/web3.js', '@coral-xyz/anchor', 'buffer'],
      esbuildOptions: {
        target: 'esnext',
        define: {
          global: 'globalThis',
        },
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
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    shim: false,
  },
})

