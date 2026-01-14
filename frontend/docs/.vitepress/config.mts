import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "KWAMI",
  description: "KWAMI Ecosystem Documentation",
  ignoreDeadLinks: true,
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/alexcolls/kwami' }
    ]
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Kwami', link: '/en/kwami/' },
          { text: 'Playground', link: '/en/pg/' },
          { text: 'App', link: '/en/app/' },
          { text: 'Solana', link: '/en/solana/' },
          { text: 'Modules', items: [
            { text: 'Candy', link: '/en/candy/' },
            { text: 'Market', link: '/en/market/' },
            { text: 'DAO', link: '/en/dao/' },
            { text: 'Web', link: '/en/web/' }
          ]}
        ],
        sidebar: {
          '/en/kwami/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Installation', link: '/en/kwami/getting-started/installation' },
                { text: 'Quick Start', link: '/en/kwami/getting-started/quickstart' },
                { text: 'Concepts', link: '/en/kwami/getting-started/concepts' }
              ]
            },
            {
              text: 'Core Components',
              items: [
                { text: 'Body', link: '/en/kwami/core/body' },
                { text: 'Mind', link: '/en/kwami/core/mind' },
                { text: 'Soul', link: '/en/kwami/core/soul' }
              ]
            },
            {
              text: 'Architecture',
              items: [
                { text: 'Overview', link: '/en/kwami/ARCHITECTURE' },
                { text: 'Body Arch', link: '/en/kwami/architecture/body-arch' },
                { text: 'Mind Arch', link: '/en/kwami/architecture/mind-arch' },
                { text: 'Soul Arch', link: '/en/kwami/architecture/soul-arch' }
              ]
            },
            {
              text: 'Guides',
              items: [
                { text: 'Configuration', link: '/en/kwami/guides/configuration' },
                { text: 'Animations', link: '/en/kwami/guides/animations' }
              ]
            },
            {
              text: 'Reference',
              items: [
                { text: 'API', link: '/en/kwami/api/kwami' },
                { text: 'NPM Setup', link: '/en/kwami/NPM_SETUP' }
              ]
            }
          ],
          '/en/pg/': [{ text: 'Playground', items: [{ text: 'Overview', link: '/en/pg/' }] }],
          '/en/app/': [{ text: 'App', items: [
            { text: 'Overview', link: '/en/app/' },
            { text: 'Setup', link: '/en/app/SETUP' },
            { text: 'Contributing', link: '/en/app/CONTRIBUTING' }
          ]}],
          '/en/solana/': [
            {
              text: 'Overview',
              items: [
                { text: 'Introduction', link: '/en/solana/' },
                { text: 'Comprehensive Overview', link: '/en/solana/COMPREHENSIVE_OVERVIEW' },
                { text: 'Token Economics', link: '/en/solana/KWAMI_TOKEN_ECONOMICS' },
                { text: 'Supply Schedule', link: '/en/solana/KWAMI_SUPPLY_SCHEDULE' }
              ]
            },
            {
              text: 'Guides',
              items: [
                { text: 'Quick Start', link: '/en/solana/QUICK_START' },
                { text: 'Setup', link: '/en/solana/SETUP' },
                { text: 'Devnet Deployment', link: '/en/solana/DEVNET_DEPLOYMENT_GUIDE' }
              ]
            }
          ],
          '/en/candy/': [{ text: 'Candy', items: [
            { text: 'Overview', link: '/en/candy/' },
            { text: 'Quickstart', link: '/en/candy/QUICKSTART' }
          ]}],
          '/en/market/': [{ text: 'Market', items: [
             { text: 'Overview', link: '/en/market/' },
             { text: 'Quickstart', link: '/en/market/QUICKSTART' }
          ]}],
          '/en/dao/': [{ text: 'DAO', items: [
             { text: 'Overview', link: '/en/dao/' },
             { text: 'Quickstart', link: '/en/dao/QUICKSTART' }
          ]}],
          '/en/web/': [{ text: 'Web', items: [
             { text: 'Overview', link: '/en/web/' },
             { text: 'Quickstart', link: '/en/web/QUICK_START_PHASE1' }
          ]}]
        }
      }
    },
    es: {
      label: 'Español',
      lang: 'es',
      link: '/es/',
      themeConfig: {
        nav: [
          { text: 'Kwami', link: '/es/kwami/' },
          { text: 'Playground', link: '/es/pg/' },
          { text: 'Aplicación', link: '/es/app/' },
          { text: 'Solana', link: '/es/solana/' },
          { text: 'Módulos', items: [
            { text: 'Candy', link: '/es/candy/' },
            { text: 'Market', link: '/es/market/' },
            { text: 'DAO', link: '/es/dao/' },
            { text: 'Web', link: '/es/web/' }
          ]}
        ],
        sidebar: {
          '/es/kwami/': [
            {
              text: 'Comenzando',
              items: [
                { text: 'Instalación', link: '/es/kwami/getting-started/installation' },
                { text: 'Inicio Rápido', link: '/es/kwami/getting-started/quickstart' },
                { text: 'Conceptos', link: '/es/kwami/getting-started/concepts' }
              ]
            },
            {
              text: 'Componentes Principales',
              items: [
                { text: 'Cuerpo (Body)', link: '/es/kwami/core/body' },
                { text: 'Mente (Mind)', link: '/es/kwami/core/mind' },
                { text: 'Alma (Soul)', link: '/es/kwami/core/soul' }
              ]
            },
            {
              text: 'Arquitectura',
              items: [
                { text: 'Visión General', link: '/es/kwami/ARCHITECTURE' },
                { text: 'Arq. Cuerpo', link: '/es/kwami/architecture/body-arch' },
                { text: 'Arq. Mente', link: '/es/kwami/architecture/mind-arch' },
                { text: 'Arq. Alma', link: '/es/kwami/architecture/soul-arch' }
              ]
            },
            {
              text: 'Guías',
              items: [
                { text: 'Configuración', link: '/es/kwami/guides/configuration' },
                { text: 'Animaciones', link: '/es/kwami/guides/animations' }
              ]
            },
            {
              text: 'Referencia',
              items: [
                { text: 'API', link: '/es/kwami/api/kwami' },
                { text: 'Configuración NPM', link: '/es/kwami/NPM_SETUP' }
              ]
            }
          ],
          '/es/pg/': [{ text: 'Playground', items: [{ text: 'Visión General', link: '/es/pg/' }] }],
          '/es/app/': [{ text: 'Aplicación', items: [
            { text: 'Visión General', link: '/es/app/' },
            { text: 'Configuración', link: '/es/app/SETUP' },
            { text: 'Contribuir', link: '/es/app/CONTRIBUTING' }
          ]}],
          '/es/solana/': [
            {
              text: 'Visión General',
              items: [
                { text: 'Introducción', link: '/es/solana/' },
                { text: 'Resumen Completo', link: '/es/solana/COMPREHENSIVE_OVERVIEW' },
                { text: 'Economía de Token', link: '/es/solana/KWAMI_TOKEN_ECONOMICS' },
                { text: 'Calendario de Suministro', link: '/es/solana/KWAMI_SUPPLY_SCHEDULE' }
              ]
            },
            {
              text: 'Guías',
              items: [
                { text: 'Inicio Rápido', link: '/es/solana/QUICK_START' },
                { text: 'Configuración', link: '/es/solana/SETUP' },
                { text: 'Despliegue en Devnet', link: '/es/solana/DEVNET_DEPLOYMENT_GUIDE' }
              ]
            }
          ],
          '/es/candy/': [{ text: 'Candy', items: [
            { text: 'Visión General', link: '/es/candy/' },
            { text: 'Inicio Rápido', link: '/es/candy/QUICKSTART' }
          ]}],
          '/es/market/': [{ text: 'Market', items: [
             { text: 'Visión General', link: '/es/market/' },
             { text: 'Inicio Rápido', link: '/es/market/QUICKSTART' }
          ]}],
          '/es/dao/': [{ text: 'DAO', items: [
             { text: 'Visión General', link: '/es/dao/' },
             { text: 'Inicio Rápido', link: '/es/dao/QUICKSTART' }
          ]}],
          '/es/web/': [{ text: 'Web', items: [
             { text: 'Visión General', link: '/es/web/' },
             { text: 'Inicio Rápido', link: '/es/web/QUICK_START_PHASE1' }
          ]}]
        }
      }
    }
  }
})
