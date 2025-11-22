# 🤝 Contributing to Kwami

Thank you for your interest in contributing to Kwami! We welcome contributions from everyone. This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Contribution Types](#-contribution-types)
- [Making Changes](#-making-changes)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Questions & Support](#-questions--support)

## 👥 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please:

- Be respectful and inclusive
- Welcome people of all backgrounds and experience levels
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members
- Report any inappropriate behavior to the maintainers

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+) or **Bun** (recommended)
- **Git** for version control
- Basic understanding of TypeScript and Three.js
- Familiarity with WebGL concepts

### Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kwami.git
   cd kwami
   ```
3. **Add upstream** for sync:
   ```bash
   git remote add upstream https://github.com/alexcolls/kwami.git
   ```

## 🛠️ Development Setup

### Install Dependencies

Using **Bun** (recommended):
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

### Run Playground

Start the interactive playground:
```bash
npm run playground
# or
bun playground
```

This starts a Vite dev server at `http://localhost:3000`

### Build TypeScript

Compile TypeScript to JavaScript:
```bash
npm run build
# or
bun build
```

### Watch Mode

Watch for TypeScript changes:
```bash
npm run dev
# or
bun dev
```

## 📝 Contribution Types

### 🐛 Bug Reports

Found a bug? Help us fix it!

1. **Check existing issues** - Avoid duplicates
2. **Create a new issue** with:
   - Clear title describing the bug
   - Step-by-step reproduction steps
   - Expected vs actual behavior
   - Environment details (OS, Node/Bun version, browser)
   - Code snippet or live example if possible

### 🎨 Features & Enhancements

Have a great idea? We'd love to hear it!

1. **Open a discussion** first (before starting major work)
2. **Describe the feature**:
   - What problem does it solve?
   - How should it work?
   - Will it break existing functionality?
3. **Wait for feedback** from maintainers
4. **Implement once approved**

### 📚 Documentation

Documentation improvements are always welcome!

- Fix typos and grammar issues
- Clarify confusing sections
- Add examples and use cases
- Improve API documentation
- Add troubleshooting guides

### ♻️ Code Quality

Help improve the codebase:

- Fix linting issues
- Add type safety improvements
- Refactor for readability
- Remove technical debt
- Improve performance

## 📝 Making Changes

## 🌿 Branch Strategy

### Production & Development Branches

We use a professional git workflow with protected branches:

- 🔒 **main** - Production branch (deployed to kwami.io)
  - Protected - requires PR review
  - Only receives releases from `dev`
  - Tagged with version numbers (v2.0.0, v2.1.0, etc.)

- 🔧 **dev** - Development/integration branch
  - Main branch for feature development
  - **All feature PRs target this branch, NOT main**
  - Testing and review happens here
  - Merged to `main` for releases

### Create a Branch

Always create feature branches from `dev`:

```bash
# First, ensure you're on dev
git checkout dev
git pull origin dev

# Then create your feature branch
git checkout -b feature/your-feature-name

# Or use these naming patterns:
git checkout -b feature/blob-skin-improvements      # New features
git checkout -b fix/scale-slider-not-working       # Bug fixes
git checkout -b docs/add-custom-shader-guide       # Documentation
git checkout -b refactor/animation-system          # Refactoring
git checkout -b perf/optimize-audio-processing     # Performance
```

### Keep Your Branch Updated

Before making a pull request:

```bash
git fetch origin
git rebase origin/dev
# or
git merge origin/dev
```

**Important**: Rebase on `dev`, not `main`!

## 💾 Commit Guidelines

We follow semantic commit messages:

### Commit Format

```
<type>(<scope>) <subject>

<body>

<footer>
```

### Types

- `✨ feat` - New feature
- `🐛 fix` - Bug fix
- `📚 docs` - Documentation
- `🎨 style` - Formatting changes
- `♻️ refactor` - Code restructuring
- `⚡ perf` - Performance improvement
- `✅ test` - Test changes
- `🔧 chore` - Build/dependency changes
- `🔌 ci` - CI configuration

### Examples

```bash
✨ feat(blob): add support for custom geometry deformation
🐛 fix(animation): prevent geometry collapse on rapid clicks
📚 docs(playground): add background gradient control guide
♻️ refactor(audio): simplify frequency analysis logic
⚡ perf(renderer): optimize material disposal
```

### Commit Guidelines

- ✅ Write in imperative mood ("add feature", not "added feature")
- ✅ Keep first line under 50 characters
- ✅ Reference issues when relevant: "Closes #123"
- ✅ Explain *why* not just *what*
- ❌ Don't mix multiple unrelated changes
- ❌ Don't commit debug code or console.log statements

## 🔄 Pull Request Process

### Branch Target

**🚨 All PRs should target the `dev` branch, NOT `main`**

- `dev` is the integration branch for features
- `main` is production (deployed to kwami.io)
- Only maintainers merge `dev` → `main` for releases

### Before Submitting

1. **Ensure you're on dev**
   ```bash
   git fetch origin
   git rebase origin/dev  # Update your branch
   ```

2. **Test your changes**
   ```bash
   npm run build
   npm run playground  # Test manually
   ```

2. **Update documentation**
   - Update README.md if adding features
   - Update CHANGELOG.md with your changes
   - Add/update JSDoc comments
   - **Version updates** (for maintainers only):
     - Only update `package.json` version field
     - Run `npm run sync-version` (or happens automatically on `npm run build`)
     - Kwami.ts and playground version display update automatically

4. **Check code quality**
   ```bash
   npm run lint  # If available
   ```

### Creating a PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

2. **Open a PR on GitHub**
   - Use a clear title describing what changed
   - Reference related issues: "Closes #123"
   - Describe your changes in the description
   - Include before/after if visual changes
   - Link to playground or example if applicable
   - **⚠️ IMPORTANT: Set target branch to `dev`, NOT `main`**

### PR Description Template

```markdown
## Description
Brief explanation of what this PR does

## Related Issues
Closes #123
Related to #456

## Changes
- ✨ Added feature X
- 🐛 Fixed bug Y
- 📚 Updated documentation

## Testing
- ✅ Tested in playground
- ✅ Verified on Chrome/Firefox
- ✅ No console errors

## Screenshots (if applicable)
[Add before/after images]

## Checklist
- [ ] Branched from `dev`
- [ ] PR targets `dev` (not `main`)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No breaking changes introduced
- [ ] Tested locally
- [ ] Rebased/merged with latest `dev`
```

### Review Process

- Maintainers will review your PR on `dev`
- We may request changes or clarifications
- Address feedback in additional commits
- Once approved, your PR will be merged to `dev`! 🎉
- Later, `dev` will be merged to `main` for release

### Release Process (Automated)

When it's time for a release:

1. **Prepare the release on `dev`:**
   - Update version in `package.json` (following semver)
   - Update CHANGELOG.md with release notes
   - Commit changes: `git commit -m "🚀 Bump version to v2.1.0"`

2. **Create release PR:**
   - Open PR from `dev` → `main` with title: "🚀 Release v2.1.0"
   - Get PR reviewed and approved by maintainers

3. **Merge to `main` (triggers automation):**
   - Once merged, GitHub Actions automatically:
     - ✅ Runs tests
     - 📦 Builds the package
     - 🚀 Publishes to npm (if version changed)
     - 🏷️ Creates a git tag (v2.1.0)
   - View workflow progress at: Actions → 📦 Publish to npm

4. **Deploy website:**
   - Website (kwami.io) deploys automatically from `main`

5. **Sync back to `dev`:**
   - Merge `main` back to `dev` to keep branches in sync
   - Push to keep development branch up to date

### Manual Publishing (for maintainers)

If you need to publish manually:

```bash
# Ensure you're on main with latest changes
git checkout main
git pull

# Bump version and publish
npm version patch|minor|major  # Bumps version and creates tag
npm publish --access public

# Push changes and tags
git push && git push --tags
```

**Note:** Automated publishing is preferred. Manual publishing should only be used for hotfixes or if automation fails.

## 🎯 Coding Standards

### TypeScript

- ✅ Use strict type checking
- ✅ Avoid `any` types
- ✅ Use descriptive names
- ✅ Add JSDoc comments for public APIs

```typescript
/**
 * Set the blob's spike intensity for noise deformation
 * @param x - X-axis spike intensity (0-20)
 * @param y - Y-axis spike intensity (0-20)
 * @param z - Z-axis spike intensity (0-20)
 */
public setSpikes(x: number, y: number, z: number): void {
  this.spikes = { x, y, z };
}
```

### File Organization

```
src/
├── core/          # Core classes (Kwami, Body, Mind, Soul)
├── blob/          # Blob implementation
│   ├── geometry.ts    # Geometry creation
│   ├── animation.ts   # Animation logic
│   ├── config.ts      # Default configuration
│   └── skins/         # Shader materials
├── scene/         # THREE.js scene setup
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Naming Conventions

- **Classes**: PascalCase (`KwamiBody`, `BlobGeometry`)
- **Functions**: camelCase (`setSpikes()`, `enableInteraction()`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_RESOLUTION`)
- **Private members**: Prefix with `_` or use `private` keyword
- **Types**: PascalCase (`BlobConfig`, `AudioEffects`)

