# Contributing to Quami 🔮

Thank you for your interest in contributing to Quami! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment. Please:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility and apologize for mistakes
- Prioritize what's best for the community

## Getting Started

### Prerequisites

- **Git** for version control
- **One of these runtimes:**
  - Bun (recommended)
  - Deno
  - Node.js (v18 or higher)
- **Basic knowledge of:**
  - Vue.js 3 / Nuxt.js 4
  - TypeScript
  - Three.js (for 3D-related contributions)

### First Time Setup

1. **Fork the repository** on GitHub

2. **Clone your fork with submodules:**
   ```bash
   git clone --recurse-submodules git@github.com:YOUR-USERNAME/quami.git
   cd quami
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream git@github.com:alexcolls/quami.git
   ```

4. **Install dependencies:**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using Deno
   deno install
   
   # Or using npm
   npm install
   ```

5. **Copy environment configuration:**
   ```bash
   cp .env.sample .env
   ```

6. **Start development server:**
   ```bash
   bun run dev  # or deno task dev / npm run dev
   ```

## Development Setup

### Branch Strategy

- `main` - Production-ready code
- Feature branches - `feature/your-feature-name`
- Bug fixes - `fix/bug-description`
- Documentation - `docs/what-you-are-documenting`

### Working with Submodules

Quami uses:
- **Git submodule:** `app/modules/@kwami` - The 3D AI companion library
- **NPM package:** `@alexcolls/nuxt-ux` - UI component library

**Before making changes to submodules:**

```bash
# Update submodules to latest
git submodule update --remote --merge

# If you need to modify a submodule
cd app/modules/@kwami
git checkout main
# Make your changes
git add .
git commit -m "your changes"
git push

# Return to main project and update reference
cd ../..
git add app/modules/@kwami
git commit -m "⬆️ Update @kwami submodule"
```

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** (if available)
3. **Include:**
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Environment details (OS, browser, runtime)
   - Console errors

### Suggesting Features

1. **Check existing feature requests**
2. **Open a new issue** with:
   - Clear feature description
   - Use cases and benefits
   - Possible implementation approach
   - Mockups or examples (if applicable)

### Making Code Contributions

1. **Pick an issue** or create one
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following coding standards
5. **Test your changes** thoroughly
6. **Commit your changes** with proper commit messages
7. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

## Coding Standards

### TypeScript / Vue

- **Use TypeScript** for type safety
- **Follow Vue 3 Composition API** patterns
- **Use meaningful variable names** (descriptive over short)
- **Keep components small** and focused (single responsibility)
- **Use Nuxt auto-imports** where available

```vue
<!-- ✅ Good -->
<script setup lang="ts">
const { user } = useAuth();
const isAuthenticated = computed(() => !!user.value);

const handleLogin = async () => {
  // Clear implementation
};
</script>

<!-- ❌ Bad -->
<script setup>
const u = useAuth().user;
const isAuth = computed(() => !!u.value);

const login = async () => {
  // No types, unclear names
};
</script>
```

### File Organization

- **Components:** Use PascalCase (e.g., `MyComponent.vue`)
- **Composables:** Use camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities:** Use camelCase (e.g., `formatDate.ts`)
- **Types:** Use PascalCase (e.g., `UserProfile.ts`)

### Vue Component Structure

```vue
<template>
  <!-- Template here -->
</template>

<script setup lang="ts">
// 1. Imports
import { computed, ref } from 'vue';
import type { User } from '~/types';

// 2. Props & Emits
interface Props {
  user: User;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  update: [user: User];
}>();

// 3. Composables
const { t } = useI18n();
const store = useStore();

// 4. Reactive state
const isLoading = ref(false);

// 5. Computed properties
const displayName = computed(() => props.user.name);

// 6. Methods
const handleUpdate = () => {
  emit('update', props.user);
};

// 7. Lifecycle hooks
onMounted(() => {
  // Initialization
});
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Styling

- **Use Tailwind CSS** utility classes
- **Keep scoped styles minimal**
- **Use design system tokens** from `nuxt-ux`
- **Mobile-first** approach

```vue
<!-- ✅ Good -->
<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
  <h2 class="text-lg font-semibold mb-2">Title</h2>
</div>

<!-- ❌ Bad -->
<div class="custom-container">
  <h2 class="custom-title">Title</h2>
</div>
<style>
.custom-container { padding: 1rem; background: #f3f4f6; }
.custom-title { font-size: 1.125rem; font-weight: 600; }
</style>
```

