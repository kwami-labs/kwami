import './style.css';
import './components/welcome-layer.css';
import './accessibility.css';
import './loading.css';
import './mobile.css';
import './social.css';
import './theme.css';
import { Kwami } from 'kwami';
import { t, changeLanguage, getCurrentLanguage, updatePageTranslations, createLanguageSwitcher } from './i18n';
import { WelcomeLayer } from './components/WelcomeLayer';
import mediaLinks from './media-links.json';
import i18next from './i18n';
import { initAnalytics, trackSectionView, trackButtonClick, trackMediaInteraction, trackBlobInteraction, trackLanguageChange, trackTabSwitch, trackSidebarNavigation, trackTiming } from './analytics';
import { initErrorHandler } from './error-handler';
import { initKeyboardNavigation } from './keyboard-navigation';
import { initLoadingStates, showBlobLoading, hideBlobLoading, lazyLoadMedia } from './loading';
import { initMobileUX } from './mobile';
import { initSocialFeatures } from './social';
import { initTheme, initPerformanceOptimizer } from './theme';

// Video files from public/video/ directory
// Add more video files here as you add them to web/public/video/
// Note: Use exact filenames with proper Unicode characters
const VIDEO_FILES = [
  '/video/BLACKPINK - \u2018Shut Down\u2019 MV.mp4',
  '/video/BLACKPINK - \u2018\uB6F0\uC5B4(JUMP)\u2019 MV.mp4',
];

// Tailwind -500 colors ordered from top to bottom of color spectrum (22 colors)
const tailwindColors500 = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#dc2626', // red-600 (deeper red)
  '#ea580c', // orange-600
  '#d97706', // amber-600
  '#ca8a04', // yellow-600
  '#65a30d', // lime-600
];

// Helper function to blend two hex colors for middle gradient
function blendColors(color1: string, color2: string): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round((r1 + r2) / 2);
  const g = Math.round((g1 + g2) / 2);
  const b = Math.round((b1 + b2) / 2);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate color palettes for 22 sections using sequential 2-color gradients
// Each section uses colors[i] and colors[i+1] with a blended middle color for Kwami
const colorPalettes = tailwindColors500.map((color, index) => {
  const nextColor = tailwindColors500[(index + 1) % tailwindColors500.length];
  const middleColor = blendColors(color, nextColor);
  
  return {
    primary: color,        // Color 1 for Kwami blob
    secondary: nextColor,  // Color 2 for Kwami blob  
    accent: middleColor    // Blended middle color for Kwami blob
  };
});

// Blob configurations for different sections (22 sections)
const blobConfigs = [
  { // Section 00 - Introduction (calm)
    spikeX: 0.2, spikeY: 0.2, spikeZ: 0.2,
    timeX: 5, timeY: 5, timeZ: 5
  },
  { // Section 01 - Why Kwami (energetic)
    spikeX: 2.5, spikeY: 2.5, spikeZ: 2.5,
    timeX: 8, timeY: 8, timeZ: 8
  },
  { // Section 02 - Quick Start (organic)
    spikeX: 5.0, spikeY: 3.0, spikeZ: 4.0,
    timeX: 10, timeY: 7, timeZ: 8
  },
  { // Section 03 - Architecture (pulsing)
    spikeX: 1.0, spikeY: 1.0, spikeZ: 1.0,
    timeX: 15, timeY: 15, timeZ: 15
  },
  { // Section 04 - Mind Layer (spiral)
    spikeX: 8.0, spikeY: 2.0, spikeZ: 5.0,
    timeX: 12, timeY: 6, timeZ: 9
  },
  { // Section 05 - Body Layer (fluid)
    spikeX: 3.0, spikeY: 4.0, spikeZ: 2.5,
    timeX: 7, timeY: 9, timeZ: 6
  },
  { // Section 06 - Soul Layer (wavy)
    spikeX: 4.0, spikeY: 4.0, spikeZ: 1.5,
    timeX: 6, timeY: 6, timeZ: 10
  },
  { // Section 07 - Interaction Flow (angular)
    spikeX: 6.0, spikeY: 1.0, spikeZ: 6.0,
    timeX: 8, timeY: 12, timeZ: 8
  },
  { // Section 08 - Visual Styles (bubble)
    spikeX: 0.8, spikeY: 0.8, spikeZ: 0.8,
    timeX: 4, timeY: 4, timeZ: 4
  },
  { // Section 09 - Audio & Voice (intricate)
    spikeX: 7.0, spikeY: 5.0, spikeZ: 3.0,
    timeX: 11, timeY: 9, timeZ: 7
  },
  { // Section 10 - Provider Architecture (meditative)
    spikeX: 2.0, spikeY: 3.0, spikeZ: 2.0,
    timeX: 3, timeY: 3, timeZ: 3
  },
  { // Section 11 - Customization (fast pulse)
    spikeX: 3.5, spikeY: 3.5, spikeZ: 3.5,
    timeX: 18, timeY: 18, timeZ: 18
  },
  { // Section 12 - Developer Toolkit (asymmetric)
    spikeX: 9.0, spikeY: 2.5, spikeZ: 6.5,
    timeX: 13, timeY: 5, timeZ: 9
  },
  { // Section 13 - Performance (geometric)
    spikeX: 4.5, spikeY: 4.5, spikeZ: 0.5,
    timeX: 7, timeY: 7, timeZ: 14
  },
  { // Section 14 - Use Cases (crystalline)
    spikeX: 6.5, spikeY: 6.5, spikeZ: 6.5,
    timeX: 9, timeY: 9, timeZ: 9
  },
  { // Section 15 - Connected Ecosystem (gentle)
    spikeX: 1.5, spikeY: 2.0, spikeZ: 1.5,
    timeX: 6, timeY: 8, timeZ: 6
  },
  { // Section 16 - Ownership & Web3 (flowing)
    spikeX: 3.2, spikeY: 3.8, spikeZ: 3.5,
    timeX: 14, timeY: 11, timeZ: 12
  },
  { // Section 17 - Roadmap (reactive)
    spikeX: 4.5, spikeY: 2.8, spikeZ: 3.5,
    timeX: 16, timeY: 8, timeZ: 12
  },
  { // Section 18 - Learning Path (structured)
    spikeX: 7.5, spikeY: 7.5, spikeZ: 2.0,
    timeX: 11, timeY: 11, timeZ: 15
  },
  { // Section 19 - Community (networked)
    spikeX: 5.0, spikeY: 6.0, spikeZ: 5.5,
    timeX: 9, timeY: 10, timeZ: 8
  },
  { // Section 20 - Pro & Enterprise (efficient)
    spikeX: 1.2, spikeY: 1.2, spikeZ: 1.2,
    timeX: 20, timeY: 20, timeZ: 20
  },
  { // Section 21 - Launch (vibrant)
    spikeX: 4.0, spikeY: 5.5, spikeZ: 4.5,
    timeX: 13, timeY: 9, timeZ: 11
  }
];

// Custom Cursor Light Manager with dual lights (fast + delayed)
class CursorLight {
  private lightFast: HTMLElement | null = null;
  private lightSlow: HTMLElement | null = null;
  private isActive = false;
  private positionHistory: Array<{ x: number, y: number, timestamp: number }> = [];
  private readonly DELAY_MS = 3000; // 3 seconds delay for second light
  private currentPalette: { primary: string, secondary: string, accent: string } | null = null;

