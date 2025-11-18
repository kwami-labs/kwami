import CryptoJS from 'crypto-js'

/**
 * Body configuration interface for DNA calculation
 * Only body properties are included in DNA - backgrounds, audio, mind, and soul are excluded
 */
export interface BodyConfig {
  // Geometry
  resolution?: number

  // Deformation - Spikes
  spikes?: {
    x?: number
    y?: number
    z?: number
  }

  // Deformation - Time
  time?: {
    x?: number
    y?: number
    z?: number
  }

  // Deformation - Rotation
  rotation?: {
    x?: number
    y?: number
    z?: number
  }

  // Visual
  colors?: {
    x?: number
    y?: number
    z?: number
  }
  shininess?: number
  wireframe?: boolean

  // Skin type
  skin?: 'tricolor' | 'tricolor2' | 'zebra' | string

  // Scale
  baseScale?: number
  opacity?: number

  // Frequency (if using newer blob system)
  frequency?: {
    x?: number
    y?: number
    z?: number
  }

  // Amplitude (if using newer blob system)
  amplitude?: {
    x?: number
    y?: number
    z?: number
  }
}

/**
 * Extracts only the body configuration properties relevant for DNA
 * Excludes backgrounds, audio effects, mind config, and soul config
 */
export function extractBodyConfig(fullConfig: any): BodyConfig {
  return {
    // Geometry
    resolution: fullConfig.resolution,

    // Deformation
    spikes: fullConfig.spikes,
    time: fullConfig.time,
    rotation: fullConfig.rotation,

    // Visual
    colors: fullConfig.colors,
    shininess: fullConfig.shininess,
    wireframe: fullConfig.wireframe,

    // Skin
    skin: fullConfig.skin,

    // Scale
    baseScale: fullConfig.baseScale,
    opacity: fullConfig.opacity,

    // Additional properties
    frequency: fullConfig.frequency,
    amplitude: fullConfig.amplitude,
  }
}

/**
 * Normalizes the body configuration for consistent DNA calculation
 * - Rounds numbers to 6 decimal places
 * - Sorts object keys alphabetically
 * - Removes undefined values
 */
export function normalizeBodyConfig(config: BodyConfig): string {
  // Helper to round numbers to 6 decimal places
  const roundNumber = (num: number): number => {
    return Math.round(num * 1000000) / 1000000
  }

  // Recursively process the config
  const normalize = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null
    }

    if (typeof obj === 'number') {
      return roundNumber(obj)
    }

    if (typeof obj === 'boolean') {
      return obj
    }

    if (typeof obj === 'string') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(normalize)
    }

    if (typeof obj === 'object') {
      const normalized: any = {}
      
      // Sort keys alphabetically
      const sortedKeys = Object.keys(obj).sort()
      
      for (const key of sortedKeys) {
        const value = obj[key]
        
        // Skip undefined values
        if (value !== undefined) {
          normalized[key] = normalize(value)
        }
      }
      
      return normalized
    }

    return obj
  }

  const normalized = normalize(config)
  return JSON.stringify(normalized)
}

/**
 * Calculates the SHA-256 DNA hash from a body configuration
 * This creates a unique, deterministic identifier for each KWAMI
 * 
 * @param config - Body configuration (or full config with body properties)
 * @returns 64-character hexadecimal DNA hash
 */
export function calculateKwamiDNA(config: any): string {
  // Extract only body-relevant properties
  const bodyConfig = extractBodyConfig(config)
  
  // Normalize the configuration for consistent hashing
  const normalized = normalizeBodyConfig(bodyConfig)
  
  // Calculate SHA-256 hash
  const hash = CryptoJS.SHA256(normalized)
  
  // Convert to hexadecimal string
  return hash.toString(CryptoJS.enc.Hex)
}

/**
 * Gets a shortened version of the DNA for display purposes
 * Returns first 8 and last 8 characters: "abcd1234...wxyz9876"
 */
export function getShortDNA(dna: string): string {
  if (dna.length < 16) return dna
  return `${dna.slice(0, 8)}...${dna.slice(-8)}`
}

/**
 * Compares two DNA hashes for equality
 */
export function compareDNA(dna1: string, dna2: string): boolean {
  return dna1.toLowerCase() === dna2.toLowerCase()
}

/**
 * Validates that a DNA string is a valid SHA-256 hash
 */
export function isValidDNA(dna: string): boolean {
  // SHA-256 produces a 64-character hexadecimal string
  return /^[a-f0-9]{64}$/i.test(dna)
}

/**
 * Generates a random body configuration for testing
 */
export function generateRandomBodyConfig(): BodyConfig {
  const random = (min: number, max: number) => Math.random() * (max - min) + min

  return {
    resolution: Math.floor(random(3, 8)),
    
    spikes: {
      x: random(0, 2),
      y: random(0, 2),
      z: random(0, 2),
    },
    
    time: {
      x: random(0, 0.5),
      y: random(0, 0.5),
      z: random(0, 0.5),
    },
    
    rotation: {
      x: random(0, 0.02),
      y: random(0, 0.02),
      z: random(0, 0.02),
    },
    
    colors: {
      x: random(0, 1),
      y: random(0, 1),
      z: random(0, 1),
    },
    
    shininess: random(0, 100),
    wireframe: Math.random() > 0.5,
    
    skin: ['tricolor', 'tricolor2', 'zebra'][Math.floor(random(0, 3))],
    
    baseScale: random(2, 5),
    opacity: random(0.8, 1),
    
    frequency: {
      x: random(0.5, 2),
      y: random(0.5, 2),
      z: random(0.5, 2),
    },
    
    amplitude: {
      x: random(0.3, 1.2),
      y: random(0.3, 1.2),
      z: random(0.3, 1.2),
    },
  }
}

/**
 * Example usage and testing
 */
export function testDNAGeneration() {
  console.log('=== KWAMI DNA Generation Test ===\n')
  
  // Test 1: Same config should produce same DNA
  const config1 = generateRandomBodyConfig()
  const dna1 = calculateKwamiDNA(config1)
  const dna2 = calculateKwamiDNA(config1)
  
  console.log('Test 1: Deterministic hashing')
  console.log('Config:', config1)
  console.log('DNA 1:', dna1)
  console.log('DNA 2:', dna2)
  console.log('Match:', compareDNA(dna1, dna2) ? '✅ PASS' : '❌ FAIL')
  console.log()
  
  // Test 2: Different configs should produce different DNA
  const config2 = { ...config1, spikes: { x: 999, y: 999, z: 999 } }
  const dna3 = calculateKwamiDNA(config2)
  
  console.log('Test 2: Unique DNA for different configs')
  console.log('DNA 1:', dna1)
  console.log('DNA 3:', dna3)
  console.log('Different:', !compareDNA(dna1, dna3) ? '✅ PASS' : '❌ FAIL')
  console.log()
  
  // Test 3: Short DNA format
  console.log('Test 3: Short DNA format')
  console.log('Full DNA:', dna1)
  console.log('Short DNA:', getShortDNA(dna1))
  console.log()
  
  // Test 4: DNA validation
  console.log('Test 4: DNA validation')
  console.log('Valid DNA:', isValidDNA(dna1) ? '✅ PASS' : '❌ FAIL')
  console.log('Invalid DNA:', !isValidDNA('not-a-valid-dna') ? '✅ PASS' : '❌ FAIL')
  console.log()
  
  console.log('=== All Tests Complete ===')
}

