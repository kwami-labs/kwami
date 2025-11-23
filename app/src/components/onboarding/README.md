# Onboarding Components

Moved from `web/` to keep the web project simple.

These components provide:
- Interactive onboarding tour
- Quick actions command palette (Ctrl+K)
- User tutorial system

## Usage in App

Import and use in your Nuxt/Vue components:

```typescript
import { initOnboarding, initQuickActions } from './components/onboarding/onboarding';

// Initialize in your app
const tour = initOnboarding();
const quickActions = initQuickActions();
```

## Files
- `onboarding.ts` - Tour and quick actions logic
- `onboarding.css` - Styles for tour and command palette

---

**Moved from web/:** 2025-01-23  
**Reason:** Keep web/ simple, app/ needs interactive tutorials

