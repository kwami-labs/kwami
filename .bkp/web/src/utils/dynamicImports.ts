/**
 * Dynamic Import Utilities
 * Provides lazy loading capabilities for heavy modules
 */

/**
 * Dynamically loads a locale file
 */
export async function loadLocale(language: string): Promise<any> {
  try {
    const locale = await import(`../locales/${language}.json`);
    return locale.default;
  } catch (error) {
    console.warn(`Failed to load locale ${language}, falling back to English`);
    const fallback = await import('../locales/en.json');
    return fallback.default;
  }
}

/**
 * Dynamically loads Three.js only when needed
 */
export async function loadThreeJS() {
  const THREE = await import('three');
  return THREE;
}

/**
 * Dynamically loads GSAP animation library only when needed
 */
export async function loadGSAP() {
  const gsap = await import('gsap');
  return gsap.default;
}

/**
 * Preloads critical modules in the background
 */
export function preloadCriticalModules() {
  // Start preloading commonly used modules
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('three').catch(() => {});
      import('gsap').catch(() => {});
    });
  } else {
    setTimeout(() => {
      import('three').catch(() => {});
      import('gsap').catch(() => {});
    }, 1000);
  }
}

/**
 * Lazy load media players
 */
export async function loadMusicPlayer() {
  const module = await import('../media/MusicPlayer');
  return module;
}

export async function loadVideoPlayer() {
  const module = await import('../media/VideoPlayer');
  return module;
}

export async function loadVoicePlayer() {
  const module = await import('../media/VoicePlayer');
  return module;
}


