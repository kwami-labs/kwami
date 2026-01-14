/**
 * WebGL Performance Profiler
 * 
 * Monitors and profiles WebGL rendering performance
 * Tracks FPS, draw calls, memory usage, and more
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  memory: MemoryMetrics;
  gpu: GPUMetrics;
}

export interface MemoryMetrics {
  used: number;
  limit: number;
  percentage: number;
}

export interface GPUMetrics {
  renderer: string;
  vendor: string;
  maxTextureSize: number;
  maxCubeMapTextureSize: number;
  maxVertexAttribs: number;
  maxFragmentUniforms: number;
  maxVertexUniforms: number;
}

export interface PerformanceSample {
  timestamp: number;
  metrics: PerformanceMetrics;
}

export interface PerformanceReport {
  duration: number;
  samples: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  averageFrameTime: number;
  averageDrawCalls: number;
  memoryTrend: 'increasing' | 'decreasing' | 'stable';
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// PERFORMANCE PROFILER
// ============================================================================

export class PerformanceProfiler {
  private renderer: any; // THREE.WebGLRenderer
  private enabled: boolean;
  private samples: PerformanceSample[];
  private maxSamples: number;
  private lastFrameTime: number;
  private frameTimes: number[];
  private gpuInfo: GPUMetrics | null;
  private startTime: number;
  private listeners: Set<(metrics: PerformanceMetrics) => void>;

  constructor(renderer?: any, maxSamples: number = 300) {
    this.renderer = renderer;
    this.enabled = false;
    this.samples = [];
    this.maxSamples = maxSamples;
    this.lastFrameTime = 0;
    this.frameTimes = [];
    this.gpuInfo = null;
    this.startTime = 0;
    this.listeners = new Set();
  }

  /**
   * Initialize profiler
   */
  initialize(renderer: any): void {
    this.renderer = renderer;
    this.gpuInfo = this.getGPUInfo();
    console.log('[Performance Profiler] Initialized');
    console.log('[GPU Info]', this.gpuInfo);
  }

  /**
   * Start profiling
   */
  start(): void {
    if (this.enabled) {
      console.warn('[Performance Profiler] Already started');
      return;
    }

    this.enabled = true;
    this.samples = [];
    this.frameTimes = [];
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;

    console.log('[Performance Profiler] Started');
  }

  /**
   * Stop profiling
   */
  stop(): void {
    if (!this.enabled) {
      console.warn('[Performance Profiler] Not started');
      return;
    }

    this.enabled = false;
    console.log('[Performance Profiler] Stopped');
  }

  /**
   * Record frame metrics
   */
  recordFrame(): void {
    if (!this.enabled || !this.renderer) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate FPS
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;

    // Get renderer info
    const info = this.renderer.info;
    
    // Get memory info
    const memory = this.getMemoryMetrics();

    const metrics: PerformanceMetrics = {
      fps: Math.round(fps),
      frameTime: Math.round(frameTime * 100) / 100,
      drawCalls: info.render?.calls || 0,
      triangles: info.render?.triangles || 0,
      geometries: info.memory?.geometries || 0,
      textures: info.memory?.textures || 0,
      programs: info.programs?.length || 0,
      memory,
      gpu: this.gpuInfo || this.getGPUInfo()
    };

    // Store sample
    const sample: PerformanceSample = {
      timestamp: now,
      metrics
    };

    this.samples.push(sample);

    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // Notify listeners
    this.notifyListeners(metrics);
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    if (this.samples.length === 0) return null;
    return this.samples[this.samples.length - 1].metrics;
  }

  /**
   * Get all samples
   */
  getSamples(): PerformanceSample[] {
    return [...this.samples];
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    if (this.samples.length === 0) {
      throw new Error('No samples collected');
    }

    const duration = performance.now() - this.startTime;
    const fpsSamples = this.samples.map(s => s.metrics.fps);
    const frameTimeSamples = this.samples.map(s => s.metrics.frameTime);
    const drawCallSamples = this.samples.map(s => s.metrics.drawCalls);
    const memorySamples = this.samples.map(s => s.metrics.memory.used);

    // Calculate statistics
    const averageFPS = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length);
    const minFPS = Math.min(...fpsSamples);
    const maxFPS = Math.max(...fpsSamples);
    const averageFrameTime = Math.round((frameTimeSamples.reduce((a, b) => a + b, 0) / frameTimeSamples.length) * 100) / 100;
    const averageDrawCalls = Math.round(drawCallSamples.reduce((a, b) => a + b, 0) / drawCallSamples.length);

    // Analyze memory trend
    const memoryTrend = this.analyzeMemoryTrend(memorySamples);

    // Generate warnings and recommendations
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (averageFPS < 30) {
      warnings.push('Average FPS is below 30 - poor performance');
      recommendations.push('Consider reducing mesh complexity or particle count');
      recommendations.push('Disable expensive post-processing effects');
    } else if (averageFPS < 50) {
      warnings.push('Average FPS is below 50 - suboptimal performance');
      recommendations.push('Review shader complexity and draw calls');
    }

    if (minFPS < 20) {
      warnings.push('FPS drops below 20 - severe frame stuttering detected');
      recommendations.push('Profile and optimize bottlenecks in render loop');
    }

    if (averageDrawCalls > 200) {
      warnings.push(`High draw call count: ${averageDrawCalls} average`);
      recommendations.push('Consider instancing or merging geometries');
    }

    if (memoryTrend === 'increasing') {
      warnings.push('Memory usage is increasing - possible memory leak');
      recommendations.push('Check for unreleased resources (geometries, textures, materials)');
    }

    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics && currentMetrics.memory.percentage > 80) {
      warnings.push('Memory usage is above 80%');
      recommendations.push('Reduce texture sizes or implement texture atlases');
      recommendations.push('Dispose unused geometries and materials');
    }

    return {
      duration,
      samples: this.samples.length,
      averageFPS,
      minFPS,
      maxFPS,
      averageFrameTime,
      averageDrawCalls,
      memoryTrend,
      warnings,
      recommendations
    };
  }

  /**
   * Clear all samples
   */
  clear(): void {
    this.samples = [];
    this.frameTimes = [];
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    console.log('[Performance Profiler] Cleared');
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(metrics: PerformanceMetrics): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('[Performance Profiler] Error in listener:', error);
      }
    });
  }

  /**
   * Get GPU information
   */
  private getGPUInfo(): GPUMetrics {
    if (!this.renderer) {
      return {
        renderer: 'Unknown',
        vendor: 'Unknown',
        maxTextureSize: 0,
        maxCubeMapTextureSize: 0,
        maxVertexAttribs: 0,
        maxFragmentUniforms: 0,
        maxVertexUniforms: 0
      };
    }

    const gl = this.renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    return {
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
    };
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics(): MemoryMetrics {
    const memory = (performance as any).memory;

    if (memory) {
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }

    return {
      used: 0,
      limit: 0,
      percentage: 0
    };
  }

  /**
   * Analyze memory trend
   */
  private analyzeMemoryTrend(samples: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (samples.length < 10) return 'stable';

    const firstHalf = samples.slice(0, Math.floor(samples.length / 2));
    const secondHalf = samples.slice(Math.floor(samples.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% change threshold

    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Export metrics to CSV
   */
  exportToCSV(): string {
    const headers = [
      'Timestamp',
      'FPS',
      'Frame Time (ms)',
      'Draw Calls',
      'Triangles',
      'Geometries',
      'Textures',
      'Programs',
      'Memory Used (MB)',
      'Memory Limit (MB)',
      'Memory %'
    ];

    const rows = this.samples.map(sample => {
      const m = sample.metrics;
      return [
        sample.timestamp,
        m.fps,
        m.frameTime,
        m.drawCalls,
        m.triangles,
        m.geometries,
        m.textures,
        m.programs,
        m.memory.used,
        m.memory.limit,
        m.memory.percentage
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Export metrics to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      report: this.generateReport(),
      samples: this.samples,
      gpuInfo: this.gpuInfo
    }, null, 2);
  }
}

// ============================================================================
// PERFORMANCE HUD
// ============================================================================

export class PerformanceHUD {
  private profiler: PerformanceProfiler;
  private container: HTMLElement | null;
  private enabled: boolean;
  private updateInterval: NodeJS.Timeout | null;

  constructor(profiler: PerformanceProfiler) {
    this.profiler = profiler;
    this.container = null;
    this.enabled = false;
    this.updateInterval = null;
  }

  /**
   * Show HUD
   */
  show(target?: HTMLElement): void {
    if (this.enabled) return;

    this.container = this.createHUD();
    const parent = target || document.body;
    parent.appendChild(this.container);

    this.enabled = true;

    // Update HUD every 500ms
    this.updateInterval = setInterval(() => {
      this.update();
    }, 500);

    console.log('[Performance HUD] Shown');
  }

  /**
   * Hide HUD
   */
  hide(): void {
    if (!this.enabled) return;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.enabled = false;

    console.log('[Performance HUD] Hidden');
  }

  /**
   * Create HUD element
   */
  private createHUD(): HTMLElement {
    const hud = document.createElement('div');
    hud.id = 'performance-hud';
    hud.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      min-width: 200px;
      pointer-events: none;
    `;

    hud.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: bold; color: #fff;">⚡ Performance</div>
      <div id="perf-fps">FPS: --</div>
      <div id="perf-frame-time">Frame: -- ms</div>
      <div id="perf-draw-calls">Draw Calls: --</div>
      <div id="perf-triangles">Triangles: --</div>
      <div id="perf-memory">Memory: -- MB / -- MB</div>
      <div id="perf-memory-percent">-- %</div>
    `;

    return hud;
  }

  /**
   * Update HUD with latest metrics
   */
  private update(): void {
    if (!this.container) return;

    const metrics = this.profiler.getCurrentMetrics();
    if (!metrics) return;

    const fpsColor = metrics.fps >= 50 ? '#00ff00' : metrics.fps >= 30 ? '#ffff00' : '#ff0000';

    this.updateElement('perf-fps', `FPS: ${metrics.fps}`, fpsColor);
    this.updateElement('perf-frame-time', `Frame: ${metrics.frameTime.toFixed(2)} ms`);
    this.updateElement('perf-draw-calls', `Draw Calls: ${metrics.drawCalls}`);
    this.updateElement('perf-triangles', `Triangles: ${metrics.triangles.toLocaleString()}`);
    this.updateElement('perf-memory', `Memory: ${metrics.memory.used} MB / ${metrics.memory.limit} MB`);
    
    const memColor = metrics.memory.percentage < 70 ? '#00ff00' : metrics.memory.percentage < 85 ? '#ffff00' : '#ff0000';
    this.updateElement('perf-memory-percent', `${metrics.memory.percentage}%`, memColor);
  }

  /**
   * Update individual element
   */
  private updateElement(id: string, text: string, color?: string): void {
    const element = this.container?.querySelector(`#${id}`);
    if (element) {
      element.textContent = text;
      if (color) {
        (element as HTMLElement).style.color = color;
      }
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let profilerInstance: PerformanceProfiler | null = null;
let hudInstance: PerformanceHUD | null = null;

export function getPerformanceProfiler(): PerformanceProfiler {
  if (!profilerInstance) {
    profilerInstance = new PerformanceProfiler();
  }
  return profilerInstance;
}

export function getPerformanceHUD(): PerformanceHUD {
  if (!hudInstance) {
    hudInstance = new PerformanceHUD(getPerformanceProfiler());
  }
  return hudInstance;
}

export function resetPerformanceProfiler(): void {
  if (hudInstance) {
    hudInstance.hide();
    hudInstance = null;
  }
  
  if (profilerInstance) {
    profilerInstance.stop();
    profilerInstance = null;
  }
}


