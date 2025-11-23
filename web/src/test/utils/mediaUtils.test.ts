import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMediaDisplayName, pickRandom, debounce, throttle } from '../../utils/mediaUtils';

describe('Media Utils', () => {
  describe('getMediaDisplayName', () => {
    it('should extract filename without extension', () => {
      const result = getMediaDisplayName('/music/song.mp3');
      expect(result).toBe('song');
    });

    it('should handle complex paths', () => {
      const result = getMediaDisplayName('/path/to/My Song - Artist.mp3');
      expect(result).toBe('My Song - Artist');
    });

    it('should handle files with multiple dots', () => {
      const result = getMediaDisplayName('/music/song.final.mp3');
      expect(result).toBe('song.final');
    });
  });

  describe('pickRandom', () => {
    it('should pick an item from array', () => {
      const items = ['a', 'b', 'c'];
      const result = pickRandom(items);
      expect(items).toContain(result);
    });

    it('should return null for empty array', () => {
      const result = pickRandom([]);
      expect(result).toBeNull();
    });

    it('should exclude specified items', () => {
      const items = ['a', 'b', 'c'];
      const exclude = new Set(['a', 'c']);
      const result = pickRandom(items, exclude);
      expect(result).toBe('b');
    });

    it('should return null when all items excluded', () => {
      const items = ['a', 'b'];
      const exclude = new Set(['a', 'b']);
      const result = pickRandom(items, exclude);
      expect(result).toBeNull();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should delay function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should limit function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});

