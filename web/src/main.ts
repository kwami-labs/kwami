import './style.css';
import './components/welcome-layer.css';
import './accessibility.css';
import './loading.css';
import './mobile.css';
import { t, getCurrentLanguage, updatePageTranslations, createLanguageSwitcher } from './i18n';
import { WelcomeLayer } from './components/WelcomeLayer';
import { BackgroundRings } from './components/BackgroundRings';
import i18next from './i18n';
import { initAnalytics, trackTiming } from './analytics';
import { initErrorHandler } from './error-handler';
import { initKeyboardNavigation } from './keyboard-navigation';
import { initLoadingStates } from './loading';
import { initMobileUX } from './mobile';
import { initPerformanceOptimizer } from './performance';
import { ScrollManager } from './managers/ScrollManager';
import { ModeSwitcher } from './managers/ModeSwitcher';
import { ActionButtonManager } from './managers/ActionButtonManager';
import { HeaderMenuManager } from './managers/HeaderMenuManager';
import { playRandomMusic } from './media/MusicPlayer';
import { playRandomVoiceClip, toggleVoicePlayback, stopVoicePlayback } from './media/VoicePlayer';
import { playRandomVideo, stopVideoPlayback, toggleVideoPresentation } from './media/VideoPlayer';
import { stopKwamiAudio } from './media/AudioController';
import { generateRandomColor } from './config/colors';
import { isRTLLanguage } from './utils/languageUtils';
import { getPageAudioManager } from './media/PageAudioManager';
import { getThemeModeManager } from './managers/ThemeModeManager';
import { initPageTextAnimations, refreshPageTextAnimations } from './utils/pageTextAnimation';
import { ENABLE_SERVICE_WORKER, ENABLE_ANALYTICS } from './config/app';

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

function initThemeToggle() {
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

      const pageAudioManager = getPageAudioManager();

      if (tabType === 'music') {
        pageAudioManager.stopPageAudio();
        stopVoicePlayback();
        stopVideoPlayback(undefined, { preserveUrl: true });
        await playRandomMusic();
      } else if (tabType === 'voice') {
        pageAudioManager.stopPageAudio();
        stopVideoPlayback(undefined, { preserveUrl: true });
        if (alreadyActive) {
          await toggleVoicePlayback();
        } else {
          await playRandomVoiceClip();
        }
      } else if (tabType === 'video') {
        pageAudioManager.stopPageAudio();
        stopKwamiAudio();
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

document.addEventListener('DOMContentLoaded', () => {
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

  new WelcomeLayer(() => {
    console.log('🎬 Welcome layer complete, initializing main app');
    scrollManager = new ScrollManager();
    new ModeSwitcher();
    new ActionButtonManager();
    (window as any).scrollManager = scrollManager;
    
    // Initialize background rings after welcome layer
    const backgroundRings = new BackgroundRings();
    backgroundRings.setOpacity(0);
    setTimeout(() => {
      backgroundRings.show();
    }, 500);
    (window as any).backgroundRings = backgroundRings;
    
    // Initialize text animations after content is loaded
    setTimeout(() => {
      initPageTextAnimations();
    }, 100);
    
    console.log('✅ Main app initialized');
  });

  initLanguageSwitcher();
  initThemeToggle();
  new HeaderMenuManager();
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

  i18next.on('languageChanged', (lng: string) => {
    console.log(`🌐 Language changed to: ${lng}`);
    scrollManager?.syncLanguageDirection(lng);
    setTimeout(() => {
      scrollManager?.updateBlobPosition(true);
      // Refresh text animations when language changes
      const currentSection = scrollManager?.getCurrentSection() || 0;
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