## Commit Guidelines

We follow **conventional commits** with **emoji prefixes** for better readability.

### Commit Format

```
<emoji> <type>: <subject>

[optional body]

[optional footer]
```

### Commit Types & Emojis

| Emoji | Type | Description |
|-------|------|-------------|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| 📝 | `docs` | Documentation changes |
| 💄 | `style` | UI/style updates (no logic change) |
| ♻️ | `refactor` | Code refactoring |
| ⚡ | `perf` | Performance improvements |
| ✅ | `test` | Adding or updating tests |
| 🔧 | `chore` | Build/config changes |
| 🔒 | `security` | Security fixes |
| ⬆️ | `upgrade` | Dependency upgrades |
| 🚚 | `move` | Moving/renaming files |
| 🗑️ | `remove` | Removing code/files |

### Examples

```bash
# Good commits
git commit -m "✨ Add voice input feature to Kwami interface"
git commit -m "🐛 Fix blob animation flickering on Safari"
git commit -m "📝 Update CONTRIBUTING.md with testing guidelines"
git commit -m "♻️ Refactor authentication store to use Pinia"

# Bad commits (avoid these)
git commit -m "fix stuff"
git commit -m "updated files"
git commit -m "WIP"
```

### Commit Grouping

Group related changes by feature/fix:

```bash
# ✅ Good: One commit per logical change
git commit -m "✨ Add user profile UI components"
git commit -m "✨ Implement user authentication flow"
git commit -m "✅ Add authentication tests"

# ❌ Bad: All changes in one commit
git commit -m "Add user stuff"
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run linter and type check:**
   ```bash
   bun run lint      # or npm run lint
   bun run typecheck # or npm run typecheck
   ```

3. **Test your changes** thoroughly

4. **Update documentation** if needed

### PR Title Format

Use the same format as commit messages:

```
✨ Add voice input feature to Kwami interface
```

### PR Description

Include:

- **What:** Clear description of changes
- **Why:** Reason for the changes
- **How:** Implementation approach
- **Testing:** How you tested the changes
- **Screenshots/Videos:** For UI changes
- **Related Issues:** Link to issues (e.g., `Closes #123`)

### PR Template Example

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile

## Screenshots
(if applicable)

## Related Issues
Closes #123
```

### Review Process

- PRs require at least **one approval** from maintainers
- Address all review comments
- Keep discussions constructive and professional
- Be patient - maintainers may need time to review

## Project Structure

```
quami/
├── app/
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # Vue components
│   │   ├── Common/          # Shared UI components
│   │   ├── Quami/          # Quami-specific components
│   │   │   └── Account/    # User account management
│   │   └── Canvas/         # 3D canvas components
│   ├── composables/        # Vue composables
│   ├── locales/            # i18n translations
│   ├── modules/            # Git submodules
│   │   └── @kwami/         # Kwami library (submodule)
│   ├── pages/              # Nuxt pages (routes)
│   ├── stores/             # Pinia stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Public static files
├── server/                 # Nuxt server routes
│   └── api/                # API endpoints
├── docs/                   # Documentation
├── .env.sample            # Environment variable template
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Testing

### Manual Testing

1. **Test on multiple browsers** (Chrome, Firefox, Safari)
2. **Test responsive design** (mobile, tablet, desktop)
3. **Test different themes** (light/dark mode)
4. **Test error scenarios**

### Adding Tests

(To be expanded when testing framework is added)

```typescript
// Example structure
describe('Component', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

## Documentation

### Code Comments

- **Write self-documenting code** first
- **Add comments** for complex logic only
- **Use JSDoc** for functions and components

```typescript
/**
 * Calculates the distance between two 3D points
 * @param p1 - First point coordinates
 * @param p2 - Second point coordinates
 * @returns Distance between points
 */
function calculateDistance(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
}
```

### Documentation Files

- Update `README.md` for major changes
- Add new docs to `docs/` folder
- Keep documentation in sync with code

## Questions?

- **Open an issue** for questions
- **Join discussions** on GitHub
- **Check existing issues** and documentation first

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page

Thank you for contributing to Quami! 🔮✨

---

**Happy Coding!** 🚀
