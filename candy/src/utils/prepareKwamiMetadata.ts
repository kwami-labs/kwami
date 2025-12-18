import type { BodyConfig } from './calculateKwamiDNA'

/**
 * Emotional trait spectrum values (-100 to +100)
 */
export interface EmotionalTraits {
  happiness: number      // -100 (deep sadness) to +100 (extreme joy)
  energy: number         // -100 (exhausted) to +100 (hyper-energetic)
  confidence: number     // -100 (anxious) to +100 (overly confident)
  calmness: number       // -100 (rage-prone) to +100 (extremely calm)
  optimism: number       // -100 (pessimistic) to +100 (blindly optimistic)
  socialness: number     // -100 (shy) to +100 (extremely extroverted)
  creativity: number     // -100 (rigid) to +100 (wildly creative)
  patience: number       // -100 (impatient) to +100 (infinite patience)
  empathy: number        // -100 (selfish) to +100 (extreme empathy)
  curiosity: number      // -100 (indifferent) to +100 (insatiable curiosity)
}

/**
 * Soul (personality) configuration
 */
export interface SoulConfig {
  name?: string                                                // Kwami's identifier/name
  personality?: string                                         // Overall personality description
  systemPrompt?: string                                        // Base AI instructions for behavior
  traits?: string[]                                           // Array of personality characteristics
  emotionalTraits?: EmotionalTraits                           // Emotional trait spectrum values
  language?: string                                           // Preferred communication language
  conversationStyle?: string                                  // Tone and style (e.g., 'friendly', 'professional')
  responseLength?: 'short' | 'medium' | 'long'              // Preferred response verbosity
  emotionalTone?: 'neutral' | 'warm' | 'enthusiastic' | 'calm' // Emotional expression level
}

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
  soul?: SoulConfig
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
  soulConfig?: SoulConfig
  imageUri: string
  glbUri?: string
  creatorAddress?: string
}): KwamiMetadata {
  const {
    name,
    description,
    dna,
    bodyConfig,
    soulConfig,
    imageUri,
    glbUri,
    creatorAddress,
  } = params

  // Convert body config to attributes
  const attributes = bodyConfigToAttributes(bodyConfig)

  // Add soul config to attributes if provided
  if (soulConfig) {
    attributes.push(...soulConfigToAttributes(soulConfig))
  }

  // Add DNA attribute at the top
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
    soul: soulConfig,
    minted_at: Date.now(),
  }
}

/**
 * Converts soul configuration to Metaplex attributes array
 */
