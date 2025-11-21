# 🔮 Kwami App

Kwami App is a Nuxt 4 web application that brings the Kwami 3D AI experience to life. It integrates the Kwami library—a fully customizable 3D AI companion (blob) with conversational AI and MCP app connector capabilities.

## Overview

Kwami App provides an immersive 3D experience featuring an AI companion with:

- **Interactive 3D Visualization** - Real-time morphing blob with audio reactivity
- **Voice Interaction** - Natural conversation capabilities with text-to-speech and speech-to-text
- **Dynamic Appearance** - Customizable skins and visual effects
- **App Connectors** - Integrations with mainstream apps via privacy-first connectors (including MCP)
- **Privacy & Anonymity** - Permissioned, privacy-by-design data access and interaction
- **Multi-language Support** - i18n support for English, French, and Spanish

## Architecture

Kwami App is built on:

- **Nuxt.js 4** - Modern Vue.js framework
- **Kwami** (`kwami` npm package) - 3D interactive AI companion library
  - Repository: [github.com/alexcolls/kwami](https://github.com/alexcolls/kwami)
  - **Independent, reusable module** that can be used in other projects
- **@alexcolls/nuxt-ux** - Layout and Common UI components library (npm package)
  - Repository: [github.com/alexcolls/nuxt-ux](https://github.com/alexcolls/nuxt-ux)
  - NPM: [@alexcolls/nuxt-ux](https://www.npmjs.com/package/@alexcolls/nuxt-ux)
  - 67+ reusable UI components with Common prefix
  - **Independent, reusable Nuxt module** for rapid UI development
- **Three.js** - 3D graphics rendering
- **Supabase** - Backend and authentication
- **Pinia** - State management

## Setup

### Install Dependencies

Using npm (recommended):

```bash
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.sample`:

```bash
cp .env.sample .env
```

Configure your environment variables:

- `NUXT_SB_URL` - Supabase project URL
- `NUXT_SB_PUBLIC` - Supabase anon/public key
- `NUXT_SB_KEY` - Supabase service role key
- `NUXT_ELEVEN_LABS_KEY` - ElevenLabs API key for TTS

## Development

Start the development server on `http://localhost:5555`:

```bash
npm run dev
```

## Production

### Build

Build the application for production:

```bash
npm run build
```

### Preview

Locally preview production build:

```bash
npm run preview
```

## Project Structure

```
kwami/app/
├── components/          # Vue components
│   └── Quami/          # Kwami UI components
├── locales/            # i18n translations
├── stores/             # Pinia stores
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── composables/        # Vue composables
├── pages/              # Nuxt pages
├── server/             # Nuxt server API routes
├── public/             # Static assets
├── assets/             # CSS and images
├── plugins/            # Nuxt plugins
└── nuxt.config.ts     # Nuxt configuration
```

## Features

### 🎨 3D Companion (Kwami)

- Real-time morphing blob visualization with Three.js
- Audio-reactive animations
- Multiple skin options (tricolor, tricolor2, zebra)
- Customizable appearance:
  - Geometry & Motion (spikes, time, rotation, resolution)
  - Scale & Camera controls
  - Material properties (opacity, shininess, wireframe)
  - Audio effects (frequency modulation)
  - Interaction settings
- Export as GLB/GLTF
- DNA-based randomization

### 🤖 AI Interaction

- Voice input via speech recognition
- Text-to-speech responses via ElevenLabs
- Natural language processing
- Conversation history

### 👤 User Management

- Email authentication via Supabase
- Profile management
- Session persistence with Pinia

### 🎨 UI Components

- 67+ reusable components from @alexcolls/nuxt-ux
- Responsive design with Tailwind CSS
- Dark mode support
- Multi-language (en, es, fr)

## Using Kwami

The application imports Kwami using the `@kwami` alias:

```typescript
import { Kwami } from '@kwami';
import audioFiles from '@kwami/assets/audio';
```

The Kwami library is installed as an npm package and provides all the 3D AI companion functionality.

## License

**Dual License** - This project is available under two licenses:

### Non-Commercial / Personal Use
For personal, educational, and non-commercial use, this software is licensed under the **Apache License 2.0**.

You are free to:
- Use, copy, and modify the software
- Distribute the software
- Use it for personal projects and learning

### Commercial / Business Use
For commercial use, including:
- Use in commercial products or services
- Use by for-profit organizations  
- Use that generates revenue or commercial advantage

You **MUST obtain a separate commercial license**.

**To obtain a commercial license, contact:**
- Alex Colls: [github.com/alexcolls](https://github.com/alexcolls)

### Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. See the [LICENSE](../LICENSE) file for full terms.

---

**Copyright (c) 2025 Alex Colls**

## Links

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Kwami Repository](https://github.com/alexcolls/kwami)
- [@alexcolls/nuxt-ux](https://www.npmjs.com/package/@alexcolls/nuxt-ux)
- [Supabase Documentation](https://supabase.com/docs)
- [Deployment Documentation](https://nuxt.com/docs/getting-started/deployment)