  constructor() {
    this.lightFast = document.getElementById('cursor-light');
    
    // Create second, delayed light
    this.lightSlow = document.createElement('div');
    this.lightSlow.id = 'cursor-light-slow';
    this.lightSlow.style.cssText = `
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.5s ease;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(this.lightSlow);
    
    if (this.lightFast) {
      this.init();
    }
  }

  private init() {
    // Track mouse movement
    document.addEventListener('mousemove', (e: MouseEvent) => {
      const now = Date.now();
      
      // Update fast light immediately
      if (this.lightFast) {
        this.lightFast.style.left = `${e.clientX}px`;
        this.lightFast.style.top = `${e.clientY}px`;
      }
      
      // Store position in history with timestamp
      this.positionHistory.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now
      });
      
      // Clean up old positions (keep only last 5 seconds of history)
      const cutoffTime = now - 5000;
      this.positionHistory = this.positionHistory.filter(pos => pos.timestamp > cutoffTime);
      
      // Update delayed light position
      this.updateDelayedLight(now);
      
      // Activate lights on first movement
      if (!this.isActive) {
        this.isActive = true;
        if (this.lightFast) this.lightFast.classList.add('active');
        if (this.lightSlow) this.lightSlow.style.opacity = '1';
      }
    });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => {
      if (this.lightFast) {
        this.lightFast.classList.remove('active');
      }
      if (this.lightSlow) {
        this.lightSlow.style.opacity = '0';
      }
      this.isActive = false;
    });

    // Show when mouse enters window
    document.addEventListener('mouseenter', () => {
      if (this.isActive) {
        if (this.lightFast) this.lightFast.classList.add('active');
        if (this.lightSlow) this.lightSlow.style.opacity = '1';
      }
    });
  }

  private updateDelayedLight(currentTime: number) {
    // Find the position from 700ms ago
    const targetTime = currentTime - this.DELAY_MS;
    
    // Find the closest position in history to our target time
    let closestPos = null;
    let minDiff = Infinity;
    
    for (const pos of this.positionHistory) {
      const diff = Math.abs(pos.timestamp - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestPos = pos;
      }
    }
    
    // Update delayed light position
    if (closestPos && this.lightSlow) {
      this.lightSlow.style.left = `${closestPos.x}px`;
      this.lightSlow.style.top = `${closestPos.y}px`;
    }
  }

  public updateColors(palette: { primary: string, secondary: string, accent: string }) {
    this.currentPalette = palette;
    
    // Convert hex colors to rgba with transparency
    const hexToRgba = (hex: string, alpha: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Update fast light (original multi-color gradient)
    if (this.lightFast) {
      this.lightFast.style.background = `radial-gradient(
        circle at center,
        ${hexToRgba(palette.primary, 0.25)} 0%,
        ${hexToRgba(palette.secondary, 0.15)} 25%,
        ${hexToRgba(palette.accent, 0.08)} 50%,
        transparent 70%
      )`;
    }

    // Update slow light (primary color only, bigger, more subtle)
    if (this.lightSlow) {
      this.lightSlow.style.background = `radial-gradient(
        circle at center,
        ${hexToRgba(palette.primary, 0.08)} 0%,
        ${hexToRgba(palette.primary, 0.04)} 30%,
        ${hexToRgba(palette.primary, 0.02)} 50%,
        transparent 80%
      )`;
    }
  }
}

// Sidebar Navigation Manager
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

function isRTLLanguage(language: string): boolean {
  if (!language) return false;
  const normalized = language.toLowerCase().split('-')[0];
  return RTL_LANGUAGES.includes(normalized);
}

class SidebarNavigator {
  private static readonly SIDE_TRANSITION_MS = 350;
  private static readonly WAVE_ANIMATION_MS = 520;
  private static readonly WAVE_DELAY_MS = 70;
  private sphereElements: HTMLElement[] = [];
  private container: HTMLElement | null = null;
  private navElement: HTMLElement | null = null;
  private totalSections: number;
  private scrollManager: ScrollManager | null = null;
  private isAnimating = false;
  private currentIsRTL = false;
  private relocationTimeout: number | null = null;
  private waveResetTimeout: number | null = null;

  constructor(totalSections: number) {
    this.totalSections = totalSections;
    this.container = document.getElementById('sphere-container');
    this.navElement = document.getElementById('sidebar-nav');
    this.currentIsRTL = isRTLLanguage(getCurrentLanguage());
    this.setSideAttribute(this.currentIsRTL);

    if (this.container) {
      this.container.style.setProperty('--wave-delay-step', `${SidebarNavigator.WAVE_DELAY_MS}ms`);
      this.container.style.setProperty('--sphere-count', `${this.totalSections}`);
      this.generateSpheres();
      this.applyWaveDelays();
      this.triggerWaveAnimation();
    }
  }

  public setScrollManager(manager: ScrollManager) {
    this.scrollManager = manager;
  }

  private generateSpheres() {
    if (!this.container) return;

    // Generate sphere buttons for each section
    for (let i = 0; i < this.totalSections; i++) {
      const sphere = document.createElement('button');
      sphere.className = 'nav-sphere';
      sphere.setAttribute('data-section', i.toString());
      sphere.setAttribute('aria-label', `Navigate to section ${String(i).padStart(2, '0')}`);
      
      // Apply linear gradient background from color palettes
      let palette;
      if (i === 0) {
        // Section 0 gets white to black gradient palette
        palette = {
          primary: '#ffffff',
          secondary: '#000000'
        };
      } else {
        // All other sections use shifted palette
        palette = colorPalettes[i];
      }
      sphere.style.background = `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`;
      
      // Add click handler for navigation with animated color transitions
      sphere.addEventListener('click', (event) => {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement;
        const sectionIndex = parseInt(target.getAttribute('data-section') || '0', 10);
        this.navigateToSectionAnimated(sectionIndex);
      });
      
      sphere.style.setProperty('--sphere-index', i.toString());
      this.sphereElements.push(sphere);
      this.container!.appendChild(sphere);
    }
  }

  private applyWaveDelays() {
    if (!this.sphereElements.length) return;

    const count = this.sphereElements.length;
    this.sphereElements.forEach((sphere, index) => {
      const delayIndex = this.currentIsRTL ? (count - index - 1) : index;
      const delay = delayIndex * SidebarNavigator.WAVE_DELAY_MS;
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
    }, SidebarNavigator.SIDE_TRANSITION_MS);
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

  private triggerWaveAnimation() {
    if (!this.container || this.sphereElements.length === 0) return;

    if (this.waveResetTimeout) {
      window.clearTimeout(this.waveResetTimeout);
      this.waveResetTimeout = null;
    }

    this.container.classList.remove('wave-enter');
    void this.container.offsetWidth;
    this.container.classList.add('wave-enter');

    const totalDuration = SidebarNavigator.WAVE_ANIMATION_MS +
      SidebarNavigator.WAVE_DELAY_MS * Math.max(this.sphereElements.length - 1, 0);

    this.waveResetTimeout = window.setTimeout(() => {
      this.container?.classList.remove('wave-enter');
      this.waveResetTimeout = null;
    }, totalDuration + 50);
  }

  private async navigateToSectionAnimated(targetSection: number) {
    if (this.isAnimating || !this.scrollManager) return;
    
    const currentSection = this.scrollManager.getCurrentSection();
    if (currentSection === targetSection) return;
    
    this.isAnimating = true;
    const docHeight = document.documentElement.scrollHeight;
    const sectionHeight = docHeight / this.totalSections;
    const targetScroll = targetSection * sectionHeight;
    
    // Single smooth scroll through all pages - let the scroll event handler update colors
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
    
    // Reset animation flag after scroll completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 1000);
  }

  private navigateToSection(sectionIndex: number) {
    const docHeight = document.documentElement.scrollHeight;
    const sectionHeight = docHeight / this.totalSections;
    const targetScroll = sectionIndex * sectionHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
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
    // Update the active sphere's glow to match current color palette
    const sphere = this.sphereElements[sectionIndex];
    if (sphere) {
      let palette;
      if (sectionIndex === 0) {
        palette = {
          primary: '#ffffff',
          secondary: '#000000',
          accent: '#808080'
        };
      } else {
        palette = colorPalettes[sectionIndex];
      }
      // Update box-shadow to match the palette
      sphere.style.setProperty('--sphere-glow-color', palette.primary);
    }
  }
}

// Main scroll handler
class ScrollManager {
  private sections: NodeListOf<Element>;
  private currentSection = 0;
  private kwami: Kwami | null = null;
  private root: HTMLElement;
  private isTransitioning = false;
  private sidebarNav: SidebarNavigator;
  private cursorLight: CursorLight;

  constructor() {
    this.sections = document.querySelectorAll('.text-section');
    this.root = document.documentElement;
    this.root.style.setProperty('--section-count', this.sections.length.toString());
    this.sidebarNav = new SidebarNavigator(this.sections.length);
    this.cursorLight = new CursorLight();
    
    // Pass reference to ScrollManager so SidebarNavigator can access current section
    this.sidebarNav.setScrollManager(this);
    
    this.init();
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.handleScroll(); // Initial call
  }

  public getCurrentSection(): number {
    return this.currentSection;
  }

  public getKwami(): Kwami | null {
    return this.kwami;
  }

  public syncLanguageDirection(language: string, animate = true) {
    this.sidebarNav.handleLanguageChange(language, animate);
  }

  public updateBlobPosition(animated: boolean = true) {
    if (!this.kwami) return;

    const blobMesh = this.kwami.body.blob.getMesh();
    const isMobile = window.innerWidth <= 1024;
    const currentLang = getCurrentLanguage();
    const isRTL = isRTLLanguage(currentLang);

    // Calculate target position based on language and device
    let targetX: number;
    let targetY: number;

    if (isMobile) {
      // Mobile: keep blob at bottom center (even lower)
      targetX = 0;
      targetY = -9;
    } else {
      // Desktop: move blob left for RTL (Arabic), right for LTR
      targetX = isRTL ? -8 : 8;
      targetY = 0;
    }

    if (animated) {
      // Smooth animation using GSAP-like approach
      const startX = blobMesh.position.x;
      const startY = blobMesh.position.y;
      const duration = 800; // milliseconds
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic function for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        blobMesh.position.x = startX + (targetX - startX) * easeProgress;
        blobMesh.position.y = startY + (targetY - startY) * easeProgress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      // Instant update
      blobMesh.position.set(targetX, targetY, 0);
    }

    console.log(`🎨 Blob position updated: x=${targetX.toFixed(1)}, y=${targetY.toFixed(1)} (${isRTL ? 'RTL' : 'LTR'})`);
  }

  private async init() {
    // Set initial colors for section 0 (white to black gradient)
    this.updateColors(0);
    this.cursorLight.updateColors({
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#808080'
    });
    
    // Initialize Kwami
    try {
      const container = document.getElementById('kwami-container');
      if (!container) {
        throw new Error('Kwami container not found');
      }

      console.log('🎨 Initializing Kwami...');
      console.log('Container dimensions:', {
        width: container.offsetWidth,
        height: container.offsetHeight
      });

      // Create canvas element with explicit dimensions
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      container.appendChild(canvas);

      // Wait a tick for the canvas to be in the DOM
      await new Promise(resolve => setTimeout(resolve, 10));

      console.log('Canvas created:', {
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight
      });

      this.kwami = new Kwami(canvas, {
        body: {
          initialSkin: 'Poles',
          blob: {
            resolution: 180,
            spikes: { x: 0.2, y: 0.2, z: 0.2 },
            time: { x: 1, y: 1, z: 1 },
            rotation: { x: 0, y: 0, z: 0 },
            wireframe: true,
            colors: {
              x: '#ff0066',
              y: '#00ff66',
              z: '#6600ff'
            }
          },
          scene: {
            cameraPosition: { x: 0, y: 0, z: 12 },
            enableControls: false  // Disable controls to prevent camera movement
          }
        }
      });

      // Set blob scale - bigger on mobile
      const isMobile = window.innerWidth <= 1024;
      const blobScale = isMobile ? 4.5 : 5.5;
      this.kwami.body.blob.setScale(blobScale);

      // Enable wireframe mode
      this.kwami.body.blob.setWireframe(true);

      // Set opacity for mobile - always 0.8 (transparent)
      if (isMobile) {
        this.kwami.body.blob.setOpacity(0.8);
      }

      // Position blob based on language and device using new method
      const blobMesh = this.kwami.body.blob.getMesh();
      this.updateBlobPosition(false); // Initial position without animation

      // Enable auto-rotation on Y-axis only (rotates in place)
      blobMesh.rotation.y = 0;
      const animate = () => {
        blobMesh.rotation.y += 0.002; // Slow rotation
        requestAnimationFrame(animate);
      };
      animate();

      // Adjust on resize
      window.addEventListener('resize', () => {
        const mobile = window.innerWidth <= 1024;
        const blobScale = mobile ? 4.5 : 5.5;
        this.updateBlobPosition(false); // Update position on resize without animation
        this.kwami?.body.blob.setScale(blobScale);
        if (mobile) {
          this.kwami?.body.blob.setOpacity(0.8);
        } else {
          this.kwami?.body.blob.setOpacity(1.0);
        }
      });

      // Setup custom double-click behavior to randomize blob
      if (this.kwami?.body?.blob) {
        this.kwami.body.blob.onDoubleClick = () => {
          console.log('🎲 Double-click detected, randomizing blob');
          this.performFullRandomization();
        };
      }

      // Enable click interaction for touch effects
      this.kwami?.body.blob.enableClickInteraction();

      // Setup click interactions for tab-specific behaviors
      this.setupInteractions(canvas);

      console.log('✨ Kwami initialized successfully!');
      console.log('Kwami instance:', this.kwami);
      console.log('Body:', this.kwami.body);
      console.log('Blob:', this.kwami.body.blob);
      console.log('Blob mesh:', this.kwami.body.blob.getMesh());
    } catch (error) {
      console.error('❌ Failed to initialize Kwami:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      // Show error in the container
      const container = document.getElementById('kwami-container');
      if (container) {
        container.innerHTML = `
          <div style="color: white; text-align: center; padding: 2rem;">
            <h3>Failed to load Kwami</h3>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <pre style="font-size: 12px; text-align: left; overflow: auto; max-height: 200px;">${error instanceof Error ? error.stack : ''}</pre>
          </div>
        `;
      }
    }
  }

  private handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    
    // Calculate which section we're in
    const totalSections = this.sections.length;
    const sectionHeight = docHeight / totalSections;
    const section = Math.min(
      Math.floor(scrollTop / sectionHeight),
      totalSections - 1
    );

    // Progress within current section (0 to 1)
    const sectionProgress = (scrollTop % sectionHeight) / sectionHeight;

    // Update active section
    this.updateActiveSection(section);

    // Update sidebar navigation spheres
    this.sidebarNav.updateActiveSphere(section);

    // Update colors and blob config based on section
    if (section !== this.currentSection && !this.isTransitioning) {
      this.currentSection = section;
      
      let palette;
      if (section === 0) {
        palette = {
          primary: '#ffffff',
          secondary: '#000000',
          accent: '#808080'
        };
      } else {
        palette = colorPalettes[section % colorPalettes.length];
      }
      
      this.updateColors(section);
      this.updateKwamiConfig(section);
      this.sidebarNav.updateSphereColors(section);
      this.cursorLight.updateColors(palette);
    }

    // Add random color variations
    this.addColorVariations(sectionProgress);
  }

  private updateActiveSection(section: number) {
    this.sections.forEach((sec, index) => {
      if (index === section) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });
  }

  private updateColors(section: number) {
    let palette;
    
    // Section 0 gets white to black gradient palette
    if (section === 0) {
      palette = {
        primary: '#ffffff',    // white
        secondary: '#000000',  // black
        accent: '#808080'      // middle gray
      };
    } else {
      // All other sections use shifted palette (section uses section+1 colors)
      palette = colorPalettes[section % colorPalettes.length];
    }
    
    // Update CSS variables with smooth transition
    this.root.style.setProperty('--color-primary', palette.primary);
    this.root.style.setProperty('--color-secondary', palette.secondary);
    this.root.style.setProperty('--color-accent', palette.accent);
  }

  private async updateKwamiConfig(section: number) {
    if (!this.kwami) return;

    this.isTransitioning = true;
    const config = blobConfigs[section % blobConfigs.length];
    
    let palette;
    // Section 0 gets gray palette for the blob
    if (section === 0) {
      palette = {
        primary: '#4a4a4a',  // middle dark gray
        secondary: '#6a6a6a', // lighter gray
        accent: '#2a2a2a'    // darker gray
      };
    } else {
      // All other sections use shifted palette
      palette = colorPalettes[section % colorPalettes.length];
    }

    try {
      // Update blob geometry
      this.kwami.body.blob.setSpikes(config.spikeX, config.spikeY, config.spikeZ);
      this.kwami.body.blob.setTime(config.timeX, config.timeY, config.timeZ);

      // Update colors
      this.kwami.body.blob.setColors(palette.primary, palette.secondary, palette.accent);

      // Preserve opacity for mobile - always 0.8 (transparent)
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        this.kwami.body.blob.setOpacity(0.8);
      }

      // Much shorter delay for smooth transitions
      setTimeout(() => {
        this.isTransitioning = false;
      }, 100);
    } catch (error) {
      console.error('Error updating Kwami config:', error);
      this.isTransitioning = false;
    }
  }

  private setupInteractions(canvas: HTMLCanvasElement) {
    // Handle double-click for randomization
    canvas.addEventListener('dblclick', () => {
      console.log('🎲 Double-click detected, randomizing blob');
      this.performFullRandomization();
    });

    // Add click handler with delay to distinguish from double-click
    canvas.addEventListener('click', (e: MouseEvent) => {
      console.log('🖱️ Click detected, detail:', e.detail);
      
      // Ignore if this is part of a multi-click (detail >= 2 for double/triple clicks)
      if (e.detail >= 2) {
        console.log('🖱️ Multi-click detected, ignoring single click handler');
        return;
      }

      // Check which tab is active and handle accordingly
      const activeTab = document.querySelector('.tab-btn.active');
      const activeTabType = activeTab?.getAttribute('data-tab');
      
      if (activeTabType === 'video') {
        // For video tab, handle video toggling
        if (currentVideoUrl && currentVideoMode !== 'none' && !isVideoLoading) {
          console.log(`🎥 Blob clicked, switching from ${currentVideoMode} mode`);
          toggleVideoPresentation();
        } else if (!isVideoLoading && !currentVideoUrl) {
          // Start playing a video if none is playing
          console.log('🎥 Blob clicked, starting video playback');
          playRandomVideo({ mode: 'background' });
        }
        return;
      }
      
      if (activeTabType === 'music') {
        // For music tab, toggle lowpass filter on blob click
        const scrollManager = (window as any).scrollManager;
        const kwami = scrollManager?.getKwami();
        if (kwami?.body?.audio?.isPlaying()) {
          console.log('🎚️ Blob clicked, toggling music lowpass filter');
          toggleMusicLowpass();
        }
        return;
      }
      
      if (activeTabType === 'voice') {
        // For voice tab, toggle voice playback on blob click
        console.log('🎤 Blob clicked, toggling voice playback');
        toggleVoicePlayback();
        return;
      }
    });
  }


  private performFullRandomization() {
    if (!this.kwami) return;

    // Randomize blob shape and colors
    this.kwami.body.randomizeBlob();
    
    // Also randomize skin type exactly like the playground
    // Skin distribution: Donut (50%), Poles (40%), Vintage (10%)
    const skinTypes = [
      'Donut', 'Donut', 'Donut', 'Donut', 'Donut',  // 50%
      'Poles', 'Poles', 'Poles', 'Poles',            // 40%
      'Vintage'                                      // 10%
    ];
    const randomSkin = skinTypes[Math.floor(Math.random() * skinTypes.length)] as 'Donut' | 'Poles' | 'Vintage';
    this.kwami.body.blob.setSkin(randomSkin);
    
    // Preserve opacity for mobile - always 0.8 (transparent)
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
      this.kwami.body.blob.setOpacity(0.8);
    }
    
    console.log(`🎲 Blob randomized with ${randomSkin} skin!`);
  }


  private addColorVariations(progress: number) {
    // Add subtle random variations to the gradient stops
    const stops = document.querySelectorAll('.logo-stop1, .logo-stop2, .logo-stop3');

    stops.forEach((stop, index) => {
      if (stop) {
        // Create subtle hue shift based on scroll progress and randomness
        const hueShift = Math.sin(progress * Math.PI * 2 + index) * 15;
        const filter = `hue-rotate(${hueShift}deg)`;
        (stop as SVGStopElement).style.filter = filter;
      }
    });
  }
}

// Random color generation utility
function generateRandomColor(): string {
  const hue = Math.random() * 360;
  const saturation = 70 + Math.random() * 30;
  const lightness = 50 + Math.random() * 20;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Add random color variation on scroll (progressive randomness)
let lastRandomUpdate = 0;
const RANDOM_UPDATE_INTERVAL = 2000; // ms

window.addEventListener('scroll', () => {
  const now = Date.now();
  if (now - lastRandomUpdate > RANDOM_UPDATE_INTERVAL) {
    lastRandomUpdate = now;
    
    // Randomly update one color component
    const randomComponent = Math.floor(Math.random() * 3);
    const components = ['--color-primary', '--color-secondary', '--color-accent'];
    const randomColor = generateRandomColor();
    
    // Only update if we're past the first section to keep introduction clean
    if (window.scrollY > window.innerHeight * 0.5) {
      document.documentElement.style.setProperty(
        components[randomComponent],
        randomColor
      );
    }
  }
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(this: HTMLAnchorElement, e: Event) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (href) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Mode Switcher Handler
class ModeSwitcher {
  private currentMode: 'voice' | 'music' | 'video' = 'voice';
  private switcher: HTMLElement | null = null;
  private buttons: NodeListOf<HTMLElement> | null = null;

  constructor() {
    this.switcher = document.querySelector('.mode-switcher');
    this.buttons = document.querySelectorAll('.mode-btn');
    
    if (this.switcher && this.buttons) {
      this.init();
    }
  }

  private init() {
    this.switcher!.setAttribute('data-active', this.currentMode);
    
    this.buttons!.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as 'voice' | 'music' | 'video';
        this.setMode(mode);
      });
    });
  }

  private setMode(mode: 'voice' | 'music' | 'video') {
    this.currentMode = mode;
    this.switcher!.setAttribute('data-active', mode);
    
    // Update active button
    this.buttons!.forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    console.log(`Mode switched to: ${mode}`);
    // TODO: Add mode-specific behavior here
  }

  public getMode() {
    return this.currentMode;
  }
}

interface ActionConfig {
  url?: string;
  copy?: string;
  message: string;
}

const PLAYGROUND_URL = 'https://pg.kwami.io';

const ACTION_ROUTES: Record<string, ActionConfig> = {
  'launch-playground': {
    url: PLAYGROUND_URL,
    message: t('action_feedback.launch_playground')
  },
  'view-demo': {
    url: `${PLAYGROUND_URL}?view=demo`,
    message: t('action_feedback.view_demo')
  },
  'run-playground': {
    copy: 'npm run playground',
    message: t('action_feedback.run_playground')
  },
  'swap-sidebars': {
    url: `${PLAYGROUND_URL}?panel=layout`,
    message: t('action_feedback.swap_sidebars')
  },
  'init-mind': {
    url: `${PLAYGROUND_URL}?panel=mind#initialize`,
    message: t('action_feedback.init_mind')
  },
  'randomize-blob': {
    url: `${PLAYGROUND_URL}?panel=body&action=randomize-blob`,
    message: t('action_feedback.randomize_blob')
  },
  'apply-soul': {
    url: `${PLAYGROUND_URL}?panel=soul&action=apply`,
    message: t('action_feedback.apply_soul')
  },
  'test-listening': {
    url: `${PLAYGROUND_URL}?action=test-listening`,
    message: t('action_feedback.test_listening')
  },
  'set-background': {
    url: `${PLAYGROUND_URL}?panel=body&action=background`,
    message: t('action_feedback.set_background')
  },
  'speak': {
    url: `${PLAYGROUND_URL}?action=speak`,
    message: t('action_feedback.speak')
  },
  'switch-provider': {
    url: 'https://github.com/alexcolls/kwami/blob/dev/docs/api/kwami.md#mindprovider',
    message: t('action_feedback.switch_provider')
  },
  'adjust-spikes': {
    url: `${PLAYGROUND_URL}?panel=body&action=spikes`,
    message: t('action_feedback.adjust_spikes')
  },
  'download-glb': {
    url: `${PLAYGROUND_URL}?action=download-glb`,
    message: t('action_feedback.download_glb')
  },
  'test-thinking': {
    url: `${PLAYGROUND_URL}?action=test-thinking`,
    message: t('action_feedback.test_thinking')
  },
  'upload-audio': {
    url: `${PLAYGROUND_URL}?action=upload-audio`,
    message: t('action_feedback.upload_audio')
  },
  'connect-services': {
    url: 'https://quami.io',
    message: t('action_feedback.connect_services')
  },
  'mint-nft': {
    url: 'https://candy.kwami.io',
    message: t('action_feedback.mint_nft')
  },
  'view-roadmap': {
    url: 'https://github.com/alexcolls/kwami/blob/dev/STATUS.md',
    message: t('action_feedback.view_roadmap')
  },
  'open-guides': {
    url: 'https://github.com/alexcolls/kwami/tree/dev/docs',
    message: t('action_feedback.open_guides')
  },
  'join-discord': {
    url: 'https://discord.gg/kwami',
    message: t('action_feedback.join_discord')
  },
  'contact-team': {
    url: 'mailto:hello@kwami.io?subject=Kwami%20Enterprise',
    message: t('action_feedback.contact_team')
  },
  'create-session': {
    url: `${PLAYGROUND_URL}?action=start-session`,
    message: t('action_feedback.create_session')
  }
};

