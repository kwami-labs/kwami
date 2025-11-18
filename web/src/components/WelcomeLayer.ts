import { gsap } from 'gsap';

export class WelcomeLayer {
  private showButton = true;
  private startAnimation = false;
  private showLoader = true;
  private showContainer = true;
  private readonly secondsLoader = 8;
  private readonly secondsContainer: number;
  private container: HTMLElement | null = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    this.secondsContainer = this.secondsLoader + 2;
    this.createWelcomeLayer();
    this.preloadAudio();
  }

  private preloadAudio() {
    // Preload the intro audio
    this.audioElement = new Audio('/fx/intro.mp3');
    this.audioElement.preload = 'auto';
    this.audioElement.volume = 0.7;
  }

  private createWelcomeLayer() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'loader-container';
    this.container.style.opacity = '1';

    // Create button
    const button = document.createElement('button');
    button.className = 'start-button fade-in-leave-active';
    button.innerHTML = `
      <div class="welcome-button">
        <span class="welcome-text">Start Experience</span>
      </div>
    `;
    button.addEventListener('click', () => this.handleClick());

    // Create SVG
    const svg = this.createSVG();
    svg.classList.add('hidden');

    // Create version display
    const versionDiv = document.createElement('div');
    versionDiv.id = 'version';
    versionDiv.className = 'fixed bottom-10 text-sm text-gray-400 opacity-80';
    versionDiv.textContent = 'v.0.0.1';

    // Append elements
    this.container.appendChild(button);
    this.container.appendChild(svg);
    this.container.appendChild(versionDiv);

    // Add to body
    document.body.appendChild(this.container);
  }

  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'mainSVG';
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('width', '900');

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

    // Create 120 ellipses
    for (let i = 0; i < 120; i++) {
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ellipse.classList.add('ell');
      ellipse.setAttribute('cx', '400');
      ellipse.setAttribute('cy', '300');
      ellipse.setAttribute('rx', '80');
      ellipse.setAttribute('ry', '80');
      svg.appendChild(ellipse);
    }

    // Create AI path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = 'ai';
    path.setAttribute('opacity', '0.95');
    path.setAttribute('d', 'M 200.8 70 L 200.8 67.1 L 240.2 67.1 L 240.2 7.2 L 217.7 55.4 L 195.2 7.1 L 195.2 70.1 L 192.2 70 L 192.2 0 L 195.2 0 L 217.7 48.3 L 240.2 0.1 L 243.2 0 L 243.2 70.1 L 200.8 70 Z M 121.7 3.1 L 59.1 3.1 L 59.1 0.1 L 126 0.1 L 100.5 70.2 L 87.5 34.6 L 74.6 70.2 L 49.1 0.1 L 52.3 0.1 L 74.6 61.4 L 87.5 25.8 L 100.5 61.4 L 121.7 3.1 Z M 139.4 70.1 L 139.4 67.1 L 176.2 67.1 L 155 8.8 L 132.7 70.1 L 129.5 70.1 L 155 0 L 180.5 70.1 L 139.4 70.1 Z M 39.8 0.1 L 44.1 0.1 L 10.5 33.5 L 47.3 70.1 L 43 70.1 L 6.2 33.5 L 39.8 0.1 Z M 0 0.1 L 3 0.1 L 3 70.1 L 0 70.1 L 0 0.1 Z M 266 0.1 L 266 70.1 L 263 70.1 L 263 0.1 L 266 0.1 Z');
    path.setAttribute('stroke', 'url(#aiGrad)');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-miterlimit', '100');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('transform', 'translate(267,264.9)');
    svg.appendChild(path);

    return svg;
  }

  private async handleClick() {
    const button = this.container?.querySelector('.start-button') as HTMLElement;
    const svg = this.container?.querySelector('#mainSVG') as SVGSVGElement;

    if (button && svg) {
      this.showButton = false;
      button.classList.add('hidden');
      svg.classList.remove('hidden');
      svg.classList.add('block');
      this.startAnimation = true;
      
      // Play intro audio
      if (this.audioElement) {
        try {
          await this.audioElement.play();
          console.log('🎵 Welcome intro audio playing');
        } catch (error) {
          console.warn('⚠️ Could not play intro audio:', error);
        }
      }
      
      this.initAnimation();
    }
  }

  private initAnimation() {
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
    }, this.secondsContainer * 1000);
  }
}

