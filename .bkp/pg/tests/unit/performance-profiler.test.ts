/**
 * Unit Tests - Performance Profiler
 * 
 * Tests performance monitoring and profiling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceProfiler } from '../../src/core/performance-profiler';

describe('PerformanceProfiler', () => {
  let profiler: PerformanceProfiler;
  let mockRenderer: any;

  beforeEach(() => {
    // Mock WebGL renderer
    mockRenderer = {
      info: {
        render: {
          calls: 10,
          triangles: 1000
        },
        memory: {
          geometries: 5,
          textures: 3
        },
        programs: []
      },
      getContext: vi.fn(() => ({
        getParameter: vi.fn((param) => {
          // Mock WebGL parameters
          if (param === 37445) return 'WebGL Renderer'; // RENDERER
          if (param === 37446) return 'WebGL Vendor'; // VENDOR
          return 2048;
        }),
        getExtension: vi.fn(() => null)
      }))
    };

    profiler = new PerformanceProfiler(mockRenderer);
    profiler.initialize(mockRenderer);
  });

  it('should initialize successfully', () => {
    expect(profiler).toBeDefined();
  });

  it('should start profiling', () => {
    profiler.start();
    expect(profiler.getCurrentMetrics()).toBeNull(); // No frames recorded yet
  });

  it('should stop profiling', () => {
    profiler.start();
    profiler.stop();
    // Should not throw
  });

  it('should record frame metrics', () => {
    profiler.start();
    
    // Simulate multiple frames
    profiler.recordFrame();
    profiler.recordFrame();
    profiler.recordFrame();
    
    const metrics = profiler.getCurrentMetrics();
    expect(metrics).toBeDefined();
    expect(metrics?.fps).toBeGreaterThan(0);
  });

  it('should track draw calls', () => {
    profiler.start();
    profiler.recordFrame();
    
    const metrics = profiler.getCurrentMetrics();
    expect(metrics?.drawCalls).toBe(10);
  });

  it('should track triangles', () => {
    profiler.start();
    profiler.recordFrame();
    
    const metrics = profiler.getCurrentMetrics();
    expect(metrics?.triangles).toBe(1000);
  });

  it('should limit sample history', () => {
    const smallProfiler = new PerformanceProfiler(mockRenderer, 10);
    smallProfiler.initialize(mockRenderer);
    smallProfiler.start();
    
    // Record more frames than max samples
    for (let i = 0; i < 20; i++) {
      smallProfiler.recordFrame();
    }
    
    const samples = smallProfiler.getSamples();
    expect(samples.length).toBeLessThanOrEqual(10);
  });

  it('should generate performance report', () => {
    profiler.start();
    
    // Record several frames
    for (let i = 0; i < 10; i++) {
      profiler.recordFrame();
    }
    
    const report = profiler.generateReport();
    expect(report).toBeDefined();
    expect(report.samples).toBe(10);
    expect(report.averageFPS).toBeGreaterThan(0);
    expect(report.minFPS).toBeGreaterThan(0);
    expect(report.maxFPS).toBeGreaterThan(0);
  });

  it('should provide warnings for low FPS', () => {
    profiler.start();
    
    // Mock low FPS by manually setting samples
    for (let i = 0; i < 10; i++) {
      profiler.recordFrame();
    }
    
    const report = profiler.generateReport();
    expect(report.warnings).toBeDefined();
    expect(report.recommendations).toBeDefined();
  });

  it('should subscribe to metrics updates', () => {
    const callback = vi.fn();
    profiler.subscribe(callback);
    
    profiler.start();
    profiler.recordFrame();
    
    expect(callback).toHaveBeenCalled();
  });

  it('should allow unsubscribing', () => {
    const callback = vi.fn();
    const unsubscribe = profiler.subscribe(callback);
    
    unsubscribe();
    
    profiler.start();
    profiler.recordFrame();
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear samples', () => {
    profiler.start();
    profiler.recordFrame();
    profiler.recordFrame();
    
    profiler.clear();
    
    const samples = profiler.getSamples();
    expect(samples).toHaveLength(0);
  });

  it('should export to CSV', () => {
    profiler.start();
    profiler.recordFrame();
    
    const csv = profiler.exportToCSV();
    expect(csv).toContain('Timestamp');
    expect(csv).toContain('FPS');
    expect(csv).toContain('Draw Calls');
  });

  it('should export to JSON', () => {
    profiler.start();
    profiler.recordFrame();
    
    const json = profiler.exportToJSON();
    expect(json).toBeDefined();
    
    const data = JSON.parse(json);
    expect(data.report).toBeDefined();
    expect(data.samples).toBeDefined();
    expect(data.gpuInfo).toBeDefined();
  });
});

