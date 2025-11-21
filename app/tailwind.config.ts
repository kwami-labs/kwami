import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.{vue,js,ts}',
    './app/pages/**/*.{vue,js,ts}',
    './app/app.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
  ],
  safelist: [
    // Basic colors
    { pattern: /(bg|text|border)-(white|black)/ },
    // All palettes and common shades we toggle at runtime
    { pattern: /(bg|text|border)-(gray|zinc|neutral|stone|slate|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    // Dark variants
    { pattern: /dark:(bg|text|border)-.*/ },
  ],
}