### Code Style

- Use semicolons
- 2-space indentation
- Line length: aim for <100 characters
- Use `const` by default, `let` when needed
- Avoid `var`
- Use template literals for strings with interpolation

## 🧪 Testing

### Manual Testing

1. **Run playground**
   ```bash
   npm run playground
   ```

2. **Test in browser**
   - Check all UI controls work
   - Verify animations are smooth
   - Test on different screen sizes
   - Check console for errors

3. **Test specific scenarios**
   - Audio reactivity with different files
   - State transitions between modes
   - Background gradient changes
   - Scale control with animation

### Before Committing

- ✅ No console errors or warnings
- ✅ All controls functional
- ✅ Animations smooth (60 FPS)
- ✅ Memory usage reasonable
- ✅ Works on different browsers

## 📚 Documentation

### Adding Documentation

1. **Inline comments** for complex logic
   ```typescript
   // Calculate noise frequencies based on spike intensity
   const baseFreqX = Math.max(0.025, spikeX);
   ```

2. **JSDoc comments** for public APIs
   ```typescript
   /**
    * Start listening mode with microphone audio input
    * @throws Error if microphone access denied
    */
   public async startListening(): Promise<void> { }
   ```

3. **Markdown files** for guides
   - Place in `/docs` folder
   - Use clear headings
   - Include examples
   - Add troubleshooting sections

