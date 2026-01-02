# 🔮 KWAMI App

Kwami App is a Nuxt 4 web application that brings the Kwami 3D AI experience to life. It integrates the Kwami library—a fully customizable 3D AI companion (blob) with conversational AI and MCP app connector capabilities.

## 🚀 Quick Start

### Development

```bash
cd app
npm install
npm run dev
```

The development server will start on `http://localhost:5555`

### 🐳 Docker Deployment

```bash
# Node.js (default)
docker build -f docker/Dockerfile -t kwami-app .
docker run -p 3000:3000 kwami-app

# Bun (faster builds)
docker build -f docker/Dockerfile.bun -t kwami-app:bun .
docker run -p 3000:3000 kwami-app:bun

# Deno (secure runtime)
docker build -f docker/Dockerfile.deno -t kwami-app:deno .
docker run -p 3000:3000 kwami-app:deno
```

👉 See [Docker Deployment Guide](../docs/DOCKER_DEPLOYMENT.md) for complete instructions

## 📚 Documentation

For complete documentation, see [docs/3_app/README.md](../docs/3_app/README.md)

## 🔗 Related

- [Changelog](./CHANGELOG.md) - Version history and changes
- [Setup Guide](../docs/3_app/SETUP.md) - Detailed setup instructions
- [Contributing Guide](../docs/3_app/CONTRIBUTING.md) - How to contribute
- [Main README](../README.md) - KWAMI project overview

## ✨ Features

- **Interactive 3D Visualization** - Real-time morphing blob with audio reactivity
- **Voice Interaction** - Natural conversation with TTS and STT
- **Dynamic Appearance** - Customizable skins and visual effects
- **App Connectors** - MCP integrations with mainstream apps
- **Privacy First** - Permissioned, privacy-by-design architecture
- **Multi-language** - i18n support (English, French, Spanish)

## 📦 Tech Stack

- Nuxt 4
- Vue 3
- Three.js
- Supabase
- Pinia
- Tailwind CSS

## 📄 License

**Dual License** - Apache 2.0 for personal/non-commercial use. Commercial license required for business use.

Contact: [Alex Colls](https://github.com/alexcolls)
