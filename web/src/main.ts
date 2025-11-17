import './style.css';
import { Kwami } from 'kwami';
import videoLinks from '../../assets/vid/links.json';

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

// Custom Cursor Light Manager
class CursorLight {
  private light: HTMLElement | null = null;
  private isActive = false;

  constructor() {
    this.light = document.getElementById('cursor-light');
    if (this.light) {
      this.init();
    }
  }

  private init() {
    // Track mouse movement
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.light) {
        this.light.style.left = `${e.clientX}px`;
        this.light.style.top = `${e.clientY}px`;
        
        // Activate light on first movement
        if (!this.isActive) {
          this.isActive = true;
          this.light.classList.add('active');
        }
      }
    });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => {
      if (this.light) {
        this.light.classList.remove('active');
        this.isActive = false;
      }
    });

    // Show when mouse enters window
    document.addEventListener('mouseenter', () => {
      if (this.light && this.isActive) {
        this.light.classList.add('active');
      }
    });
  }

  public updateColors(palette: { primary: string, secondary: string, accent: string }) {
    if (this.light) {
      // Convert hex colors to rgba with transparency
      const hexToRgba = (hex: string, alpha: number): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      // Update gradient colors dynamically based on current section
      this.light.style.background = `radial-gradient(
        circle at center,
        ${hexToRgba(palette.primary, 0.25)} 0%,
        ${hexToRgba(palette.secondary, 0.15)} 25%,
        ${hexToRgba(palette.accent, 0.08)} 50%,
        transparent 70%
      )`;
    }
  }
}

// Sidebar Navigation Manager
class SidebarNavigator {
  private sphereElements: HTMLElement[] = [];
  private container: HTMLElement | null = null;
  private totalSections: number;
  private scrollManager: ScrollManager | null = null;
  private isAnimating = false;