### Updating CHANGELOG

Always update `CHANGELOG.md`:

```markdown
### ✨ Added

- 🎨 New feature description
- 🎤 Another feature

### 🐛 Bug Fixes

- Fixed issue with scale control
- Improved animation performance

### 📚 Documentation

- Added custom shader guide
- Updated playground README
```

## ❓ Questions & Support

### Getting Help

- 📖 Check existing [documentation](/docs)
- 🔍 Search [existing issues](https://github.com/alexcolls/kwami/issues)
- 💬 Ask in discussions
- 📧 Contact maintainers

### Resources

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Project structure
- [Playground README](./playground/README.md) - UI guide
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Three.js Docs](https://threejs.org/docs/)

## 🎓 Learning Resources

### Understanding Kwami

1. **Read ARCHITECTURE.md** - Understand the structure
2. **Explore the playground** - See features in action
3. **Check examples** in README.md
4. **Study the codebase** - Start with core classes

### Relevant Technologies

- [Three.js](https://threejs.org/) - 3D graphics
- [WebGL](https://www.khronos.org/webgl/) - GPU acceleration
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio processing
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Simplex Noise](https://github.com/jwagner/simplex-noise.js/) - Smooth random patterns

## 🎉 Recognition

Contributors are recognized in:

- ✨ [GitHub Contributors](https://github.com/alexcolls/kwami/graphs/contributors)
- 📝 CHANGELOG.md entries
- 🏆 Project README (for major contributions)

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project (Dual License - Apache 2.0 for personal use, commercial license required for business use).

## 🙏 Thank You!

Thank you for contributing to Kwami! Your help makes this project better for everyone. We appreciate your time, effort, and passion for open source! 🚀

---

**Questions?** Open an issue or discussion on GitHub!

**Found a security vulnerability?** Please email instead of using issues.

Happy coding! 💻✨