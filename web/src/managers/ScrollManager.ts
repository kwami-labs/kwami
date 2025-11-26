import { Kwami } from 'kwami';
import type { KwamiConfig } from 'kwami';
import { COLOR_PALETTES } from '../config/colors';
import type { ColorPalette } from '../config/colors';
import { BLOB_CONFIGS } from '../config/blobConfigs';
import {
  BLOB_OPACITY_DESKTOP,
  BLOB_OPACITY_MOBILE,
  BLOB_SCALE_DESKTOP,
  BLOB_SCALE_MOBILE,
  MOBILE_BREAKPOINT
} from '../config/constants';
import { getCurrentLanguage } from '../i18n';
import { SidebarNavigator } from './SidebarNavigator';
import { CursorLight } from './CursorLight';
import { isRTLLanguage } from '../utils/languageUtils';
import { toggleMusicLowpass } from '../media/MusicPlayer';
import { toggleVoicePlayback } from '../media/VoicePlayer';
import { getVideoState, playRandomVideo, toggleVideoPresentation } from '../media/VideoPlayer';
import { rafThrottle, getPassiveEventOptions } from '../utils/performanceUtils';
import { getPageAudioManager } from '../media/PageAudioManager';
import { animatePageSection } from '../utils/pageTextAnimation';
import { getKwamiAppsConfig } from '../config/env';

const blobConfigs = BLOB_CONFIGS;
const colorPalettes = COLOR_PALETTES;

export class ScrollManager {
  private sections: NodeListOf<Element>;
  private currentSection = 0;
  private kwami: Kwami | null = null;
  private root: HTMLElement;
  private isTransitioning = false;
  private sidebarNav: SidebarNavigator;
  private cursorLight: CursorLight;
  private pageAudioManager = getPageAudioManager();
  private clickCount = 0;
  private clickTimer: number | null = null;

  constructor() {
    this.sections = document.querySelectorAll('.text-section');
    this.root = document.documentElement;
    this.root.style.setProperty('--section-count', this.sections.length.toString());
    this.sidebarNav = new SidebarNavigator(this.sections.length, {
      getCurrentSection: () => this.currentSection,
    });
    this.cursorLight = new CursorLight();

    this.init();
    // Use RAF-throttled scroll handler for better performance
    const throttledScroll = rafThrottle(this.handleScroll.bind(this));
    window.addEventListener('scroll', throttledScroll, getPassiveEventOptions());
    this.handleScroll();
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

  public updateBlobPosition(animated: boolean = true, forceCenter: boolean = false) {
    if (!this.kwami) return;

    const blobMesh = this.kwami.body.blob.getMesh();
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const currentLang = getCurrentLanguage();
    const isRTL = isRTLLanguage(currentLang);

    let targetX: number;
    let targetY: number;

    // Page 00: Center the blob
    if (forceCenter || this.currentSection === 0) {
      targetX = 0;
      targetY = 0;
    } else if (isMobile) {
      targetX = 0;
      targetY = -9;
    } else {
      targetX = isRTL ? -8 : 8;
      targetY = 0;
    }

    if (animated) {
      const startX = blobMesh.position.x;
      const startY = blobMesh.position.y;
      const duration = 800;
      const startTime = performance.now();

      const animateBlob = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        blobMesh.position.x = startX + (targetX - startX) * easeProgress;
        blobMesh.position.y = startY + (targetY - startY) * easeProgress;

        if (progress < 1) {
          requestAnimationFrame(animateBlob);
        }
      };

      requestAnimationFrame(animateBlob);
    } else {
      blobMesh.position.set(targetX, targetY, 0);
    }

    console.log(`🎨 Blob position updated: x=${targetX.toFixed(1)}, y=${targetY.toFixed(1)} (${isRTL ? 'RTL' : 'LTR'}, section=${this.currentSection})`);
  }

