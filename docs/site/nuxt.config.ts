import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(currentDir, '..')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/content'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  app: {
    head: {
      titleTemplate: (title?: string) =>
        title ? `${title} · KWAMI Documentation` : 'KWAMI Documentation',
      meta: [
        {
          name: 'description',
          content: 'Modern documentation hub for the KWAMI ecosystem - 3D characters, AI-powered behavior, blockchain integration, and more.'
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  ui: {
    primary: 'emerald',
    gray: 'slate'
  },
  content: {
    documentDriven: true,
    highlight: {
      theme: {
        default: 'github-dark',
        dark: 'github-dark',
        light: 'github-light',
        sepia: 'one-light'
      },
      preload: ['bash', 'javascript', 'typescript', 'json', 'yaml', 'markdown']
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3
      },
      anchorLinks: true
    },
    sources: {
      docs: {
        driver: 'fs',
        base: docsDir,
        prefix: '/'
      }
    },
    ignores: ['site/**']
  }
})
