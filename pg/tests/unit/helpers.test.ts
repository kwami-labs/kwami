/**
 * Unit Tests for Helper Functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
  debounce,
  throttle,
  clamp,
  lerp,
  mapRange,
  random,
  randomInt,
  shuffleArray,
  randomChoice,
  hexToRgb,
  rgbToHex,
  getLuminance,
  isValidHexColor
} from '../../src/utils/helpers';

describe('Utility Helpers', () => {
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      debounced();
      debounced();
      
      expect(fn).not.toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      
      throttled();
      throttled();
      throttled();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Math utilities', () => {
    it('should clamp values correctly', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
    
    it('should lerp between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 100, 0.25)).toBe(25);
      expect(lerp(10, 20, 1)).toBe(20);
    });
    
    it('should map ranges correctly', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(2.5, 0, 10, 0, 100)).toBe(25);
    });
    
    it('should generate random numbers in range', () => {
      const value = random(0, 10);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    });
    
    it('should generate random integers', () => {
      const value = randomInt(1, 10);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    });
  });
  
  describe('Array utilities', () => {
    it('should shuffle array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).not.toBe(original); // Different reference
      expect(shuffled.sort()).toEqual(original.sort()); // Same elements
    });
    
    it('should pick random element', () => {
      const array = [1, 2, 3, 4, 5];
      const choice = randomChoice(array);
      expect(array).toContain(choice);
    });
  });
  
  describe('Color utilities', () => {
    it('should validate hex colors', () => {
      expect(isValidHexColor('#FF0000')).toBe(true);
      expect(isValidHexColor('#f00')).toBe(false);
      expect(isValidHexColor('red')).toBe(false);
      expect(isValidHexColor('#GGGGGG')).toBe(false);
    });
    
    it('should convert hex to RGB', () => {
      const rgb = hexToRgb('#FF0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
      
      const rgb2 = hexToRgb('#00FF00');
      expect(rgb2).toEqual({ r: 0, g: 255, b: 0 });
    });
    
    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });
    
    it('should calculate luminance', () => {
      const whiteLum = getLuminance('#FFFFFF');
      const blackLum = getLuminance('#000000');
      
      expect(whiteLum).toBeGreaterThan(blackLum);
      expect(whiteLum).toBeCloseTo(1, 1);
      expect(blackLum).toBeCloseTo(0, 1);
    });
  });
});

