# Kwami App - Setup Instructions

## What's Been Done

The Kwami App has been successfully created by importing the Quami application structure and rebranding it as "Kwami App". 

### Changes Made:

1. **Created new Nuxt 4 app** in `/home/kali/labs/kwami/app/`
2. **Imported all Quami structure**:
   - Components, pages, layouts
   - Server API routes
   - Stores, composables, utilities
   - i18n translations
   - Assets and public files
   - Plugins and middleware

3. **Rebranded from Quami to Kwami App**:
   - Updated `package.json` name: `kwami-app`
   - Updated app title: `🔮 Kwami App`
   - Updated meta description
   - Updated locale references

4. **Configuration files copied**:
   - `nuxt.config.ts` (with updated paths)
   - `tailwind.config.ts`
   - `eslint.config.mjs`
   - `tsconfig.json`
   - `.env.sample`
   - `.gitignore`
   - `.npmrc`

## Next Steps

### 1. Install Dependencies

```bash
cd /home/kali/labs/kwami/app
npm install
```

### 2. Configure Environment

Copy the `.env.sample` to `.env` and configure:

```bash
cp .env.sample .env
```

Edit `.env` with your values:
- `NUXT_SB_URL` - Your Supabase project URL
- `NUXT_SB_PUBLIC` - Supabase public/anon key
- `NUXT_SB_KEY` - Supabase service role key
- `NUXT_ELEVEN_LABS_KEY` - ElevenLabs API key for TTS

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5555`

## Key Features

- **3D AI Companion**: Interactive Kwami blob powered by Three.js
- **Voice Interaction**: Speech-to-text and text-to-speech
- **Multi-language**: English, French, Spanish
- **Authentication**: Supabase-based auth
- **UI Components**: 67+ components from @alexcolls/nuxt-ux
- **Dark Mode**: System preference detection

## Project Structure

```
kwami/app/
├── components/       # Vue components (including Quami UI components)
├── pages/           # Nuxt pages (index.vue)
├── server/          # API routes
├── stores/          # Pinia state management
├── assets/          # CSS, images
├── public/          # Static files (favicons, etc)
├── plugins/         # Nuxt plugins
├── middleware/      # Route middleware
├── composables/     # Vue composables
├── utils/           # Utility functions
├── types/           # TypeScript definitions
├── i18n/            # Internationalization
└── locales/         # Additional locale files
```

## Documentation

- Full README: See `README.md` for complete documentation
- Contributing: See `CONTRIBUTING.md` for contribution guidelines
- Docs: Check the `docs/` directory for additional documentation

## Important Notes

- The app uses the `kwami` npm package for the 3D AI companion functionality
- Port 5555 is used by default (configured in `nuxt.config.ts`)
- SSR is disabled (`ssr: false`) for client-side rendering
- The app uses the `@kwami` alias to import Kwami library components
