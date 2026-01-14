import { gsap } from 'gsap';
import type { Kwami, KwamiConfig } from 'kwami';
import i18next, { t, createLanguageSwitcher } from '../i18n';
import { getThemeModeManager } from '../managers/ThemeModeManager';
import { getKwamiAppsConfig } from '../config/env';

// Static loader path (from public/loader folder)
const LOADER_GIF = '/loader/loader.gif';

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

// Generate color palettes for 22 sections using sequential 2-color gradients
const colorPalettes = tailwindColors500.map((color, index) => {
  const nextColor = tailwindColors500[(index + 1) % tailwindColors500.length];
  const middleColor = blendColors(color, nextColor);
  
  return {
    primary: color,        // Color 1 for Kwami blob
    secondary: nextColor,  // Color 2 for Kwami blob  
    accent: middleColor    // Blended middle color for Kwami blob
  };
});

export class WelcomeLayer {
  private showButton = true;
  private startAnimation = false;
  private showLoader = true;
  private showContainer = true;
  private readonly secondsLoader = 6;
  private readonly secondsContainer: number;
  private container: HTMLElement | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private kwami: Kwami | null = null;
  private kwamiContainer: HTMLElement | null = null;
  private loaderOverlay: HTMLElement | null = null;
  private welcomeInfo: HTMLElement | null = null;
  private blobSpikeState = { x: 0, y: 0, z: 0 };
  private blobTimeState = { x: 0, y: 0, z: 0 };
  private hasStartedSvgAnimation = false;
  private scrollHandler: (() => void) | null = null;
  private currentSection = 0;
  private static readonly STORAGE_KEY = 'kwami_skip_welcome';
  private sidebarNav: HTMLElement | null = null;
  private sidebarPlaceholder: Comment | null = null;
  private onCompleteCallback: (() => void) | null = null;
  private onExitStartCallback: (() => void) | null = null;
  private hasSignaledExitStart = false;
  private themeToggleButton: HTMLElement | null = null;

  constructor(onComplete?: () => void, onExitStart?: () => void) {
    this.onExitStartCallback = onExitStart || null;
    this.onCompleteCallback = onComplete || null;
    this.secondsContainer = this.secondsLoader + 2;
    
    // Check if user has opted to skip welcome screen
    if (this.shouldSkipWelcome()) {
      console.log('⏭️ Skipping welcome layer (user preference)');
      this.createWelcomeLayerSkipped();
      return;
    }
    
    this.createWelcomeLayer();
    this.preloadAudio();
  }

  private shouldSkipWelcome(): boolean {
    // Check for force-show query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === '1') {
      return false; // Force show welcome
    }
    
    // Check for hard reload (Ctrl+Shift+R / Cmd+Shift+R) - reset preference
    const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (perfEntries.length > 0) {
      const navEntry = perfEntries[0];
      // Check if it's a hard reload by looking at the navigation type
      // In modern browsers, hard reload doesn't have a specific flag, so we keep the preference
      // Only reset on hard reload if explicitly detected
      if ((navEntry as any).type === 'reload' && (performance.navigation as any)?.type === 1) {
        localStorage.removeItem(WelcomeLayer.STORAGE_KEY);
        console.log('🔄 Hard reload detected - resetting welcome preference');
        return false;
      }
    }
    