class ActionButtonManager {
  private buttons: NodeListOf<HTMLButtonElement>;

  constructor() {
    this.buttons = document.querySelectorAll('[data-action-key]');
    if (!this.buttons.length) return;
    this.attachListeners();
  }

  private attachListeners() {
    this.buttons.forEach(button => {
      button.addEventListener('click', this.handleClick.bind(this));
    });
  }

  private async handleClick(event: Event) {
    event.preventDefault();
    const button = event.currentTarget as HTMLButtonElement;
    const key = button.dataset.actionKey;
    if (!key) return;
    const config = ACTION_ROUTES[key];
    if (!config) return;

    button.classList.add('triggered');
    window.setTimeout(() => button.classList.remove('triggered'), 400);

    if (config.copy) {
      const success = await this.copyToClipboard(config.copy);
      this.showFeedback(button, success ? config.message : 'Copy unavailable');
      return;
    }

    if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }

    this.showFeedback(button, config.message);
  }

  private async copyToClipboard(value: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (error) {
      console.warn('Clipboard API failed, attempting fallback', error);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      textarea.remove();
      return success;
    } catch (error) {
      console.error('Fallback clipboard copy failed', error);
      return false;
    }
  }

  private showFeedback(button: HTMLElement, message: string) {
    const existing = button.querySelector('.action-feedback');
    if (existing) {
      existing.remove();
    }
    const note = document.createElement('span');
    note.className = 'action-feedback';
    note.textContent = message;
    button.appendChild(note);
    window.setTimeout(() => {
      note.remove();
    }, 1400);
  }
}

