/**
 * Theme Customization Module
 * 
 * Provides theme switching, performance monitoring, and visual enhancements
 */

import { trackEvent } from './analytics';

export type ThemeName = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'purple';

export class ThemeManager {
  private currentTheme: ThemeName = 'indigo';
  private themes: ThemeName[] = ['indigo', 'rose', 'emerald', 'amber', 'cyan', 'purple'];
  private performanceMode: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize theme manager
   */
  private init(): void {
    console.log('🎨 Initializing theme manager...');

    // Load saved theme
    this.loadSavedTheme();

    // Create theme switcher
    this.createThemeSwitcher();

    // Create performance indicator
    this.createPerformanceIndicator();

    // Monitor performance
    this.monitorPerformance();

    // Apply initial theme
    this.applyTheme(this.currentTheme);

    console.log('✅ Theme manager initialized');
  }

  /**
   * Load saved theme from localStorage
   */
  private loadSavedTheme(): void {
    const saved = localStorage.getItem('kwami-theme');
    if (saved && this.themes.includes(saved as ThemeName)) {
      this.currentTheme = saved as ThemeName;
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: ThemeName): void {
    localStorage.setItem('kwami-theme', theme);
  }

  /**
   * Create theme switcher UI
   */
  private createThemeSwitcher(): void {
    const container = document.createElement('div');
    container.className = 'theme-switcher';

    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.innerHTML = '🎨';
    toggle.setAttribute('aria-label', 'Toggle theme palette');
    toggle.setAttribute('aria-expanded', 'false');

    // Palette container
    const palette = document.createElement('div');
    palette.className = 'theme-palette';
    palette.setAttribute('role', 'menu');

    // Add theme colors
    this.themes.forEach((theme) => {
      const color = document.createElement('button');
      color.className = `theme-color ${theme}`;
      color.setAttribute('data-theme', theme);
      color.setAttribute('aria-label', `${theme} theme`);
      color.setAttribute('role', 'menuitem');

      if (theme === this.currentTheme) {
        color.classList.add('active');
      }

      color.addEventListener('click', () => {
        this.setTheme(theme);
      });

      palette.appendChild(color);
    });

    // Toggle palette
    toggle.addEventListener('click', () => {
      const isExpanded = palette.classList.toggle('show');
      toggle.setAttribute('aria-expanded', isExpanded.toString());
      trackEvent('theme', 'palette', isExpanded ? 'opened' : 'closed');
    });

    container.appendChild(toggle);
    container.appendChild(palette);
    document.body.appendChild(container);
  }

  /**
   * Set theme
   */
  public setTheme(theme: ThemeName): void {
    if (!this.themes.includes(theme)) {
      console.error('Invalid theme:', theme);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);

    // Update active state
    document.querySelectorAll('.theme-color').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-theme') === theme);
    });

