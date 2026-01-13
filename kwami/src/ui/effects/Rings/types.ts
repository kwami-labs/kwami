export type RingsResizeMode = 'manual' | 'auto';

export type RingsSizeSource = 'window' | 'mount' | 'auto';

export interface RingsGradientStop {
  /** 0..1 */
  offset: number;
  color: string;
  opacity?: number;
}

export interface BackgroundRingsOptions {
  /**
   * Where to mount the rings container. If omitted, you must call `mount()`.
   */
  mount?: HTMLElement | null;

  /**
   * How to measure available size.
   * - 'window': uses window.innerWidth/innerHeight
   * - 'mount': uses mount.getBoundingClientRect()
   * - 'auto': prefers 'mount' when mounted into a non-body element
   */
  sizeSource?: RingsSizeSource;

  /**
   * Resize behavior.
   * - 'manual' (default): host calls `resize()` when needed
   * - 'auto': attaches resize listeners (and cleans up in destroy)
   */
  resize?: RingsResizeMode;

  /** Number of ring ellipses. */
  ringCount?: number;

  /** Stroke width (px). */
  strokeWidth?: number;

  /** Starting radius (px). */
  baseRadius?: number;

  /**
   * How much each subsequent ring expands relative to the maximum dimension.
   * Defaults to 0.007 to match the current web implementation.
   */
  expansionFactor?: number;

  /**
   * Maximum per-ring opacity (ring opacity decreases with ring index).
   */
  maxRingOpacity?: number;

  /**
   * Palette used for interpolated ring stroke colors.
   */
  colors?: string[];

  /**
   * Optional gradient stops (kept for compatibility / future use).
   * The current implementation still uses interpolated stroke colors.
   */
  gradientStops?: RingsGradientStop[];

  /**
   * Position rings relative to the size.
   * Defaults match the web implementation: 10% beyond right edge and 10% above top edge.
   */
  centerOffset?: {
    x: number; // fraction of width
    y: number; // fraction of height
  };

  /** Insert as first child (default) or last child of mount target. */
  insert?: 'first' | 'last';

  /** Container z-index. */
  zIndex?: string;

  /** CSS opacity transition duration in ms used by show/hide. */
  opacityTransitionMs?: number;

  /** CSS opacity transition timing function (e.g. 'ease-in-out'). */
  opacityTransitionEasing?: string;

  /** Initial container opacity (default 0). */
  initialOpacity?: number;

  /** Extra className applied to the container. */
  className?: string;
}

export interface BackgroundRingsHandle {
  /** The container element (positioned absolutely). */
  element: HTMLDivElement;

  /** Mount into a target (or the configured mount). */
  mount: (target?: HTMLElement | null) => void;

  /** Recompute SVG viewBox and ring radii/colors. */
  resize: () => void;

  /** Set container opacity immediately (no animation). */
  setOpacity: (opacity: number) => void;

  /** Fade container to opacity=1. */
  show: () => void;

  /** Fade container to opacity=0. */
  hide: () => void;

  /** Remove DOM + detach listeners. Safe to call multiple times. */
  destroy: () => void;
}
