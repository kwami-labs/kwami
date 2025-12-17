# KWAMI Website

A beautiful single-page scrolling website showcasing the KWAMI project - an interactive 3D AI companion.

## 🎨 Features

- Progressive color transitions as you scroll through 22 sections
- Animated KWAMI blob morphing through shapes
- 29 language support with RTL languages (Arabic, Hebrew, Farsi, Urdu)
- Fully responsive (desktop, tablet, mobile)
- Smooth animations throughout
- Interactive - double-click the blob to randomize!
- Voice, Music, and Video playback modes
- PWA support with offline capabilities
- Comprehensive error handling

## 🚀 Quick Start

```bash
cd web
npm install
npm run dev
```

The website will be available at `http://localhost:5173`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run preview          # Preview production build

# Building
npm run build            # Production build
npm run build:check      # Type-check then build

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking

# Testing
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

## 📚 Documentation

For complete documentation, see [docs/8_web/README.md](../docs/8_web/README.md)

### Key Documents
- [Quick Start Phase 1](../docs/8_web/QUICK_START_PHASE1.md) - Quick start guide
- [Deployment](../docs/8_web/DEPLOYMENT.md) - Deployment instructions
- [Phase 1 Complete](../docs/8_web/PHASE1_COMPLETE.md) - Phase 1 features
- [Phase 2 Complete](../docs/8_web/PHASE2_COMPLETE.md) - Phase 2 features
- [Test Report](../docs/8_web/TEST_REPORT.md) - Testing results

## 🔗 Related

- [Changelog](./CHANGELOG.md) - Version history and changes
- [Main README](../README.md) - KWAMI project overview

## 🏗️ Tech Stack

- **Build Tool:** Vite 7.x
- **Language:** TypeScript 5.9
- **3D Rendering:** Three.js
- **Animation:** GSAP
- **Internationalization:** i18next (29 languages)
- **Testing:** Vitest
- **Code Quality:** ESLint + Prettier
- **PWA:** Service Worker with offline support

## 📁 Project Structure

```
web/
├── public/              # Static assets
│   ├── music/          # Music files
│   ├── video/          # Video files
│   ├── voices/         # Voice samples
│   └── *.png           # Icons and social images
├── src/
│   ├── components/     # Reusable components
│   ├── config/         # Configuration files
│   │   ├── colors.ts
│   │   ├── blobConfigs.ts
│   │   └── constants.ts
│   ├── managers/       # Manager classes
│   │   ├── CursorLight.ts
│   │   └── ActionButtonManager.ts
│   ├── media/          # Media player modules (WIP)
│   ├── utils/          # Utility functions
│   │   ├── languageUtils.ts
│   │   ├── mediaUtils.ts
│   │   └── media-error-handler.ts
│   ├── locales/        # Translation files (29 languages)
│   ├── test/           # Test files
│   ├── main.ts         # Main application entry
│   ├── i18n.ts         # Internationalization setup
│   └── *.css           # Style files
├── index.html          # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 📦 Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## ✨ Highlights

### Split Screen Layout
- Left: Scrollable content
- Right: Fixed animated blob

### Section Animations
Each section triggers unique blob shapes:
- Meet KWAMI - Circular
- Mind - Star pattern
- Body - Organic shape
- Soul - Pulsing
- Customization - Spiral
- Get Started - Heart shape

### Color System
6 rotating color palettes with progressive random variations

## 🐛 Known Issues

- Service worker caching strategy needs completion (currently feature-flagged)
- Bundle size/performance can be improved further (code-splitting + lazy-loading)

## 🤝 Contributing

1. Follow the existing code structure
2. Run `npm run lint` and `npm test` before committing
3. Ensure all tests pass
4. Update documentation as needed

## 📝 Notes

- SVG icon placeholders are temporary - convert to PNG for production
- Run `npm install` after pulling latest changes
- See `IMPROVEMENTS.md` for detailed development roadmap

---

**Version:** 1.5.12-dev  
**Status:** Under Active Development