// Language switcher initialization using shared function from i18n
function initLanguageSwitcher() {
  // Create and append the language switcher to the header
  const langSwitcher = createLanguageSwitcher('language-switcher');
  const rightHeader = document.querySelector('.right-header');
  
  if (rightHeader) {
    rightHeader.appendChild(langSwitcher);
  } else {
    // Fallback to body if header not found
    document.body.appendChild(langSwitcher);
  }
  
  // Set initial text direction based on current language
  const currentLang = getCurrentLanguage();
  const htmlElement = document.documentElement;
  if (isRTLLanguage(currentLang)) {
    htmlElement.setAttribute('dir', 'rtl');
  } else {
    htmlElement.setAttribute('dir', 'ltr');
  }
  
  console.log('🌐 Language switcher initialized');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize analytics and error handling
  const startTime = performance.now();
  initAnalytics();
  initErrorHandler();
  const keyboardNav = initKeyboardNavigation();
  initLoadingStates();
  const mobileUX = initMobileUX();
  
  // Initialize Phase 3 features
  const socialFeatures = initSocialFeatures();
  const themeManager = initTheme();
  const perfOptimizer = initPerformanceOptimizer();
  
  // Initialize welcome layer
  new WelcomeLayer();
  
  const scrollManager = new ScrollManager();
  new ModeSwitcher();
  new ActionButtonManager();
  // Initialize language switcher
  initLanguageSwitcher();
  
  // Update initial translations
  updatePageTranslations();
  
  // Track page load time
  const loadTime = performance.now() - startTime;
  trackTiming('page', 'dom_loaded', Math.round(loadTime));
  
  // Register service worker for PWA support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      }).catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
    });
  }
  
  // Make scrollManager accessible globally for music functions
  (window as any).scrollManager = scrollManager;
  
  // Listen for language changes and update blob position with smooth animation
  i18next.on('languageChanged', (lng: string) => {
    console.log(`🌐 Language changed to: ${lng}`);
    scrollManager.syncLanguageDirection(lng);
    // Wait a tick for the language to be fully applied
    setTimeout(() => {
      scrollManager.updateBlobPosition(true); // Animate the blob position
    }, 50);
  });
});

