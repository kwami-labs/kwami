# Privacy Configuration

This document explains the privacy-focused configuration changes made to the Kwami web application.

## Overview

By default, the Kwami web application is now configured to **maximize user privacy** by:

1. **Disabling Service Workers** - No browser caching or offline storage
2. **Disabling Analytics** - No tracking or data collection

## Configuration File

All privacy settings are controlled by a single file:

```
web/src/config/app.ts
```

## Default Settings (Privacy-First)

```typescript
export const ENABLE_SERVICE_WORKER = false;  // No browser caching
export const ENABLE_ANALYTICS = false;       // No tracking
```

## What This Means

### Service Workers (DISABLED by default)

- ✅ No data cached in the browser
- ✅ No offline storage
- ✅ All existing service workers are automatically unregistered
- ✅ All existing caches are automatically cleared on app load

**Note**: Service workers use browser caching for offline functionality, not cookies. However, disabling them ensures no data is stored locally.

### Analytics (DISABLED by default)

- ✅ No Google Analytics tracking
- ✅ No event tracking
- ✅ No user data collection
- ✅ No engagement metrics
- ✅ No page view tracking

## How to Enable Features (Optional)

If you want to enable these features, edit `web/src/config/app.ts`:

```typescript
// Enable browser caching for offline support
export const ENABLE_SERVICE_WORKER = true;

// Enable analytics for usage insights
export const ENABLE_ANALYTICS = true;
```

## Implementation Details

### Files Modified

1. **`web/src/config/app.ts`** (NEW)
   - Global configuration file
   - Single source of truth for all settings

2. **`web/src/main.ts`**
   - Imports configuration
   - Conditionally initializes analytics
   - Conditionally registers/unregisters service workers
   - Conditionally tracks timing metrics

3. **`web/src/analytics.ts`**
   - All tracking functions check `ENABLE_ANALYTICS` before executing
   - Auto-engagement tracking disabled when analytics is off
   - Safe to call tracking functions even when disabled

4. **`web/src/config/README.md`** (NEW)
   - Documentation for configuration options

### Service Worker Behavior

When `ENABLE_SERVICE_WORKER = false`:
- The app checks for any registered service workers on load
- Unregisters all service workers found
- Clears all browser caches
- Logs confirmation to console: `✅ Service workers and caches disabled by configuration`

When `ENABLE_SERVICE_WORKER = true`:
- Registers the service worker at `/sw.js`
- Enables offline caching
- Provides faster page loads through cache-first strategy

### Analytics Behavior

When `ENABLE_ANALYTICS = false`:
- `initAnalytics()` returns immediately without initialization
- All tracking functions return immediately without sending data
- No Google Analytics scripts are loaded
- No network requests to analytics servers

When `ENABLE_ANALYTICS = true`:
- Google Analytics is initialized
- Events, page views, and metrics are tracked
- Engagement time is monitored

## Console Messages

You can verify the configuration in the browser console:

When service workers are disabled:
```
🗑️ Unregistered service worker: <scope>
🗑️ Deleted cache: <cache-name>
✅ Service workers and caches disabled by configuration
```

When analytics is disabled:
```
📊 Analytics disabled by configuration
```

## Privacy Guarantee

With the default configuration:
- ✅ No cookies are used
- ✅ No localStorage/sessionStorage for tracking
- ✅ No service worker caching
- ✅ No analytics tracking
- ✅ No third-party data collection
- ✅ No persistent data stored in the browser

The application operates in a completely privacy-first mode by default.

## Questions?

For questions about privacy configuration, refer to:
- `web/src/config/app.ts` - Configuration file
- `web/src/config/README.md` - Detailed documentation
- This file - Privacy overview

