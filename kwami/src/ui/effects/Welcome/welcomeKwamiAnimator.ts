export interface WelcomeKwamiAnimatorOptions {
  /** Starting scale (default 40% of final). */
  initialScaleRatio?: number;

  /** Final scale (defaults match web welcome: 7.8 desktop / 7.5 mobile). */
  finalScale?: number | ((ctx: { isMobile: boolean }) => number);

  /** Duration for scaling animation in ms (default 2500). */
  scaleDurationMs?: number;

  /** Target spikes (defaults match web welcome). */
  targetSpikes?: { x: number; y: number; z: number };

  /** Duration for spikes animation in ms (default 1250). */
  spikesDurationMs?: number;

  /** Auto-rotation speeds (radians per frame at ~60fps); set 0 to disable. */
  rotation?: { x: number; y: number; z?: number };

  /**
   * Whether to run rotation loop while the animator is active.
   * Default true.
   */
  autoRotate?: boolean;
}

export interface WelcomeKwamiAnimatorHandle {
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

/**
 * Minimal interface required from Kwami's blob.
 * We keep it structural to avoid hard imports and keep this usable across bundles.
 */
export interface BlobLike {
  setScale: (value: number) => void;
  getScale: () => number;
  setSpikes: (x: number, y: number, z: number) => void;
  getMesh: () => { rotation: { x: number; y: number; z: number } };
}

export function createWelcomeKwamiAnimator(blob: BlobLike, options: WelcomeKwamiAnimatorOptions = {}): WelcomeKwamiAnimatorHandle {
  const {
    initialScaleRatio = 0.4,
    finalScale = ({ isMobile }) => (isMobile ? 7.5 : 7.8),
    scaleDurationMs = 2500,
    targetSpikes = { x: 0.05, y: 5.2, z: 0.05 },
    spikesDurationMs = 1250,
    rotation = { x: 0.003, y: 0.012, z: 0 },
    autoRotate = true,
  } = options;

  let destroyed = false;
  let running = false;

  let rafScale: number | null = null;
  let rafRotate: number | null = null;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const resolvedFinalScale = typeof finalScale === 'function' ? finalScale({ isMobile }) : finalScale;
  const resolvedInitialScale = resolvedFinalScale * initialScaleRatio;

  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function animateScaleAndSpikes() {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // Start fully spherical in the web welcome.
    blob.setSpikes(0, 0, 0);
    blob.setScale(resolvedInitialScale);

    const tick = (now: number) => {
      if (destroyed || !running) return;

      const tScale = Math.min(1, (now - start) / scaleDurationMs);
      const tSpikes = Math.min(1, (now - start) / spikesDurationMs);

      const s = lerp(resolvedInitialScale, resolvedFinalScale, easeOutCubic(tScale));
      blob.setScale(s);

      const k = easeInOutQuad(tSpikes);
      blob.setSpikes(targetSpikes.x * k, targetSpikes.y * k, targetSpikes.z * k);

      if (tScale < 1 || tSpikes < 1) {
        rafScale = requestAnimationFrame(tick);
      } else {
        rafScale = null;
      }
    };

    rafScale = requestAnimationFrame(tick);
  }

  function animateRotation() {
    if (!autoRotate) return;

    const mesh = blob.getMesh();
    const tick = () => {
      if (destroyed || !running) return;
      mesh.rotation.y += rotation.y;
      mesh.rotation.x += rotation.x;
      if (rotation.z) mesh.rotation.z += rotation.z;
      rafRotate = requestAnimationFrame(tick);
    };

    rafRotate = requestAnimationFrame(tick);
  }

  const handle: WelcomeKwamiAnimatorHandle = {
    start() {
      if (destroyed || running) return;
      running = true;
      animateScaleAndSpikes();
      animateRotation();
    },

    stop() {
      running = false;
      if (rafScale != null) {
        cancelAnimationFrame(rafScale);
        rafScale = null;
      }
      if (rafRotate != null) {
        cancelAnimationFrame(rafRotate);
        rafRotate = null;
      }
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      handle.stop();
    },
  };

  return handle;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
