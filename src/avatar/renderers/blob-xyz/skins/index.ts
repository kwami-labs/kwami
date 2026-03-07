import type { ShaderMaterial } from 'three'
import { createPolesSkin } from './poles'
import { createDonutSkin } from './donut'
import { createVintageSkin } from './vintage'
import type { BlobXyzSkinSelection, TricolorSkinConfig, TricolorSubtype } from '../types'

/**
 * Create a skin material based on skin selection.
 */
export function createSkin(
  selection: BlobXyzSkinSelection,
  config: TricolorSkinConfig,
): ShaderMaterial {
  // Currently only Tricolor exists.
  const subtype: TricolorSubtype = selection.subtype ?? 'poles'

  switch (subtype) {
    case 'poles':
      return createPolesSkin(config)
    case 'donut':
      return createDonutSkin(config)
    case 'vintage':
      return createVintageSkin(config)
    default:
      return createPolesSkin(config)
  }
}

export { createPolesSkin, createDonutSkin, createVintageSkin }
