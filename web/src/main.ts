import { gsap } from 'gsap';

import './style.css';
import './components/welcome-layer.css';
import './accessibility.css';
import './loading.css';
import './mobile.css';

import { t, getCurrentLanguage, updatePageTranslations, createLanguageSwitcher } from './i18n';
import i18next from './i18n';

import { initAnalytics, trackTiming } from './analytics';
import { initErrorHandler } from './error-handler';
import { initKeyboardNavigation } from './keyboard-navigation';
import { initLoadingStates } from './loading';
import { initMobileUX } from './mobile';
import { initPerformanceOptimizer } from './performance';

import { generateRandomColor } from './config/colors';
import { isRTLLanguage } from './utils/languageUtils';
import { ENABLE_SERVICE_WORKER, ENABLE_ANALYTICS } from './config/app';

import type { ScrollManager } from './managers/ScrollManager';

let scrollManager: ScrollManager | null = null;

let themeToggleInitPromise: Promise<void> | null = null;

let prewarmStarted = false;

type MainAppState = {
  scrollManager: ScrollManager;
  backgroundRings: any;
};

let mainAppStatePromise: Promise<MainAppState> | null = null;

async function ensureMainAppState(): Promise<MainAppState> {
  if (mainAppStatePromise) {
    return mainAppStatePromise;
  }

  mainAppStatePromise = (async () => {
    const [
      scrollManagerMod,
      modeSwitcherMod,
      actionButtonMod,
      headerMenuMod,
      ringsMod,
    ] = await Promise.all([
      import('./managers/ScrollManager'),
      import('./managers/ModeSwitcher'),
      import('./managers/ActionButtonManager'),
      import('./managers/HeaderMenuManager'),
      import('kwami/ui/rings'),
    ]);

    const sm = new scrollManagerMod.ScrollManager({
      intro: true,
      autoplayPageAudio: false, // we'll start audio after the welcome layer is gone
    });
    scrollManager = sm;
    (window as any).scrollManager = sm;

    new modeSwitcherMod.ModeSwitcher();
    new actionButtonMod.ActionButtonManager();

    // Make sure theme toggle exists before we create the hamburger manager (so it can hide/show it)
    if (themeToggleInitPromise) {
      try {
        await themeToggleInitPromise;
      } catch {
        // ignore
      }
    }
    new headerMenuMod.HeaderMenuManager();

    const contentRight = document.querySelector('.content-right') as HTMLElement | null;
    const backgroundRings = ringsMod.createBackgroundRings({
      mount: contentRight ?? document.body,
      insert: 'first',
      zIndex: '0',
      sizeSource: 'mount',
      resize: 'auto',
      initialOpacity: 0,
    });
    (window as any).backgroundRings = backgroundRings;

    return { scrollManager: sm, backgroundRings };
  })();

  return mainAppStatePromise;
}

async function prewarmMainBlob(): Promise<void> {
  if (prewarmStarted) {
    return;
  }
  prewarmStarted = true;

  // Keep the main blob hidden until it's initialized.
  const kwamiContainer = document.getElementById('kwami-container') as HTMLElement | null;
  if (kwamiContainer) {
    gsap.set(kwamiContainer, { autoAlpha: 0 });
  }

  const state = await ensureMainAppState();
  await state.scrollManager.whenReady();

  // Mark that the blob is ready (no visual effect by itself).
  document.body.classList.add('blob-ready');

  // Let the main blob be visible behind the welcome layer (while keeping other UI locked).
  document.body.classList.add('peek-main-blob');
  if (kwamiContainer) {
    gsap.set(kwamiContainer, { autoAlpha: 1 });
  }
}

function initLanguageSwitcher() {
  const langSwitcher = createLanguageSwitcher('language-switcher');
  const rightHeader = document.querySelector('.right-header');

  if (rightHeader) {
    rightHeader.appendChild(langSwitcher);
  } else {
    document.body.appendChild(langSwitcher);
  }

  const currentLang = getCurrentLanguage();
  document.documentElement.setAttribute('dir', isRTLLanguage(currentLang) ? 'rtl' : 'ltr');
  console.log('🌐 Language switcher initialized');
}

