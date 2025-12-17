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

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', async function(this: HTMLButtonElement) {
      const alreadyActive = this.classList.contains('active');
      const tabType = this.getAttribute('data-tab');
      if (!tabType) {
        return;
      }

      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      triggerTabAnimation(this, tabType);

      const { getPageAudioManager } = await import('./media/PageAudioManager');
      const pageAudioManager = getPageAudioManager();

      if (tabType === 'music') {
        pageAudioManager.stopPageAudio();

        const { stopVoicePlayback } = await import('./media/VoicePlayer');
        stopVoicePlayback();

        const { stopVideoPlayback } = await import('./media/VideoPlayer');
        stopVideoPlayback(undefined, { preserveUrl: true });

        const { playRandomMusic } = await import('./media/MusicPlayer');
        await playRandomMusic();
      } else if (tabType === 'voice') {
        pageAudioManager.stopPageAudio();

        const { stopVideoPlayback } = await import('./media/VideoPlayer');
        stopVideoPlayback(undefined, { preserveUrl: true });

        const { toggleVoicePlayback, playRandomVoiceClip } = await import('./media/VoicePlayer');
        if (alreadyActive) {
          await toggleVoicePlayback();
        } else {
          await playRandomVoiceClip();
        }
      } else if (tabType === 'video') {
        pageAudioManager.stopPageAudio();

        const { stopKwamiAudio } = await import('./media/AudioController');
        stopKwamiAudio();

        const { toggleVideoPresentation, playRandomVideo } = await import('./media/VideoPlayer');
        if (alreadyActive) {
          await toggleVideoPresentation();
        } else {
          await playRandomVideo({ mode: 'background' });
        }
      }
    });
  });
}

function triggerTabAnimation(button: HTMLButtonElement, tabType: string) {
  const animationClass = `tab-anim-${tabType}`;
  button.classList.remove(animationClass);
  void button.offsetWidth;
  button.classList.add(animationClass);
  button.addEventListener('animationend', () => {
    button.classList.remove(animationClass);
  }, { once: true });
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

  const [
    scrollManagerMod,
    modeSwitcherMod,
    actionButtonMod,
    headerMenuMod,
    ringsMod,
    textAnimMod,
  ] = await Promise.all([
    import('./managers/ScrollManager'),
    import('./managers/ModeSwitcher'),
    import('./managers/ActionButtonManager'),
    import('./managers/HeaderMenuManager'),
    import('kwami/ui/rings'),
    import('./utils/pageTextAnimation'),
  ]);

  scrollManager = new scrollManagerMod.ScrollManager();
  new modeSwitcherMod.ModeSwitcher();
  new actionButtonMod.ActionButtonManager();
  new headerMenuMod.HeaderMenuManager();
  (window as any).scrollManager = scrollManager;

  // Initialize background rings after welcome layer
  const contentRight = document.querySelector('.content-right') as HTMLElement | null;
  const backgroundRings = ringsMod.createBackgroundRings({
    mount: contentRight ?? document.body,
    insert: 'first',
    zIndex: '0',
    sizeSource: 'mount',
    resize: 'auto',
    initialOpacity: 0,
  });

  setTimeout(() => {
    backgroundRings.show();
  }, 500);
  (window as any).backgroundRings = backgroundRings;

  // Initialize text animations after content is loaded
  setTimeout(() => {
    textAnimMod.initPageTextAnimations();
  }, 100);

  console.log('✅ Main app initialized');
}

document.addEventListener('DOMContentLoaded', async () => {
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
  initTabs();

  // Welcome layer (lazy-loaded so we don't pull the whole app graph up-front)
  const { WelcomeLayer } = await import('./components/WelcomeLayer');
  new WelcomeLayer(() => {
    void bootstrapMainApp();
  });

  initLanguageSwitcher();
  void initThemeToggle();
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


