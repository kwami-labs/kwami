import type { WelcomeAnimatedRingsHandle, WelcomeAnimatedRingsOptions, WelcomeRingsResizeMode } from './types';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_COLORS = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];

// This is the centered wordmark path used in the web welcome SVG (id: ai)
const WELCOME_WORDMARK_PATH_D =
  'M 200.8 70 L 200.8 67.1 L 240.2 67.1 L 240.2 7.2 L 217.7 55.4 L 195.2 7.1 L 195.2 70.1 L 192.2 70 L 192.2 0 L 195.2 0 L 217.7 48.3 L 240.2 0.1 L 243.2 0 L 243.2 70.1 L 200.8 70 Z M 121.7 3.1 L 59.1 3.1 L 59.1 0.1 L 126 0.1 L 100.5 70.2 L 87.5 34.6 L 74.6 70.2 L 49.1 0.1 L 52.3 0.1 L 74.6 61.4 L 87.5 25.8 L 100.5 61.4 L 121.7 3.1 Z M 139.4 70.1 L 139.4 67.1 L 176.2 67.1 L 155 8.8 L 132.7 70.1 L 129.5 70.1 L 155 0 L 180.5 70.1 L 139.4 70.1 Z M 39.8 0.1 L 44.1 0.1 L 10.5 33.5 L 47.3 70.1 L 43 70.1 L 6.2 33.5 L 39.8 0.1 Z M 0 0.1 L 3 0.1 L 3 70.1 L 0 70.1 L 0 0.1 Z M 266 0.1 L 266 70.1 L 263 70.1 L 263 0.1 L 266 0.1 Z';

