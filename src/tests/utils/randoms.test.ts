import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getRandomUUID,
  getRandomBetween,
  getRandomHexColor,
  getRandomBoolean,
  randomNumber,
  genDNA,
} from '../../utils/randoms';

describe('Random Utilities', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRandomUUID', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = getRandomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set();
      for (let i = 0; i < 100; i++) {
        uuids.add(getRandomUUID());
      }
      expect(uuids.size).toBe(100);
    });

    it('should always have 4 in the third section first position', () => {
      const uuid = getRandomUUID();
      expect(uuid.charAt(14)).toBe('4');
    });

    it('should have correct length (36 characters)', () => {
      const uuid = getRandomUUID();
      expect(uuid.length).toBe(36);
    });
  });

  describe('getRandomBetween', () => {
    it('should return a number between min and max', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomBetween(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('should respect decimal places', () => {
      const result = getRandomBetween(0, 1, 3);
      const decimalPlaces = (result.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(3);
    });

    it('should handle negative ranges', () => {
      const result = getRandomBetween(-10, -5, 2);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-5);
    });

    it('should use default values when no arguments provided', () => {
      const result = getRandomBetween();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should return min when Math.random returns 0', () => {
      vi.mocked(Math.random).mockReturnValue(0);
      const result = getRandomBetween(5, 10);
      expect(result).toBe(5);
    });

    it('should handle when min equals max', () => {
      const result = getRandomBetween(5, 5);
      expect(result).toBe(5);
    });
  });

  describe('getRandomHexColor', () => {
    it('should return a valid hex color', () => {
      const color = getRandomHexColor();
      const hexRegex = /^#[0-9a-f]{6}$/i;
      expect(color).toMatch(hexRegex);
    });

    it('should start with #', () => {
      const color = getRandomHexColor();
      expect(color.charAt(0)).toBe('#');
    });

    it('should be 7 characters long', () => {
      const color = getRandomHexColor();
      expect(color.length).toBe(7);
    });

    it('should pad with zeros for small values', () => {
      vi.mocked(Math.random).mockReturnValue(0);
      const color = getRandomHexColor();
      expect(color).toBe('#000000');
    });

    it('should generate different colors', () => {
      const colors = new Set();
      for (let i = 0; i < 50; i++) {
        colors.add(getRandomHexColor());
      }
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('getRandomBoolean', () => {
    it('should return a boolean', () => {
      const result = getRandomBoolean();
      expect(typeof result).toBe('boolean');
    });

    it('should return false when probability is 0', () => {
      const result = getRandomBoolean(0);
      expect(result).toBe(false);
    });

    it('should return true when probability is 1', () => {
      const result = getRandomBoolean(1);
      expect(result).toBe(true);
    });

    it('should respect probability (50% by default)', () => {
      vi.mocked(Math.random).mockReturnValue(0.4);
      expect(getRandomBoolean()).toBe(true);
      
      vi.mocked(Math.random).mockReturnValue(0.6);
      expect(getRandomBoolean()).toBe(false);
    });

    it('should respect custom probability', () => {
      vi.mocked(Math.random).mockReturnValue(0.7);
      expect(getRandomBoolean(0.8)).toBe(true);
      
      vi.mocked(Math.random).mockReturnValue(0.7);
      expect(getRandomBoolean(0.6)).toBe(false);
    });

    it('should generate both true and false over multiple calls', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(getRandomBoolean());
      }
      expect(results.size).toBe(2);
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });
  });

  describe('randomNumber', () => {
    it('should return a string of specified length', () => {
      const result = randomNumber(5);
      expect(result.length).toBe(5);
    });

    it('should contain only digits', () => {
      const result = randomNumber(10);
      expect(result).toMatch(/^\d+$/);
    });

    it('should handle length of 1', () => {
      const result = randomNumber(1);
      expect(result.length).toBe(1);
      expect(result).toMatch(/^\d$/);
    });

    it('should handle large lengths', () => {
      const result = randomNumber(15);
      expect(result.length).toBe(15);
    });

    it('should generate different numbers', () => {
      const numbers = new Set();
      for (let i = 0; i < 50; i++) {
        numbers.add(randomNumber(5));
      }
      expect(numbers.size).toBeGreaterThan(1);
    });
  });

  describe('genDNA', () => {
    it('should generate DNA string with correct format', () => {
      const dna = genDNA();
      const parts = dna.split('-');
      expect(parts.length).toBe(3);
    });

    it('should use default lengths (12-12-12)', () => {
      const dna = genDNA();
      const [x, y, z] = dna.split('-');
      expect(x.length).toBe(12);
      expect(y.length).toBe(12);
      expect(z.length).toBe(12);
    });

    it('should respect custom lengths', () => {
      const dna = genDNA(5, 7, 9);
      const [x, y, z] = dna.split('-');
      expect(x.length).toBe(5);
      expect(y.length).toBe(7);
      expect(z.length).toBe(9);
    });

    it('should contain only digits and dashes', () => {
      const dna = genDNA();
      expect(dna).toMatch(/^\d+-\d+-\d+$/);
    });

    it('should generate unique DNA strings', () => {
      const dnas = new Set();
      for (let i = 0; i < 100; i++) {
        dnas.add(genDNA());
      }
      expect(dnas.size).toBe(100);
    });

    it('should handle single digit lengths', () => {
      const dna = genDNA(1, 1, 1);
      const [x, y, z] = dna.split('-');
      expect(x.length).toBe(1);
      expect(y.length).toBe(1);
      expect(z.length).toBe(1);
    });
  });
});

