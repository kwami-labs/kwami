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
          content: 'Modern documentation hub for the KWAMI ecosystem.'
        }
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
        light: 'github-light',
        sepia: 'one-light'
      }
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