// Add scroll indicator on first section
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
scrollIndicator.textContent = '↓';
document.body.appendChild(scrollIndicator);

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    scrollIndicator.style.opacity = '0';
  } else {
    scrollIndicator.style.opacity = '0.5';
  }
});

// Music files from assets/aud/music/
// Note: Files are copied to web/public/music/ for easier serving
const MUSIC_FILES = [
  '/music/Tove Lo - Habits (Stay High) - Hippie Sabotage Remix.mp3',
  '/music/Alexiane - A Million on My Soul (From Valerian and the City of a Thousand Planets).mp3',
  '/music/Benson Boone - Beautiful Things (Live from the 67th GRAMMY Awards).mp3',
  '/music/RagnBone Man - Human (Official Video).mp3',
  '/music/Sigma ft Paloma Faith - Changing (Official Video).mp3',
  "/music/BLACKPINK - 'Pink Venom' MV.mp3",
  "/music/BLACKPINK - 'Shut Down' MV.mp3",
  "/music/BLACKPINK - '뛰어(JUMP)' MV.mp3",
  '/music/Dennis Lloyd - GFY (Official Video).mp3',
  '/music/Eladio Carrion - Branzino.mp3',
  '/music/OTYKEN - STORM (Official Music Video).mp3',
];

const VOICE_FILES = [
  '/voices/test.mp3'
];

// Use local video files from public/video directory
const PLAYABLE_VIDEO_LINKS = VIDEO_FILES.filter(url => typeof url === 'string' && url.length > 0);

let currentVideoUrl: string | null = null;
let isVideoLoading = false;
let currentVideoMode: 'none' | 'background' | 'blob' = 'none';
let activeVideoStream: MediaStream | null = null;
let videoElementCleanup: (() => void) | null = null;
let previousKwamiSkinForVideo: string | null = null;
let glassModeActiveForVideo = false;
type VideoAttachResult = 'success' | 'no-audio' | 'stream-error';

// Music player state
let currentMusicIndex = -1;
let isMusicPlaying = false;
let isLowpassFilterActive = false;
let lowpassReleaseHandle: number | null = null;
const LOWPASS_OPEN_FREQUENCY = 18000;
const LOWPASS_CLOSED_FREQUENCY = 420;

// Voice playback state
let isVoicePlaying = false;
let currentVoiceUrl: string | null = null;
let voiceEndedHandler: (() => void) | null = null;

// Create song title display element as a clickable link
const songTitleDisplay = document.createElement('a');
songTitleDisplay.id = 'song-title-display';
songTitleDisplay.target = '_blank';
songTitleDisplay.rel = 'noopener noreferrer';
songTitleDisplay.style.cssText = `
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  width: 100vw;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 400;
  z-index: 9998;
  white-space: nowrap;
  overflow: hidden;
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  text-decoration: none;
  cursor: pointer;
`;
document.body.appendChild(songTitleDisplay);

// Bottom tabs functionality
document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', async function(this: HTMLButtonElement) {
    const alreadyActive = this.classList.contains('active');
    const tabType = this.getAttribute('data-tab');
    if (!tabType) {
      return;
    }

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    triggerTabAnimation(this, tabType);
    console.log(`🎵 Switched to ${tabType} tab${alreadyActive ? ' (repeat click)' : ''}`);

    if (tabType === 'music') {
      stopVoicePlayback();
      stopVideoPlayback(undefined, { preserveUrl: true });
      // Always play music when clicking the Music tab
      // Lowpass filter is toggled by clicking the Kwami blob
      await playRandomMusic();
    } else if (tabType === 'voice') {
      stopVideoPlayback(undefined, { preserveUrl: true });
      if (alreadyActive) {
        await toggleVoicePlayback();
      } else {
        await playRandomVoiceClip();
      }
    } else if (tabType === 'video') {
      stopKwamiAudio();
      if (alreadyActive) {
        await toggleVideoPresentation();
      } else {
        await playRandomVideo({ mode: 'background' });
      }
    }
  });
});

function triggerTabAnimation(button: HTMLButtonElement, tabType: string) {
  const animationClass = `tab-anim-${tabType}`;
  button.classList.remove(animationClass);
  // Force reflow so repeated clicks retrigger the animation
  void button.offsetWidth;
  button.classList.add(animationClass);
  button.addEventListener('animationend', () => {
    button.classList.remove(animationClass);
  }, { once: true });
}

