# Configuration Summary

## Quick Reference

### Location
```
web/src/config/app.ts
```

### Current Settings (Privacy-First)
```typescript
ENABLE_SERVICE_WORKER = false  ❌ No caching
ENABLE_ANALYTICS      = false  ❌ No tracking
```

### To Enable Features
```typescript
ENABLE_SERVICE_WORKER = true   ✅ Enable caching
ENABLE_ANALYTICS      = true   ✅ Enable tracking
```

## What Changed

### Before
- Service workers were **always unregistered** (hardcoded in development mode)
- Analytics had **no global off switch**
- Settings were scattered across multiple files

### After
- Service workers **controlled by configuration variable**
- Analytics **controlled by configuration variable**
- **Single source of truth** in `app.ts`
- **Privacy-first by default**

## Files Created
1. ✨ `web/src/config/app.ts` - Global configuration
2. 📖 `web/src/config/README.md` - Configuration docs
3. 🔒 `web/PRIVACY_CONFIG.md` - Privacy documentation
4. 📋 `web/CONFIG_SUMMARY.md` - This file

## Files Modified
1. 🔧 `web/src/main.ts` - Uses configuration
2. 🔧 `web/src/analytics.ts` - Respects ENABLE_ANALYTICS

## Testing

Start the dev server and check the console:
```bash
npm run web
```

You should see:
```
📊 Analytics disabled by configuration
✅ Service workers and caches disabled by configuration
```

## Need Help?

Read the full documentation:
- `web/PRIVACY_CONFIG.md` - Complete privacy guide
- `web/src/config/README.md` - Configuration reference