    // Check localStorage preference
    const skipWelcome = localStorage.getItem(WelcomeLayer.STORAGE_KEY) === 'true';
    console.log(`🔍 Checking skip welcome: ${skipWelcome ? 'YES (skipping)' : 'NO (showing)'}`);
    return skipWelcome;
  }

  private setSkipWelcome(skip: boolean) {
    if (skip) {
      localStorage.setItem(WelcomeLayer.STORAGE_KEY, 'true');
      console.log('💾 Saved to localStorage: kwami_skip_welcome = true');
    } else {
      localStorage.removeItem(WelcomeLayer.STORAGE_KEY);
      console.log('🗑️ Removed from localStorage: kwami_skip_welcome');
    }
  }

  private preloadAudio() {
    // Preload the intro audio
    this.audioElement = new Audio('/fx/intro.mp3');
    this.audioElement.preload = 'auto';
    this.audioElement.volume = 0.7;
  }

  private createWelcomeLayerSkipped() {
    // Create simplified container that goes straight to SVG animation
    this.container = document.createElement('div');
    this.container.className = 'loader-container';
    this.container.style.opacity = '1';

    // Create SVG
    const svg = this.createSVG();
    svg.classList.remove('hidden');
    svg.classList.add('visible');

    // Create version display
    const versionDiv = document.createElement('div');
    versionDiv.id = 'version';
    versionDiv.className = 'fixed bottom-10 text-sm text-gray-400 opacity-80';
    versionDiv.textContent = 'KWAMI v.1.5.12';

    // Create welcome language switcher using shared function
    const welcomeLangSwitcher = createLanguageSwitcher('welcome-language-switcher');

    // Create theme toggle button
    this.themeToggleButton = this.createThemeToggleButton();

    this.container.appendChild(svg);
    this.container.appendChild(versionDiv);
    this.container.appendChild(welcomeLangSwitcher);
    this.container.appendChild(this.themeToggleButton);
    document.body.appendChild(this.container);
    this.attachSidebarNavigation();

    // Preload audio for skipped version
    this.audioElement = new Audio('/fx/intro.mp3');
    this.audioElement.preload = 'auto';
    this.audioElement.volume = 0.7;

    // Start SVG animation immediately with shorter duration
    this.hasStartedSvgAnimation = true;
    this.showButton = false;
    setTimeout(() => {
      this.initAnimationSkipped();
      
      // Play audio
      if (this.audioElement) {
        this.audioElement.play().catch(error => {
          console.warn('⚠️ Could not play intro audio:', error);
        });
      }
      
      // Start onboarding tour and trigger completion callback after skipped animation completes (3 seconds)
      setTimeout(() => {
        const onboardingTour = (window as any).onboardingTour;
        if (onboardingTour) {
          onboardingTour.start();
          console.log('🎓 Starting onboarding tour after skipped welcome layer');
        }
        
        // Signal that welcome layer is complete
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
      }, 3500); // 3.5 seconds - slightly after the 3-second skipped animation
    }, 100);
  }

  private createWelcomeLayer() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'loader-container';
    this.container.style.opacity = '1';

    // Create loader overlay (shown while blob is loading)
    this.loaderOverlay = document.createElement('div');
    this.loaderOverlay.className = 'welcome-loader-overlay';
    const loaderImage = document.createElement('img');
    loaderImage.className = 'welcome-loader-image';
    loaderImage.src = LOADER_GIF;
    loaderImage.style.opacity = '0.5';
    loaderImage.alt = 'Loading...';
    this.loaderOverlay.appendChild(loaderImage);

    // Create Kwami container (initially hidden with opacity 0)
    this.kwamiContainer = document.createElement('div');
    this.kwamiContainer.className = 'welcome-kwami-container fade-in-leave-active';
    this.kwamiContainer.style.opacity = '0';
    this.kwamiContainer.addEventListener('click', () => this.handleClick());

    // Create welcome info text (initially hidden)
    this.welcomeInfo = document.createElement('div');
    this.welcomeInfo.className = 'welcome-info text-paused';
    this.welcomeInfo.style.opacity = '0';
    this.welcomeInfo.style.visibility = 'hidden';
    
    // Create "Don't show again" checkbox FIRST
    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-welcome-container';
    skipContainer.style.opacity = '0';
    skipContainer.style.transform = 'translateY(10px)';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'skip-welcome-checkbox';
    checkbox.className = 'skip-welcome-checkbox';
    
    const label = document.createElement('label');
    label.htmlFor = 'skip-welcome-checkbox';
    label.className = 'skip-welcome-label';
    label.textContent = "Don't show this again";
    
    checkbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.setSkipWelcome(target.checked);
      console.log(target.checked ? '✅ Welcome will be skipped on next visit' : '🔄 Welcome will show on next visit');
    });
    
    skipContainer.appendChild(checkbox);
    skipContainer.appendChild(label);

    // Append checkbox to welcome info FIRST
    if (this.welcomeInfo) {
      this.welcomeInfo.appendChild(skipContainer);
      console.log('📌 Checkbox appended to welcomeInfo');
    }
    
    // NOW populate text and schedule checkbox animation
    this.populateWelcomeText();
    
    // Listen for language changes and reload text with animation
    i18next.on('languageChanged', () => {
      if (this.welcomeInfo && this.showButton) {
        this.reloadWelcomeText();
      }
    });

    // Create SVG (initially hidden)
    const svg = this.createSVG();
    svg.classList.add('hidden');
    svg.style.visibility = 'hidden';
    svg.style.opacity = '0';

    // Create version display (initially hidden)
    const versionDiv = document.createElement('div');
    versionDiv.id = 'version';
    versionDiv.className = 'fixed bottom-10 text-sm text-gray-400 opacity-80';
    versionDiv.textContent = 'KWAMI v.1.5.12';
    versionDiv.style.visibility = 'hidden';
    versionDiv.style.opacity = '0';

    // Create welcome language switcher using shared function (initially hidden)
    const welcomeLangSwitcher = createLanguageSwitcher('welcome-language-switcher');
    welcomeLangSwitcher.style.opacity = '0';
    welcomeLangSwitcher.style.visibility = 'hidden';

    // Create theme toggle button (initially hidden)
    this.themeToggleButton = this.createThemeToggleButton();
    this.themeToggleButton.style.opacity = '0';
    this.themeToggleButton.style.visibility = 'hidden';

    // Append elements (loader overlay first, then kwami container)
    this.container.appendChild(this.loaderOverlay);
    this.container.appendChild(this.kwamiContainer);
    if (this.welcomeInfo) {
      this.container.appendChild(this.welcomeInfo);
    }
    this.container.appendChild(svg);
    this.container.appendChild(versionDiv);
    this.container.appendChild(welcomeLangSwitcher);
    this.container.appendChild(this.themeToggleButton);

    // Add to body
    document.body.appendChild(this.container);
    this.attachSidebarNavigation();

    // Initialize Kwami
    this.initWelcomeKwami();
  }

  private attachSidebarNavigation() {
    if (this.sidebarNav || !this.container) return;

    const nav = document.getElementById('sidebar-nav');
    if (!nav || !nav.parentNode) return;

    this.sidebarPlaceholder = document.createComment('sidebar-nav-placeholder');
    nav.parentNode.insertBefore(this.sidebarPlaceholder, nav);
    this.container.appendChild(nav);
    nav.classList.add('inside-welcome-layer');
    this.sidebarNav = nav;

  }

  private triggerSidebarWave() {
    if (!this.sidebarNav) return;
    const sphereContainer = this.sidebarNav.querySelector('.sphere-container');
    if (!sphereContainer) return;

    sphereContainer.classList.remove('wave-enter');
    void sphereContainer.getBoundingClientRect(); // Force reflow
    sphereContainer.classList.add('wave-enter');
  }

  private triggerSidebarExit() {
    if (!this.sidebarNav) return;
    const spheres = Array.from(this.sidebarNav.querySelectorAll('.nav-sphere'));
    if (spheres.length === 0) return;

    // Animate spheres out from bottom to top (reverse order)
    spheres.reverse().forEach((sphere, index) => {
      const htmlSphere = sphere as HTMLElement;
      gsap.to(htmlSphere, {
        opacity: 0,
        y: 12,
        scale: 0.6,
        duration: 0.3,
        delay: index * 0.05, // 50ms stagger
        ease: 'power2.in'
      });
    });
  }

  private detachSidebarNavigation() {
    if (!this.sidebarNav) return;

    // Ensure no leftover wave class is present when the nav becomes visible in the main app.
    const sphereContainer = this.sidebarNav.querySelector('.sphere-container');
    sphereContainer?.classList.remove('wave-enter');

    if (this.sidebarPlaceholder && this.sidebarPlaceholder.parentNode) {
      this.sidebarPlaceholder.parentNode.replaceChild(this.sidebarNav, this.sidebarPlaceholder);
    } else {
      document.body.appendChild(this.sidebarNav);
    }

    this.sidebarNav.classList.remove('inside-welcome-layer');
    this.sidebarNav = null;
    this.sidebarPlaceholder = null;
  }

  private createThemeToggleButton(): HTMLElement {
    const themeManager = getThemeModeManager();
    return themeManager.createThemeToggleButton('welcome-theme-toggle');
  }

  private async initWelcomeKwami() {
    if (!this.kwamiContainer) return;

    try {
      // Create canvas for Kwami
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      this.kwamiContainer.appendChild(canvas);

      // Wait for canvas to be in DOM
      await new Promise(resolve => setTimeout(resolve, 10));

      // Initialize Kwami with FIXED black configuration (no randomness)
      const spikes = {
        x: 0.2,
        y: 2.2,
        z: 0.3
      };

      const timeConfig = {
        x: 3,
        y: 3,
        z: 3
      };

      this.blobSpikeState = { ...spikes };
      this.blobTimeState = { ...timeConfig };

      const kwamiConfig: KwamiConfig = {
        body: {
          initialSkin: 'Donut',
          blob: {
            resolution: 180,
            spikes,
            time: timeConfig,
            rotation: { x: 0, y: 0, z: 0 },
            wireframe: false,
            shininess: 0,
            colors: {
              x: '#ffffff',
              y: '#808080',
              z: '#000000'
            }
          },
          scene: {
            cameraPosition: { x: 0, y: 0, z: 12 },
            enableControls: false
          }
        },
      };

      const appsConfig = getKwamiAppsConfig();
      if (appsConfig) {
        kwamiConfig.apps = appsConfig;
      }

      const { Kwami } = await import('kwami');
      this.kwami = new Kwami(canvas, kwamiConfig);

      // Enable blob interaction WITHOUT conversation callback (disables double-click microphone)
      // This allows rotation and click effects but no microphone activation
      this.kwami.body.enableBlobInteraction(undefined);
      
      // Disable context menu (no right-click actions)
      this.kwami.body.disableContextMenu();

      // Set blob scale based on screen size - bigger for welcome screen
      const isMobile = window.innerWidth <= 768;
      const finalBlobScale = isMobile ? 7.5 : 7.8;
      
      // Start SMALL (50% of final size) - will grow during animation
      const initialScale = finalBlobScale * 0.5;
      this.kwami.body.blob.setScale(initialScale);
      this.kwami.body.blob.setWireframe(false);
      
      // FORCE set colors explicitly after initialization - section 0 white/gray/black gradient
      this.kwami.body.blob.setColors('#ffffff', '#808080', '#000000');
      
      // Start FULLY SPHERICAL (no spikes)
      this.kwami.body.blob.setSpikes(0, 0, 0);
      this.kwami.body.blob.setTime(3, 6, 3);
      
      // Store final target values for animation
      this.blobSpikeState = { x: 0.05, y: 5.2, z: 0.05 };
      this.blobTimeState = { x: 3, y: 6, z: 3 };
      
      // FORCE set skin explicitly
      this.kwami.body.blob.setSkin('Donut');
      
      // FORCE set shininess to 0 (no shine/glossiness)
      this.kwami.body.blob.setShininess(0.5);

      const blobMesh = this.kwami.body.blob.getMesh();
      blobMesh.position.set(0, 0, 0);
      
      // Set initial rotation to 90 degrees on Y-axis after a brief delay
      setTimeout(() => {
        if (blobMesh) {
          blobMesh.rotation.y = Math.PI / 2;
          console.log('🔄 Blob rotated 90° on Y-axis:', blobMesh.rotation.y);
        }
      }, 50);

      // Auto-rotate (faster)
      const animate = () => {
        if (this.kwami && this.showButton) {
          blobMesh.rotation.y += 0.012;
          blobMesh.rotation.x += 0.003;
          requestAnimationFrame(animate);
        }
      };
      animate();

      console.log('✨ Welcome Kwami initialized!');
      
      // Setup scroll handler to update blob color based on page section
      this.setupScrollHandler();
      
      // Smoothly transition from loader to blob
      this.transitionLoaderToBlob();
    } catch (error) {
      console.error('❌ Failed to initialize welcome Kwami:', error);
      // Hide loader even on error
      this.hideLoader();
    }
  }

  private transitionLoaderToBlob() {
    // Wait a bit to ensure blob is fully rendered
    setTimeout(() => {
      if (this.loaderOverlay && this.kwamiContainer && this.kwami) {
        // Fade out loader
        this.loaderOverlay.classList.add('fade-out');
        
        // Fade in blob container
        gsap.to(this.kwamiContainer, {
          duration: 0.8,
          opacity: 1,
          ease: 'power2.out'
        });
        
        // Animate blob from small sphere to final spiked form
        this.animateBlobToFinalState();
        
        // Show and animate welcome info text after blob starts fading in
        setTimeout(() => {
          this.showWelcomeContent();
        }, 400); // Start text animation halfway through blob fade-in
        
        // Remove loader from DOM after transition
        setTimeout(() => {
          if (this.loaderOverlay && this.loaderOverlay.parentNode) {
            this.loaderOverlay.parentNode.removeChild(this.loaderOverlay);
            this.loaderOverlay = null;
          }
        }, 800);
      }
    }, 500); // Small delay to ensure blob is fully initialized
  }

  private animateBlobToFinalState() {
    if (!this.kwami) return;
    
    const blobRef = this.kwami.body.blob;
    const isMobile = window.innerWidth <= 768;
    const finalScale = isMobile ? 7.5 : 7.8;
    const initialScale = finalScale * 0.4;
    
    // Animate scale and spikes at the same time using a GSAP timeline
    const scaleState = { value: initialScale };
    const currentSpikes = { x: 0, y: 0, z: 0 };
    const targetSpikes = { x: 0.05, y: 5.2, z: 0.05 };

    const tl = gsap.timeline();

    // Add scale and spikes to the timeline to run simultaneously
    tl.to(currentSpikes, {
      duration: 1.25,
      x: targetSpikes.x,
      y: targetSpikes.y,
      z: targetSpikes.z,
      ease: 'power2.inOut',
      onUpdate: () => {
        blobRef.setSpikes(currentSpikes.x, currentSpikes.y, currentSpikes.z);
      }
    }, 0) // start at time 0
    .to(scaleState, {
      duration: 2.5,
      value: finalScale,
      ease: 'power2.out',
      onUpdate: () => {
        blobRef.setScale(scaleState.value);
      }
    }, 0); // start at time 0

  }

  private showWelcomeContent() {
    // SVG stays hidden - it only appears when user clicks the blob
    
    // Show and fade in version display
    const versionDiv = this.container?.querySelector('#version') as HTMLElement;
    if (versionDiv) {
      versionDiv.style.visibility = 'visible';
      gsap.to(versionDiv, {
        duration: 0.6,
        opacity: 0.8,
        ease: 'power2.out'
      });
    }
    
    // Show and fade in welcome info
    if (this.welcomeInfo) {
      this.welcomeInfo.style.visibility = 'visible';
      gsap.to(this.welcomeInfo, {
        duration: 0.6,
        opacity: 1,
        ease: 'power2.out',
        onStart: () => {
          setTimeout(() => this.setTextAnimationPaused(false), 50);
        }
      });
    }
    
    // Show and fade in language switcher
    const welcomeLangSwitcher = this.container?.querySelector('.welcome-language-switcher') as HTMLElement;
    if (welcomeLangSwitcher) {
      welcomeLangSwitcher.style.visibility = 'visible';
      gsap.to(welcomeLangSwitcher, {
        duration: 0.6,
        delay: 0.3, // Slight delay after welcome info
        opacity: 1,
        ease: 'power2.out'
      });
    }
    
    // Show and fade in theme toggle button
    if (this.themeToggleButton) {
      this.themeToggleButton.style.visibility = 'visible';
      gsap.to(this.themeToggleButton, {
        duration: 0.6,
        delay: 0.3, // Slight delay after welcome info
        opacity: 1,
        ease: 'power2.out'
      });
    }
  }

  private hideLoader() {
    if (this.loaderOverlay) {
      this.loaderOverlay.classList.add('fade-out');
      setTimeout(() => {
        if (this.loaderOverlay && this.loaderOverlay.parentNode) {
          this.loaderOverlay.parentNode.removeChild(this.loaderOverlay);
          this.loaderOverlay = null;
        }
      }, 800);
    }
  }

  private setupScrollHandler() {
    this.scrollHandler = () => {
      if (!this.kwami || !this.showButton) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      
      // Calculate which section we're in (22 sections total)
      const totalSections = 22;
      const sectionHeight = docHeight / totalSections;
      const section = Math.min(
        Math.floor(scrollTop / sectionHeight),
        totalSections - 1
      );

      // Only update if section changed
      if (section !== this.currentSection) {
        this.currentSection = section;
        
        // Section 0 gets a white-to-black gradient (gray middle)
        if (section === 0) {
          this.kwami.body.blob.setColors('#ffffff', '#808080', '#000000');
        } else {
          const palette = colorPalettes[section % colorPalettes.length];
          // Update the blob's middle color (y-axis) to match the current section color
          this.kwami.body.blob.setColors('#ffffff', palette.accent, '#000000');
        }
      }
    };

    window.addEventListener('scroll', this.scrollHandler);
  }

  private cleanupScrollHandler() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  }


  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'mainSVG';
    
    // Use viewport dimensions for full screen coverage
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // Create defs with gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'aiGrad';
    gradient.setAttribute('x1', '213.98');
    gradient.setAttribute('y1', '290');
    gradient.setAttribute('x2', '179.72');
    gradient.setAttribute('y2', '320');
    gradient.setAttribute('gradientUnits', 'userSpaceOnUse');

    const stops = [
      { offset: '0', color: '#000', opacity: '0' },
      { offset: '.15', color: '#EF476F', opacity: '1' },
      { offset: '.4', color: '#359eee', opacity: '1' },
      { offset: '.6', color: '#03cea4', opacity: '1' },
      { offset: '.78', color: '#FFC43D', opacity: '1' },
      { offset: '1', color: '#000', opacity: '0' }
    ];

    stops.forEach(stopData => {
      const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop.setAttribute('offset', stopData.offset);
      stop.setAttribute('stop-color', stopData.color);
      stop.setAttribute('stop-opacity', stopData.opacity);
      gradient.appendChild(stop);
    });

    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Create 120 ellipses centered on screen - larger for full screen effect
    const centerX = vw / 2;
    const centerY = vh / 2;
    const baseRadius = Math.min(vw, vh) * 0.12; // 12% of smaller dimension (bigger)
    
    for (let i = 0; i < 120; i++) {
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ellipse.classList.add('ell');
      ellipse.setAttribute('cx', centerX.toString());
      ellipse.setAttribute('cy', centerY.toString());
      ellipse.setAttribute('rx', baseRadius.toString());
      ellipse.setAttribute('ry', baseRadius.toString());
      svg.appendChild(ellipse);
    }

    // Create AI path - centered on screen with responsive scaling
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = 'ai';
    path.setAttribute('opacity', '0.95');
    path.setAttribute('d', 'M 200.8 70 L 200.8 67.1 L 240.2 67.1 L 240.2 7.2 L 217.7 55.4 L 195.2 7.1 L 195.2 70.1 L 192.2 70 L 192.2 0 L 195.2 0 L 217.7 48.3 L 240.2 0.1 L 243.2 0 L 243.2 70.1 L 200.8 70 Z M 121.7 3.1 L 59.1 3.1 L 59.1 0.1 L 126 0.1 L 100.5 70.2 L 87.5 34.6 L 74.6 70.2 L 49.1 0.1 L 52.3 0.1 L 74.6 61.4 L 87.5 25.8 L 100.5 61.4 L 121.7 3.1 Z M 139.4 70.1 L 139.4 67.1 L 176.2 67.1 L 155 8.8 L 132.7 70.1 L 129.5 70.1 L 155 0 L 180.5 70.1 L 139.4 70.1 Z M 39.8 0.1 L 44.1 0.1 L 10.5 33.5 L 47.3 70.1 L 43 70.1 L 6.2 33.5 L 39.8 0.1 Z M 0 0.1 L 3 0.1 L 3 70.1 L 0 70.1 L 0 0.1 Z M 266 0.1 L 266 70.1 L 263 70.1 L 263 0.1 L 266 0.1 Z');
    path.setAttribute('stroke', 'url(#aiGrad)');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-miterlimit', '100');
    path.setAttribute('stroke-width', '2');
    
    const textScale = Math.min(vw, vh) / 500;
    path.setAttribute('transform', `translate(${centerX - 133 * textScale}, ${centerY - 35 * textScale}) scale(${textScale})`);
    svg.appendChild(path);

    return svg;
  }

  private async handleClick() {
    if (!this.showButton) return;
    
    const kwamiContainer = this.container?.querySelector('.welcome-kwami-container') as HTMLElement;
    const infoBlock = this.container?.querySelector('.welcome-info') as HTMLElement;
    const svg = this.container?.querySelector('#mainSVG') as SVGSVGElement;
    const welcomeLangSwitcher = this.container?.querySelector('.welcome-language-switcher') as HTMLElement;

    if (kwamiContainer && svg && this.kwami) {
      this.showButton = false;

      // Signal exit start (so the main app can prewarm its blob while this layer fades out)
      if (!this.hasSignaledExitStart) {
        this.hasSignaledExitStart = true;

        // Start fading the welcome background only AFTER the rings animation finishes.
        // Rings are revealed ~700ms after click. Visually they fade out around `secondsLoader - 2` seconds.
        const ringsRevealDelayMs = 700;
        const ringsDurationMs = Math.max(0, (this.secondsLoader - 2) * 1000);
        const fadeStartMs = ringsRevealDelayMs + ringsDurationMs;

        window.setTimeout(() => {
          this.container?.classList.add('bg-fade');
        }, fadeStartMs);

        // Don't make the layer click-through until the fade starts (prevents accidental interactions).
        window.setTimeout(() => {
          this.container?.classList.add('exiting');
        }, fadeStartMs);

        try {
          this.onExitStartCallback?.();
        } catch (error) {
          console.warn('⚠️ onExitStart callback failed:', error);
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Trigger sidebar exit animation (bottom to top)
      this.triggerSidebarExit();
      
      // Clean up scroll handler since we're starting the exit animation
      this.cleanupScrollHandler();
      
      // Make blob spherical and animate it
      const blobMesh = this.kwami.body.blob.getMesh();
      const blobRef = this.kwami.body.blob;
      const spikeState = { ...this.blobSpikeState };
      const timeState = { ...this.blobTimeState };
      
      // PHASE 1: Become spherical and get smaller
      gsap.to(spikeState, {
        duration: 6,
        x: 0,
        y: 0,
        z: 0,
        ease: 'power2.inOut',
        onUpdate: () => {
          blobRef.setSpikes(spikeState.x, spikeState.y, spikeState.z);
          blobRef.setOpacity(0.8);
        }
      });

      gsap.to(timeState, {
        duration: 3,
        x: 22,
        y: 0,
        z: 11,
        ease: 'power2.inOut',
        onUpdate: () => {
          blobRef.setTime(timeState.x, timeState.y, timeState.z);
        }
      });
      
      // Scale-down animation
      const currentScale = blobRef.getScale();
      const scaleState = { value: currentScale };
      gsap.to(scaleState, {
        duration: 4,
        delay: 2,
        value: currentScale * 0.5, // 50% smaller
        ease: 'power2.inOut',
        onUpdate: () => {
          blobRef.setScale(scaleState.value);
        }
      });
      
      // PHASE 2: Transition white to black
      // Helper to interpolate between white and black
      const colorState = { 
        r: 255, // white
        g: 255, 
        b: 255 
      };
      
      // gsap.to(colorState, {
      //   duration: 2,
      //   delay: 2,
      //   r: 0, // black
      //   g: 0,
      //   b: 0,
      //   ease: 'power2.in',
      //   onUpdate: () => {
      //     const r = Math.round(colorState.r);
      //     const g = Math.round(colorState.g);
      //     const b = Math.round(colorState.b);
      //     const yColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      //     blobRef.setColors('#000000', yColor, '#000000');
      //   }
      // });
      
      // PHASE 2: Fade out with accelerating rotation
      let rotationSpeed = 0.1; // Start with current idle speed
      let animationActive = true;
      let startTime = Date.now();
      
      const accelerateRotation = () => {
        if (animationActive && blobMesh) {
          const elapsed = (Date.now() - startTime) / 1000;
          
          // Normal rotation for first 2 seconds
          if (elapsed < 2) {
            blobMesh.rotation.y += rotationSpeed;
            blobMesh.rotation.x += rotationSpeed * 0.25;
          } 
          // Accelerate after 2 seconds
          else {
            rotationSpeed += 0.0008; // Faster acceleration in phase 2
            blobMesh.rotation.y += rotationSpeed;
            blobMesh.rotation.x += rotationSpeed * 0.5;
            blobMesh.rotation.z += rotationSpeed * 0.3;
          }
          
          requestAnimationFrame(accelerateRotation);
        }
      };
      accelerateRotation();

      // Keep opacity at 1 for first 2 seconds, then fade out over next 2 seconds
      gsap.to(kwamiContainer, {
        duration: 2,
        delay: 4,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => {
          animationActive = false;
          kwamiContainer.style.display = 'none';
          
          // Start onboarding tour after welcome layer animation completes
          setTimeout(() => {
            const onboardingTour = (window as any).onboardingTour;
            if (onboardingTour) {
              onboardingTour.start();
              console.log('🎓 Starting onboarding tour after welcome layer');
            }
          }, 1000); // Wait 1 second after welcome layer finishes for smooth transition
        }
      });

      // Fade out info block quickly
      if (infoBlock) {
        gsap.to(infoBlock, {
          duration: 0.5,
          opacity: 0,
          y: 10,
          ease: 'power2.out'
        });
      }

      // Fade out welcome language switcher very fast
      if (welcomeLangSwitcher) {
        gsap.to(welcomeLangSwitcher, {
          duration: 0.2,
          opacity: 0,
          scale: 0.8,
          ease: 'power2.in'
        });
      }
      
      // Fade out theme toggle button
      if (this.themeToggleButton) {
        gsap.to(this.themeToggleButton, {
          duration: 0.2,
          opacity: 0,
          scale: 0.8,
          ease: 'power2.in'
        });
      }
      
      // Reveal SVG animation smoothly
      setTimeout(() => {
        this.revealSvgAndStartAnimation(svg);
      }, 700);
      
      // Play intro audio
      if (this.audioElement) {
        try {
          await this.audioElement.play();
          console.log('🎵 Welcome intro audio playing');
        } catch (error) {
          console.warn('⚠️ Could not play intro audio:', error);
        }
      }
      
      // Clean up Kwami instance after animation (4s total + 0.5s buffer)
      setTimeout(() => {
        if (this.kwami) {
          animationActive = false;
          this.kwami = null;
        }
      }, 4500);
    }
  }


  private initAnimationSkipped() {
    // Faster version for skipped welcome (3 seconds total)
    (gsap as any).config({ trialWarn: false });

    const mainSVG = document.querySelector('#mainSVG') as SVGSVGElement;
    const allEll = Array.from(document.querySelectorAll('.ell'));
    const colorArr = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];
    const colorInterp = gsap.utils.interpolate(colorArr);

    gsap.set(mainSVG, { visibility: 'visible' });

    const animate = (el: Element, count: number) => {
      const tl = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        repeat: -1
      });

      gsap.set(el, {
        opacity: 1 - count / allEll.length,
        stroke: colorInterp(count / allEll.length)
      });

      tl.to(el, {
        attr: { ry: `+=${count * 2}`, rx: `+=${count * 2}` },
        ease: 'sine.in'
      })
        .to(el, {
          attr: { ry: `+=${count * 2}`, rx: `+=${count * 2}` },
          ease: 'sine'
        })
        .to(el, {
          duration: 3,
          rotation: 2160,
          transformOrigin: '50% 50%'
        }, 0)
        .timeScale(1.5);
    };

    allEll.forEach((c, i) => {
      gsap.delayedCall((i / (allEll.length - 1)) * 0.5, animate, [c, i + 1]);
    });

    gsap.to('#aiGrad', {
      duration: 2,
      delay: 0.1,
      attr: { x1: '+=380', x2: '+=300' },
      scale: 1.4,
      transformOrigin: '50% 50%',
      repeat: 1,
      ease: 'none'
    });

    gsap.to('#ai', {
      duration: 3,
      scale: Math.min(window.innerWidth, window.innerHeight) / 400, // Scale to viewport
      transformOrigin: '50% 50%',
      repeat: 1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(allEll, {
      duration: 1.5,
      opacity: 0,
      ease: 'sine.inOut'
    });

    gsap.to('#version', {
      duration: 1.5,
      opacity: 0,
      ease: 'sine.inOut'
    });

    setTimeout(() => {
      this.showLoader = false;
      if (this.container) {
        this.container.style.opacity = '0';
      }
      
      if (this.audioElement && !this.audioElement.paused) {
        const fadeOutDuration = 1000;
        const fadeSteps = 20;
        const stepInterval = fadeOutDuration / fadeSteps;
        const volumeStep = this.audioElement.volume / fadeSteps;
        
        const fadeInterval = setInterval(() => {
          if (this.audioElement && this.audioElement.volume > volumeStep) {
            this.audioElement.volume -= volumeStep;
          } else {
            if (this.audioElement) {
              this.audioElement.pause();
              this.audioElement.currentTime = 0;
            }
            clearInterval(fadeInterval);
          }
        }, stepInterval);
      }
    }, 3000);

    setTimeout(() => {
      this.showContainer = false;
      if (this.container) {
        this.detachSidebarNavigation();
        this.container.remove();
      }
      
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement = null;
      }
      
      // Signal that welcome layer is complete
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }, 4000);
  }

  private initAnimation() {
    (gsap as any).config({ trialWarn: false });

    const mainSVG = document.querySelector('#mainSVG') as SVGSVGElement;
    const allEll = Array.from(document.querySelectorAll('.ell'));
    const colorArr = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];

    const colorInterp = gsap.utils.interpolate(colorArr);

    gsap.set(mainSVG, { visibility: 'visible' });

    const animate = (el: Element, count: number) => {
      const tl = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        repeat: -1
      });

      gsap.set(el, {
        opacity: 1 - count / allEll.length,
        stroke: colorInterp(count / allEll.length)
      });

      tl.to(el, {
        attr: {
          ry: `+=${count * 2}`,
          rx: `+=${count * 2}`
        },
        ease: 'sine.in'
      })
        .to(el, {
          attr: {
            ry: `+=${count * 2}`,
            rx: `+=${count * 2}`
          },
          ease: 'sine'
        })
        .to(el, {
          duration: this.secondsLoader,
          rotation: 2160,
          transformOrigin: '50% 50%'
        }, 0)
        .timeScale(1.2);
    };

    allEll.forEach((c, i) => {
      gsap.delayedCall(i / (allEll.length - 1), animate, [c, i + 1]);
    });

    gsap.to('#aiGrad', {
      duration: 2,
      delay: 0.25,
      attr: {
        x1: '+=380',
        x2: '+=300'
      },
      scale: 1.4,
      transformOrigin: '50% 50%',
      repeat: 1,
      ease: 'none'
    });

    gsap.to('#ai', {
      duration: 2,
      scale: 3,
      transformOrigin: '50% 50%',
      repeat: 1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('#ai', {
      duration: 2,
      delay: 2,
      opacity: 0,
      ease: 'sine.inOut'
    });

    gsap.to(allEll, {
      duration: this.secondsLoader - 2,
      opacity: 0,
      ease: 'sine.inOut'
    });

    gsap.to('#version', {
      duration: this.secondsLoader - 2,
      opacity: 0,
      ease: 'sine.inOut'
    });

    setTimeout(() => {
      this.showLoader = false;
      if (this.container) {
        this.container.style.opacity = '0';
      }
      
      // Fade out audio
      if (this.audioElement && !this.audioElement.paused) {
        const fadeOutDuration = 2000; // 2 seconds
        const fadeSteps = 20;
        const stepInterval = fadeOutDuration / fadeSteps;
        const volumeStep = this.audioElement.volume / fadeSteps;
        
        const fadeInterval = setInterval(() => {
          if (this.audioElement && this.audioElement.volume > volumeStep) {
            this.audioElement.volume -= volumeStep;
          } else {
            if (this.audioElement) {
              this.audioElement.pause();
              this.audioElement.currentTime = 0;
            }
            clearInterval(fadeInterval);
          }
        }, stepInterval);
      }
    }, this.secondsLoader * 1000);

    setTimeout(() => {
      this.showContainer = false;
      if (this.container) {
        this.detachSidebarNavigation();
        this.container.remove();
      }
      
      // Clean up audio
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement = null;
      }
      
      // Clean up scroll handler
      this.cleanupScrollHandler();
      
      // Signal that welcome layer is complete
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }, this.secondsContainer * 1000);
  }

  private revealSvgAndStartAnimation(svg: SVGSVGElement) {
    if (this.hasStartedSvgAnimation) return;
    this.hasStartedSvgAnimation = true;

    svg.classList.remove('hidden');
    svg.classList.add('visible');

    gsap.fromTo(svg, { opacity: 0 }, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    });

    this.startAnimation = true;
    this.initAnimation();
  }

  private populateWelcomeText() {
    if (!this.welcomeInfo) return;
    
    const infoLines = [
      { text: t('welcome_layer.heading'), className: 'info-line heading' },
      { text: t('welcome_layer.line1'), className: 'info-line' },
      { text: t('welcome_layer.line2'), className: 'info-line' },
      { text: t('welcome_layer.line3'), className: 'info-line subtle' }
    ];
    
    infoLines.forEach((line, index) => this.appendAnimatedLine(line.text, index, line.className));
    
    // Calculate total animation time for checkbox appearance
    this.scheduleCheckboxAnimation(infoLines);
  }

  private reloadWelcomeText() {
    if (!this.welcomeInfo) return;
    
    // Pause any current animation before transitioning
    this.setTextAnimationPaused(true);
    
    // Fade out current text (including checkbox)
    gsap.to(this.welcomeInfo, {
      duration: 0.3,
      opacity: 0,
      y: -10,
      ease: 'power2.in',
      onComplete: () => {
        // Clear existing content
        if (this.welcomeInfo) {
          // Store checkbox before clearing
          const skipContainer = this.welcomeInfo.querySelector('.skip-welcome-container');
          
          this.welcomeInfo.innerHTML = '';
          
          // Reload with new language
          this.populateWelcomeText();
          
          // Re-add checkbox if it existed
          if (skipContainer) {
            this.welcomeInfo.appendChild(skipContainer);
            // Reset checkbox animation
            gsap.set(skipContainer, { opacity: 0, y: 10 });
          }
          
          // Fade back in
          gsap.fromTo(this.welcomeInfo, 
            { opacity: 0, y: 10 },
            { 
              duration: 0.4, 
              opacity: 1, 
              y: 0, 
              ease: 'power2.out',
              onComplete: () => {
                setTimeout(() => this.setTextAnimationPaused(false), 50);
              }
            }
          );
        }
      }
    });
  }

  private appendAnimatedLine(text: string, lineIndex: number, className = 'info-line') {
    if (!this.welcomeInfo) return;

    const lineEl = document.createElement('p');
    lineEl.className = className;

    const characters = Array.from(text);
    const charAnimDuration = 0.015; // 15ms per character (faster)
    const lineDuration = characters.length * charAnimDuration;
    
    // Calculate delay: sum of all previous lines' durations + 0.2s gap between lines
    let baseDelay = 0.3; // Initial delay (faster)
    for (let i = 0; i < lineIndex; i++) {
      const prevLine = this.welcomeInfo.children[i];
      if (prevLine && !prevLine.classList.contains('skip-welcome-container')) {
        const prevText = prevLine.textContent || '';
        baseDelay += prevText.length * charAnimDuration + 0.2; // 200ms gap between lines (faster)
      }
    }
    
    characters.forEach((char, charIndex) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${baseDelay + charIndex * charAnimDuration}s`;
      lineEl.appendChild(span);
    });

    // Insert before checkbox (checkbox should be last child)
    const skipContainer = this.welcomeInfo.querySelector('.skip-welcome-container');
    if (skipContainer) {
      this.welcomeInfo.insertBefore(lineEl, skipContainer);
    } else {
      this.welcomeInfo.appendChild(lineEl);
    }
  }

  private scheduleCheckboxAnimation(infoLines: { text: string; className: string }[]) {
    const charAnimDuration = 0.015; // 15ms per character (faster)
    let totalDelay = 0.3; // Initial delay (faster)
    
    // Calculate total animation time for all lines
    infoLines.forEach((line, index) => {
      const lineLength = line.text.length;
      const lineDuration = lineLength * charAnimDuration;
      totalDelay += lineDuration;
      if (index < infoLines.length - 1) {
        totalDelay += 0.2; // Gap between lines (faster)
      }
    });
    
    // Add extra delay after last line completes
    totalDelay += 0.5;
    
    console.log('🔍 Scheduling checkbox animation with delay:', totalDelay);
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const skipContainer = this.welcomeInfo?.querySelector('.skip-welcome-container') as HTMLElement;
      console.log('📦 Checkbox element found:', !!skipContainer);
      
      if (skipContainer) {
        gsap.fromTo(skipContainer,
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            ease: 'power2.out',
            onStart: () => console.log('✅ Checkbox animation started'),
            onComplete: () => console.log('✅ Checkbox animation completed')
          }
        );
      } else {
        console.error('❌ Checkbox element not found!');
      }
    }, totalDelay * 1000);
  }

  private setTextAnimationPaused(paused: boolean): void {
    if (!this.welcomeInfo) return;
    
    if (paused) {
      if (!this.welcomeInfo.classList.contains('text-paused')) {
        this.welcomeInfo.classList.add('text-paused');
      }
      // Force reflow to ensure animation reset
      void this.welcomeInfo.offsetWidth;
      return;
    }

    if (this.welcomeInfo.classList.contains('text-paused')) {
      // Force reflow before resuming to restart animations
      void this.welcomeInfo.offsetWidth;
      this.welcomeInfo.classList.remove('text-paused');
    }
  }
}