  constructor(totalSections: number) {
    this.totalSections = totalSections;
    this.container = document.getElementById('sphere-container');
    if (this.container) {
      this.generateSpheres();
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
      
      // Apply linear gradient background from color palettes (primary to secondary)
      const palette = colorPalettes[i];
      sphere.style.background = `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`;
      
      // Add click handler for navigation with animated color transitions
      sphere.addEventListener('click', () => this.navigateToSectionAnimated(i));
      
      this.sphereElements.push(sphere);
      this.container!.appendChild(sphere);
    }
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
      const palette = colorPalettes[sectionIndex];
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
  private recognition: any = null;
  private isListening = false;

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

  private async init() {
    // Set initial colors
    this.updateColors(0);
    this.cursorLight.updateColors(colorPalettes[0]);
    
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

      // Set blob scale
      this.kwami.body.blob.setScale(5.5);

      // Position blob more to the right (desktop only)
      const blobMesh = this.kwami.body.blob.getMesh();
      const isMobile = window.innerWidth <= 1024;
      // Use direct world coordinates - x:8 positions it in center of right half
      blobMesh.position.set(isMobile ? 0 : 8, 0, 0);

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
        blobMesh.position.set(mobile ? 0 : 8, 0, 0);
        this.kwami?.body.blob.setScale(mobile ? 4.0 : 6.0);
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

      // Setup voice recognition for "kwami" keyword
      this.setupVoiceRecognition(canvas);

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
      const palette = colorPalettes[section % colorPalettes.length];
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
    const palette = colorPalettes[section % colorPalettes.length];
    
    // Update CSS variables with smooth transition
    this.root.style.setProperty('--color-primary', palette.primary);
    this.root.style.setProperty('--color-secondary', palette.secondary);
    this.root.style.setProperty('--color-accent', palette.accent);
  }

  private async updateKwamiConfig(section: number) {
    if (!this.kwami) return;

    this.isTransitioning = true;
    const config = blobConfigs[section % blobConfigs.length];
    const palette = colorPalettes[section % colorPalettes.length];

    try {
      // Update blob geometry
      this.kwami.body.blob.setSpikes(config.spikeX, config.spikeY, config.spikeZ);
      this.kwami.body.blob.setTime(config.timeX, config.timeY, config.timeZ);

      // Update colors
      this.kwami.body.blob.setColors(palette.primary, palette.secondary, palette.accent);

      // Much shorter delay for smooth transitions
      setTimeout(() => {
        this.isTransitioning = false;
      }, 100);
    } catch (error) {
      console.error('Error updating Kwami config:', error);
      this.isTransitioning = false;
    }
  }

  private clickTimer: number | null = null;
  private readonly SINGLE_CLICK_DELAY = 500; // ms delay to distinguish single vs double click

  private setupVoiceRecognition(canvas: HTMLCanvasElement) {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      console.log('🎤 Heard:', transcript);

      // Check if "kwami" was said
      if (transcript.toLowerCase().includes('kwami')) {
        console.log('✨ "Kwami" detected! Randomizing blob...');
        this.randomizeBlobAndSkin();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      console.log('🎤 Listening stopped');
      this.isListening = false;
    };

    // Cancel any pending single-click action when a double-click is detected
    canvas.addEventListener('dblclick', () => {
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }

      // Ensure mic stays off when double-click occurs
      if (this.isListening) {
        this.stopListening();
      }
    });

    // Add click handler with delay to distinguish from double-click
    canvas.addEventListener('click', (e: MouseEvent) => {
      console.log('🖱️ Click detected, detail:', e.detail);
      
      // Ignore if this is part of a multi-click (detail >= 2 for double/triple clicks)
      if (e.detail >= 2) {
        console.log('🖱️ Multi-click detected, ignoring for voice recognition');
        // Clear any pending timer from the first click
        if (this.clickTimer) {
          clearTimeout(this.clickTimer);
          this.clickTimer = null;
        }
        return;
      }

      // Clear any existing timer
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
      }

      // Wait a bit to see if a second click comes (double-click)
      this.clickTimer = window.setTimeout(() => {
        console.log('🎤 Single click confirmed, toggling voice recognition');
        // If we get here, it was a true single click
        if (this.isListening) {
          this.stopListening();
        } else {
          this.startListening();
        }
        this.clickTimer = null;
      }, this.SINGLE_CLICK_DELAY);
    });
  }

  private startListening() {
    if (!this.recognition) {
      console.warn('⚠️ Speech recognition not available');
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('🎤 Started listening for "kwami"...');
      
      // Visual feedback: change blob state to listening
      if (this.kwami) {
        this.kwami.setState('listening');
      }
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }

  private stopListening() {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('🛑 Stopped listening');
      
      // Return to idle state
      if (this.kwami) {
        this.kwami.setState('idle');
      }
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
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
    
    console.log(`🎲 Blob randomized with ${randomSkin} skin!`);
  }

  private randomizeBlobAndSkin() {
    // Perform full randomization
    this.performFullRandomization();
    
    // Stop listening after detecting "kwami"
    this.stopListening();
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

const PLAYGROUND_URL = 'https://playground.kwami.io';

const ACTION_ROUTES: Record<string, ActionConfig> = {
  'launch-playground': {
    url: PLAYGROUND_URL,
    message: 'Opening the live playground...'
  },
  'view-demo': {
    url: `${PLAYGROUND_URL}?view=demo`,
    message: 'Loading the demo layout...'
  },
  'run-playground': {
    copy: 'npm run playground',
    message: 'Copied: npm run playground'
  },
  'swap-sidebars': {
    url: `${PLAYGROUND_URL}?panel=layout`,
    message: 'Swap the sidebars inside the playground'
  },
  'init-mind': {
    url: `${PLAYGROUND_URL}?panel=mind#initialize`,
    message: 'Mind controls opened in a new tab'
  },
  'randomize-blob': {
    url: `${PLAYGROUND_URL}?panel=body&action=randomize-blob`,
    message: 'Hit 🎲 Randomize Blob in the playground'
  },
  'apply-soul': {
    url: `${PLAYGROUND_URL}?panel=soul&action=apply`,
    message: 'Soul presets ready to apply'
  },
  'test-listening': {
    url: `${PLAYGROUND_URL}?action=test-listening`,
    message: 'Listening mode queued in the playground'
  },
  'set-background': {
    url: `${PLAYGROUND_URL}?panel=body&action=background`,
    message: 'Background controls opened'
  },
  'speak': {
    url: `${PLAYGROUND_URL}?action=speak`,
    message: 'Ready to send a new line to ElevenLabs'
  },
  'switch-provider': {
    url: 'https://github.com/alexcolls/kwami/blob/dev/docs/api/kwami.md#mindprovider',
    message: 'Mind provider contract opened'
  },
  'adjust-spikes': {
    url: `${PLAYGROUND_URL}?panel=body&action=spikes`,
    message: 'Spike sliders ready in playground'
  },
  'download-glb': {
    url: `${PLAYGROUND_URL}?action=download-glb`,
    message: 'Export your blob as a GLB'
  },
  'test-thinking': {
    url: `${PLAYGROUND_URL}?action=test-thinking`,
    message: 'Thinking mode engaged'
  },
  'upload-audio': {
    url: `${PLAYGROUND_URL}?action=upload-audio`,
    message: 'Upload a track in the audio player'
  },
  'connect-services': {
    url: 'https://quami.io',
    message: 'Opening the quami.io service hub'
  },
  'mint-nft': {
    url: 'https://candy.kwami.io',
    message: 'Mint a Kwami on Solana'
  },
  'view-roadmap': {
    url: 'https://github.com/alexcolls/kwami/blob/dev/STATUS.md',
    message: 'Roadmap opened on GitHub'
  },
  'open-guides': {
    url: 'https://github.com/alexcolls/kwami/tree/dev/docs',
    message: 'Docs opened in a new tab'
  },
  'join-discord': {
    url: 'https://discord.gg/kwami',
    message: 'Discord invite opened'
  },
  'contact-team': {
    url: 'mailto:hello@kwami.io?subject=Kwami%20Enterprise',
    message: 'Say hello to the Kwami team'
  },
  'create-session': {
    url: `${PLAYGROUND_URL}?action=start-session`,
    message: 'Start a fresh playground session'
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const scrollManager = new ScrollManager();
  new ModeSwitcher();
  new ActionButtonManager();
  
  // Make scrollManager accessible globally for music functions
  (window as any).scrollManager = scrollManager;
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

const VIDEO_LIBRARY: string[] = Array.isArray(videoLinks) ? (videoLinks as string[]) : [];
const PLAYABLE_VIDEO_LINKS = VIDEO_LIBRARY
  .map(link => (typeof link === 'string' ? link.trim() : ''))
  .filter(link => link.length > 0 && !/youtube\.com/i.test(link) && /\.(mp4|webm|mov)(\?|$)/i.test(link));

let currentVideoUrl: string | null = null;
let isVideoLoading = false;
let isVideoPlayingInBlob = false;
let activeVideoStream: MediaStream | null = null;
let videoElementCleanup: (() => void) | null = null;

// Music player state
let currentMusicIndex = -1;
let isPlaying = false;

// Create song title display element
const songTitleDisplay = document.createElement('div');
songTitleDisplay.id = 'song-title-display';
songTitleDisplay.style.cssText = `
  position: fixed;
  bottom: 8vh;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 400;
  z-index: 9998;
  max-width: 320px;
  width: min(80vw, 320px);
  white-space: nowrap;
  overflow: hidden;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
`;
document.body.appendChild(songTitleDisplay);

// Bottom tabs functionality
document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', async function(this: HTMLButtonElement) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked tab
    this.classList.add('active');
    
    // Get tab type
    const tabType = this.getAttribute('data-tab');
    console.log(`🎵 Switched to ${tabType} tab`);
    
    // Handle Media tabs
    if (tabType === 'music') {
      stopVideoPlayback();
      await playRandomMusic();
    } else if (tabType === 'voice') {
      // Stop any audio when switching to voice mode
      stopMusic();
      stopVideoPlayback();
    } else if (tabType === 'video') {
      // Switch to blob video playback
      stopMusic();
      await playRandomVideoInBlob();
    }
  });
});

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
    const songName = selectedSong.split('/').pop()?.replace('.mp3', '') || 'Unknown';
    
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
    await kwami.body.audio.play();
    
    // Set blob to speaking state for audio reactivity
    kwami.setState('speaking');
    isPlaying = true;
    
    console.log(`✅ Now playing: ${songName}`);
    
    // Listen for when song ends
    const audioElement = kwami.body.audio.getAudioElement();
    audioElement.addEventListener('ended', () => {
      console.log('🎵 Song ended');
      kwami.setState('idle');
      isPlaying = false;
      hideSongTitle();
    }, { once: true });
    
    // Also listen for errors
    audioElement.addEventListener('error', (e: Event) => {
      console.error('🎵 Audio element error:', e);
      kwami.setState('idle');
      isPlaying = false;
    }, { once: true });
    
  } catch (error) {
    console.error('❌ Failed to play music:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
  }
}

