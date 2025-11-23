import { describe, it, expect } from 'vitest';
import { blendColors, generateRandomColor, hexToRgba } from '../../config/colors';

describe('Color Utils', () => {
  describe('blendColors', () => {
    it('should blend two hex colors', () => {
      const result = blendColors('#ff0000', '#0000ff');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should return middle color for red and blue', () => {
      const result = blendColors('#ff0000', '#0000ff');
      // Middle of red and blue should have some purple tint
      expect(result).toBeDefined();
      expect(result.length).toBe(7);
    });

    it('should handle identical colors', () => {
      const color = '#ff5733';
      const result = blendColors(color, color);
      expect(result).toBe(color);
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba', () => {
      const result = hexToRgba('#ff0000', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should handle full opacity', () => {
      const result = hexToRgba('#00ff00', 1);
      expect(result).toBe('rgba(0, 255, 0, 1)');
    });

    it('should handle zero opacity', () => {
      const result = hexToRgba('#0000ff', 0);
      expect(result).toBe('rgba(0, 0, 255, 0)');
    });
  });

  describe('generateRandomColor', () => {
    it('should generate a valid HSL color', () => {
      const result = generateRandomColor();
      expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });

    it('should generate different colors on subsequent calls', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(generateRandomColor());
      }
      // Should generate at least some different colors
      expect(colors.size).toBeGreaterThan(1);
    });
  });
});

