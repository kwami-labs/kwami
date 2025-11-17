import './style.css';
import { Kwami } from 'kwami';

// Color palettes for different sections (16 sections)
const colorPalettes = [
  { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' }, // 00 - Purple gradient
  { primary: '#ff6b6b', secondary: '#ee5a6f', accent: '#f093fb' }, // 01 - Red-pink
  { primary: '#4ecdc4', secondary: '#44a08d', accent: '#96e6a1' }, // 02 - Teal-green
  { primary: '#f7971e', secondary: '#ffd200', accent: '#ffeb3b' }, // 03 - Orange-yellow
  { primary: '#667eea', secondary: '#f093fb', accent: '#c471ed' }, // 04 - Purple-pink
  { primary: '#00b4db', secondary: '#0083b0', accent: '#667eea' }, // 05 - Blue gradient
  { primary: '#e94b3c', secondary: '#6a2c70', accent: '#f38181' }, // 06 - Red-purple
  { primary: '#11998e', secondary: '#38ef7d', accent: '#a8e6cf' }, // 07 - Emerald
  { primary: '#fc466b', secondary: '#3f5efb', accent: '#8e54e9' }, // 08 - Pink-blue
  { primary: '#fdbb2d', secondary: '#22c1c3', accent: '#66d9e8' }, // 09 - Yellow-cyan
  { primary: '#8e2de2', secondary: '#4a00e0', accent: '#b794f6' }, // 10 - Deep purple
  { primary: '#ff9a56', secondary: '#ff6a88', accent: '#ffafbd' }, // 11 - Coral-pink
  { primary: '#2af598', secondary: '#009efd', accent: '#7dd3fc' }, // 12 - Cyan-blue
  { primary: '#f12711', secondary: '#f5af19', accent: '#fbbf24' }, // 13 - Fire gradient
  { primary: '#9333ea', secondary: '#ec4899', accent: '#f472b6' }, // 14 - Purple-pink
  { primary: '#14b8a6', secondary: '#0891b2', accent: '#22d3ee' }, // 15 - Teal-sky
];

// Blob configurations for different sections (16 sections)
const blobConfigs = [
  { // Section 00 - Circle (calm)
    spikeX: 0.2, spikeY: 0.2, spikeZ: 0.2,
    timeX: 5, timeY: 5, timeZ: 5
  },
  { // Section 01 - Star-like (energetic)
    spikeX: 2.5, spikeY: 2.5, spikeZ: 2.5,
    timeX: 8, timeY: 8, timeZ: 8
  },
  { // Section 02 - Squiggly (organic)
    spikeX: 5.0, spikeY: 3.0, spikeZ: 4.0,
    timeX: 10, timeY: 7, timeZ: 8
  },
  { // Section 03 - Pulsing (alive)
    spikeX: 1.0, spikeY: 1.0, spikeZ: 1.0,
    timeX: 15, timeY: 15, timeZ: 15
  },
  { // Section 04 - Spiral (dynamic)
    spikeX: 8.0, spikeY: 2.0, spikeZ: 5.0,
    timeX: 12, timeY: 6, timeZ: 9
  },
  { // Section 05 - Heart-like (soft)
    spikeX: 3.0, spikeY: 4.0, spikeZ: 2.5,
    timeX: 7, timeY: 9, timeZ: 6
  },
  { // Section 06 - Wavy (flowing)
    spikeX: 4.0, spikeY: 4.0, spikeZ: 1.5,
    timeX: 6, timeY: 6, timeZ: 10
  },
  { // Section 07 - Sharp (angular)
    spikeX: 6.0, spikeY: 1.0, spikeZ: 6.0,
    timeX: 8, timeY: 12, timeZ: 8
  },
  { // Section 08 - Bubble (soft)
    spikeX: 0.8, spikeY: 0.8, spikeZ: 0.8,
    timeX: 4, timeY: 4, timeZ: 4
  },
  { // Section 09 - Complex (intricate)
    spikeX: 7.0, spikeY: 5.0, spikeZ: 3.0,
    timeX: 11, timeY: 9, timeZ: 7
  },
  { // Section 10 - Slow wave (meditative)
    spikeX: 2.0, spikeY: 3.0, spikeZ: 2.0,
    timeX: 3, timeY: 3, timeZ: 3
  },
  { // Section 11 - Fast pulse (excited)
    spikeX: 3.5, spikeY: 3.5, spikeZ: 3.5,
    timeX: 18, timeY: 18, timeZ: 18
  },
  { // Section 12 - Asymmetric (unique)
    spikeX: 9.0, spikeY: 2.5, spikeZ: 6.5,
    timeX: 13, timeY: 5, timeZ: 9
  },
  { // Section 13 - Geometric (structured)
    spikeX: 4.5, spikeY: 4.5, spikeZ: 0.5,
    timeX: 7, timeY: 7, timeZ: 14
  },
  { // Section 14 - Gentle (smooth)
    spikeX: 1.5, spikeY: 2.0, spikeZ: 1.5,
    timeX: 6, timeY: 8, timeZ: 6
  },
  { // Section 15 - Celebration (dynamic)
    spikeX: 5.5, spikeY: 5.5, spikeZ: 5.5,
    timeX: 10, timeY: 10, timeZ: 10
  }
];

// Main scroll handler
class ScrollManager {
  private sections: NodeListOf<Element>;
  private currentSection = 0;
  private kwami: Kwami | null = null;
  private root: HTMLElement;
  private isTransitioning = false;

  constructor() {
    this.sections = document.querySelectorAll('.text-section');
    this.root = document.documentElement;
    
    this.init();
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.handleScroll(); // Initial call
  }

  private async init() {
    // Set initial colors
    this.updateColors(0);
    
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
            cameraPosition: { x: -0.9, y: 7.3, z: -1.8 },
            enableControls: true
          }
        }
      });

      // Set blob scale to match playground
      this.kwami.body.blob.setScale(4.0);

      // Enable click interaction for touch effects
      this.kwami.body.blob.setClickEnabled(true);

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

    // Update colors and blob config based on section
    if (section !== this.currentSection && !this.isTransitioning) {
      this.currentSection = section;
      this.updateColors(section);
      this.updateKwamiConfig(section);
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

      // Small delay before allowing next transition
      setTimeout(() => {
        this.isTransitioning = false;
      }, 800);
    } catch (error) {
      console.error('Error updating Kwami config:', error);
      this.isTransitioning = false;
    }
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

