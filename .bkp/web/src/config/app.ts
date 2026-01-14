/**
 * Global Application Configuration
 *
 * This file contains global settings that control the behavior of the application.
 */

function envBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return defaultValue;
}

/**
 * Development Configuration
 */
export const DEV_MODE = Boolean(import.meta.env.DEV);

/**
 * Service Worker Configuration
 *
 * Controlled via VITE_ENABLE_SERVICE_WORKER.
 */
export const ENABLE_SERVICE_WORKER = envBool(import.meta.env.VITE_ENABLE_SERVICE_WORKER, false);

/**
 * Analytics Configuration
 *
 * Controlled via VITE_ENABLE_ANALYTICS.
 */
export const ENABLE_ANALYTICS = envBool(import.meta.env.VITE_ENABLE_ANALYTICS, false);

/**
 * Logging Configuration
 */
export const ENABLE_DEBUG_LOGS = envBool(import.meta.env.VITE_ENABLE_DEBUG_LOGS, DEV_MODE);

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

