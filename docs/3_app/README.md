# KWAMI App Documentation

Welcome to the KWAMI App documentation. This is the main Nuxt.js application for KWAMI.

## 📚 Documentation

### Setup & Configuration
- [Setup Guide](./SETUP.md) - Installation and setup instructions
- [App Migration Summary](./APP_MIGRATION_SUMMARY.md) - Migration notes and history

### Contributing
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the KWAMI app

## 🏗️ Tech Stack

- **Framework**: Nuxt 3
- **UI**: Vue 3 + Tailwind CSS
- **State Management**: Pinia stores
- **i18n**: Vue I18n for internationalization
- **TypeScript**: Full TypeScript support

## 🔗 Related Documentation

- Main README: [/app/README.md](../../app/README.md)
- CHANGELOG: [/app/CHANGELOG.md](../../app/CHANGELOG.md)
- Core Library Docs: [../1_kwami/](../1_kwami/)

## 📁 Project Structure

```
app/
├── components/       # Vue components
│   ├── Apps/        # Application components
│   ├── Canvas/      # Canvas/rendering components
│   ├── Common/      # Shared components
│   └── Quami/       # Quami-specific components
├── composables/     # Vue composables
├── pages/           # Nuxt pages
├── stores/          # Pinia stores
├── middleware/      # Route middleware
├── plugins/         # Nuxt plugins
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── i18n/            # Internationalization
```

## 🚀 Quick Start

```bash
cd app
npm install
npm run dev
```

For detailed setup instructions, see [SETUP.md](./SETUP.md).