  private async init() {
    this.updateColors(0);
    this.cursorLight.updateColors({
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#808080'
    });

    try {
      const container = document.getElementById('kwami-container');
      if (!container) {
        throw new Error('Kwami container not found');
      }

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      container.appendChild(canvas);

      await new Promise(resolve => setTimeout(resolve, 10));

      // Get page 00 config from kwamis.json
      const config = blobConfigs[0];
      const palette = this.getPaletteForSection(0);

      const kwamiConfig: KwamiConfig = {
        body: {
          initialSkin: (config.skin || 'Donut') as 'Donut' | 'Poles' | 'Vintage',
          blob: {
            resolution: config.resolution || 180,
            spikes: { x: config.spikeX, y: config.spikeY, z: config.spikeZ },
            time: { x: config.timeX, y: config.timeY, z: config.timeZ },
            rotation: { x: 0, y: 0, z: 0 },
            wireframe: config.wireframe || false,
            colors: {
              x: palette.primary,
              y: palette.accent,
              z: palette.secondary,
            },
          },
          scene: {
            cameraPosition: { x: 0, y: 0, z: 12 },
            enableControls: false,
          },
        },
      };

      const appsConfig = getKwamiAppsConfig();
      if (appsConfig) {
        kwamiConfig.apps = appsConfig;
      }

      this.kwami = new Kwami(canvas, kwamiConfig);

      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      const blobScale = isMobile ? BLOB_SCALE_MOBILE : BLOB_SCALE_DESKTOP;
      this.kwami.body.blob.setScale(blobScale);
      this.kwami.body.blob.setWireframe(config.wireframe);

      if (isMobile) {
        this.kwami.body.blob.setOpacity(BLOB_OPACITY_MOBILE);
      }

      const blobMesh = this.kwami.body.blob.getMesh();
      this.updateBlobPosition(false);

      const animate = () => {
        blobMesh.rotation.y += 0.002;
        requestAnimationFrame(animate);
      };
      animate();

      window.addEventListener('resize', () => {
        const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const scale = mobile ? BLOB_SCALE_MOBILE : BLOB_SCALE_DESKTOP;
        this.updateBlobPosition(false);
        this.kwami?.body.blob.setScale(scale);
        this.kwami?.body.blob.setOpacity(mobile ? BLOB_OPACITY_MOBILE : BLOB_OPACITY_DESKTOP);
      });

      if (this.kwami?.body?.blob) {
        this.kwami.body.blob.onDoubleClick = () => {
          console.log('🎲 Double-click detected, randomizing blob');
          this.performFullRandomization();
        };
      }

      this.kwami?.body.blob.enableClickInteraction();
      this.setupInteractions(canvas);

      // Load page 00 audio immediately
      console.log('🎤 Loading page 00 audio on initialization');
      await this.pageAudioManager.loadAndPlayPageAudio(0);
    } catch (error) {
      console.error('❌ Failed to initialize Kwami:', error);
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

    const totalSections = this.sections.length;
    const sectionHeight = docHeight / totalSections;
    const section = Math.min(
      Math.floor(scrollTop / sectionHeight),
      totalSections - 1
    );

    const sectionProgress = (scrollTop % sectionHeight) / sectionHeight;

    this.updateActiveSection(section);
    this.sidebarNav.updateActiveSphere(section);

    if (section !== this.currentSection && !this.isTransitioning) {
      this.currentSection = section;
      const palette = this.getPaletteForSection(section);
      this.updateColors(section);
      this.updateKwamiConfig(section);
      this.sidebarNav.updateSphereColors(section);
      this.cursorLight.updateColors(palette);
      
      // Update content-right class based on section
      const contentRight = document.querySelector('.content-right');
      if (contentRight) {
        if (section === 0) {
          contentRight.classList.add('page-00');
        } else {
          contentRight.classList.remove('page-00');
        }
      }
      
      // Update blob position (center on page 0)
      this.updateBlobPosition(true);
      
      // Load and play audio for the new page
      this.pageAudioManager.loadAndPlayPageAudio(section);
      
      // Trigger text animation for the new page (skip page 0 - no text)
      if (section !== 0) {
        animatePageSection(section);
      }
    }

    this.addColorVariations(sectionProgress);
  }

  private updateActiveSection(section: number) {
    this.sections.forEach((sec, index) => {
      sec.classList.remove('active', 'exiting', 'entering');

      if (index === section) {
        sec.classList.add('active');
      } else if (index < section) {
        sec.classList.add('exiting');
      } else {
        sec.classList.add('entering');
      }
    });
  }

  private getPaletteForSection(section: number): ColorPalette {
    // Get color palette from kwamis.json config
    const config = blobConfigs[section % blobConfigs.length];
    
    // Check if config has colorPalette property
    if ((config as any).colorPalette && Array.isArray((config as any).colorPalette)) {
      const colors = (config as any).colorPalette;
      const palette = {
        primary: colors[0] || '#ffffff',
        secondary: colors[1] || '#000000',
        accent: colors[2] || '#808080'
      };
      console.log(`🎨 Page ${section} palette from kwamis.json:`, palette);
      return palette;
    }
    
    // Fallback to color palettes array
    if (section === 0) {
      console.log(`🎨 Page ${section} using fallback palette (no colorPalette in config)`);
      return {
        primary: '#ffffff',
        secondary: '#000000',
        accent: '#808080'
      };
    }
    return colorPalettes[section % colorPalettes.length];
  }

  private updateColors(section: number) {
    const palette = this.getPaletteForSection(section);
    this.root.style.setProperty('--color-primary', palette.primary);
    this.root.style.setProperty('--color-secondary', palette.secondary);
    this.root.style.setProperty('--color-accent', palette.accent);
  }

  private async updateKwamiConfig(section: number) {
    if (!this.kwami) return;

    this.isTransitioning = true;
    const config = blobConfigs[section % blobConfigs.length];
    const palette = this.getPaletteForSection(section);

    try {
      this.kwami.body.blob.setSpikes(config.spikeX, config.spikeY, config.spikeZ);
      this.kwami.body.blob.setTime(config.timeX, config.timeY, config.timeZ);
      this.kwami.body.blob.setColors(palette.primary, palette.accent, palette.secondary);

      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      if (isMobile) {
        this.kwami.body.blob.setOpacity(BLOB_OPACITY_MOBILE);
      }

      setTimeout(() => {
        this.isTransitioning = false;
      }, 100);
    } catch (error) {
      console.error('Error updating Kwami config:', error);
      this.isTransitioning = false;
    }
  }

  private setupInteractions(canvas: HTMLCanvasElement) {
    canvas.addEventListener('dblclick', () => {
      console.log('🎲 Double-click detected, randomizing blob');
      this.performFullRandomization();
    });

    canvas.addEventListener('click', (e: MouseEvent) => {
      // Increment click count
      this.clickCount++;

      // Clear existing timer
      if (this.clickTimer !== null) {
        clearTimeout(this.clickTimer);
      }

      // Set a timer to detect single vs double click
      this.clickTimer = window.setTimeout(() => {
        if (this.clickCount === 1) {
          // Single click - handle pause/play
          this.handleSingleClick(e);
        } else if (this.clickCount === 2) {
          // Double click - randomize (handled by dblclick event)
          // We don't need to do anything here as dblclick handler takes care of it
        }
        // Reset click count
        this.clickCount = 0;
        this.clickTimer = null;
      }, 250); // 250ms delay to detect double click
    });
  }

  private handleSingleClick(e: MouseEvent) {
    const activeTab = document.querySelector('.tab-btn.active');
    const activeTabType = activeTab?.getAttribute('data-tab');

    if (activeTabType === 'video') {
      const { currentVideoMode, currentVideoUrl, isVideoLoading } = getVideoState();
      if (currentVideoUrl && currentVideoMode !== 'none' && !isVideoLoading) {
        toggleVideoPresentation();
      } else if (!isVideoLoading && !currentVideoUrl) {
        playRandomVideo({ mode: 'background' });
      }
      return;
    }

    if (activeTabType === 'music') {
      const kwami = (window as any).scrollManager?.getKwami?.();
      if (kwami?.body?.audio?.isPlaying()) {
        toggleMusicLowpass();
      }
      return;
    }

    if (activeTabType === 'voice') {
      toggleVoicePlayback();
      return;
    }

    // Default behavior: toggle page audio (no tab selected or other tab)
    this.pageAudioManager.togglePageAudio();
  }

  private performFullRandomization() {
    if (!this.kwami) return;

    this.kwami.body.randomizeBlob();

    const skinTypes = [
      'Donut', 'Donut', 'Donut', 'Donut', 'Donut',
      'Poles', 'Poles', 'Poles', 'Poles',
      'Vintage'
    ];
    const randomSkin = skinTypes[Math.floor(Math.random() * skinTypes.length)] as 'Donut' | 'Poles' | 'Vintage';
    this.kwami.body.blob.setSkin(randomSkin);

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobile) {
      this.kwami.body.blob.setOpacity(BLOB_OPACITY_MOBILE);
    }

    console.log(`🎲 Blob randomized with ${randomSkin} skin!`);
  }

  private addColorVariations(progress: number) {
    const stops = document.querySelectorAll('.logo-stop1, .logo-stop2, .logo-stop3');

    stops.forEach((stop, index) => {
      const hueShift = Math.sin(progress * Math.PI * 2 + index) * 15;
      const filter = `hue-rotate(${hueShift}deg)`;
      (stop as SVGStopElement).style.filter = filter;
    });
  }
}


