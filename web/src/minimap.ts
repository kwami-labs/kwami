/**
 * Section Mini-Map
 * 
 * Provides quick visual navigation through sections
 */

import { trackEvent } from './analytics';

export class MiniMap {
  private container?: HTMLElement;
  private currentSection: number = 0;
  private totalSections: number = 22;

  constructor() {
    this.create();
    this.setupScrollListener();
  }

  /**
   * Create mini-map UI
   */
  private create(): void {
    this.container = document.createElement('div');
    this.container.className = 'mini-map';
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Section mini-map');

    for (let i = 0; i < this.totalSections; i++) {
      const item = document.createElement('div');
      item.className = 'mini-map-item';
      item.setAttribute('data-section', this.getSectionName(i));
      item.setAttribute('aria-label', `Jump to section ${i}: ${this.getSectionName(i)}`);
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      if (i === 0) {
        item.classList.add('active');
      }

      item.addEventListener('click', () => this.jumpToSection(i));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.jumpToSection(i);
        }
      });

      this.container.appendChild(item);
    }

    document.body.appendChild(this.container);
    console.log('✅ Mini-map created');
  }

  /**
   * Get section name by index
   */
  private getSectionName(index: number): string {
    const names = [
      'Meet Kwami',
      'Why Kwami',
      'Quick Start',
      'Architecture',
      'Mind Layer',
      'Body Layer',
      'Soul Layer',
      'Interaction Flow',
      'Visual Styles',
      'Audio Integration',
      'Voice Modes',
      'Music Modes',
      'Video Modes',
      'Custom Types',
      'Lifecycle Hooks',
      'Runtime Engine',
      'Examples',
      'Patterns',
      'FAQs',
      'Community',
      'Roadmap',
      'Contact',
    ];
    return names[index] || `Section ${index}`;
  }

  /**
   * Setup scroll listener
   */
  private setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      this.updateActiveSection();
    }, { passive: true });
  }

  /**
   * Update active section based on scroll
   */
  private updateActiveSection(): void {
    const sections = document.querySelectorAll('.text-section');
    let activeIndex = 0;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        activeIndex = index;
      }
    });

    if (activeIndex !== this.currentSection) {
      this.setActiveSection(activeIndex);
    }
  }

  /**
   * Set active section
   */
  private setActiveSection(index: number): void {
    this.currentSection = index;

    const items = this.container?.querySelectorAll('.mini-map-item');
    items?.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  /**
   * Jump to section
   */
  private jumpToSection(index: number): void {
    const scrollManager = (window as any).scrollManager;
    if (scrollManager) {
      scrollManager.scrollToSection(index);
    } else {
      // Fallback
      const sections = document.querySelectorAll('.text-section');
      const section = sections[index] as HTMLElement;
      section?.scrollIntoView({ behavior: 'smooth' });
    }

    trackEvent('minimap', 'jump', `section_${index}`);
  }

  /**
   * Show mini-map
   */
  public show(): void {
    this.container?.style.setProperty('display', 'flex');
  }

  /**
   * Hide mini-map
   */
  public hide(): void {
    this.container?.style.setProperty('display', 'none');
  }

  /**
   * Toggle visibility
   */
  public toggle(): void {
    const isVisible = this.container?.style.display !== 'none';
    if (isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

/**
 * Initialize mini-map
 */
export function initMiniMap(): MiniMap {
  return new MiniMap();
}