export function soulConfigToAttributes(config: SoulConfig): MetadataAttribute[] {
  const attributes: MetadataAttribute[] = []

  // Personality name
  if (config.name) {
    attributes.push({
      trait_type: 'Name',
      value: config.name,
    })
  }

  // Personality description
  if (config.personality) {
    attributes.push({
      trait_type: 'Personality',
      value: config.personality,
    })
  }

  // Traits as comma-separated string
  if (config.traits && config.traits.length > 0) {
    attributes.push({
      trait_type: 'Traits',
      value: config.traits.join(', '),
    })
  }

  // Language
  if (config.language) {
    attributes.push({
      trait_type: 'Language',
      value: config.language,
    })
  }

  // Conversation style
  if (config.conversationStyle) {
    attributes.push({
      trait_type: 'Conversation Style',
      value: config.conversationStyle,
    })
  }

  // Response length
  if (config.responseLength) {
    attributes.push({
      trait_type: 'Response Length',
      value: config.responseLength,
    })
  }

  // Emotional tone
  if (config.emotionalTone) {
    attributes.push({
      trait_type: 'Emotional Tone',
      value: config.emotionalTone,
    })
  }

  // Emotional traits (individual scores)
  if (config.emotionalTraits) {
    const traits = config.emotionalTraits
    
    attributes.push(
      {
        trait_type: 'Happiness',
        value: traits.happiness,
        display_type: 'number',
      },
      {
        trait_type: 'Energy',
        value: traits.energy,
        display_type: 'number',
      },
      {
        trait_type: 'Confidence',
        value: traits.confidence,
        display_type: 'number',
      },
      {
        trait_type: 'Calmness',
        value: traits.calmness,
        display_type: 'number',
      },
      {
        trait_type: 'Optimism',
        value: traits.optimism,
        display_type: 'number',
      },
      {
        trait_type: 'Socialness',
        value: traits.socialness,
        display_type: 'number',
      },
      {
        trait_type: 'Creativity',
        value: traits.creativity,
        display_type: 'number',
      },
      {
        trait_type: 'Patience',
        value: traits.patience,
        display_type: 'number',
      },
      {
        trait_type: 'Empathy',
        value: traits.empathy,
        display_type: 'number',
      },
      {
        trait_type: 'Curiosity',
        value: traits.curiosity,
        display_type: 'number',
      }
    )
  }

  return attributes
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

  // Validate soul config if provided
  if (metadata.soul) {
    validateSoulConfig(metadata.soul, errors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates soul configuration
 */
function validateSoulConfig(soul: SoulConfig, errors: string[]): void {
  // Validate emotional traits range if provided
  if (soul.emotionalTraits) {
    const traits = soul.emotionalTraits
    const traitNames = [
      'happiness', 'energy', 'confidence', 'calmness', 'optimism',
      'socialness', 'creativity', 'patience', 'empathy', 'curiosity'
    ] as const

    for (const traitName of traitNames) {
      const value = traits[traitName]
      if (value !== undefined && (value < -100 || value > 100)) {
        errors.push(`Emotional trait '${traitName}' must be between -100 and 100`)
      }
    }
  }
}

/**
 * Extracts body config from metadata
 */
export function extractBodyFromMetadata(metadata: KwamiMetadata): BodyConfig {
  return metadata.body
}

/**
 * Extracts soul config from metadata
 */
export function extractSoulFromMetadata(metadata: KwamiMetadata): SoulConfig | undefined {
  return metadata.soul
}

/**
 * Gets default soul configuration
 */
export function getDefaultSoulConfig(): SoulConfig {
  return {
    name: 'Kwami',
    personality: 'A friendly and helpful AI companion',
    systemPrompt: 'You are Kwami, a friendly AI companion. Be helpful, clear, and engaging in your responses.',
    traits: ['friendly', 'helpful', 'curious'],
    emotionalTraits: {
      happiness: 50,
      energy: 50,
      confidence: 50,
      calmness: 50,
      optimism: 50,
      socialness: 50,
      creativity: 50,
      patience: 50,
      empathy: 50,
      curiosity: 50,
    },
    language: 'en',
    conversationStyle: 'friendly',
    responseLength: 'medium',
    emotionalTone: 'warm',
  }
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
    description: 'A unique AI companion NFT with distinct DNA and personality',
    image: 'https://arweave.net/example-image-hash',
    external_url: 'https://kwami.io',
    attributes: [
      { trait_type: 'DNA', value: 'a1b2c3d4...' },
      { trait_type: 'Skin', value: 'tricolor' },
      { trait_type: 'Resolution', value: 5, display_type: 'number' },
      { trait_type: 'Shininess', value: 50, display_type: 'number' },
      { trait_type: 'Name', value: 'Kaya' },
      { trait_type: 'Personality', value: 'friendly and curious' },
      { trait_type: 'Happiness', value: 75, display_type: 'number' },
      { trait_type: 'Energy', value: 60, display_type: 'number' },
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
    soul: {
      name: 'Kaya',
      personality: 'friendly and curious',
      traits: ['friendly', 'curious', 'helpful'],
      emotionalTraits: {
        happiness: 75,
        energy: 60,
        confidence: 65,
        calmness: 70,
        optimism: 80,
        socialness: 70,
        creativity: 85,
        patience: 75,
        empathy: 90,
        curiosity: 95,
      },
      language: 'en',
      conversationStyle: 'friendly',
      responseLength: 'medium',
      emotionalTone: 'warm',
    },
    minted_at: Date.now(),
  }
}
