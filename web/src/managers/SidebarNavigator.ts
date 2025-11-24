import { COLOR_PALETTES } from '../config/colors';
import type { ColorPalette } from '../config/colors';
import { SIDE_TRANSITION_MS, WAVE_ANIMATION_MS, WAVE_DELAY_MS } from '../config/constants';
import { getCurrentLanguage } from '../i18n';
import { isRTLLanguage } from '../utils/languageUtils';

export interface SidebarNavigatorOptions {
  onNavigate?: (sectionIndex: number) => void;
  getCurrentSection?: () => number;
  colorPalettes?: ColorPalette[];
}

/**
 * Handles creation and animation of the floating sidebar navigation spheres.
 */
export class SidebarNavigator {
  private readonly totalSections: number;
  private readonly onNavigate?: (section: number) => void;
  private readonly getCurrentSection?: () => number;
  private readonly colorPalettes: ColorPalette[];

  private sphereElements: HTMLElement[] = [];
  private container: HTMLElement | null = null;
  private navElement: HTMLElement | null = null;
  private isAnimating = false;
  private currentIsRTL = false;
  private relocationTimeout: number | null = null;
  private waveResetTimeout: number | null = null;

  constructor(totalSections: number, options: SidebarNavigatorOptions = {}) {
    this.totalSections = totalSections;
    this.onNavigate = options.onNavigate;
    this.getCurrentSection = options.getCurrentSection;
    this.colorPalettes = options.colorPalettes ?? COLOR_PALETTES;

    this.container = document.getElementById('sphere-container');
    this.navElement = document.getElementById('sidebar-nav');
    this.currentIsRTL = isRTLLanguage(getCurrentLanguage());
    this.setSideAttribute(this.currentIsRTL);

    if (this.container) {
      this.container.style.setProperty('--wave-delay-step', `${WAVE_DELAY_MS}ms`);
      this.container.style.setProperty('--sphere-count', `${this.totalSections}`);
      this.generateSpheres();
      this.applyWaveDelays();
      this.triggerWaveAnimation();
    }
  }

  public updateActiveSphere(sectionIndex: number) {
    this.sphereElements.forEach((sphere, index) => {
      if (index === sectionIndex) {
        sphere.classList.add('active');
      } else {
        sphere.classList.remove('active');
      }
    });
  }

  public updateSphereColors(sectionIndex: number) {
    const sphere = this.sphereElements[sectionIndex];
    if (!sphere) {
      return;
    }

    const palette = sectionIndex === 0
      ? { primary: '#ffffff', secondary: '#000000', accent: '#808080' }
      : this.colorPalettes[sectionIndex % this.colorPalettes.length];

    sphere.style.setProperty('--sphere-glow-color', palette.primary);
  }

  public handleLanguageChange(language: string, animate = true) {
    const nextIsRTL = isRTLLanguage(language);

    if (!animate) {
      this.setSideAttribute(nextIsRTL);
      this.currentIsRTL = nextIsRTL;
      this.applyWaveDelays();
      this.triggerWaveAnimation();
      return;
    }

    if (nextIsRTL !== this.currentIsRTL) {
      this.animateSideChange(nextIsRTL);
    } else {
      this.applyWaveDelays();
      this.triggerWaveAnimation();
    }
  }

  public destroy() {
    if (this.relocationTimeout) {
      window.clearTimeout(this.relocationTimeout);
    }
    if (this.waveResetTimeout) {
      window.clearTimeout(this.waveResetTimeout);
    }
    this.sphereElements.forEach(sphere => sphere.remove());
    this.sphereElements = [];
  }

  private generateSpheres() {
    if (!this.container) return;

    for (let i = 0; i < this.totalSections; i++) {
      const sphere = document.createElement('button');
      sphere.className = 'nav-sphere';
      sphere.setAttribute('data-section', i.toString());
      sphere.setAttribute('aria-label', `Navigate to section ${String(i).padStart(2, '0')}`);

      const palette = i === 0
        ? { primary: '#ffffff', secondary: '#000000', accent: '#808080' }
        : this.colorPalettes[i % this.colorPalettes.length];

      sphere.style.background = `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`;

      sphere.addEventListener('click', (event) => {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement;
        const sectionIndex = parseInt(target.getAttribute('data-section') || '0', 10);
        this.navigateToSectionAnimated(sectionIndex);
      });

      sphere.style.setProperty('--sphere-index', i.toString());
      this.sphereElements.push(sphere);
      this.container.appendChild(sphere);
    }
  }

  private applyWaveDelays() {
    if (!this.sphereElements.length) return;

    const count = this.sphereElements.length;
    this.sphereElements.forEach((sphere, index) => {
      const delayIndex = this.currentIsRTL ? (count - index - 1) : index;
      const delay = delayIndex * WAVE_DELAY_MS;
      sphere.style.setProperty('--wave-delay', `${delay}ms`);
    });
  }

  private setSideAttribute(isRTL: boolean) {
    if (!this.navElement) return;
    this.navElement.setAttribute('data-side', isRTL ? 'rtl' : 'ltr');
  }

  private animateSideChange(nextIsRTL: boolean) {
    if (!this.navElement) {
      this.currentIsRTL = nextIsRTL;
      this.applyWaveDelays();
      this.triggerWaveAnimation();
      return;
    }

    this.navElement.classList.add('is-repositioning');

    if (this.relocationTimeout) {
      window.clearTimeout(this.relocationTimeout);
    }

    this.relocationTimeout = window.setTimeout(() => {
      this.setSideAttribute(nextIsRTL);
      this.currentIsRTL = nextIsRTL;
      this.applyWaveDelays();

      requestAnimationFrame(() => {
        this.navElement?.classList.remove('is-repositioning');
        this.triggerWaveAnimation();
      });

      this.relocationTimeout = null;
    }, SIDE_TRANSITION_MS);
  }

  private triggerWaveAnimation() {
    if (!this.container || this.sphereElements.length === 0) return;

    if (this.waveResetTimeout) {
      window.clearTimeout(this.waveResetTimeout);
      this.waveResetTimeout = null;
    }

    this.container.classList.remove('wave-enter');
    void this.container.offsetWidth;
    this.container.classList.add('wave-enter');

    const totalDuration = WAVE_ANIMATION_MS +
      WAVE_DELAY_MS * Math.max(this.sphereElements.length - 1, 0);

    this.waveResetTimeout = window.setTimeout(() => {
      this.container?.classList.remove('wave-enter');
      this.waveResetTimeout = null;
    }, totalDuration + 50);
  }

  private async navigateToSectionAnimated(targetSection: number) {
    if (this.isAnimating) return;

    const currentSection = this.getCurrentSection?.() ?? 0;
    if (currentSection === targetSection) return;

    this.isAnimating = true;
    const docHeight = document.documentElement.scrollHeight;
    const sectionHeight = docHeight / this.totalSections;
    const targetScroll = targetSection * sectionHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });

    if (this.onNavigate) {
      this.onNavigate(targetSection);
    }

    setTimeout(() => {
      this.isAnimating = false;
    }, 1000);
  }
}


