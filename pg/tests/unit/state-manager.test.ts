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

describe('State Manager', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  afterEach(() => {
    localStorage.clear();
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
      saveState('key1', 'value1');
      saveState('key2', 'value2');
      saveState('key3', 'value3');
      
      clearAllState();
      
      expect(loadState('key1', null)).toBeNull();
      expect(loadState('key2', null)).toBeNull();
      expect(loadState('key3', null)).toBeNull();
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