// Stop music function
function stopMusic() {
  const scrollManager = (window as any).scrollManager;
  const kwami = scrollManager?.getKwami();
  
  if (kwami && isPlaying) {
    kwami.body.audio.pause();
    kwami.setState('idle');
    isPlaying = false;
    hideSongTitle();
    console.log('🛑 Music stopped');
  }
}

// Show song title with marquee effect for long titles
function showSongTitle(title: string) {
  songTitleDisplay.textContent = title;
  songTitleDisplay.style.opacity = '1';
  
  // If title is long, add scrolling animation
  const titleWidth = songTitleDisplay.scrollWidth;
  const containerWidth = 300; // max-width
  
  if (titleWidth > containerWidth) {
    // Add marquee animation for long titles
    songTitleDisplay.style.animation = 'none';
    setTimeout(() => {
      songTitleDisplay.style.animation = 'marquee 15s linear infinite';
    }, 10);
  } else {
    songTitleDisplay.style.animation = 'none';
  }
}

// Hide song title
function hideSongTitle() {
  songTitleDisplay.style.opacity = '0';
  songTitleDisplay.style.animation = 'none';
}

function getKwamiInstance(): Kwami | null {
  const scrollManager = (window as any).scrollManager;
  return scrollManager?.getKwami?.() ?? null;
}

