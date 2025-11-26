/**
 * Unit Tests - Plugin System
 * 
 * Tests plugin registration, installation, and lifecycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManager, Plugin } from '../../src/core/plugin-system';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(async () => {
    manager = new PluginManager();
    await manager.initialize();
  });

  it('should initialize successfully', async () => {
    expect(manager).toBeDefined();
  });

  it('should register a plugin', async () => {
    const testPlugin: Plugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Test plugin'
      },
      install: vi.fn()
    };

    await manager.register(testPlugin);
    
    const available = manager.getAvailable();
    expect(available).toHaveLength(1);
    expect(available[0].name).toBe('test-plugin');
  });

  it('should not allow duplicate plugin registration', async () => {
    const testPlugin: Plugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Test plugin'
      },
      install: vi.fn()
    };

    await manager.register(testPlugin);
    
    await expect(manager.register(testPlugin)).rejects.toThrow('already registered');
  });

  it('should install a plugin', async () => {
    const installFn = vi.fn();
    const testPlugin: Plugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Test plugin'
      },
      install: installFn
    };

    await manager.register(testPlugin);
    await manager.install('test-plugin');
    
    expect(installFn).toHaveBeenCalled();
    expect(manager.isInstalled('test-plugin')).toBe(true);
  });

  it('should uninstall a plugin', async () => {
    const uninstallFn = vi.fn();
    const testPlugin: Plugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Test plugin'
      },
      install: vi.fn(),
      uninstall: uninstallFn
    };

    await manager.register(testPlugin);
    await manager.install('test-plugin');
    await manager.uninstall('test-plugin');
    
    expect(uninstallFn).toHaveBeenCalled();
    expect(manager.isInstalled('test-plugin')).toBe(false);
  });

  it('should call plugin hooks', async () => {
    const onInitFn = vi.fn();
    const testPlugin: Plugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Test plugin'
      },
      hooks: {
        onInit: onInitFn
      },
      install: vi.fn()
    };

    await manager.register(testPlugin);
    await manager.install('test-plugin');
    
    expect(onInitFn).toHaveBeenCalled();
  });

  it('should emit and listen to events', () => {
    const callback = vi.fn();
    manager.on('test-event', callback);
    
    manager.emit('test-event', { data: 'test' });
    
    expect(callback).toHaveBeenCalledWith({ data: 'test' });
  });

  it('should allow unsubscribing from events', () => {
    const callback = vi.fn();
    const unsubscribe = manager.on('test-event', callback);
    
    unsubscribe();
    manager.emit('test-event');
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should check plugin dependencies', async () => {
    const dependentPlugin: Plugin = {
      metadata: {
        name: 'dependent-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Dependent plugin',
        dependencies: ['non-existent-plugin']
      },
      install: vi.fn()
    };

    await expect(manager.register(dependentPlugin)).rejects.toThrow('requires dependency');
  });

  it('should get plugin metadata', async () => {
    const testPlugin: Plugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.5.9',
        author: 'Test',
        description: 'Test plugin'
      },
      install: vi.fn()
    };

    await manager.register(testPlugin);
    
    const metadata = manager.getMetadata('test-plugin');
    expect(metadata).toEqual(testPlugin.metadata);
  });

  it('should list installed plugins', async () => {
    const plugin1: Plugin = {
      metadata: {
        name: 'plugin-1',
        version: '1.5.9',
        author: 'Test',
        description: 'Plugin 1'
      },
      install: vi.fn()
    };

    const plugin2: Plugin = {
      metadata: {
        name: 'plugin-2',
        version: '1.5.9',
        author: 'Test',
        description: 'Plugin 2'
      },
      install: vi.fn()
    };

    await manager.register(plugin1);
    await manager.register(plugin2);
    await manager.install('plugin-1');
    await manager.install('plugin-2');
    
    const installed = manager.getInstalled();
    expect(installed).toHaveLength(2);
    expect(installed).toContain('plugin-1');
    expect(installed).toContain('plugin-2');
  });
});

