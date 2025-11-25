import gsap from 'gsap';

/**
 * BackgroundRings - Creates and animates colored rings in the background
 * Uses the same colors and animation style from the welcome layer
 */
export class BackgroundRings {
  private svg: SVGSVGElement | null = null;
  private container: HTMLDivElement | null = null;
  private allEllipses: SVGEllipseElement[] = [];
  private colorArr = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];
  private isDestroyed = false;

  constructor() {

    this.init();
  }

  private init() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'background-rings';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.zIndex = '0'; // Same level as .content-right itself, but will be behind kwami-container
    this.container.style.pointerEvents = 'none';
    this.container.style.overflow = 'hidden';

    // Create SVG
    this.svg = this.createSVG();
    this.container.appendChild(this.svg);

    // Add to .content-right (the right side container) instead of body
    const contentRight = document.querySelector('.content-right');
    if (contentRight) {
      // Insert as first child so it's behind everything else in .content-right
      contentRight.insertBefore(this.container, contentRight.firstChild);
    } else {
      // Fallback to body if .content-right doesn't exist
      document.body.appendChild(this.container);
    }

    // Start animation after a brief delay
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.startAnimation();
      }
    }, 100);
  }

  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'backgroundRingsSVG';
    
    // Use viewport dimensions for full screen coverage
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Create defs with gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'bgRingsGrad';
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

    // Position rings at top-right corner, outside the screen
    const centerX = vw + vw * 0.1; // 10% beyond right edge
    const centerY = -vh * 0.1; // 10% above top edge
    // Use max dimension to ensure rings cover the entire screen on all sizes
    const maxDimension = Math.max(vw, vh);
    const baseRadius = 2; // Start as a tiny point (2px)
    
    // Create 120 ellipses
    for (let i = 0; i < 120; i++) {
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ellipse.classList.add('bg-ring-ell');
      ellipse.setAttribute('cx', centerX.toString());
      ellipse.setAttribute('cy', centerY.toString());
      ellipse.setAttribute('rx', baseRadius.toString());
      ellipse.setAttribute('ry', baseRadius.toString());
      ellipse.setAttribute('fill', 'none');
      ellipse.setAttribute('stroke-width', '2');
      this.allEllipses.push(ellipse);
      svg.appendChild(ellipse);
    }

    return svg;
  }

  private startAnimation() {
    // @ts-ignore - gsap trialWarn config
    gsap.config({ trialWarn: false });

    const colorInterp = gsap.utils.interpolate(this.colorArr);
    
    // Calculate expansion size based on screen dimensions
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);
    const expansionPerRing = maxDimension * 0.007; // Reduced from 0.01 to 0.004 for tighter spacing

    // Just set the rings to their fully expanded state without animation
    this.allEllipses.forEach((el, i) => {
      const count = i + 1;
      const baseRadius = 2; // Start from tiny point
      const maxExpansion = count * expansionPerRing; // Removed the *2 multiplier for less expansion
      const finalRadius = baseRadius + maxExpansion;
      
      // Set final state with color and opacity - no animation
      gsap.set(el, {
        opacity: (1 - count / this.allEllipses.length) * 0.3, // Reduced opacity for background
        stroke: colorInterp(count / this.allEllipses.length),
        attr: {
          rx: finalRadius,
          ry: finalRadius
        }
      });
    });
  }

  public setOpacity(opacity: number) {
    if (this.container) {
      this.container.style.opacity = opacity.toString();
    }
  }

  public show() {
    if (this.container) {
      gsap.to(this.container, {
        opacity: 1,
        duration: 2,
        ease: 'sine.inOut'
      });
    }
  }

  public hide() {
    if (this.container) {
      gsap.to(this.container, {
        opacity: 0,
        duration: 1,
        ease: 'sine.inOut'
      });
    }
  }

  public destroy() {
    this.isDestroyed = true;
    
    // Kill all GSAP animations
    gsap.killTweensOf(this.allEllipses);
    gsap.killTweensOf('#bgRingsGrad');
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.svg = null;
    this.container = null;
    this.allEllipses = [];
  }
}

