import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import el from './locales/el.json';
import de from './locales/de.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import uk from './locales/uk.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import id from './locales/id.json';
import th from './locales/th.json';
import af from './locales/af.json';
import ak from './locales/ak.json';
import ig from './locales/ig.json';
import yo from './locales/yo.json';
import am from './locales/am.json';
import ha from './locales/ha.json';
import sw from './locales/sw.json';
import he from './locales/he.json';
import ar from './locales/ar.json';
import fa from './locales/fa.json';
import ur from './locales/ur.json';

// Initialize i18next
await i18next
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt', 'fr', 'it', 'el', 'de', 'nl', 'pl', 'uk', 'ru', 'zh', 'ja', 'ko', 'hi', 'bn', 'id', 'th', 'af', 'ak', 'ig', 'yo', 'am', 'ha', 'sw', 'he', 'ar', 'fa', 'ur'],
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      fr: { translation: fr },
      it: { translation: it },
      el: { translation: el },
      de: { translation: de },
      nl: { translation: nl },
      pl: { translation: pl },
      uk: { translation: uk },
      ru: { translation: ru },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      hi: { translation: hi },
      bn: { translation: bn },
      id: { translation: id },
      th: { translation: th },
      af: { translation: af },
      ak: { translation: ak },
      ig: { translation: ig },
      yo: { translation: yo },
      am: { translation: am },
      ha: { translation: ha },
      sw: { translation: sw },
      he: { translation: he },
      ar: { translation: ar },
      fa: { translation: fa },
      ur: { translation: ur }
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
  return ['en', 'es', 'pt', 'fr', 'it', 'el', 'de', 'nl', 'pl', 'uk', 'ru', 'zh', 'ja', 'ko', 'hi', 'bn', 'id', 'th', 'af', 'ak', 'ig', 'yo', 'am', 'ha', 'sw', 'he', 'ar', 'fa', 'ur'];
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
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'bn', flag: '🇧🇩', name: 'বাংলা' },
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { code: 'th', flag: '🇹🇭', name: 'ไทย' },
  { code: 'af', flag: '🇿🇦', name: 'Afrikaans' },
  { code: 'ak', flag: '🇬🇭', name: 'Akan' },
  { code: 'ig', flag: '🇳🇬', name: 'Igbo' },
  { code: 'yo', flag: '🇳🇬', name: 'Yorùbá' },
  { code: 'am', flag: '🇪🇹', name: 'አማርኛ' },
  { code: 'ha', flag: '🇳🇬', name: 'Hausa' },
  { code: 'sw', flag: '🇰🇪', name: 'Kiswahili' },
  { code: 'he', flag: '🇮🇱', name: 'עברית' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'fa', flag: '🇮🇷', name: 'فارسی' },
  { code: 'ur', flag: '🇵🇰', name: 'اردو' }
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
      if (['ar', 'he', 'fa', 'ur'].includes(lang.code)) {
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

