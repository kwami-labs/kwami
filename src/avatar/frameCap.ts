/**
 * How often the avatar is drawn, at most.
 *
 * Every renderer drew on every animation frame the browser offered: 144 times a second on
 * a 144 Hz monitor, 240 on a 240 Hz one, for a figure whose motion is smooth at 60. On a
 * desktop that is most of the GPU, and the fans, spent on frames nobody can tell apart.
 * Each loop still asks for every frame, and draws only when one is due.
 *
 * The gate keeps its phase, so 60 on a 144 Hz monitor comes out at 60 on average (two
 * vsyncs, then three) rather than the 48 a plain "at least 16.7 ms since the last" gives.
 */

/** Frames per second the avatar is drawn at, at most; 0 draws every frame. */
let maxFps = 60

export function setMaxFps(fps: number): void {
  maxFps = Number.isFinite(fps) && fps > 0 ? fps : 0
}

export function getMaxFps(): number {
  return maxFps
}

/** A gate for one draw loop: call it with the frame's time (ms); true when it should draw. */
export function createFrameGate(): (now?: number) => boolean {
  let due = 0
  return (now: number = typeof performance === 'undefined' ? Date.now() : performance.now()) => {
    if (!maxFps) return true
    const interval = 1000 / maxFps
    // A little early still counts: vsyncs jitter around the interval.
    if (due && now < due - 1.5) return false
    // Behind by more than a frame (a background tab, a stall): start the rhythm again.
    due = due && now - due < interval ? due + interval : now + interval
    return true
  }
}