// Play random music function
async function playRandomMusic() {
  console.log('🎵 playRandomMusic() called');
  
  if (MUSIC_FILES.length === 0) {
    console.warn('⚠️ No music files available');
    return;
  }

  const scrollManager = (window as any).scrollManager;
  console.log('ScrollManager:', scrollManager);
  
  const kwami = scrollManager?.getKwami();
  console.log('Kwami instance:', kwami);
  
  if (!kwami) {
    console.warn('⚠️ Kwami not initialized yet');
    return;
  }

  if (!kwami.body?.audio) {
    console.error('⚠️ Kwami audio system not available');
    return;
  }

  try {
    // Pick a random song (different from current if possible)
    let newIndex;
    if (MUSIC_FILES.length === 1) {
      newIndex = 0;
    } else {
      do {
        newIndex = Math.floor(Math.random() * MUSIC_FILES.length);
      } while (newIndex === currentMusicIndex && MUSIC_FILES.length > 1);
    }
    
    currentMusicIndex = newIndex;
    const selectedSong = MUSIC_FILES[newIndex];
    const songName = getMediaDisplayName(selectedSong);
    
    // Show song title with scrolling animation
    showSongTitle(songName);
    
    console.log(`🎵 Loading: ${songName}`);
    console.log(`🎵 File path: ${selectedSong}`);
    
    // Fetch the audio file as an ArrayBuffer
    console.log('🎵 Fetching audio file...');
    const response = await fetch(selectedSong);
    console.log('🎵 Response status:', response.status, response.statusText);
    console.log('🎵 Response headers:', response.headers.get('content-type'));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('🎵 ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    
    // Load the audio using ArrayBuffer method
    await kwami.body.audio.loadAudio(arrayBuffer);
    console.log('🎵 Audio loaded into Kwami');
    
    // Play the audio
    console.log('🎵 Starting playback...');
    kwami.body.audio.disableLowpassFilter();
    isLowpassFilterActive = false;
    await kwami.body.audio.play();
    
    // Set blob to speaking state for audio reactivity - SKIPPED to preserve section styles
    // kwami.setState('speaking');
    isMusicPlaying = true;
    isVoicePlaying = false;
    isLowpassFilterActive = false;
    
    console.log(`✅ Now playing: ${songName}`);
    
    // Listen for when song ends
    const audioElement = kwami.body.audio.getAudioElement();
    audioElement.addEventListener('ended', () => {
      console.log('🎵 Song ended');
      // kwami.setState('idle'); // Preserve section style
      isMusicPlaying = false;
      kwami.body.audio.disableLowpassFilter();
      isLowpassFilterActive = false;
      hideSongTitle();
    }, { once: true });
    
    // Also listen for errors
    audioElement.addEventListener('error', (e: Event) => {
      console.error('🎵 Audio element error:', e);
      // kwami.setState('idle'); // Preserve section style
      isMusicPlaying = false;
    }, { once: true });
    
  } catch (error) {
    console.error('❌ Failed to play music:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
  }
}

// Stop any Kwami-managed audio (music or voice)
function stopKwamiAudio() {
  const kwami = getKwamiInstance();
  const audio = kwami?.body?.audio;
  
  if (!kwami || !audio) {
    isMusicPlaying = false;
    isVoicePlaying = false;
    return;
  }

  if (voiceEndedHandler) {
    audio.getAudioElement().removeEventListener('ended', voiceEndedHandler);
    voiceEndedHandler = null;
  }

  if (lowpassReleaseHandle !== null) {
    window.clearTimeout(lowpassReleaseHandle);
    lowpassReleaseHandle = null;
  }
  audio.disableLowpassFilter();
  audio.disableHighpassFilter();
  audio.pause();
  audio.setCurrentTime(0);
  // kwami.setState('idle'); // Preserve section style

  isMusicPlaying = false;
  isVoicePlaying = false;
  isLowpassFilterActive = false;
  hideSongTitle();
  console.log('🛑 Audio stopped');
}

function getMediaDisplayName(path: string): string {
  const fileName = path.split('/').pop() ?? path;
  return fileName.replace(/\.[^/.]+$/, '');
}

// Animation state for letters
let titleAnimationFrameId: number | null = null;

// Show song title with rhythm-based letter animations
function showSongTitle(title: string, type: 'music' | 'video' | 'voice' = 'music') {
  console.log(`🎵 showSongTitle called: "${title}" (${type})`);
  
  let youtubeUrl: string | undefined;
  if (type === 'music') {
    const fileName = `${title}.mp3`;
    youtubeUrl = mediaLinks.music[fileName as keyof typeof mediaLinks.music];
  } else if (type === 'video') {
    const fileName = `${title}.mp4`;
    youtubeUrl = mediaLinks.video[fileName as keyof typeof mediaLinks.video];
  }
  
  // Clear existing content and create letter spans
  songTitleDisplay.innerHTML = '';
  const letters = title.split('');
  const letterSpans: HTMLSpanElement[] = [];
  
  console.log(`🎵 Creating ${letters.length} letter spans`);
  
  letters.forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'title-letter';
    span.style.display = 'inline-block';
    span.style.transition = 'transform 0.15s ease-out';
    letterSpans.push(span);
    songTitleDisplay.appendChild(span);
  });
  
  if (youtubeUrl) {
    songTitleDisplay.href = youtubeUrl;
    songTitleDisplay.style.pointerEvents = 'auto';
    songTitleDisplay.title = 'Click to watch on YouTube';
  } else {
    songTitleDisplay.removeAttribute('href');
    songTitleDisplay.style.pointerEvents = 'none';
    songTitleDisplay.title = '';
  }
  
  songTitleDisplay.style.opacity = '1';
  if (type === 'voice') {
    songTitleDisplay.style.pointerEvents = 'none';
    songTitleDisplay.title = 'Playing voice sample';
  }
  
  console.log(`🎵 Title display opacity set to: ${songTitleDisplay.style.opacity}`);
  console.log(`🎵 Title display element position:`, {
    bottom: songTitleDisplay.style.bottom,
    zIndex: songTitleDisplay.style.zIndex,
    opacity: songTitleDisplay.style.opacity,
    width: songTitleDisplay.style.width
  });
  
  // Start rhythm-based animation for music and video
  if (type === 'music' || type === 'video') {
    console.log(`🎵 Starting letter animation for ${letterSpans.length} letters`);
    startTitleAnimation(letterSpans);
  }
  
  // If title is long, add scrolling animation
  const titleWidth = songTitleDisplay.scrollWidth;
  const containerWidth = window.innerWidth;
  
  console.log(`🎵 Title width: ${titleWidth}px, Container width: ${containerWidth}px`);
  
  if (titleWidth > containerWidth) {
    songTitleDisplay.style.animation = 'none';
    setTimeout(() => {
      songTitleDisplay.style.animation = 'marquee 15s linear infinite';
    }, 10);
  } else {
    songTitleDisplay.style.animation = 'none';
  }
  
  console.log(`🎵 showSongTitle completed successfully`);
}

// Animate letters based on audio rhythm
function startTitleAnimation(letterSpans: HTMLSpanElement[]) {
  if (titleAnimationFrameId !== null) {
    cancelAnimationFrame(titleAnimationFrameId);
  }
  
  const scrollManager = (window as any).scrollManager;
  const kwami = scrollManager?.getKwami();
  
  let lastBeatTime = 0;
  const beatThreshold = 0.6; // Sensitivity for beat detection
  const minBeatInterval = 100; // Minimum ms between beats
  
  const animate = () => {
    if (!kwami?.body?.audio) {
      titleAnimationFrameId = requestAnimationFrame(animate);
      return;
    }
    
    const audioSystem = kwami.body.audio;
    const analyzer = audioSystem.getAnalyser?.();
    
    if (analyzer) {
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);
      
      // Calculate average volume (bass frequencies for beat detection)
      const bassEnd = Math.floor(bufferLength * 0.15);
      let bassSum = 0;
      for (let i = 0; i < bassEnd; i++) {
        bassSum += dataArray[i];
      }
      const bassAverage = bassSum / bassEnd / 255;
      
      // Detect beat
      const now = Date.now();
      if (bassAverage > beatThreshold && (now - lastBeatTime) > minBeatInterval) {
        lastBeatTime = now;
        
        // Make random letters jump
        const numLettersToJump = Math.floor(Math.random() * 3) + 2; // 2-4 letters
        const selectedIndices = new Set<number>();
        
        while (selectedIndices.size < numLettersToJump && selectedIndices.size < letterSpans.length) {
          const randomIndex = Math.floor(Math.random() * letterSpans.length);
          selectedIndices.add(randomIndex);
        }
        
        selectedIndices.forEach(index => {
          const span = letterSpans[index];
          const jumpHeight = (Math.random() * 8 + 4); // Random jump 4-12px
          const rotation = (Math.random() * 20 - 10); // Random rotation -10 to 10 degrees
          
          span.style.transform = `translateY(-${jumpHeight}px) rotate(${rotation}deg)`;
          
          // Reset after animation
          setTimeout(() => {
            span.style.transform = 'translateY(0) rotate(0deg)';
          }, 150);
        });
      } else {
        // Subtle continuous movement based on overall volume
        const midEnd = Math.floor(bufferLength * 0.5);
        let midSum = 0;
        for (let i = bassEnd; i < midEnd; i++) {
          midSum += dataArray[i];
        }
        const midAverage = midSum / (midEnd - bassEnd) / 255;
        
        // Apply subtle scale/movement to random letters
        if (Math.random() < midAverage * 0.3) {
          const randomIndex = Math.floor(Math.random() * letterSpans.length);
          const span = letterSpans[randomIndex];
          const scale = 1 + (midAverage * 0.1);
          
          span.style.transform = `scale(${scale})`;
          setTimeout(() => {
            span.style.transform = 'scale(1)';
          }, 100);
        }
      }
    }
    
    titleAnimationFrameId = requestAnimationFrame(animate);
  };
  
  titleAnimationFrameId = requestAnimationFrame(animate);
}

