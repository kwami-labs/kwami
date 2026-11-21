import { afterEach, describe, expect, it } from 'vitest'
import { createFrameGate, getMaxFps, setMaxFps } from '../../src/avatar/frameCap'
import { getMaxFps as exported } from '../../src/index'

/** How many frames a gate draws over `seconds` of a monitor refreshing at `hz`. */
function drawn(hz: number, seconds: number): number {
  const due = createFrameGate()
  let frames = 0
  for (let i = 0; i < hz * seconds; i++) if (due(i * (1000 / hz))) frames++
  return frames
}

afterEach(() => setMaxFps(60))

describe('the avatar frame cap', () => {
  it('draws 60 a second by default, on any monitor', () => {
    expect(getMaxFps()).toBe(60)
    expect(exported()).toBe(60)
    expect(drawn(144, 10)).toBeGreaterThanOrEqual(595)
    expect(drawn(144, 10)).toBeLessThanOrEqual(605)
    expect(drawn(240, 10)).toBeGreaterThanOrEqual(595)
    expect(drawn(240, 10)).toBeLessThanOrEqual(605)
  })

  it('misses no frame on a 60 Hz monitor, whose vsyncs jitter', () => {
    const due = createFrameGate()
    let frames = 0
    for (let i = 0; i < 600; i++) if (due(i * 16.667 + (i % 2 ? 0.9 : -0.9))) frames++
    expect(frames).toBe(600)
  })

  it('draws every frame when set to 0, and fewer when set lower', () => {
    setMaxFps(0)
    expect(drawn(144, 2)).toBe(288)
    setMaxFps(30)
    expect(drawn(144, 10)).toBeGreaterThanOrEqual(295)
    expect(drawn(144, 10)).toBeLessThanOrEqual(305)
  })

  it('starts its rhythm again after a stall, instead of drawing a burst to catch up', () => {
    const due = createFrameGate()
    expect(due(0)).toBe(true)
    expect(due(5000)).toBe(true)
    expect(due(5007)).toBe(false)
    expect(due(5017)).toBe(true)
  })
})
