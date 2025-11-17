import type { BodyConfig } from './calculateKwamiDNA'

/**
 * Metaplex-standard NFT metadata
 */
export interface KwamiMetadata {
  name: string
  symbol: string
  description: string
  image: string
  external_url?: string
  attributes: MetadataAttribute[]
  properties: {
    files: Array<{
      uri: string
      type: string
    }>
    category: string
    creators?: Array<{
      address: string
      share: number
      verified?: boolean
    }>
  }
  // Custom Kwami properties
  dna: string
  body: BodyConfig
  minted_at?: number
}

export interface MetadataAttribute {
  trait_type: string
  value: string | number
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date'
}

/**
 * Prepares Metaplex-standard metadata for a KWAMI NFT
 */
export function prepareKwamiMetadata(params: {
  name: string
  description: string
  dna: string
  bodyConfig: BodyConfig
  imageUri: string
  glbUri?: string
  creatorAddress?: string
}): KwamiMetadata {
  const {
    name,
    description,
    dna,
    bodyConfig,
    imageUri,
    glbUri,
    creatorAddress,
  } = params

  // Convert body config to attributes
  const attributes = bodyConfigToAttributes(bodyConfig)

  // Add DNA attribute
  attributes.unshift({
    trait_type: 'DNA',
    value: dna,
  })

  // Prepare files array
  const files: Array<{ uri: string; type: string }> = [
    {
      uri: imageUri,
      type: 'image/png',
    },
  ]

  // Add GLB model if provided
  if (glbUri) {
    files.push({
      uri: glbUri,
      type: 'model/gltf-binary',
    })
  }

  // Prepare creators array
  const creators = creatorAddress
    ? [
        {
          address: creatorAddress,
          share: 100,
          verified: true,
        },
      ]
    : undefined

  return {
    name,
    symbol: 'KWAMI',
    description,
    image: imageUri,
    external_url: 'https://kwami.io',
    attributes,
    properties: {
      files,
      category: 'image',
      creators,
    },
    dna,
    body: bodyConfig,
    minted_at: Date.now(),
  }
}

/**
 * Converts body configuration to Metaplex attributes array
 */
export function bodyConfigToAttributes(config: BodyConfig): MetadataAttribute[] {
  const attributes: MetadataAttribute[] = []

  // Skin type
  if (config.skin) {
    attributes.push({
      trait_type: 'Skin',
      value: config.skin,
    })
  }

  // Resolution
  if (config.resolution !== undefined) {
    attributes.push({
      trait_type: 'Resolution',
      value: config.resolution,
      display_type: 'number',
    })
  }

  // Spikes
  if (config.spikes) {
    attributes.push({
      trait_type: 'Spikes X',
      value: round(config.spikes.x || 0, 2),
      display_type: 'number',
    })
    attributes.push({
      trait_type: 'Spikes Y',
      value: round(config.spikes.y || 0, 2),
      display_type: 'number',
    })
    attributes.push({
      trait_type: 'Spikes Z',
      value: round(config.spikes.z || 0, 2),
      display_type: 'number',
    })
  }

  // Colors
  if (config.colors) {
    attributes.push({
      trait_type: 'Color R',
      value: round((config.colors.x || 0) * 255, 0),
      display_type: 'number',
    })
    attributes.push({
      trait_type: 'Color G',
      value: round((config.colors.y || 0) * 255, 0),
      display_type: 'number',
    })
    attributes.push({
      trait_type: 'Color B',
      value: round((config.colors.z || 0) * 255, 0),
      display_type: 'number',
    })
  }

  // Shininess
  if (config.shininess !== undefined) {
    attributes.push({
      trait_type: 'Shininess',
      value: round(config.shininess, 0),
      display_type: 'number',
    })
  }

  // Wireframe
  if (config.wireframe !== undefined) {
    attributes.push({
      trait_type: 'Wireframe',
      value: config.wireframe ? 'Yes' : 'No',
    })
  }

  // Base scale
  if (config.baseScale !== undefined) {
    attributes.push({
      trait_type: 'Scale',
      value: round(config.baseScale, 2),
      display_type: 'number',
    })
  }

  // Opacity
  if (config.opacity !== undefined) {
    attributes.push({
      trait_type: 'Opacity',
      value: round(config.opacity * 100, 0),
      display_type: 'boost_percentage',
    })
  }

  return attributes
}

/**
 * Validates Metaplex metadata
 */
export function validateMetadata(metadata: KwamiMetadata): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required fields
  if (!metadata.name || metadata.name.length === 0) {
    errors.push('Name is required')
  }
  if (metadata.name && metadata.name.length > 32) {
    errors.push('Name must be 32 characters or less')
  }

  if (!metadata.symbol || metadata.symbol.length === 0) {
    errors.push('Symbol is required')
  }
  if (metadata.symbol && metadata.symbol.length > 10) {
    errors.push('Symbol must be 10 characters or less')
  }

  if (!metadata.description) {
    errors.push('Description is required')
  }

  if (!metadata.image) {
    errors.push('Image URI is required')
  }

  if (!metadata.dna || metadata.dna.length !== 64) {
    errors.push('Valid DNA hash is required (64 characters)')
  }

  if (!metadata.properties?.files || metadata.properties.files.length === 0) {
    errors.push('At least one file is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Extracts body config from metadata
 */
export function extractBodyFromMetadata(metadata: KwamiMetadata): BodyConfig {
  return metadata.body
}

/**
 * Helper function to round numbers
 */
function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Example metadata generation
 */
export function exampleMetadata(): KwamiMetadata {
  return {
    name: 'KWAMI #1',
    symbol: 'KWAMI',
    description: 'A unique AI companion NFT with distinct DNA',
    image: 'https://arweave.net/example-image-hash',
    external_url: 'https://kwami.io',
    attributes: [
      { trait_type: 'DNA', value: 'a1b2c3d4...' },
      { trait_type: 'Skin', value: 'tricolor' },
      { trait_type: 'Resolution', value: 5, display_type: 'number' },
      { trait_type: 'Shininess', value: 50, display_type: 'number' },
    ],
    properties: {
      files: [
        { uri: 'https://arweave.net/example-image-hash', type: 'image/png' },
        { uri: 'https://arweave.net/example-model-hash', type: 'model/gltf-binary' },
      ],
      category: 'image',
    },
    dna: 'a1b2c3d4e5f6...',
    body: {
      resolution: 5,
      skin: 'tricolor',
      shininess: 50,
    },
    minted_at: Date.now(),
  }
}

