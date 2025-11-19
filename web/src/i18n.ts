import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import nl from './locales/nl.json';

// Initialize i18next
await i18next
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'zh', 'ko', 'ja', 'pt', 'it', 'ru', 'ar', 'nl'],
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      zh: { translation: zh },
      ko: { translation: ko },
      ja: { translation: ja },
      pt: { translation: pt },
      it: { translation: it },
      ru: { translation: ru },
      ar: { translation: ar },
      nl: { translation: nl }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kwami_language'
    },
    interpolation: {
      escapeValue: false // not needed for non-HTML usage
    }
  });

// Helper function to translate text
export function t(key: string, options?: Record<string, any>): string {
  return i18next.t(key, options);
}

// Helper function to change language
export function changeLanguage(lng: string): Promise<any> {
  return i18next.changeLanguage(lng);
}

// Helper function to get current language
export function getCurrentLanguage(): string {
  return i18next.language || 'en';
}

// Helper function to get available languages
export function getAvailableLanguages(): string[] {
  return ['en', 'es', 'fr', 'zh', 'ko', 'ja', 'pt', 'it', 'ru', 'ar', 'nl'];
}

// Update all elements with data-i18n attribute
export function updatePageTranslations() {
  // Update page title
  document.title = t('page.title');
  
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const htmlElement = element as HTMLElement;
      
      // Check if we need to preserve HTML (like emojis/spans)
      const innerHTML = htmlElement.innerHTML;
      const hasSpecialContent = innerHTML.includes('<span') || innerHTML.includes('emoji');
      
      if (hasSpecialContent) {
        // Extract and preserve special content (emojis, etc.)
        const emojiMatch = innerHTML.match(/<span class="emoji">[^<]*<\/span>/);
        const emoji = emojiMatch ? emojiMatch[0] : '';
        const gradientMatch = innerHTML.match(/<span class="gradient-text">.*?<\/span>/);
        
        if (gradientMatch) {
          // This is a title with emoji and gradient
          htmlElement.innerHTML = `${emoji} <span class="gradient-text">${t(key)}</span>`;
        } else if (emoji) {
          // Just emoji
          htmlElement.innerHTML = `${emoji} ${t(key)}`;
        }
      } else {
        // Simple text content
        htmlElement.textContent = t(key);
      }
    }
  });
  
  // Update aria-label attributes
  const ariaElements = document.querySelectorAll('[data-i18n-aria]');
  ariaElements.forEach((element) => {
    const key = element.getAttribute('data-i18n-aria');
    if (key) {
      const section = element.getAttribute('data-section');
      element.setAttribute('aria-label', t(key, { number: section }));
    }
  });
  
  // Update title attributes
  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      element.setAttribute('title', t(key));
    }
  });
}

// Helper to get messages array for a section
export function getSectionMessages(sectionNumber: string): string[] {
  const key = `sections.${sectionNumber}.messages`;
  const messages = i18next.t(key, { returnObjects: true });
  
  // Check if messages is an array
  if (Array.isArray(messages)) {
    return (messages as string[]).filter((msg) => typeof msg === "string");
  }
  
  // Fallback to empty array if not found
  return [];
}

// Language list configuration
const LANGUAGE_LIST = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' }
];

// Shared function to create language switcher HTML
export function createLanguageSwitcher(className = 'language-switcher'): HTMLElement {
  const container = document.createElement('div');
  container.className = className;

  const langBtn = document.createElement('button');
  langBtn.className = 'lang-btn';
  langBtn.setAttribute('aria-label', 'Change language');

  const langIcon = document.createElement('span');
  langIcon.className = 'lang-icon';
  // Set initial flag based on current language
  const currentLanguage = i18next.language.toLowerCase();
  const currentLangData = LANGUAGE_LIST.find(lang => lang.code === currentLanguage);
  langIcon.textContent = currentLangData?.flag || '🌐';

  const currentLang = document.createElement('span');
  currentLang.className = 'current-lang';
  currentLang.textContent = i18next.language.toUpperCase();

  langBtn.appendChild(langIcon);
  langBtn.appendChild(currentLang);

  const langMenu = document.createElement('div');
  langMenu.className = 'lang-menu';

  LANGUAGE_LIST.forEach(lang => {
    const option = document.createElement('button');
    option.className = 'lang-option';
    option.setAttribute('data-lang', lang.code);
    option.textContent = `${lang.flag} ${lang.name}`;
    
    option.addEventListener('click', async () => {
      await i18next.changeLanguage(lang.code);
      currentLang.textContent = lang.code.toUpperCase();
      langIcon.textContent = lang.flag; // Update flag icon
      langMenu.classList.remove('open');
      
      // Update text direction for RTL languages
      if (lang.code === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
      
      console.log(`🌐 Language changed to ${lang.name}`);
    });
    
    langMenu.appendChild(option);
  });

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) {
      langMenu.classList.remove('open');
    }
  });

  container.appendChild(langBtn);
  container.appendChild(langMenu);

  return container;
}

// Listen for language changes
i18next.on('languageChanged', () => {
  updatePageTranslations();
});

// Export i18next instance
export default i18next;