function pickRandomVideoUrl(): string | null {
  if (!PLAYABLE_VIDEO_LINKS.length) {
    return null;
  }

  if (PLAYABLE_VIDEO_LINKS.length === 1) {
    return PLAYABLE_VIDEO_LINKS[0];
  }

  let selected = currentVideoUrl;
  let attempts = 0;
  const maxAttempts = 6;

  while (selected === currentVideoUrl && attempts < maxAttempts) {
    selected = PLAYABLE_VIDEO_LINKS[Math.floor(Math.random() * PLAYABLE_VIDEO_LINKS.length)];
    attempts += 1;
  }

  return selected ?? PLAYABLE_VIDEO_LINKS[0];
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

function stopVideoPlayback(explicitKwami?: Kwami | null) {
  const kwami = explicitKwami ?? getKwamiInstance();

  cleanupVideoElementListeners();
  releaseActiveVideoStream();

  if (!kwami) {
    currentVideoUrl = null;
    isVideoPlayingInBlob = false;
    isVideoLoading = false;
    return;
  }

  kwami.body.setBlobSurfaceVideo(null);
  kwami.body.audio.disconnectMediaStream();

  if (isVideoPlayingInBlob) {
    kwami.setState('idle');
  }

  isVideoPlayingInBlob = false;
  isVideoLoading = false;
  currentVideoUrl = null;
}

async function waitForBlobSurfaceVideoElement(kwami: Kwami, timeout = 7000): Promise<HTMLVideoElement | null> {
  const start = performance.now();

  return new Promise(resolve => {
    const tick = () => {
      const videoElement = kwami.body.getBlobSurfaceVideoElement?.() ?? null;
      if (videoElement && videoElement.readyState >= 2) {
        resolve(videoElement);
        return;
      }

      if (performance.now() - start >= timeout) {
        resolve(videoElement);
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

async function attachVideoAudioToKwami(kwami: Kwami, videoElement: HTMLVideoElement, sourceUrl: string) {
  cleanupVideoElementListeners();

  const handleEnded = () => {
    if (videoElement.loop) {
      return;
    }
    isVideoPlayingInBlob = false;
    kwami.setState('idle');
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
    return;
  }

  try {
    const stream = captureStream.call(videoElement);
    if (!stream) {
      console.warn('🎥 Failed to capture MediaStream from video element.');
      return;
    }

    releaseActiveVideoStream();
    activeVideoStream = stream;

    await kwami.body.audio.connectMediaStream(stream);

    if (videoElement.paused) {
      await videoElement.play().catch(() => {});
    }

    kwami.setState('speaking');
    console.log(`🎥 Blob video audio stream attached: ${sourceUrl}`);
  } catch (error) {
    console.error('🎥 Unable to connect video audio stream:', error);
  }
}

async function playRandomVideoInBlob() {
  if (isVideoLoading) {
    console.warn('🎥 A video is already loading, please wait...');
    return;
  }

  if (!PLAYABLE_VIDEO_LINKS.length) {
    console.warn('🎥 No playable video links available in links.json');
    return;
  }

  const kwami = getKwamiInstance();
  if (!kwami) {
    console.warn('🎥 Kwami instance not ready yet');
    return;
  }

  const nextUrl = pickRandomVideoUrl();
  if (!nextUrl) {
    console.warn('🎥 Failed to select a video URL');
    return;
  }

  isVideoLoading = true;
  stopVideoPlayback(kwami);
  currentVideoUrl = nextUrl;

  console.log(`🎥 Loading blob video stream: ${nextUrl}`);

  try {
    kwami.body.setBlobSurfaceVideo(nextUrl, { autoplay: true, loop: true, muted: false });
    const videoElement = await waitForBlobSurfaceVideoElement(kwami);

    if (!videoElement) {
      throw new Error('Video element was not ready in time');
    }

    videoElement.muted = false;
    videoElement.volume = 1;

    await attachVideoAudioToKwami(kwami, videoElement, nextUrl);
    isVideoPlayingInBlob = true;
  } catch (error) {
    console.error('🎥 Failed to start blob video playback:', error);
    stopVideoPlayback(kwami);
  } finally {
    isVideoLoading = false;
  }
}

// Console message
console.log(`
  🎨 Kwami - Interactive AI Companion
  👻 https://github.com/alexcolls/kwami
  
  Tip: Scroll to see the real Kwami blob morph!
  Tip: Double-click the blob to randomize it! 🎲
  Tip: Click the blob to start listening, then say "kwami" to randomize! 🎤
  Tip: Click the Music tab to play a random song! 🎵
`);