async function initThemeToggle() {
  const { getThemeModeManager } = await import('./managers/ThemeModeManager');
  const themeManager = getThemeModeManager();
  const themeToggle = themeManager.createThemeToggleButton('header-theme-toggle');
  const rightHeader = document.querySelector('.right-header');

  if (rightHeader) {
    rightHeader.appendChild(themeToggle);
  } else {
    document.body.appendChild(themeToggle);
  }

  console.log('🌓 Theme toggle initialized');
}


function setupColorVariations() {
  let lastRandomUpdate = 0;
  const RANDOM_UPDATE_INTERVAL = 2000;

  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastRandomUpdate > RANDOM_UPDATE_INTERVAL) {
      lastRandomUpdate = now;

      const randomComponent = Math.floor(Math.random() * 3);
      const components = ['--color-primary', '--color-secondary', '--color-accent'];
      const randomColor = generateRandomColor();

      if (window.scrollY > window.innerHeight * 0.5) {
        document.documentElement.style.setProperty(
          components[randomComponent],
          randomColor
        );
      }
    }
  });
}

function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(this: HTMLAnchorElement, e: Event) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

function initScrollIndicator() {
  const scrollIndicator = document.createElement('div');
  scrollIndicator.className = 'scroll-indicator';
  scrollIndicator.textContent = '↓';
  document.body.appendChild(scrollIndicator);

  window.addEventListener('scroll', () => {
    scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '0.5';
  });
}

async function bootstrapMainApp() {
  console.log('🎬 Welcome layer complete, initializing main app');

  // Keep UI locked; we'll remove this and reveal quickly.
  document.body.classList.add('app-intro');

  const kwamiContainer = document.getElementById('kwami-container') as HTMLElement | null;
  const logo = document.querySelector('.kwami-label') as HTMLElement | null;
  const rightHeader = document.querySelector('.right-header') as HTMLElement | null;
  const sidebarNav = document.getElementById('sidebar-nav') as HTMLElement | null;

  // Hide everything except the blob (the blob may already be visible behind the welcome layer).
  gsap.set([logo, rightHeader, sidebarNav].filter(Boolean) as HTMLElement[], { autoAlpha: 0 });

  const { scrollManager, backgroundRings } = await ensureMainAppState();
  await scrollManager.whenReady();

  // Ensure the blob is ready; we will reveal everything (blob + UI) at the same time.
  document.body.classList.add('blob-ready');

  // Prep initial states (hidden + small motion offsets)
  const revealTargets = [logo, rightHeader, sidebarNav].filter(Boolean) as HTMLElement[];
  gsap.set(revealTargets, { autoAlpha: 0 });
  if (logo) gsap.set(logo, { y: -8 });
  if (rightHeader) gsap.set(rightHeader, { y: -8 });

  if (kwamiContainer) {
    gsap.set(kwamiContainer, { autoAlpha: 0 });
  }

  // Unlock CSS, then reveal *everything* together.
  document.body.classList.remove('peek-main-blob');
  document.body.classList.remove('app-intro');

  const tl = gsap.timeline();
  tl.to(revealTargets, { autoAlpha: 1, duration: 0.28, ease: 'power2.out' }, 0);

  if (kwamiContainer) {
    tl.to(kwamiContainer, { autoAlpha: 1, duration: 0.28, ease: 'power2.out' }, 0);
  }

  // Rings appear at the same moment.
  tl.call(() => {
    backgroundRings.show();
  }, [], 0);

  // Start blob intro at the same moment.
  tl.call(() => {
    void scrollManager.playIntroAnimation();
  }, [], 0);

  // Replay the wave so it happens right after reveal.
  tl.call(() => {
    const sphereContainer = document.getElementById('sphere-container');
    if (sphereContainer) {
      sphereContainer.classList.remove('wave-enter');
      void sphereContainer.getBoundingClientRect();
      sphereContainer.classList.add('wave-enter');
    }
  }, [], 0.02);

  // Start page-00 audio after the welcome layer is gone.
  setTimeout(async () => {
    try {
      const { getPageAudioManager } = await import('./media/PageAudioManager');
      const mgr = getPageAudioManager();
      await mgr.loadAndPlayPageAudio(scrollManager.getCurrentSection());
    } catch (error) {
      console.warn('⚠️ Could not start page audio after welcome:', error);
    }
  }, 120);

  // Text animation can start shortly after.
  setTimeout(async () => {
    const textAnimMod = await import('./utils/pageTextAnimation');
    textAnimMod.initPageTextAnimations();
  }, 150);

  console.log('✅ Main app initialized');
}

