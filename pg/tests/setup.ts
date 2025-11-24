/**
 * Vitest Setup
 * 
 * Global setup for unit tests
 */

import { vi } from 'vitest';

// Mock window.performance if not available
if (typeof window !== 'undefined' && !window.performance) {
  (window as any).performance = {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 10000000,
      jsHeapSizeLimit: 100000000
    }
  };
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});