// Hide song title
function hideSongTitle() {
  songTitleDisplay.style.opacity = '0';
  songTitleDisplay.style.animation = 'none';
  
  // Stop animation loop
  if (titleAnimationFrameId !== null) {
    cancelAnimationFrame(titleAnimationFrameId);
    titleAnimationFrameId = null;
  }
}

function pickRandomVoiceUrl(): string | null {
  if (!VOICE_FILES.length) {
    return null;
  }

  if (VOICE_FILES.length === 1) {
    return VOICE_FILES[0];
  }

  let candidate: string | null = null;
  const attempts = new Set<string>();

  while (attempts.size < VOICE_FILES.length) {
    const next = VOICE_FILES[Math.floor(Math.random() * VOICE_FILES.length)];
    if (next !== currentVoiceUrl) {
      candidate = next;
      break;
    }
    attempts.add(next);
  }

  return candidate ?? VOICE_FILES[0];
}

async function playRandomVoiceClip() {
  if (!VOICE_FILES.length) {
    console.warn('🎤 No voice files found in /voices/');
    return;
  }

  const kwami = getKwamiInstance();
  if (!kwami) {
    console.warn('🎤 Kwami instance not ready yet');
    return;
  }

  const nextUrl = pickRandomVoiceUrl();
  if (!nextUrl) {
    console.warn('🎤 Could not select a voice file to play');
    return;
  }

  currentVoiceUrl = nextUrl;
  stopKwamiAudio();

  try {
    kwami.body.audio.loadAudioSource(nextUrl);
    await kwami.body.audio.play();
    // kwami.setState('speaking'); // Preserve section style
    isVoicePlaying = true;
    isMusicPlaying = false;
    isLowpassFilterActive = false;

    const voiceName = getMediaDisplayName(nextUrl);
    showSongTitle(voiceName, 'voice');

    const audioElement = kwami.body.audio.getAudioElement();
    if (voiceEndedHandler) {
      audioElement.removeEventListener('ended', voiceEndedHandler);
    }
    voiceEndedHandler = () => {
      isVoicePlaying = false;
      // kwami.setState('idle'); // Preserve section style
      hideSongTitle();
    };
    audioElement.addEventListener('ended', voiceEndedHandler, { once: true });
  } catch (error) {
    console.error('❌ Failed to play voice clip:', error);
    stopVoicePlayback();
  }
}

async function toggleVoicePlayback() {
  if (isVoicePlaying) {
    stopVoicePlayback();
  } else {
    await playRandomVoiceClip();
  }
}

function stopVoicePlayback() {
  if (!isVoicePlaying) {
    return;
  }
  stopKwamiAudio();
  isVoicePlaying = false;
  currentVoiceUrl = null;
}

function getOpenLowpassFrequency(audio: any): number {
  const ctx = audio.getAudioContext?.();
  if (ctx) {
    return Math.min(LOWPASS_OPEN_FREQUENCY, ctx.sampleRate / 2 - 100);
  }
  return LOWPASS_OPEN_FREQUENCY;
}

async function toggleMusicLowpass(forceState?: boolean) {
  const kwami = getKwamiInstance();
  const audio = kwami?.body?.audio;

  if (!kwami || !audio) {
    console.warn('🎚️ Lowpass toggle skipped - Kwami audio not ready');
    return;
  }

  if (!audio.isPlaying() && !isMusicPlaying) {
    console.warn('🎚️ Lowpass toggle skipped - no music playing');
    return;
  }

  const nextState = typeof forceState === 'boolean' ? forceState : !isLowpassFilterActive;
  const transitionSeconds = 1.15;
  const openFrequency = getOpenLowpassFrequency(audio);

  if (lowpassReleaseHandle !== null) {
    window.clearTimeout(lowpassReleaseHandle);
    lowpassReleaseHandle = null;
  }

  if (nextState) {
    audio.enableLowpassFilter({ frequency: openFrequency, q: 0.95 });
    audio.setLowpassFrequency(LOWPASS_CLOSED_FREQUENCY, { transitionTime: transitionSeconds, q: 1.3 });
  } else {
    audio.setLowpassFrequency(openFrequency, { transitionTime: transitionSeconds, q: 0.95 });
    lowpassReleaseHandle = window.setTimeout(() => {
      audio.disableLowpassFilter();
      lowpassReleaseHandle = null;
    }, transitionSeconds * 1000 + 150);
  }

  isLowpassFilterActive = nextState;
  console.log(`🎚️ Lowpass filter ${nextState ? 'enabled' : 'disabled'} with smooth ramp`);
}

function getKwamiVideoElement(kwami: Kwami): HTMLVideoElement | null {
  const body = kwami.body as any;
  if (!body) {
    return null;
  }

  // Try to get the appropriate video element based on current mode
  if (currentVideoMode === 'blob') {
    // For blob mode, prioritize blob surface video element
    const blobVideo = typeof body.getBlobSurfaceVideoElement === 'function' 
      ? body.getBlobSurfaceVideoElement() 
      : body.blobSurfaceVideoElement;
    if (blobVideo instanceof HTMLVideoElement) {
      return blobVideo;
    }
  }
  
  // For background mode or fallback
  const backgroundVideo = typeof body.getBackgroundVideoElement === 'function' 
    ? body.getBackgroundVideoElement() 
    : body.backgroundVideoElement;
  if (backgroundVideo instanceof HTMLVideoElement) {
    return backgroundVideo;
  }

  // Final fallback - check all candidates
  const candidates = [
    typeof body.getBackgroundVideoElement === 'function' ? body.getBackgroundVideoElement() : undefined,
    body.backgroundVideoElement,
    typeof body.getBlobSurfaceVideoElement === 'function' ? body.getBlobSurfaceVideoElement() : undefined,
    body.blobSurfaceVideoElement,
  ];

  for (const candidate of candidates) {
    if (candidate instanceof HTMLVideoElement) {
      return candidate;
    }
  }

  return null;
}

function getKwamiInstance(): Kwami | null {
  const scrollManager = (window as any).scrollManager;
  return scrollManager?.getKwami?.() ?? null;
}

function pickRandomVideoUrl(exclude: Set<string> = new Set()): string | null {
  if (!PLAYABLE_VIDEO_LINKS.length) {
    return null;
  }

  const candidates = PLAYABLE_VIDEO_LINKS.filter(link => !exclude.has(link));
  if (!candidates.length) {
    return null;
  }

  let selectionPool = candidates;
  if (candidates.length > 1 && currentVideoUrl) {
    const filtered = candidates.filter(link => link !== currentVideoUrl);
    if (filtered.length) {
      selectionPool = filtered;
    }
  }

  const randomIndex = Math.floor(Math.random() * selectionPool.length);
  return selectionPool[randomIndex];
}

function cleanupVideoElementListeners() {
  if (videoElementCleanup) {
    videoElementCleanup();
    videoElementCleanup = null;
  }
}

function releaseActiveVideoStream() {
  if (activeVideoStream) {
    activeVideoStream.getTracks().forEach(track => track.stop());
    activeVideoStream = null;
  }
}

function stopVideoPlayback(explicitKwami?: Kwami | null, options: { preserveUrl?: boolean } = {}) {
  const kwami = explicitKwami ?? getKwamiInstance();

  cleanupVideoElementListeners();
  releaseActiveVideoStream();
  
  // Hide video title when stopping
  hideSongTitle();

  if (!kwami) {
    currentVideoUrl = null;
    currentVideoMode = 'none';
    isVideoLoading = false;
    return;
  }

  try {
    const activeVideo = getKwamiVideoElement(kwami);
    activeVideo?.pause();
  } catch (error) {
    console.warn('🎥 Failed to pause video element:', error);
  }


  kwami.body.audio.disconnectMediaStream();

  if (currentVideoMode === 'background') {
    kwami.body.clearBackgroundMedia();
  }
  if (currentVideoMode === 'blob' && typeof kwami.body.setBlobSurfaceVideo === 'function') {
    kwami.body.setBlobSurfaceVideo(null);
  }

  if (currentVideoMode !== 'none') {
    // kwami.setState('idle'); // Preserve section style
  }

  currentVideoMode = 'none';
  isVideoLoading = false;
  if (!options.preserveUrl) {
    currentVideoUrl = null;
  }
}

