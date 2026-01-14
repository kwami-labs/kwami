/**
 * Blob Configuration for different sections (23 sections: 00-22)
 * These configs are now loaded from kwamis.json
 */

import kwamiConfigs from './kwamis.json';

export interface BlobConfig {
  spikeX: number;
  spikeY: number;
  spikeZ: number;
  timeX: number;
  timeY: number;
  timeZ: number;
  skin?: string;
  resolution?: number;
  wireframe?: boolean;
  colorPalette?: string[];
}

function normalizeColorPalette(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const arr = value.filter((v): v is string => typeof v === 'string');
    return arr.length ? arr : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : undefined;
  }

  return undefined;
}

// Load blob configurations from kwamis.json
export const BLOB_CONFIGS: BlobConfig[] = kwamiConfigs.map((config) => ({
  spikeX: config.spikes.x,
  spikeY: config.spikes.y,
  spikeZ: config.spikes.z,
  timeX: config.time.x,
  timeY: config.time.y,
  timeZ: config.time.z,
  skin: config.skin,
  resolution: config.resolution,
  wireframe: typeof config.wireframe === 'boolean' ? config.wireframe : undefined,
  colorPalette: normalizeColorPalette(config.colorPalette),
}));

