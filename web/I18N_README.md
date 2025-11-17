# Internationalization (i18n) Documentation

## Overview

The Kwami website now supports multiple languages using **i18next**, a powerful internationalization framework. The implementation supports:

- 🇬🇧 English (en) - Default
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)

## Architecture

### File Structure

```
web/
├── src/
│   ├── i18n.ts                 # i18n configuration and helper functions
│   ├── locales/
│   │   ├── en.json             # English translations
│   │   ├── es.json             # Spanish translations
│   │   └── fr.json             # French translations
│   ├── main.ts                 # Main app with i18n integration
│   └── style.css               # Includes language switcher styles
└── index.html                   # HTML with data-i18n attributes
```

### Dependencies

- `i18next` - Core i18n library
- `i18next-browser-languagedetector` - Automatic language detection

## Features

### 1. Automatic Language Detection

The application automatically detects the user's preferred language from:
1. Previously saved language preference (localStorage)
2. Browser's language settings

### 2. Language Persistence

The selected language is saved to localStorage as `kwami_language` and persists across sessions.

### 3. Dynamic Language Switching

Users can switch languages using the floating language switcher button in the bottom-right corner. The entire page updates instantly without requiring a reload.

### 4. Comprehensive Coverage

All user-facing text is translatable, including:
- Page title
- Section headings and descriptions
- Button labels
- Tab labels
- Console messages
- Action feedback messages
- Tooltips and aria-labels

## Usage

### For Developers

#### Adding a New Language

1. Create a new translation file in `src/locales/`:
   ```json
   // src/locales/de.json (German example)
   {
     "page": {
       "title": "Kwami - Dein Interaktiver KI-Begleiter"
     },
     // ... more translations
   }
   ```

2. Import and register in `src/i18n.ts`:
   ```typescript
   import de from './locales/de.json';
   
   // Add to resources
   resources: {
     en: { translation: en },
     es: { translation: es },
     fr: { translation: fr },
     de: { translation: de }  // Add new language
   },
   
   // Add to supported languages
   supportedLngs: ['en', 'es', 'fr', 'de'],
   ```

3. Add language option to `index.html`:
   ```html
   <button class="lang-option" data-lang="de">Deutsch</button>
   ```

#### Using Translations in TypeScript

```typescript
import { t } from './i18n';

// Simple translation
const message = t('messages.loading_music');

// Translation with interpolation
const greeting = t('messages.now_playing', { name: 'Song Name' });

// Change language programmatically
await changeLanguage('es');

// Get current language
const currentLang = getCurrentLanguage(); // Returns 'en', 'es', or 'fr'
```

#### Using Translations in HTML

```html
<!-- Simple text translation -->
<p data-i18n="sections.00.main">Default text</p>

<!-- Title attribute translation -->
<a data-i18n-title="header_links.playground">🎮</a>

<!-- Aria-label translation with interpolation -->
<button data-i18n-aria="nav.aria_navigate" data-section="01">
  Navigate
</button>

<!-- Gradient text (special handling) -->
<h1>
  <span class="emoji">👋</span>
  <span class="gradient-text" data-i18n="sections.00.title">
    Meet Kwami
  </span>
</h1>
```

### Translation Key Structure

The translation files follow a hierarchical structure:

```json
{
  "page": {           // Page metadata
    "title": "..."
  },
  "nav": {            // Navigation elements
    "aria_navigate": "..."
  },
  "tabs": {           // Bottom tabs
    "voice": "...",
    "music": "...",
    "video": "..."
  },
  "sections": {       // Content sections (00-21)
    "00": {
      "title": "...",
      "main": "...",
      "sub": "...",
      "button": "..."
    }
  },
  "messages": {       // Dynamic console/app messages
    "loading_music": "...",
    "now_playing": "..."
  },
  "console": {        // Console welcome messages
    "welcome": "...",
    "tip_scroll": "..."
  },
  "action_feedback": { // Button action feedback
    "launch_playground": "...",
    "view_demo": "..."
  }
}
```

## Language Switcher UI

The language switcher is a floating button positioned in the bottom-right corner:

- **Desktop**: Bottom-right at 2rem spacing
- **Mobile**: Adjusted to bottom: 7rem to avoid bottom tabs

### Customizing the Switcher

Edit `src/style.css` to modify the appearance:

```css
.language-switcher {
  position: fixed;
  bottom: 2rem;      /* Adjust vertical position */
  right: 2rem;       /* Adjust horizontal position */
  z-index: 10000;
}

.lang-btn {
  /* Customize button styles */
}

.lang-menu {
  /* Customize dropdown menu */
}
```

## Testing

### Manual Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Click the language switcher button (🌐 EN) in the bottom-right

4. Select a language from the dropdown

5. Verify all text updates correctly

### Testing in Different Languages

1. Change your browser's preferred language
2. Clear localStorage: `localStorage.removeItem('kwami_language')`
3. Reload the page
4. Verify the correct language is automatically selected

## Best Practices

### 1. Keep Translation Keys Consistent

Use descriptive, hierarchical keys:
```json
// ✅ Good
"sections.00.title": "Meet Kwami"

// ❌ Bad
"s0t": "Meet Kwami"
```

### 2. Use Interpolation for Dynamic Content

```json
// Translation file
"messages.now_playing": "✅ Now playing: {{name}}"

// TypeScript
t('messages.now_playing', { name: songName })
```

### 3. Preserve Emojis in Translations

Emojis are part of the brand identity. Keep them consistent:
```json
"button": "🚀 Launch Playground"
```

### 4. Test All Languages

After making changes, test all three languages to ensure:
- Text fits in the UI without overflow
- Special characters display correctly
- Grammar and context are appropriate

## Common Issues

### Issue: Translations not updating

**Solution**: Call `updatePageTranslations()` after language change or DOM updates.

### Issue: Language not persisting

**Solution**: Check browser localStorage permissions and ensure `localStorage.setItem()` is working.

### Issue: Text overflow in other languages

**Solution**: Some languages (like German or French) have longer words. Adjust CSS `max-width` or use `overflow: hidden` with `text-overflow: ellipsis`.

## Future Enhancements

Potential improvements for the i18n system:

1. **Add more languages**:
   - German (de)
   - Japanese (ja)
   - Chinese (zh)
   - Portuguese (pt)
   - Russian (ru)

2. **RTL language support**:
   - Add support for Arabic, Hebrew
   - Implement `dir="rtl"` attribute switching

3. **Translation management**:
   - Integrate with translation management platforms (e.g., Lokalise, Crowdin)
   - Automated translation validation

4. **Lazy loading**:
   - Load translation files only when needed
   - Reduce initial bundle size

5. **Pluralization**:
   - Add support for plural forms
   - Handle count-based translations

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languageDetector)
- [Translation JSON Format](https://www.i18next.com/misc/json-format)

## Contributing

To contribute translations:

1. Fork the repository
2. Add or update translation files in `src/locales/`
3. Test thoroughly in the UI
4. Submit a pull request with:
   - Language code and name
   - Native speaker verification (if possible)
   - Screenshots showing the translations in context

---

**Questions or issues?** Open an issue on GitHub or contact the Kwami team at hello@kwami.io

