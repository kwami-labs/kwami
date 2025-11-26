/**
 * Global Application Configuration
 * 
 * This file contains global settings that control the behavior of the application.
 */

/**
 * Service Worker Configuration
 * 
 * ENABLE_SERVICE_WORKER: Set to false to disable service worker registration and caching.
 * When disabled, the app will not use any service workers or browser caches.
 * 
 * Note: Service workers use browser caching, not cookies. However, disabling this
 * ensures no data is stored in the browser cache.
 */
export const ENABLE_SERVICE_WORKER = false;

/**
 * Analytics Configuration
 * 
 * ENABLE_ANALYTICS: Set to false to disable Google Analytics tracking.
 * When disabled, no analytics data will be collected.
 */
export const ENABLE_ANALYTICS = false;

/**
 * Development Configuration
 * 
 * These settings are for development purposes.
 */
export const DEV_MODE = import.meta.env.DEV || false;

/**
 * Logging Configuration
 */
export const ENABLE_DEBUG_LOGS = DEV_MODE;

/**
 * Export all configuration
 */
export const APP_CONFIG = {
  ENABLE_SERVICE_WORKER,
  ENABLE_ANALYTICS,
  DEV_MODE,
  ENABLE_DEBUG_LOGS,
} as const;

export default APP_CONFIG;

