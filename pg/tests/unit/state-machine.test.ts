/**
 * Unit Tests - Blob State Machine
 * 
 * Tests state machine transitions and behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlobStateMachineService, BlobState } from '../../src/core/blob-state-machine';

describe('BlobStateMachineService', () => {
  let machine: BlobStateMachineService;

  beforeEach(() => {
    machine = new BlobStateMachineService();
    machine.start();
  });

  it('should start in idle state', () => {
    expect(machine.getCurrentState()).toBe('idle');
  });

  it('should transition from idle to listening', () => {
    machine.startListening();
    expect(machine.getCurrentState()).toBe('listening');
  });

  it('should transition from listening to thinking', () => {
    machine.startListening();
    machine.startThinking();
    expect(machine.getCurrentState()).toBe('thinking');
  });

  it('should transition from thinking to speaking', () => {
    machine.startListening();
    machine.startThinking();
    machine.startSpeaking();
    expect(machine.getCurrentState()).toBe('speaking');
  });

  it('should transition to error state', () => {
    machine.error('Test error');
    expect(machine.getCurrentState()).toBe('error');
    expect(machine.getContext().errorMessage).toBe('Test error');
  });

  it('should recover from error state', () => {
    machine.error('Test error');
    machine.recover();
    expect(machine.getCurrentState()).toBe('idle');
    expect(machine.getContext().errorMessage).toBeNull();
  });

  it('should minimize and restore', () => {
    machine.minimize();
    expect(machine.getCurrentState()).toBe('minimized');
    
    machine.restore();
    expect(machine.getCurrentState()).toBe('idle');
  });

  it('should stop and reset to idle', () => {
    machine.startListening();
    machine.stopAndReset();
    expect(machine.getCurrentState()).toBe('idle');
  });

  it('should update audio level', () => {
    machine.updateAudioLevel(0.75);
    expect(machine.getContext().audioLevel).toBe(0.75);
  });

  it('should track state history', () => {
    machine.startListening();
    machine.startThinking();
    machine.startSpeaking();
    
    const history = machine.getStateHistory();
    expect(history).toContain('listening');
    expect(history).toContain('thinking');
    expect(history).toContain('speaking');
  });

  it('should check if in specific state', () => {
    machine.startListening();
    expect(machine.isInState('listening')).toBe(true);
    expect(machine.isInState('thinking')).toBe(false);
  });

  it('should notify subscribers on state change', () => {
    const callback = vi.fn();
    machine.subscribe(callback);
    
    machine.startListening();
    
    expect(callback).toHaveBeenCalled();
  });

  it('should allow unsubscribing', () => {
    const callback = vi.fn();
    const unsubscribe = machine.subscribe(callback);
    
    unsubscribe();
    machine.startListening();
    
    expect(callback).not.toHaveBeenCalled();
  });
});

