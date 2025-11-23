import { describe, it, expect } from 'vitest';
import { isRTLLanguage, getTextDirection } from '../../utils/languageUtils';

describe('Language Utils', () => {
  describe('isRTLLanguage', () => {
    it('should return true for Arabic', () => {
      expect(isRTLLanguage('ar')).toBe(true);
    });

    it('should return true for Hebrew', () => {
      expect(isRTLLanguage('he')).toBe(true);
    });

    it('should return true for Persian/Farsi', () => {
      expect(isRTLLanguage('fa')).toBe(true);
    });

    it('should return true for Urdu', () => {
      expect(isRTLLanguage('ur')).toBe(true);
    });

    it('should return false for English', () => {
      expect(isRTLLanguage('en')).toBe(false);
    });

    it('should return false for Spanish', () => {
      expect(isRTLLanguage('es')).toBe(false);
    });

    it('should handle language codes with region', () => {
      expect(isRTLLanguage('ar-SA')).toBe(true);
      expect(isRTLLanguage('en-US')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isRTLLanguage('')).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('should return rtl for RTL languages', () => {
      expect(getTextDirection('ar')).toBe('rtl');
      expect(getTextDirection('he')).toBe('rtl');
    });

    it('should return ltr for LTR languages', () => {
      expect(getTextDirection('en')).toBe('ltr');
      expect(getTextDirection('es')).toBe('ltr');
    });
  });
});

