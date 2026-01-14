/**
 * Unit Tests for State Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveState,
  loadState,
  removeState,
  clearAllState,
  observeState,
  notifyStateChange
} from '../../src/core/state-manager';
import { STORAGE_KEYS } from '../../src/core/config';

describe('State Manager', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key in store) delete store[key];
      })
    });
    
    localStorage.clear();
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  describe('State Persistence', () => {
    it('should save and load state', () => {
      const testData = { foo: 'bar', num: 42 };
      saveState('test_key', testData);
      
      const loaded = loadState('test_key');
      expect(loaded).toEqual(testData);
    });
    
    it('should return default value when key not found', () => {
      const defaultValue = { default: true };
      const loaded = loadState('nonexistent_key', defaultValue);
      expect(loaded).toEqual(defaultValue);
    });
    
    it('should remove state', () => {
      saveState('test_key', { data: 'test' });
      removeState('test_key');
      
      const loaded = loadState('test_key', null);
      expect(loaded).toBeNull();
    });
    
    it('should clear all state', () => {
      saveState(STORAGE_KEYS.THEME, 'dark');
      saveState(STORAGE_KEYS.APP_COLOR, 'blue');
      
      // Save some unrelated state
      saveState('other_key', 'value');
      
      clearAllState();
      
      expect(loadState(STORAGE_KEYS.THEME, null)).toBeNull();
      expect(loadState(STORAGE_KEYS.APP_COLOR, null)).toBeNull();
      
      // Unrelated state should persist (or cleared if implementation changed, but currently it only clears STORAGE_KEYS)
      expect(loadState('other_key', null)).toEqual('value');
    });
  });
  
  describe('State Observers', () => {
    it('should notify observers on state change', () => {
      let called = false;
      let receivedNewState = null;
      let receivedOldState = null;
      
      const unsubscribe = observeState('test', (newState, oldState) => {
        called = true;
        receivedNewState = newState;
        receivedOldState = oldState;
      });
      
      const oldState = { value: 1 };
      const newState = { value: 2 };
      
      notifyStateChange('test', newState, oldState);
      
      expect(called).toBe(true);
      expect(receivedNewState).toEqual(newState);
      expect(receivedOldState).toEqual(oldState);
      
      unsubscribe();
    });
    
    it('should unsubscribe observer', () => {
      let callCount = 0;
      
      const unsubscribe = observeState('test', () => {
        callCount++;
      });
      
      notifyStateChange('test', {}, {});
      expect(callCount).toBe(1);
      
      unsubscribe();
      
      notifyStateChange('test', {}, {});
      expect(callCount).toBe(1); // Should not increment
    });
    
    it('should handle multiple observers', () => {
      let call1 = false;
      let call2 = false;
      
      observeState('test', () => { call1 = true; });
      observeState('test', () => { call2 = true; });
      
      notifyStateChange('test', {}, {});
      
      expect(call1).toBe(true);
      expect(call2).toBe(true);
    });
  });
});