    trackEvent('theme', 'change', theme);
  }

  /**
   * Apply theme
   */
  private applyTheme(theme: ThemeName): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add('theme-transitioning');

    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 500);
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  /**
   * Cycle to next theme
   */
  public nextTheme(): void {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex]);
  }

  /**
   * Create performance indicator
   */
  private createPerformanceIndicator(): void {
    const indicator = document.createElement('div');
    indicator.id = 'performance-indicator';
    indicator.className = 'performance-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');

    indicator.innerHTML = `
      <span class="performance-indicator-icon">⚡</span>
      <span class="performance-indicator-text">Good performance</span>
    `;

    document.body.appendChild(indicator);

    // Show briefly on load
    setTimeout(() => {
      indicator.classList.add('show');
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 3000);
    }, 1000);
  }

  /**
   * Monitor performance
   */
  private monitorPerformance(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;
    let fps = 60;

    const measureFPS = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;

        this.updatePerformanceIndicator(fps);
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Monitor long tasks
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration + 'ms');
            trackEvent('performance', 'long_task', Math.round(entry.duration).toString());
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // PerformanceLongTaskTiming might not be supported
    }
  }

  /**
   * Update performance indicator
   */
  private updatePerformanceIndicator(fps: number): void {
    const indicator = document.getElementById('performance-indicator');
    if (!indicator) return;

    let status: 'good' | 'medium' | 'poor';
    let text: string;
    let icon: string;

    if (fps >= 55) {
      status = 'good';
      text = 'Excellent performance';
      icon = '⚡';
    } else if (fps >= 30) {
      status = 'medium';
      text = 'Good performance';
      icon = '⚠️';
    } else {
      status = 'poor';
      text = 'Performance issues';
      icon = '🐌';
    }

    indicator.className = `performance-indicator ${status}`;
    indicator.querySelector('.performance-indicator-text')!.textContent = `${text} (${fps} FPS)`;
    indicator.querySelector('.performance-indicator-icon')!.textContent = icon;

    // Enable performance mode if FPS drops
    if (fps < 30 && !this.performanceMode) {
      this.enablePerformanceMode();
    } else if (fps >= 55 && this.performanceMode) {
      this.disablePerformanceMode();
    }
  }

  /**
   * Enable performance mode (reduce animations)
   */
  private enablePerformanceMode(): void {
    this.performanceMode = true;
    document.body.classList.add('performance-mode');
    console.warn('⚡ Performance mode enabled');
    trackEvent('performance', 'mode', 'enabled');
  }

  /**
   * Disable performance mode
   */
  private disablePerformanceMode(): void {
    this.performanceMode = false;
    document.body.classList.remove('performance-mode');
    console.log('⚡ Performance mode disabled');
    trackEvent('performance', 'mode', 'disabled');
  }

  /**
   * Show performance indicator
   */
  public showPerformanceIndicator(): void {
    const indicator = document.getElementById('performance-indicator');
    if (indicator) {
      indicator.classList.add('show');
    }
  }

  /**
   * Hide performance indicator
   */
  public hidePerformanceIndicator(): void {
    const indicator = document.getElementById('performance-indicator');
    if (indicator) {
      indicator.classList.remove('show');
    }
  }
}

/**
 * Performance Optimizations
 */
export class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  /**
   * Initialize performance optimizations
   */
  private init(): void {
    console.log('⚡ Initializing performance optimizations...');

    // Preload critical resources
    this.preloadCriticalResources();

    // Lazy load non-critical resources
    this.setupLazyLoading();

    // Optimize images
    this.optimizeImages();

    // Debounce resize events
    this.debounceResize();

    // Monitor memory usage
    this.monitorMemory();

    console.log('✅ Performance optimizations initialized');
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources(): void {
    const resources = [
      { href: '/vite.svg', as: 'image' },
      // Add more critical resources
    ];

    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup lazy loading for images
   */
  private setupLazyLoading(): void {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      document.querySelectorAll('img[data-src]').forEach((img) => {
        (img as HTMLImageElement).src = img.getAttribute('data-src')!;
        img.setAttribute('loading', 'lazy');
      });
    } else {
      // Intersection Observer fallback
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.getAttribute('data-src')!;
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        observer.observe(img);
      });
    }
  }

  /**
   * Optimize images
   */
  private optimizeImages(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      // Add decoding hint
      img.decoding = 'async';
      
      // Add fetchpriority for important images
      if (img.classList.contains('important')) {
        img.fetchPriority = 'high';
      }
    });
  }

  /**
   * Debounce resize events
   */
  private debounceResize(): void {
    let resizeTimeout: number;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('optimizedResize'));
      }, 250);
    });
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (used > 0.9) {
          console.warn('⚠️ High memory usage:', (used * 100).toFixed(1) + '%');
          trackEvent('performance', 'memory', 'high');
        }
      }, 30000); // Check every 30 seconds
    }
  }
}

/**
 * Initialize theme manager
 */
export function initTheme(): ThemeManager {
  return new ThemeManager();
}

/**
 * Initialize performance optimizer
 */
export function initPerformanceOptimizer(): PerformanceOptimizer {
  return new PerformanceOptimizer();
}

