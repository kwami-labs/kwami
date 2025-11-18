import { gsap } from 'gsap';
import { Kwami } from 'kwami';
import i18next, { t } from '../i18n';

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
  private readonly secondsLoader = 8;
  private readonly secondsContainer: number;
  private container: HTMLElement | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private kwami: Kwami | null = null;
  private kwamiContainer: HTMLElement | null = null;
  private welcomeInfo: HTMLElement | null = null;
  private blobSpikeState = { x: 0, y: 0, z: 0 };
  private blobTimeState = { x: 0, y: 0, z: 0 };
  private hasStartedSvgAnimation = false;
  private scrollHandler: (() => void) | null = null;
  private currentSection = 0;
  private static readonly STORAGE_KEY = 'kwami_skip_welcome';

  constructor() {
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
    // Check for hard reload (force reload) - always show welcome on hard reload
    const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (perfEntries.length > 0 && perfEntries[0].type === 'reload') {
      const isHardReload = performance.navigation?.type === 1; // TYPE_RELOAD
      if (isHardReload) {
        return false; // Always show on hard reload
      }
    }
    
    // Check for force-show query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === '1') {
      return false; // Force show welcome
    }
    
    // Check localStorage preference
    return localStorage.getItem(WelcomeLayer.STORAGE_KEY) === 'true';
  }

  private setSkipWelcome(skip: boolean) {
    if (skip) {
      localStorage.setItem(WelcomeLayer.STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(WelcomeLayer.STORAGE_KEY);
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
    versionDiv.textContent = 'v.1.3.4';

    this.container.appendChild(svg);
    this.container.appendChild(versionDiv);
    document.body.appendChild(this.container);

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
    }, 100);
  }

  private createWelcomeLayer() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'loader-container';
    this.container.style.opacity = '1';

    // Create Kwami container
    this.kwamiContainer = document.createElement('div');
    this.kwamiContainer.className = 'welcome-kwami-container fade-in-leave-active';
    this.kwamiContainer.addEventListener('click', () => this.handleClick());

    // Create welcome info text
    this.welcomeInfo = document.createElement('div');
    this.welcomeInfo.className = 'welcome-info';
    this.populateWelcomeText();
    
    // Listen for language changes and reload text with animation
    i18next.on('languageChanged', () => {
      if (this.welcomeInfo && this.showButton) {
        this.reloadWelcomeText();
      }
    });

    // Create SVG
    const svg = this.createSVG();
    svg.classList.add('hidden');

    // Create version display
    const versionDiv = document.createElement('div');
    versionDiv.id = 'version';
    versionDiv.className = 'fixed bottom-10 text-sm text-gray-400 opacity-80';
    versionDiv.textContent = 'v.1.3.4';

    // Create "Don't show again" checkbox
    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-welcome-container';
    
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

    // Append checkbox to welcome info (below description)
    if (this.welcomeInfo) {
      this.welcomeInfo.appendChild(skipContainer);
    }

    // Append elements
    this.container.appendChild(this.kwamiContainer);
    if (this.welcomeInfo) {
      this.container.appendChild(this.welcomeInfo);
    }
    this.container.appendChild(svg);
    this.container.appendChild(versionDiv);

    // Add to body
    document.body.appendChild(this.container);

    // Initialize Kwami
    this.initWelcomeKwami();
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

      // Get the initial palette for section 0
      const initialPalette = colorPalettes[0];
      
      this.kwami = new Kwami(canvas, {
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
              y: initialPalette.accent,
              z: '#000000'
            }
          },
          scene: {
            cameraPosition: { x: 0, y: 0, z: 12 },
            enableControls: false
          }
        }
      });

      // Set blob scale based on screen size - bigger for welcome screen
      const isMobile = window.innerWidth <= 768;
      const blobScale = isMobile ? 6.5 : 7.8;
      this.kwami.body.blob.setScale(blobScale);
      this.kwami.body.blob.setWireframe(false);
      
      // FORCE set colors explicitly after initialization to override any defaults
      this.kwami.body.blob.setColors('#ffffff', initialPalette.accent, '#000000');
      
      // FORCE set spikes and time explicitly
      this.kwami.body.blob.setSpikes(0.05, 5.2, 0.05);
      this.kwami.body.blob.setTime(3, 6, 3);
      
      // FORCE set skin explicitly
      this.kwami.body.blob.setSkin('Donut');
      
      // FORCE set shininess to 0 (no shine/glossiness)
      this.kwami.body.blob.setShininess(0.5);

      const blobMesh = this.kwami.body.blob.getMesh();
      blobMesh.position.set(0, 0, 0);

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
    } catch (error) {
      console.error('❌ Failed to initialize welcome Kwami:', error);
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

    // Create 120 ellipses centered on screen
    const centerX = vw / 2;
    const centerY = vh / 2;
    const baseRadius = Math.min(vw, vh) * 0.08; // 8% of smaller dimension
    
    for (let i = 0; i < 120; i++) {
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ellipse.classList.add('ell');
      ellipse.setAttribute('cx', centerX.toString());
      ellipse.setAttribute('cy', centerY.toString());
      ellipse.setAttribute('rx', baseRadius.toString());
      ellipse.setAttribute('ry', baseRadius.toString());
      svg.appendChild(ellipse);
    }

    // Create AI path - centered on screen
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = 'ai';
    path.setAttribute('opacity', '0.95');
    path.setAttribute('d', 'M 200.8 70 L 200.8 67.1 L 240.2 67.1 L 240.2 7.2 L 217.7 55.4 L 195.2 7.1 L 195.2 70.1 L 192.2 70 L 192.2 0 L 195.2 0 L 217.7 48.3 L 240.2 0.1 L 243.2 0 L 243.2 70.1 L 200.8 70 Z M 121.7 3.1 L 59.1 3.1 L 59.1 0.1 L 126 0.1 L 100.5 70.2 L 87.5 34.6 L 74.6 70.2 L 49.1 0.1 L 52.3 0.1 L 74.6 61.4 L 87.5 25.8 L 100.5 61.4 L 121.7 3.1 Z M 139.4 70.1 L 139.4 67.1 L 176.2 67.1 L 155 8.8 L 132.7 70.1 L 129.5 70.1 L 155 0 L 180.5 70.1 L 139.4 70.1 Z M 39.8 0.1 L 44.1 0.1 L 10.5 33.5 L 47.3 70.1 L 43 70.1 L 6.2 33.5 L 39.8 0.1 Z M 0 0.1 L 3 0.1 L 3 70.1 L 0 70.1 L 0 0.1 Z M 266 0.1 L 266 70.1 L 263 70.1 L 263 0.1 L 266 0.1 Z');
    path.setAttribute('stroke', 'url(#aiGrad)');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-miterlimit', '100');
    path.setAttribute('stroke-width', '1');
    // Center the KWAMI text - translate to center of viewport
    path.setAttribute('transform', `translate(${centerX - 133}, ${centerY - 35})`);
    svg.appendChild(path);

    return svg;
  }

  private async handleClick() {
    if (!this.showButton) return;
    
    const kwamiContainer = this.container?.querySelector('.welcome-kwami-container') as HTMLElement;
    const infoBlock = this.container?.querySelector('.welcome-info') as HTMLElement;
    const svg = this.container?.querySelector('#mainSVG') as SVGSVGElement;

    if (kwamiContainer && svg && this.kwami) {
      this.showButton = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
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
      
      // Reveal SVG animation smoothly
      setTimeout(() => {
        this.revealSvgAndStartAnimation(svg);
      }, 1000);
      
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
    // @ts-ignore - gsap trialWarn config
    gsap.config({ trialWarn: false });

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
      duration: 1.5,
      delay: 0.1,
      attr: { x1: '+=380', x2: '+=300' },
      scale: 1.4,
      transformOrigin: '50% 50%',
      repeat: 1,
      ease: 'none'
    });

    gsap.to('#ai', {
      duration: 3,
      scale: 3,
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
        this.container.remove();
      }
      
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement = null;
      }
    }, 4000);
  }

  private initAnimation() {
    // @ts-ignore - gsap trialWarn config
    gsap.config({ trialWarn: false });

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
        .timeScale(0.6);
    };

    allEll.forEach((c, i) => {
      gsap.delayedCall(i / (allEll.length - 1), animate, [c, i + 1]);
    });

    gsap.to('#aiGrad', {
      duration: 4,
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
      duration: 8,
      scale: 3,
      transformOrigin: '50% 50%',
      repeat: 1,
      yoyo: true,
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
    }, this.secondsContainer * 1000);
  }

  private revealSvgAndStartAnimation(svg: SVGSVGElement) {
    if (this.hasStartedSvgAnimation) return;
    this.hasStartedSvgAnimation = true;

    svg.classList.remove('hidden');
    svg.classList.add('visible');

    gsap.fromTo(svg, { opacity: 0 }, {
      opacity: 1,
      duration: 1.2,
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
    
    // Fade out current text
    gsap.to(this.welcomeInfo, {
      duration: 0.3,
      opacity: 0,
      y: -10,
      ease: 'power2.in',
      onComplete: () => {
        // Clear existing content
        if (this.welcomeInfo) {
          this.welcomeInfo.innerHTML = '';
          
          // Reload with new language
          this.populateWelcomeText();
          
          // Fade back in
          gsap.fromTo(this.welcomeInfo, 
            { opacity: 0, y: 10 },
            { duration: 0.4, opacity: 1, y: 0, ease: 'power2.out' }
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
    const charAnimDuration = 0.025; // 25ms per character
    const lineDuration = characters.length * charAnimDuration;
    
    // Calculate delay: sum of all previous lines' durations + 0.3s gap between lines
    let baseDelay = 0.5; // Initial delay
    for (let i = 0; i < lineIndex; i++) {
      const prevLine = this.welcomeInfo.children[i];
      if (prevLine) {
        const prevText = prevLine.textContent || '';
        baseDelay += prevText.length * charAnimDuration + 0.3; // 300ms gap between lines
      }
    }
    
    characters.forEach((char, charIndex) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${baseDelay + charIndex * charAnimDuration}s`;
      lineEl.appendChild(span);
    });

    this.welcomeInfo.appendChild(lineEl);
  }

  private scheduleCheckboxAnimation(infoLines: { text: string; className: string }[]) {
    const charAnimDuration = 0.025; // 25ms per character
    let totalDelay = 0.5; // Initial delay
    
    // Calculate total animation time for all lines
    infoLines.forEach((line, index) => {
      const lineLength = line.text.length;
      const lineDuration = lineLength * charAnimDuration;
      totalDelay += lineDuration;
      if (index < infoLines.length - 1) {
        totalDelay += 0.3; // Gap between lines
      }
    });
    
    // Add extra delay after last line completes
    totalDelay += 0.5;
    
    // Animate checkbox in after text completes
    const skipContainer = document.querySelector('.skip-welcome-container') as HTMLElement;
    if (skipContainer) {
      gsap.fromTo(skipContainer,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          delay: totalDelay,
          ease: 'power2.out'
        }
      );
    }
  }
}

