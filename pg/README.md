# 🎮 KWAMI Playground

Interactive playground for testing and developing with the KWAMI AI companion library.

## 🚀 Quick Start

```bash
# From the kwami root directory
npm run pg

# Or using the full command
npm run playground
```

This will start a local dev server at `http://localhost:3000`

## 📁 Project Structure

```
pg/
├── src/                          # Source files
│   ├── main.js                   # Main application entry point
│   ├── styles.css                # Global styles
│   ├── agent-management-functions.js
│   ├── agent-management-section.html
│   ├── media-loader-ui.js
│   └── media-loading-manager.js
├── public/                       # Static assets (served from root by Vite)
│   ├── aud/                      # Audio files
│   │   └── fx/                   # Sound effects
│   ├── img/                      # Images
│   │   ├── bg/                   # Background images
│   │   ├── loader/               # Loading animations
│   │   └── logo/                 # Logos
│   └── vid/                      # Video files
│       └── bg/                   # Background videos
├── docker/                       # Docker configurations
├── index.html                    # Main HTML file
├── vite.config.js               # Vite configuration
├── package.json                 # Package dependencies
├── CHANGELOG.md                 # Version history
└── README.md                    # This file
```

## 🛠️ Development

### Building

```bash
npm run build:pg
```

### Preview Production Build

```bash
npm run preview:pg
```

## 📚 Documentation

For complete documentation, see [docs/2_pg/README.md](../docs/2_pg/README.md)

## 🔗 Related

- [Changelog](./CHANGELOG.md) - Version history and changes
- [Main README](../README.md) - KWAMI project overview
- [KWAMI Library](../kwami/) - Core library

