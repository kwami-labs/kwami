import type {
  BackgroundRingsHandle,
  BackgroundRingsOptions,
  RingsGradientStop,
  RingsResizeMode,
  RingsSizeSource,
} from './types';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_COLORS = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];

const DEFAULT_GRADIENT_STOPS: RingsGradientStop[] = [
  { offset: 0, color: '#000', opacity: 0 },
  { offset: 0.15, color: '#EF476F', opacity: 1 },
  { offset: 0.4, color: '#359EEE', opacity: 1 },
  { offset: 0.6, color: '#03CEA4', opacity: 1 },
  { offset: 0.78, color: '#FFC43D', opacity: 1 },
  { offset: 1, color: '#000', opacity: 0 },
];

export function createBackgroundRings(options: BackgroundRingsOptions = {}): BackgroundRingsHandle {
  if (typeof document === 'undefined') {
    throw new Error('createBackgroundRings can only be used in a browser environment');
  }

  const {
    ringCount = 120,
    strokeWidth = 2,
    baseRadius = 2,
    expansionFactor = 0.007,
    maxRingOpacity = 0.3,
    colors = DEFAULT_COLORS,
    gradientStops = DEFAULT_GRADIENT_STOPS,
    centerOffset = { x: 0.1, y: -0.1 },
    insert = 'first',
    zIndex = '0',
    opacityTransitionMs = 900,
    opacityTransitionEasing = 'ease-in-out',
    initialOpacity = 0,
  } = options;

  let isDestroyed = false;
  let mountedInto: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const resizeMode: RingsResizeMode = options.resize ?? 'manual';
  const sizeSource: RingsSizeSource = options.sizeSource ?? 'auto';

  const container = document.createElement('div');
  container.id = 'kwami-background-rings';
  container.className = ['kwami-background-rings', options.className].filter(Boolean).join(' ');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';
  container.style.zIndex = zIndex;
  container.style.opacity = `${initialOpacity}`;
  container.style.transition = `opacity ${opacityTransitionMs}ms ${opacityTransitionEasing}`;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.display = 'block';

  // defs kept for parity with the original implementation (not required for current strokes)
  svg.appendChild(createDefs(gradientStops));

  const ellipses: SVGEllipseElement[] = [];
  for (let i = 0; i < ringCount; i++) {
    const ellipse = document.createElementNS(SVG_NS, 'ellipse');
    ellipse.classList.add('kwami-bg-ring');
    ellipse.setAttribute('fill', 'none');
    ellipse.setAttribute('stroke-width', String(strokeWidth));
    // cx/cy + radii are applied in resize()
    ellipses.push(ellipse);
    svg.appendChild(ellipse);
  }

  container.appendChild(svg);

  const onWindowResize = () => {
    if (isDestroyed) return;
    handle.resize();
  };

  function measure(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }

    const useMount =
      sizeSource === 'mount' ||
      (sizeSource === 'auto' && mountedInto && mountedInto !== document.body && mountedInto !== document.documentElement);

    if (useMount && mountedInto) {
      const rect = mountedInto.getBoundingClientRect();
      return {
        width: Math.max(0, Math.round(rect.width)),
        height: Math.max(0, Math.round(rect.height)),
      };
    }

    return {
      width: Math.max(0, window.innerWidth),
      height: Math.max(0, window.innerHeight),
    };
  }

  function applyLayout() {
    const { width, height } = measure();
    if (width <= 0 || height <= 0) return;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Match web implementation: rings centered just outside the top-right.
    const cx = width + width * centerOffset.x;
    const cy = height * centerOffset.y;

    const maxDimension = Math.max(width, height);
    const expansionPerRing = maxDimension * expansionFactor;

    for (let i = 0; i < ellipses.length; i++) {
      const count = i + 1;
      const finalRadius = baseRadius + count * expansionPerRing;

      const ellipse = ellipses[i];
      ellipse.setAttribute('cx', String(cx));
      ellipse.setAttribute('cy', String(cy));
      ellipse.setAttribute('rx', String(finalRadius));
      ellipse.setAttribute('ry', String(finalRadius));

      const t = count / ellipses.length;
      ellipse.style.opacity = String((1 - t) * maxRingOpacity);
      ellipse.setAttribute('stroke', interpolatePalette(colors, t));
    }
  }

  function ensureAutoResize() {
    if (resizeMode !== 'auto') return;
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWindowResize, { passive: true });
    }

    // Use ResizeObserver when mounted into a specific element.
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (isDestroyed) return;
        handle.resize();
      });
      if (mountedInto && mountedInto !== document.body && mountedInto !== document.documentElement) {
        resizeObserver.observe(mountedInto);
      }
    }
  }

  function teardownAutoResize() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onWindowResize);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  }

  const handle: BackgroundRingsHandle = {
    element: container,

    mount(target?: HTMLElement | null) {
      if (isDestroyed) return;

      const resolvedTarget = target ?? options.mount ?? document.body;
      if (!resolvedTarget) {
        throw new Error('createBackgroundRings.mount: no mount target provided');
      }

      mountedInto = resolvedTarget;

      if (insert === 'first' && resolvedTarget.firstChild) {
        resolvedTarget.insertBefore(container, resolvedTarget.firstChild);
      } else {
        resolvedTarget.appendChild(container);
      }

      // Ensure layout after mount so sizeSource:auto can measure the mount.
      applyLayout();
      ensureAutoResize();
    },

    resize() {
      if (isDestroyed) return;
      applyLayout();
    },

    setOpacity(opacity: number) {
      if (isDestroyed) return;
      container.style.transition = 'none';
      container.style.opacity = String(opacity);
      // Restore transition for subsequent show/hide calls.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      container.offsetHeight;
      container.style.transition = `opacity ${opacityTransitionMs}ms ${opacityTransitionEasing}`;
    },

    show() {
      if (isDestroyed) return;
      container.style.opacity = '1';
    },

    hide() {
      if (isDestroyed) return;
      container.style.opacity = '0';
    },

    destroy() {
      if (isDestroyed) return;
      isDestroyed = true;

      teardownAutoResize();

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }

      mountedInto = null;
    },
  };

  if (options.mount) {
    handle.mount(options.mount);
  }

  return handle;
}

function createDefs(gradientStops: RingsGradientStop[]): SVGDefsElement {
  const defs = document.createElementNS(SVG_NS, 'defs');
  const gradient = document.createElementNS(SVG_NS, 'linearGradient');
  gradient.id = 'kwami-bg-rings-gradient';
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
  gradient.setAttribute('x1', '213.98');
  gradient.setAttribute('y1', '290');
  gradient.setAttribute('x2', '179.72');
  gradient.setAttribute('y2', '320');

  for (const stopData of gradientStops) {
    const stop = document.createElementNS(SVG_NS, 'stop');
    const pct = Math.max(0, Math.min(1, stopData.offset)) * 100;
    stop.setAttribute('offset', `${pct}%`);
    stop.setAttribute('stop-color', stopData.color);
    stop.setAttribute('stop-opacity', String(stopData.opacity ?? 1));
    gradient.appendChild(stop);
  }

  defs.appendChild(gradient);
  return defs;
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
  if (!ca || !cb) {
    // If colors are not hex, fall back to nearest segment color.
    return frac < 0.5 ? a : b;
  }

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
