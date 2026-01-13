import type { KwamiLogoLinkOptions, KwamiLogoOptions } from './types';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_GRADIENT_STOPS = [
  { offset: '0%', color: '#EF476F' },
  { offset: '25%', color: '#359EEE' },
  { offset: '50%', color: '#03CEA4' },
  { offset: '75%', color: '#FFC43D' },
  { offset: '100%', color: '#EF476F' },
] as const;

const WORDMARK_PATH_D =
  'M 224.8 70 L 224.8 67.1 L 264.2 67.1 L 264.2 7.2 L 241.7 55.4 L 219.2 7.1 L 219.2 70.1 L 216.2 70 L 216.2 0 L 219.2 0 L 241.7 48.3 L 264.2 0.1 L 267.2 0 L 267.2 70.1 L 224.8 70 Z M 133.7 3.1 L 71.1 3.1 L 71.1 0.1 L 138 0.1 L 112.5 70.2 L 99.5 34.6 L 86.6 70.2 L 61.1 0.1 L 64.3 0.1 L 86.6 61.4 L 99.5 25.8 L 112.5 61.4 L 133.7 3.1 Z M 157.4 70.1 L 157.4 67.1 L 194.2 67.1 L 173 8.8 L 150.7 70.1 L 147.5 70.1 L 173 0 L 198.5 70.1 L 157.4 70.1 Z M 45.8 0.1 L 50.1 0.1 L 16.5 33.5 L 53.3 70.1 L 49 70.1 L 12.2 33.5 L 45.8 0.1 Z M 0 0.1 L 3 0.1 L 3 70.1 L 0 70.1 L 0 0.1 Z M 296 0.1 L 296 70.1 L 293 70.1 L 293 0.1 L 296 0.1 Z';

export function createKwamiLogoSvg(options: KwamiLogoOptions = {}): SVGSVGElement {
  if (typeof document === 'undefined') {
    throw new Error('createKwamiLogoSvg can only be used in a browser environment');
  }

  const {
    className,
    gradientId = 'kwami-logo-grad',
    strokeWidth = 4,
    style,
  } = options;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', '0 0 296 70.2');
  svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
  if (className) svg.setAttribute('class', className);

  if (style) {
    Object.assign(svg.style, style);
  }

  const defs = document.createElementNS(SVG_NS, 'defs');
  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', gradientId);
  grad.setAttribute('x1', '0%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%');
  grad.setAttribute('y2', '0%');

  for (const stopCfg of DEFAULT_GRADIENT_STOPS) {
    const stop = document.createElementNS(SVG_NS, 'stop');
    stop.setAttribute('offset', stopCfg.offset);
    stop.setAttribute('stop-color', stopCfg.color);
    stop.setAttribute('stop-opacity', '1');
    grad.appendChild(stop);
  }

  defs.appendChild(grad);
  svg.appendChild(defs);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('opacity', '0.95');
  path.setAttribute('d', WORDMARK_PATH_D);
  path.setAttribute('stroke', `url(#${gradientId})`);
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', String(strokeWidth));
  path.setAttribute('fill', 'none');

  svg.appendChild(path);
  return svg;
}

export function createKwamiLogoLink(options: KwamiLogoLinkOptions = {}): HTMLAnchorElement {
  if (typeof document === 'undefined') {
    throw new Error('createKwamiLogoLink can only be used in a browser environment');
  }

  const {
    href = '/',
    target,
    rel,
    ariaLabel = 'KWAMI',
    linkClassName,
    ...svgOptions
  } = options;

  const a = document.createElement('a');
  a.href = href;
  if (target) a.target = target;
  if (rel) a.rel = rel;
  a.setAttribute('aria-label', ariaLabel);
  if (linkClassName) a.className = linkClassName;

  const svg = createKwamiLogoSvg(svgOptions);
  a.appendChild(svg);

  return a;
}
