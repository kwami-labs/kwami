/**
 * Analytics Module
 * 
 * Provides Google Analytics 4 (GA4) integration with event tracking
 * for the Kwami website.
 */

import { ENABLE_ANALYTICS } from './config/app';

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export function initAnalytics(): void {
  // Check if analytics is enabled
  if (!ENABLE_ANALYTICS) {
    console.log('📊 Analytics: Disabled by configuration');
    return;
  }
  
  // Check if running in production and GA ID is available
  const GA_ID = import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX';
  
  if (typeof window === 'undefined') {
    console.warn('Analytics: window is undefined, skipping initialization');
    return;
  }

  // Skip if already initialized
  if (window.dataLayer) {
    console.log('Analytics: Already initialized');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Configure GA
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    send_page_view: true,
  });

  console.log('✅ Analytics initialized:', GA_ID);
}

/**
 * Track a page view
 * @param path - Page path (e.g., '/about')
 * @param title - Page title
 */
export function trackPageView(path?: string, title?: string): void {
  if (!ENABLE_ANALYTICS || typeof window.gtag === 'undefined') return;

  window.gtag('event', 'page_view', {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
    page_location: window.location.href,
  });

  console.log('📊 Page view tracked:', path || window.location.pathname);
}

/**
 * Track a custom event
 * @param action - Event action (e.g., 'click', 'play', 'download')
 * @param category - Event category (e.g., 'button', 'video', 'audio')
 * @param label - Event label (optional, e.g., 'header_cta')
 * @param value - Event value (optional, numeric)
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (!ENABLE_ANALYTICS || typeof window.gtag === 'undefined') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  console.log('📊 Event tracked:', { action, category, label, value });
}

/**
 * Track section scroll
 * @param sectionNumber - Section number (0-21)
 * @param sectionName - Section name (e.g., 'Meet Kwami')
 */
export function trackSectionView(sectionNumber: number, sectionName: string): void {
  trackEvent('section_view', 'scroll', `section_${sectionNumber}_${sectionName}`, sectionNumber);
}

/**
 * Track button click
 * @param buttonName - Button identifier (e.g., 'launch-playground')
 * @param buttonText - Button text
 */
export function trackButtonClick(buttonName: string, buttonText?: string): void {
  trackEvent('click', 'button', buttonName);
  
  // Also track as a conversion if it's a CTA
  if (isCTAButton(buttonName)) {
    trackEvent('conversion', 'cta', buttonName);
  }
}

/**
 * Track media interaction
 * @param mediaType - Type of media ('music', 'video', 'voice')
 * @param action - Action performed ('play', 'pause', 'stop', 'complete')
 * @param mediaName - Name of the media file
 */
export function trackMediaInteraction(
  mediaType: 'music' | 'video' | 'voice',
  action: 'play' | 'pause' | 'stop' | 'complete',
  mediaName?: string
): void {
  trackEvent(action, `media_${mediaType}`, mediaName);
}

/**
 * Track blob interaction
 * @param action - Interaction type ('click', 'double_click', 'randomize')
 */
export function trackBlobInteraction(action: 'click' | 'double_click' | 'randomize'): void {
  trackEvent(action, 'blob', `blob_${action}`);
}

/**
 * Track language change
 * @param fromLang - Previous language code
 * @param toLang - New language code
 */
export function trackLanguageChange(fromLang: string, toLang: string): void {
  trackEvent('language_change', 'i18n', `${fromLang}_to_${toLang}`);
}

/**
 * Track tab switch
 * @param tabName - Tab name ('voice', 'music', 'video')
 */
export function trackTabSwitch(tabName: 'voice' | 'music' | 'video'): void {
  trackEvent('tab_switch', 'navigation', tabName);
}

/**
 * Track sidebar navigation
 * @param fromSection - Previous section number
 * @param toSection - New section number
 */
export function trackSidebarNavigation(fromSection: number, toSection: number): void {
  trackEvent('sidebar_click', 'navigation', `section_${fromSection}_to_${toSection}`);
}

/**
 * Track error
 * @param error - Error object or message
 * @param fatal - Whether the error is fatal
 */
export function trackError(error: Error | string, fatal: boolean = false): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? '' : error.stack;

  window.gtag?.('event', 'exception', {
    description: errorMessage,
    fatal: fatal,
    error_stack: errorStack,
  });

  console.error('📊 Error tracked:', errorMessage);
}

/**
 * Track timing
 * @param category - Timing category (e.g., 'load', 'render')
 * @param variable - Variable name (e.g., 'page_load', 'blob_init')
 * @param value - Time in milliseconds
 * @param label - Optional label
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if (!ENABLE_ANALYTICS || typeof window.gtag === 'undefined') return;

  window.gtag('event', 'timing_complete', {
    name: variable,
    value: value,
    event_category: category,
    event_label: label,
  });

  console.log('⏱️ Timing tracked:', { category, variable, value, label });
}

/**
 * Check if button is a CTA (Call To Action)
 * @param buttonName - Button identifier
 * @returns Whether the button is a CTA
 */
function isCTAButton(buttonName: string): boolean {
  const ctaButtons = [
    'launch-playground',
    'view-demo',
    'run-playground',
    'mint-nft',
    'create-session',
    'join-discord',
    'contact-team',
  ];
  
  return ctaButtons.includes(buttonName);
}

/**
 * Track user engagement time
 * Call this periodically to track how long users stay on the site
 */
export function trackEngagementTime(): void {
  if (!ENABLE_ANALYTICS || typeof window.gtag === 'undefined') return;

  window.gtag('event', 'user_engagement', {
    engagement_time_msec: 30000, // 30 seconds
  });
}

// Auto-track engagement every 30 seconds (only if analytics is enabled)
if (typeof window !== 'undefined' && ENABLE_ANALYTICS) {
  setInterval(() => {
    trackEngagementTime();
  }, 30000);
}

/**
 * Set user properties
 * @param properties - User properties object
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (!ENABLE_ANALYTICS || typeof window.gtag === 'undefined') return;

  window.gtag('set', 'user_properties', properties);
}

/**
 * Track outbound link
 * @param url - External URL
 * @param label - Optional label
 */
export function trackOutboundLink(url: string, label?: string): void {
  trackEvent('click', 'outbound_link', label || url);
}

