// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-21',
  devtools: { enabled: true },
  ssr: true,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['~/assets/styles/main.scss'],

  runtimeConfig: {
    public: {
      solanaNetwork: process.env.NUXT_PUBLIC_SOLANA_NETWORK || 'devnet',
      solanaRpcUrl: process.env.NUXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      kwamiProgramId: process.env.NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID || '11111111111111111111111111111111',
      kwamiCollectionMint: process.env.NUXT_PUBLIC_KWAMI_COLLECTION_MINT || '',
      kwamiCollectionAuthority: process.env.NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY || '',
      kwamiDnaRegistry: process.env.NUXT_PUBLIC_KWAMI_DNA_REGISTRY || '',
    }
  },

  app: {
    head: {
      title: 'KWAMI Marketplace',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Buy, sell and trade unique KWAMI NFTs - AI companion NFTs on Solana' 
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  vite: {
    resolve: {
      alias: {
        'bn.js': 'bn.js',
        'buffer': 'buffer',
        kwami: fileURLToPath(new URL('../kwami/index.ts', import.meta.url)),
      }
    },
    define: {
      'process.env.ANCHOR_BROWSER': JSON.stringify(true),
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['bn.js', 'buffer'],
    }
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  }
})
