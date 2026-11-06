import { describe, expect, it } from 'vitest';
import {
  formatStamp,
  getPanelPlacements,
  logReveal,
  spectrumKey,
  trackingKey,
  type LogLine,
} from '../../src/avatar/renderers/jarvis/panels.js';
import { getLabelPlacements } from '../../src/avatar/renderers/jarvis/layout.js';
import { getDefaultJarvisConfig } from '../../src/avatar/renderers/jarvis/config.js';

/**
 * The panels' drawing and posing need a canvas and WebGL and stay on the browser layer. What
 * can go wrong without either is the arithmetic around them: where the panels sit, and the
 * keys that decide whether a panel is redrawn — a key that changes too often redraws a
 * texture every frame, one that changes too rarely freezes a readout.
 */

interface Rect {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

function rect(box: { x: number; y: number; width: number; height: number }): Rect {
  return {
    left: box.x - box.width / 2,
    right: box.x + box.width / 2,
    bottom: box.y - box.height / 2,
    top: box.y + box.height / 2,
  };
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.right && b.left < a.right && a.bottom < b.top && b.bottom < a.top;
}

describe('jarvis panel placements', () => {
  it('flanks the reactor with six panels on a wide screen', () => {
    const placements = getPanelPlacements('wide', 1.61);
    expect(placements.map((placement) => placement.id).sort()).toEqual([
      'chrono',
      'log',
      'spectrum',
      'systems',
      'tracking',
      'waveform',
    ]);
    expect(placements.filter((placement) => placement.x < 0)).toHaveLength(3);
    expect(placements.filter((placement) => placement.x > 0)).toHaveLength(3);
  });

  it('keeps every wide panel clear of the reactor, the other panels and the text blocks', () => {
    const placements = getPanelPlacements('wide', 1.61);
    const labels = getLabelPlacements('wide');
    const blocks = [rect(labels.title), rect(labels.telemetry)];
    placements.forEach((placement, index) => {
      const box = rect(placement);
      // The outermost bright ring sits at 1.62 reactor units.
      expect(Math.min(Math.abs(box.left), Math.abs(box.right))).toBeGreaterThan(1.62);
      for (const block of blocks) expect(overlaps(box, block)).toBe(false);
      for (const other of placements.slice(index + 1)) {
        expect(overlaps(box, rect(other))).toBe(false);
      }
    });
  });

  it('turns each column toward the centre', () => {
    for (const placement of getPanelPlacements('wide', 1.61)) {
      expect(Math.sign(placement.yaw)).toBe(-Math.sign(placement.x));
    }
  });

  it('keeps the wide panels inside the shortest wide viewport', () => {
    // Half the visible height at the fit the renderer uses for a wide layout.
    const halfHeight = 0.5 / 0.31;
    for (const placement of getPanelPlacements('wide', halfHeight)) {
      const box = rect(placement);
      expect(box.top).toBeLessThan(halfHeight);
      expect(box.bottom).toBeGreaterThan(-halfHeight);
    }
  });

  it('shows two panels on a tall portrait screen and none on a short one', () => {
    expect(getPanelPlacements('stacked', 2.4)).toEqual([]);
    const tall = getPanelPlacements('stacked', 3.3);
    expect(tall.map((placement) => placement.id)).toEqual(['spectrum', 'log']);
    const labels = getLabelPlacements('stacked');
    for (const placement of tall) {
      expect(overlaps(rect(placement), rect(labels.title))).toBe(false);
      expect(overlaps(rect(placement), rect(labels.telemetry))).toBe(false);
      expect(Math.abs(placement.y) + placement.height / 2).toBeLessThan(3.05);
    }
  });
});

describe('jarvis panel redraw keys', () => {
  const silent = {
    bars: new Float32Array(32),
    peaks: new Float32Array(32),
    db: -90,
    hz: 0,
    active: false,
  };

  it('does not redraw a silent spectrum when only the readouts drift', () => {
    expect(spectrumKey(silent)).toBe(spectrumKey({ ...silent, db: -72, hz: 140 }));
  });

  it('redraws the spectrum when a bar or a peak cap moves', () => {
    const bars = new Float32Array(32);
    bars[3] = 0.5;
    const peaks = new Float32Array(32);
    peaks[3] = 0.9;
    const live = { ...silent, active: true, db: -20, hz: 220 };
    expect(spectrumKey({ ...live, bars })).not.toBe(spectrumKey(live));
    expect(spectrumKey({ ...live, peaks })).not.toBe(spectrumKey(live));
  });

  it('ignores sub-step changes of a spectrum bar', () => {
    const a = new Float32Array(32);
    const b = new Float32Array(32);
    a[0] = 0.5;
    b[0] = 0.505;
    const live = { ...silent, active: true, db: -20, hz: 220 };
    expect(spectrumKey({ ...live, bars: a })).toBe(spectrumKey({ ...live, bars: b }));
  });

  it('keys tracking by pointer, attitude and zoom, and drops the pointer when inactive', () => {
    const base = { x: 0.4, y: -0.2, active: true, yaw: 0.1, pitch: 0, zoom: 1 };
    expect(trackingKey(base)).toBe(trackingKey({ ...base, x: 0.405 }));
    expect(trackingKey(base)).not.toBe(trackingKey({ ...base, x: 0.5 }));
    expect(trackingKey(base)).not.toBe(trackingKey({ ...base, yaw: 0.2 }));
    expect(trackingKey(base)).not.toBe(trackingKey({ ...base, zoom: 1.3 }));
    const idle = { ...base, active: false };
    expect(trackingKey(idle)).toBe(trackingKey({ ...idle, x: 2, y: 2 }));
  });
});

describe('jarvis event log', () => {
  const line: LogLine = { id: 1, stamp: '12:00:00', text: 'CORE > LISTENING', bornAt: 0 };

  it('types the newest line in and stops at its length', () => {
    expect(logReveal(undefined, 1)).toBe(0);
    expect(logReveal(line, 0)).toBe(0);
    expect(logReveal(line, 0.1)).toBe(7);
    expect(logReveal(line, 60)).toBe(line.text.length);
  });

  it('stamps lines as zero-padded wall-clock time', () => {
    expect(formatStamp(new Date(2026, 10, 6, 9, 5, 7))).toBe('09:05:07');
    expect(formatStamp(new Date(2026, 10, 6, 23, 59, 59))).toBe('23:59:59');
  });
});

describe('jarvis defaults', () => {
  it('ships with the panels, the floor grid and the reference depth on', () => {
    const config = getDefaultJarvisConfig();
    expect(config.panels).toBe(true);
    expect(config.grid).toBe(true);
    expect(config.depth).toBe(1);
  });
});
