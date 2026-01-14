# Configuration

This directory contains global configuration files for the Kwami web application.

## app.ts - Application Configuration

The `app.ts` file contains global settings that control the behavior of the application.

### Available Settings

#### Service Worker Configuration

```typescript
export const ENABLE_SERVICE_WORKER = false;
```

Controls whether the service worker is registered and caching is enabled.

- **`true`**: Service worker will be registered, and assets will be cached in the browser
- **`false`** (default): Service worker will be disabled, and any existing service workers and caches will be cleared

**Note**: Service workers use browser caching for offline support, not cookies. When disabled, no data is stored in the browser cache.

#### Analytics Configuration

```typescript
export const ENABLE_ANALYTICS = false;
```

Controls whether Google Analytics tracking is enabled.

- **`true`**: Analytics will be initialized and events will be tracked
- **`false`** (default): No analytics data will be collected

#### Development Configuration

```typescript
export const DEV_MODE = import.meta.env.DEV || false;
```

Automatically set based on the Vite environment.

#### Debug Logging

```typescript
export const ENABLE_DEBUG_LOGS = DEV_MODE;
```

Controls whether debug logs are shown in the console.

### How to Enable/Disable Features

To enable or disable features, simply change the value in `app.ts`:

```typescript
// To enable service worker
export const ENABLE_SERVICE_WORKER = true;

// To enable analytics
export const ENABLE_ANALYTICS = true;
```

### Privacy Considerations

By default, both `ENABLE_SERVICE_WORKER` and `ENABLE_ANALYTICS` are set to `false` to ensure:

- No browser caching (service workers disabled)
- No tracking or analytics data collection
- Maximum privacy for users

This configuration ensures the web application does not store any data in the browser or send any tracking information.