// Tailwind colors at -500 tone ordered harmonically (by hue)
const tailwindColors500Harmonic = [
  '#ef4444', // red-500
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#d946ef', // fuchsia-500
  '#a855f7', // purple-500
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
  '#3b82f6', // blue-500
  '#0ea5e9', // sky-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#10b981', // emerald-500
  '#22c55e', // green-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#f59e0b', // amber-500
  '#f97316', // orange-500
];

// Get harmonic gradient for a section
function getHarmonicGradient(sectionIndex: number) {
  const totalColors = tailwindColors500Harmonic.length;
  const totalSections = 16;
  
  // Calculate color indices for smooth progression
  const baseIndex = Math.floor((sectionIndex / totalSections) * totalColors);
  const color1Index = baseIndex % totalColors;
  const color2Index = (baseIndex + 3) % totalColors;
  const color3Index = (baseIndex + 6) % totalColors;
  
  return {
    color1: tailwindColors500Harmonic[color1Index],
    color2: tailwindColors500Harmonic[color2Index],
    color3: tailwindColors500Harmonic[color3Index]
  };
}

function applyHarmonicColorsToSection(sectionIndex: number) {
  const gradient = getHarmonicGradient(sectionIndex);
  const gradientStyle = `linear-gradient(135deg, ${gradient.color1}, ${gradient.color2}, ${gradient.color3})`;
  
  // Apply to section numbers
  const sectionNumbers = document.querySelectorAll('.section-number');
  if (sectionNumbers[sectionIndex]) {
    const numberEl = sectionNumbers[sectionIndex] as HTMLElement;
    numberEl.style.background = gradientStyle;
    numberEl.style.backgroundSize = '200% 200%';
    numberEl.style.webkitBackgroundClip = 'text';
    numberEl.style.backgroundClip = 'text';
    numberEl.style.webkitTextFillColor = 'transparent';
  }
  
  // Apply to titles (h1/h2)
  const sections = document.querySelectorAll('.text-section');
  if (sections[sectionIndex]) {
    const titleEl = sections[sectionIndex].querySelector('h1, h2') as HTMLElement;
    if (titleEl) {
      titleEl.style.background = gradientStyle;
      titleEl.style.backgroundSize = '200% 200%';
      titleEl.style.webkitBackgroundClip = 'text';
      titleEl.style.backgroundClip = 'text';
      titleEl.style.webkitTextFillColor = 'transparent';
    }
  }
}

function initializeAllSectionColors() {
  const totalSections = document.querySelectorAll('.text-section').length;
  for (let i = 0; i < totalSections; i++) {
    applyHarmonicColorsToSection(i);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ScrollManager();
  
  // Apply harmonic colors to all sections
  initializeAllSectionColors();
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

// Console message
console.log(`
  🎨 Kwami - Interactive AI Companion
  👻 https://github.com/alexcolls/kwami
  
  Tip: Scroll to see the real Kwami blob morph!
`);
