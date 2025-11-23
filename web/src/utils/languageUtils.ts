/**
 * Language Utilities
 */

import { RTL_LANGUAGES } from '../config/constants';

/**
 * Check if a language is RTL
 */
export function isRTLLanguage(language: string): boolean {
  if (!language) return false;
  const normalized = language.toLowerCase().split('-')[0];
  return RTL_LANGUAGES.includes(normalized);
}

/**
 * Get text direction for a language
 */
export function getTextDirection(language: string): 'ltr' | 'rtl' {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
}

/**
 * Set document direction
 */
export function setDocumentDirection(language: string): void {
  const dir = getTextDirection(language);
  document.documentElement.setAttribute('dir', dir);
}

