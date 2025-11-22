# Contributing to KWAMI

Thank you for your interest in contributing to the KWAMI ecosystem! 🎉

## 📦 Monorepo Structure

KWAMI is organized as a monorepo with multiple projects:

- **`kwami/`** - Core library (published to npm)
- **`pg/`** - Interactive playground
- **`app/`** - Nuxt application
- **`solana/`** - Solana blockchain programs
- **`candy/`** - NFT candy machine
- **`market/`** - NFT marketplace
- **`dao/`** - Decentralized governance
- **`web/`** - Public website
- **`docs/`** - All documentation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/alexcolls/kwami.git
cd kwami

# Install all workspace dependencies
npm install --legacy-peer-deps
```

## 🔧 Development Workflow

### Working on the Core Library

```bash
# Build the core library
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

### Working on Projects

```bash
# Run playground
npm run pg

# Run web app
npm run app

# Run website
npm run web

# Run candy machine
npm run candy

# Run marketplace
npm run market

# Run DAO
npm run dao
```

## 📝 Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Your Changes

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and descriptive

### 3. Test Your Changes

```bash
# Test the core library
cd kwami && npm test

# Test specific projects as needed
npm run test -w <project-name>
```

### 4. Commit Your Changes

Use descriptive commit messages with emojis at the beginning:

```bash
git commit -m "✨ Add new feature"
git commit -m "🐛 Fix bug in component"
git commit -m "📚 Update documentation"
git commit -m "♻️ Refactor code"
git commit -m "🎨 Improve styling"
```

Common emoji prefixes:
- ✨ New feature
- 🐛 Bug fix
- 📚 Documentation
- ♻️ Refactoring
- 🎨 Styling/UI
- 🚀 Performance
- 🧪 Tests
- 🔧 Configuration
- 🔒 Security

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📋 Code Style

### TypeScript

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Add proper type definitions
- Avoid `any` types when possible

### Formatting

The project uses standard formatting. Please ensure your code is properly formatted before committing.

### Documentation

- Update README files when adding features
- Add JSDoc comments for public APIs
- Update the relevant docs/ folder for your project

## 🧪 Testing

### Core Library Tests

```bash
cd kwami
npm test
```

### Writing Tests

- Use Vitest for unit tests
- Place tests in `tests/` directory
- Follow the existing test patterns
- Aim for good coverage of new features

## 📚 Documentation

### Project Documentation

Each project has its own documentation in `docs/<n>_<project>/`:

- `docs/1_kwami/` - Core library
- `docs/2_pg/` - Playground
- `docs/3_app/` - App
- `docs/4_solana/` - Solana
- `docs/5_candy/` - Candy machine
- `docs/6_market/` - Marketplace
- `docs/7_dao/` - DAO
- `docs/8_web/` - Website

When making changes, update the relevant documentation.

## 🔄 Versioning

### Core Library (`kwami/`)

- Follows [Semantic Versioning](https://semver.org/)
- Version changes trigger npm publishing via GitHub Actions
- Update `kwami/CHANGELOG.md` for releases

### Other Projects

- Each project maintains its own version
- Update project-specific CHANGELOGs

## 📦 Publishing (Maintainers Only)

### Core Library

Publishing is automated via GitHub Actions:

1. Update version in `kwami/package.json`
2. Update `kwami/CHANGELOG.md`
3. Commit and push to `main`
4. GitHub Actions will automatically publish to npm

See [.github/workflows/publish.yml](./.github/workflows/publish.yml) for details.

## 🤝 Code Review Process

1. All changes require a Pull Request
2. At least one approval from a maintainer
3. All tests must pass
4. Documentation must be updated
5. Code must follow project style

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/alexcolls/kwami/discussions)
- Check existing [Issues](https://github.com/alexcolls/kwami/issues)
- Read the [Documentation](./docs/README.md)

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license terms. See [LICENSE](./LICENSE) for details.

---

**Thank you for contributing to KWAMI!** ❤️

