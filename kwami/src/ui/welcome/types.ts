export type WelcomeRingsResizeMode = 'manual' | 'auto';

export interface WelcomeAnimatedRingsOptions {
  /**
   * Where to mount the SVG container. If omitted, you must call `mount()`.
   */
  mount?: HTMLElement | null;

  /** Insert container as first child (default) or last child. */
  insert?: 'first' | 'last';

  /** Container z-index (defaults to high so it sits above black background). */
  zIndex?: string;

  /** Number of ring ellipses (default 120). */
  ringCount?: number;

  /** Base radius as a fraction of min(viewportWidth, viewportHeight). Default matches web welcome (0.12). */
  baseRadiusRatio?: number;

  /** Stroke width for rings (px). Default 2. */
  ringStrokeWidth?: number;

  /** Duration (seconds) for a full pulse cycle. Default 6 to match web welcome. */
  cycleSeconds?: number;

  /**
   * Approximate per-ring pulse amplitude (px multiplier). Higher = more expansion.
   * The web welcome expands by ~count*2 twice per loop; default 4 is a close match.
   */
  ringPulsePxPerIndex?: number;

  /**
   * Rotation speed for the ring group (degrees per second).
   * The web welcome rotates ~2160deg over 6s (~360deg/s).
   */
  rotationDegreesPerSecond?: number;

  /**
   * Animate the gradient vector (x1/x2) similar to the web welcome.
   */
  animateGradient?: boolean;

  /**
   * Palette used to interpolate ring stroke colors.
   * Default matches web welcome.
   */
  colors?: string[];

  /** Start immediately after mount (default true). */
  autoStart?: boolean;

  /** Resize handling. Default 'manual'. */
  resize?: WelcomeRingsResizeMode;

  /** Optional opacity (0..1) applied to the whole container. */
  opacity?: number;

  /** Whether to include the centered wordmark path (the welcome “KWAMI” stroke). Default true. */
  includeWordmark?: boolean;
}

export interface WelcomeAnimatedRingsHandle {
  element: HTMLDivElement;
  svg: SVGSVGElement;

  mount: (target?: HTMLElement | null) => void;
  start: () => void;
  stop: () => void;
  resize: () => void;
  destroy: () => void;
}

export interface KwamiLogoOptions {
  className?: string;
  gradientId?: string;
  strokeWidth?: number;
  /** Optional inline styles for the SVG element. */
  style?: Partial<CSSStyleDeclaration>;
}

export interface KwamiLogoLinkOptions extends KwamiLogoOptions {
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  linkClassName?: string;
}