export function createWelcomeAnimatedRings(options: WelcomeAnimatedRingsOptions = {}): WelcomeAnimatedRingsHandle {
  if (typeof document === 'undefined') {
    throw new Error('createWelcomeAnimatedRings can only be used in a browser environment');
  }

  const {
    mount,
    insert = 'first',
    zIndex = '100',
    ringCount = 120,
    baseRadiusRatio = 0.12,
    ringStrokeWidth = 2,
    cycleSeconds = 6,
    ringPulsePxPerIndex = 4,
    rotationDegreesPerSecond = 360,
    animateGradient = true,
    colors = DEFAULT_COLORS,
    autoStart = true,
    opacity = 1,
    includeWordmark = true,
  } = options;

  const resizeMode: WelcomeRingsResizeMode = options.resize ?? 'manual';

  let mountedInto: HTMLElement | null = null;
  let rafId: number | null = null;
  let startTs: number | null = null;
  let destroyed = false;

  const container = document.createElement('div');
  container.className = 'kwami-welcome-rings';
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';
  container.style.zIndex = zIndex;
  container.style.opacity = String(opacity);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.display = 'block';

  const defs = document.createElementNS(SVG_NS, 'defs');
  const gradient = document.createElementNS(SVG_NS, 'linearGradient');
  gradient.setAttribute('id', 'kwami-welcome-grad');
  gradient.setAttribute('x1', '213.98');
  gradient.setAttribute('y1', '290');
  gradient.setAttribute('x2', '179.72');
  gradient.setAttribute('y2', '320');
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');

  const gradientBase = {
    x1: 213.98,
    y1: 290,
    x2: 179.72,
    y2: 320,
  };

  const stops = [
    { offset: '0', color: '#000', opacity: '0' },
    { offset: '.15', color: '#EF476F', opacity: '1' },
    { offset: '.4', color: '#359EEE', opacity: '1' },
    { offset: '.6', color: '#03CEA4', opacity: '1' },
    { offset: '.78', color: '#FFC43D', opacity: '1' },
    { offset: '1', color: '#000', opacity: '0' },
  ];

  for (const stopCfg of stops) {
    const stop = document.createElementNS(SVG_NS, 'stop');
    stop.setAttribute('offset', stopCfg.offset);
    stop.setAttribute('stop-color', stopCfg.color);
    stop.setAttribute('stop-opacity', stopCfg.opacity);
    gradient.appendChild(stop);
  }

  defs.appendChild(gradient);
  svg.appendChild(defs);

  const ringsGroup = document.createElementNS(SVG_NS, 'g');
  ringsGroup.setAttribute('id', 'kwami-welcome-rings-group');
  svg.appendChild(ringsGroup);

  const ellipses: SVGEllipseElement[] = [];
  for (let i = 0; i < ringCount; i++) {
    const e = document.createElementNS(SVG_NS, 'ellipse');
    e.classList.add('kwami-welcome-ring');
    e.setAttribute('fill', 'none');
    e.setAttribute('stroke-width', String(ringStrokeWidth));
    ellipses.push(e);
    ringsGroup.appendChild(e);
  }

  let wordmark: SVGPathElement | null = null;
  if (includeWordmark) {
    wordmark = document.createElementNS(SVG_NS, 'path');
    wordmark.setAttribute('id', 'kwami-welcome-wordmark');
    wordmark.setAttribute('opacity', '0.95');
    wordmark.setAttribute('d', WELCOME_WORDMARK_PATH_D);
    wordmark.setAttribute('stroke', 'url(#kwami-welcome-grad)');
    wordmark.setAttribute('stroke-linecap', 'round');
    wordmark.setAttribute('stroke-miterlimit', '100');
    wordmark.setAttribute('stroke-width', '2');
    wordmark.setAttribute('fill', 'none');
    svg.appendChild(wordmark);
  }

  container.appendChild(svg);

  function measureViewport(): { vw: number; vh: number } {
    if (typeof window === 'undefined') return { vw: 0, vh: 0 };
    return { vw: window.innerWidth, vh: window.innerHeight };
  }

  let cx = 0;
  let cy = 0;
  let baseRadius = 0;

  function resizeSvg() {
    const { vw, vh } = measureViewport();
    if (vw <= 0 || vh <= 0) return;

    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);

    cx = vw / 2;
    cy = vh / 2;
    baseRadius = Math.min(vw, vh) * baseRadiusRatio;

    for (let i = 0; i < ellipses.length; i++) {
      const count = i + 1;
      const e = ellipses[i];
      e.setAttribute('cx', String(cx));
      e.setAttribute('cy', String(cy));
      e.setAttribute('rx', String(baseRadius));
      e.setAttribute('ry', String(baseRadius));

      const t = count / ellipses.length;
      e.style.opacity = String(1 - t);
      e.setAttribute('stroke', interpolatePalette(colors, t));
    }

    if (wordmark) {
      const textScale = Math.min(vw, vh) / 500;
      wordmark.setAttribute(
        'transform',
        `translate(${cx - 133 * textScale}, ${cy - 35 * textScale}) scale(${textScale})`,
      );
    }
  }

  function tick(ts: number) {
    if (destroyed) return;
    if (startTs === null) startTs = ts;

    const elapsed = (ts - startTs) / 1000;
    const phase = (elapsed % cycleSeconds) / cycleSeconds; // 0..1

    // Pulse in [0..1]
    const pulse = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);

    // Animate rings expansion without accumulating radius.
    for (let i = 0; i < ellipses.length; i++) {
      const count = i + 1;
      const e = ellipses[i];
      const delta = pulse * count * ringPulsePxPerIndex;
      e.setAttribute('rx', String(baseRadius + delta));
      e.setAttribute('ry', String(baseRadius + delta));
    }

    // Rotate the whole ring group around the center.
    if (rotationDegreesPerSecond !== 0) {
      const angle = elapsed * rotationDegreesPerSecond;
      ringsGroup.setAttribute('transform', `rotate(${angle} ${cx} ${cy})`);
    }

    // Animate gradient vector similar to web welcome (forward/back).
    if (animateGradient) {
      const shift = pulse;
      gradient.setAttribute('x1', String(gradientBase.x1 + 380 * shift));
      gradient.setAttribute('x2', String(gradientBase.x2 + 300 * shift));
    }

    rafId = requestAnimationFrame(tick);
  }

  const onResize = () => handle.resize();

  function attachAutoResize() {
    if (resizeMode !== 'auto') return;
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize, { passive: true });
    }
  }

  function detachAutoResize() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onResize);
    }
  }

  const handle: WelcomeAnimatedRingsHandle = {
    element: container,
    svg,

    mount(target?: HTMLElement | null) {
      if (destroyed) return;
      const resolved = target ?? mount ?? document.body;
      if (!resolved) throw new Error('createWelcomeAnimatedRings.mount: no mount target provided');
      mountedInto = resolved;

      if (insert === 'first' && resolved.firstChild) {
        resolved.insertBefore(container, resolved.firstChild);
      } else {
        resolved.appendChild(container);
      }

      resizeSvg();
      attachAutoResize();

      if (autoStart) {
        handle.start();
      }
    },

    start() {
      if (destroyed) return;
      if (rafId != null) return;
      startTs = null;
      rafId = requestAnimationFrame(tick);
    },

    stop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      startTs = null;
    },

    resize() {
      if (destroyed) return;
      resizeSvg();
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      handle.stop();
      detachAutoResize();
      if (container.parentNode) container.parentNode.removeChild(container);
      mountedInto = null;
      wordmark = null;
    },
  };

  if (mount) {
    handle.mount(mount);
  }

  return handle;
}

function interpolatePalette(palette: string[], t: number): string {
  if (!palette.length) return '#000000';
  if (palette.length === 1) return palette[0];

  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (palette.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;

  const a = palette[idx];
  const b = palette[Math.min(idx + 1, palette.length - 1)];

  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return frac < 0.5 ? a : b;

  return rgbToHex({
    r: mix(ca.r, cb.r, frac),
    g: mix(ca.g, cb.g, frac),
    b: mix(ca.b, cb.b, frac),
  });
}

function mix(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function parseHex(input: string): { r: number; g: number; b: number } | null {
  const hex = input.trim();
  if (!hex.startsWith('#')) return null;

  const raw = hex.slice(1);
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }

  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }

  return null;
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const to = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`;
}
