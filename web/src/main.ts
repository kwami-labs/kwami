import './style.css';

// Color palettes for different sections
const colorPalettes = [
  { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' }, // Purple gradient
  { primary: '#ff6b6b', secondary: '#ee5a6f', accent: '#f093fb' }, // Red-pink
  { primary: '#4ecdc4', secondary: '#44a08d', accent: '#96e6a1' }, // Teal-green
  { primary: '#f7971e', secondary: '#ffd200', accent: '#ffeb3b' }, // Orange-yellow
  { primary: '#667eea', secondary: '#f093fb', accent: '#c471ed' }, // Purple-pink
  { primary: '#00b4db', secondary: '#0083b0', accent: '#667eea' }, // Blue gradient
];

// Kwami blob configuration
interface BlobCircle {
  x: number;
  y: number;
  radius: number;
  element: SVGCircleElement;
}

class KwamiBlob {
  private circles: BlobCircle[] = [];
  private blobGroup: SVGGElement;
  private numCircles = 8;
  private baseRadius = 80;
  private centerX = 200;
  private centerY = 200;
  private time = 0;
  private animationFrame: number | null = null;

  constructor() {
    const blobElement = document.getElementById('kwami-blob');
    if (!blobElement) {
      throw new Error('Kwami blob element not found');
    }
    this.blobGroup = blobElement as unknown as SVGGElement;
    this.init();
    this.animate();
  }

  private init() {
    // Create blob circles
    for (let i = 0; i < this.numCircles; i++) {
      const angle = (i / this.numCircles) * Math.PI * 2;
      const distance = this.baseRadius;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '60');
      circle.setAttribute('fill', 'url(#kwami-gradient)');
      circle.classList.add('blob-circle');

      this.blobGroup.appendChild(circle);
      this.circles.push({ x, y, radius: 60, element: circle });
    }
  }

  public updateShape(scrollProgress: number, section: number) {
    // Change blob shape based on scroll and section
    const morphFactor = Math.sin(scrollProgress * Math.PI * 2) * 0.3;
    const sectionOffset = section * 0.5;

    this.circles.forEach((circle, i) => {
      const angle = (i / this.numCircles) * Math.PI * 2 + sectionOffset;
      
      // Create different shapes for different sections
      let distance = this.baseRadius;
      const radiusVariation = 60;

      switch (section) {
        case 0: // Circle
          distance = this.baseRadius;
          circle.radius = radiusVariation;
          break;
        case 1: // Star-like
          distance = this.baseRadius + (i % 2 === 0 ? 30 : -20) + morphFactor * 20;
          circle.radius = radiusVariation + (i % 2 === 0 ? 10 : -10);
          break;
        case 2: // Squiggly
          distance = this.baseRadius + Math.sin(angle * 3) * 25;
          circle.radius = radiusVariation + Math.cos(angle * 2) * 15;
          break;
        case 3: // Pulsing
          distance = this.baseRadius + Math.sin(this.time * 2 + i) * 20;
          circle.radius = radiusVariation + Math.cos(this.time * 3 + i) * 10;
          break;
        case 4: // Spiral
          distance = this.baseRadius + i * 8 + morphFactor * 30;
          circle.radius = radiusVariation - i * 3;
          break;
        case 5: // Heart-like
          const t = angle;
          distance = this.baseRadius * (0.8 + 0.2 * Math.sin(t) * Math.cos(t));
          circle.radius = radiusVariation + Math.sin(t * 2) * 10;
          break;
      }

      circle.x = this.centerX + Math.cos(angle) * distance;
      circle.y = this.centerY + Math.sin(angle) * distance;

      // Apply positions
      circle.element.setAttribute('cx', circle.x.toString());
      circle.element.setAttribute('cy', circle.y.toString());
      circle.element.setAttribute('r', circle.radius.toString());
    });
  }

  private animate = () => {
    this.time += 0.02;
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Main scroll handler
class ScrollManager {
  private sections: NodeListOf<Element>;
  private currentSection = 0;
  private kwamiBlob: KwamiBlob;
  private root: HTMLElement;

  constructor() {
    this.sections = document.querySelectorAll('.text-section');
    this.root = document.documentElement;
    this.kwamiBlob = new KwamiBlob();
    
    this.init();
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.handleScroll(); // Initial call
  }

  private init() {
    // Set initial colors
    this.updateColors(0);
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

    // Update colors based on section
    if (section !== this.currentSection) {
      this.currentSection = section;
      this.updateColors(section);
    }

    // Update kwami shape
    this.kwamiBlob.updateShape(sectionProgress, section);

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

  private addColorVariations(progress: number) {
    // Add subtle random variations to the gradient stops
    const stops = [
      document.querySelector('.stop1'),
      document.querySelector('.stop2'),
      document.querySelector('.stop3')
    ];

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ScrollManager();
  
  // Add loading animation
  const svg = document.getElementById('kwami-svg');
  if (svg) {
    svg.classList.add('loading');
    setTimeout(() => {
      svg.classList.remove('loading');
    }, 1000);
  }
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

// Easter egg: Click on kwami to randomize colors
document.getElementById('kwami-svg')?.addEventListener('click', () => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', generateRandomColor());
  root.style.setProperty('--color-secondary', generateRandomColor());
  root.style.setProperty('--color-accent', generateRandomColor());
});

// Console message
console.log(`
  🎨 Kwami - Interactive AI Companion
  👻 https://github.com/alexcolls/kwami
  
  Tip: Click on the Kwami blob to randomize colors!
`);