async function waitForKwamiVideoElement(kwami: Kwami, timeout = 7000): Promise<HTMLVideoElement | null> {
  const start = performance.now();

  return new Promise(resolve => {
    let latestElement: HTMLVideoElement | null = null;

    const tick = () => {
      const videoElement = getKwamiVideoElement(kwami);
      if (videoElement) {
        latestElement = videoElement;
      }

      if (latestElement && latestElement.readyState >= 2) {
        resolve(latestElement);
        return;
      }

      if (performance.now() - start >= timeout) {
        resolve(latestElement);
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

async function attachVideoAudioToKwami(
  kwami: Kwami,
  videoElement: HTMLVideoElement,
  sourceUrl: string,
  mode: 'background' | 'blob'
): Promise<VideoAttachResult> {
  cleanupVideoElementListeners();

  const handleEnded = () => {
    if (videoElement.loop) {
      return;
    }
    currentVideoMode = 'none';
    // kwami.setState('idle'); // Preserve section style
  };

  const handleError = (event: Event) => {
    console.error('🎥 Blob surface video error:', event);
    stopVideoPlayback(kwami);
  };

  videoElement.addEventListener('ended', handleEnded);
  videoElement.addEventListener('error', handleError);
  videoElementCleanup = () => {
    videoElement.removeEventListener('ended', handleEnded);
    videoElement.removeEventListener('error', handleError);
  };

  const captureStream: (() => MediaStream | null) | undefined =
    (videoElement as any).captureStream ||
    (videoElement as any).mozCaptureStream ||
    (videoElement as any).webkitCaptureStream;

  if (typeof captureStream !== 'function') {
    console.warn('🎥 captureStream() not supported in this browser; skipping audio visualization for video.');
    return 'stream-error';
  }

  try {
    const stream = captureStream.call(videoElement);
    if (!stream) {
      console.warn('🎥 Failed to capture MediaStream from video element.');
      return 'stream-error';
    }

    const hasAudioTrack = stream.getAudioTracks().length > 0;
    if (!hasAudioTrack) {
      // No audio track available; allow the video to keep playing visually
      return 'no-audio';
    }

    releaseActiveVideoStream();
    activeVideoStream = stream;

    await kwami.body.audio.connectMediaStream(stream);

    if (videoElement.paused) {
      await videoElement.play().catch(() => {});
    }

    // kwami.setState('speaking'); // Preserve section style
    console.log(`🎥 Blob video audio stream attached: ${sourceUrl}`);
    currentVideoMode = mode;
    return 'success';
  } catch (error) {
    console.error('🎥 Unable to connect video audio stream:', error);
    return 'stream-error';
  }
}

async function playRandomVideo(options: { mode?: 'background' | 'blob'; reuseCurrent?: boolean } = {}) {
  const mode = options.mode ?? 'background';
  const reuseCurrent = options.reuseCurrent ?? false;

  if (isVideoLoading) {
    console.warn('🎥 A video is already loading, please wait...');
    return;
  }

  if (!PLAYABLE_VIDEO_LINKS.length) {
    console.warn('🎥 No video files found in /video/ directory');
    return;
  }

  const kwami = getKwamiInstance();
  if (!kwami) {
    console.warn('🎥 Kwami instance not ready yet');
    return;
  }

  const attempted = new Set<string>();
  let playbackStarted = false;

  isVideoLoading = true;
  stopVideoPlayback(kwami, { preserveUrl: reuseCurrent });

  try {
    while (attempted.size < PLAYABLE_VIDEO_LINKS.length) {
      let nextUrl: string | null = null;
      if (reuseCurrent && currentVideoUrl && attempted.size === 0) {
        nextUrl = currentVideoUrl;
      } else {
        nextUrl = pickRandomVideoUrl(attempted);
      }

      if (!nextUrl) {
        break;
      }

      attempted.add(nextUrl);
      currentVideoUrl = nextUrl;

      console.log(`🎥 Loading ${mode === 'blob' ? 'blob' : 'background'} video stream: ${nextUrl}`);

      playbackStarted = mode === 'blob'
        ? await playVideoInsideBlob(kwami, nextUrl)
        : await playVideoAsBackground(kwami, nextUrl);

      if (playbackStarted) {
        break;
      }
    }

    if (!playbackStarted) {
      console.warn('🎥 Could not start video playback from /video/ directory');
    }
  } finally {
    if (!playbackStarted) {
      stopVideoPlayback(kwami, { preserveUrl: reuseCurrent });
    }
    isVideoLoading = false;
  }
}

async function playVideoAsBackground(kwami: Kwami, url: string): Promise<boolean> {
  try {
    kwami.body.clearBackgroundMedia();
    kwami.body.setBackgroundVideo(url, {
      autoplay: true,
      loop: true,
      muted: true,
      fit: 'cover',
    });

    const videoElement = await waitForKwamiVideoElement(kwami);

    if (!videoElement) {
      console.warn('🎥 Background video element was not ready, trying another source...');
      return false;
    }

    videoElement.muted = true;
    videoElement.volume = 0;

    if (videoElement.paused) {
      try {
        await videoElement.play();
      } catch (playError) {
        console.warn('🎥 Failed to auto-play background video:', playError);
      }
    }

    const attachResult = await attachVideoAudioToKwami(kwami, videoElement, url, 'background');
    const videoName = getMediaDisplayName(url);
    showSongTitle(videoName, 'video');

    if (attachResult === 'success') {
      console.log('🎥 Video streaming with audio-reactive blob!');
      return true;
    }

    if (attachResult === 'no-audio') {
      console.warn('🎥 Video has no audio track. Playing visual-only background.');
      // kwami.setState('thinking'); // Preserve section style
      currentVideoMode = 'background';
      return true;
    }

    return false;
  } catch (error) {
    console.error('🎥 Error while loading background video:', error);
    return false;
  }
}

async function playVideoInsideBlob(kwami: Kwami, url: string): Promise<boolean> {
  try {
    console.log('🎥 Starting playVideoInsideBlob with URL:', url);
    kwami.body.clearBackgroundMedia();

    console.log('🎥 Setting blob surface video...');
    kwami.body.setBlobSurfaceVideo(url, {
      autoplay: true,
      loop: true,
      muted: true,
      playbackRate: 1,
    });

    // Set the mode early so getKwamiVideoElement knows to look for blob video
    currentVideoMode = 'blob';

    const videoElement = await waitForKwamiVideoElement(kwami);

    if (!videoElement) {
      console.warn('🎥 Blob video element was not ready, trying another source...');
      currentVideoMode = 'none';
      return false;
    }

    videoElement.muted = true;

    if (videoElement.paused) {
      try {
        await videoElement.play();
      } catch (playError) {
        console.warn('🎥 Failed to auto-play blob video:', playError);
      }
    }

    const attachResult = await attachVideoAudioToKwami(kwami, videoElement, url, 'blob');
    const videoName = getMediaDisplayName(url);
    showSongTitle(videoName, 'video');

    if (attachResult === 'success') {
      console.log('🎥 Video streaming inside blob with glass effect!');
      // currentVideoMode is already set in attachVideoAudioToKwami
      return true;
    }

    if (attachResult === 'no-audio') {
      console.warn('🎥 Blob video has no audio track. Showing visual-only mode.');
      // kwami.setState('thinking'); // Preserve section style
      // currentVideoMode is already set to 'blob' earlier
      return true;
    }

    return false;
  } catch (error) {
    console.error('🎥 Error while loading blob video:', error);
    return false;
  }
}

async function toggleVideoPresentation() {
  if (currentVideoMode === 'background') {
    await playRandomVideo({ mode: 'blob', reuseCurrent: true });
    return;
  }

  if (currentVideoMode === 'blob') {
    await playRandomVideo({ mode: 'background', reuseCurrent: true });
    return;
  }

  await playRandomVideo({ mode: 'background' });
}

// Console message
console.log(`
  ${t('console.welcome')}
  ${t('console.github')}
  
  ${t('console.tip_scroll')}
  ${t('console.tip_double_click')}
  ${t('console.tip_voice')}
  ${t('console.tip_music')}
`);
