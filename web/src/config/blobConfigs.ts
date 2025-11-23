/**
 * Blob Configuration for different sections (23 sections: 00-22)
 * These configs are now loaded from kwamis.json
 */

import kwamiConfigs from '../kwamis.json';

export interface BlobConfig {
  spikeX: number;
  spikeY: number;
  spikeZ: number;
  timeX: number;
  timeY: number;
  timeZ: number;
}

// Load blob configurations from kwamis.json
export const BLOB_CONFIGS: BlobConfig[] = kwamiConfigs.map(config => ({
  spikeX: config.spikes.x,
  spikeY: config.spikes.y,
  spikeZ: config.spikes.z,
  timeX: config.time.x,
  timeY: config.time.y,
  timeZ: config.time.z
}));