document.addEventListener('DOMContentLoaded', async () => {
  // During the welcome layer, keep the main app UI visually locked.
  // (Sidebar nav remains visible inside the welcome layer via CSS exception.)
  document.body.classList.add('app-intro');

  const startTime = performance.now();

  // Initialize analytics only if enabled
  if (ENABLE_ANALYTICS) {
    initAnalytics();
  } else {
    console.log('📊 Analytics disabled by configuration');
  }

  initErrorHandler();
  initKeyboardNavigation();
  initLoadingStates();
  initMobileUX();
  initPerformanceOptimizer();

  let mainAppBootstrapped = false;
  const startMainApp = () => {
    if (mainAppBootstrapped) return;
    mainAppBootstrapped = true;
    void bootstrapMainApp();
  };

  // Welcome layer (lazy-loaded so we don't pull the whole app graph up-front)
  const { WelcomeLayer } = await import('./components/WelcomeLayer');
  new WelcomeLayer(
    () => {
      // Fallback: if the welcome is skipped, this is the only signal we get.
      startMainApp();
    },
    () => {
      // On click: start prewarming immediately, but start the main app right after the
      // rings *visually* finish (they fade out around ~4s after reveal).
      void prewarmMainBlob();
      window.setTimeout(() => {
        startMainApp();
      }, 4700);
    }
  );

  initLanguageSwitcher();
  themeToggleInitPromise = initThemeToggle();
  updatePageTranslations();

  const loadTime = performance.now() - startTime;

  // Track timing only if analytics is enabled
  if (ENABLE_ANALYTICS) {
    trackTiming('page', 'dom_loaded', Math.round(loadTime));
  }

  // Service Worker Management
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      if (ENABLE_SERVICE_WORKER) {
        // Register service worker if enabled
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service worker registered:', registration.scope);
        } catch (error) {
          console.error('❌ Service worker registration failed:', error);
        }
      } else {
        // Unregister all service workers and clear caches if disabled
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('🗑️ Unregistered service worker:', registration.scope);
        }

        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('🗑️ Deleted cache:', cacheName);
        }

        console.log('✅ Service workers and caches disabled by configuration');
      }
    });
  }

  i18next.on('languageChanged', async (lng: string) => {
    console.log(`🌐 Language changed to: ${lng}`);
    scrollManager?.syncLanguageDirection(lng);
    setTimeout(async () => {
      scrollManager?.updateBlobPosition(true);
      const currentSection = scrollManager?.getCurrentSection() || 0;
      const { refreshPageTextAnimations } = await import('./utils/pageTextAnimation');
      refreshPageTextAnimations(currentSection);
    }, 50);
  });

  setupColorVariations();
  initSmoothScrolling();
  initScrollIndicator();
});

console.log(`
  ${t('console.welcome')}
  ${t('console.github')}
  
  ${t('console.tip_scroll')}
  ${t('console.tip_double_click')}
  ${t('console.tip_voice')}
  ${t('console.tip_music')}
`);


