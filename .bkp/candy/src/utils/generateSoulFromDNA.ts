import type { SoulConfig } from './prepareKwamiMetadata'

/**
 * Generates a random but deterministic Soul configuration from a DNA hash
 * This ensures the same DNA always produces the same personality
 */
export function generateSoulFromDNA(dna: string): SoulConfig {
  // Use DNA as seed for pseudo-random generation
  const seed = parseInt(dna.slice(0, 16), 16)
  
  // Seeded random number generator
  let currentSeed = seed
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }

  // Generate name from DNA prefix
  const nameOptions = [
    'Kaya', 'Zuri', 'Nova', 'Echo', 'Luna', 'Sage', 'River', 'Sky',
    'Atlas', 'Phoenix', 'Orion', 'Lyra', 'Iris', 'Kai', 'Zephyr', 'Ember'
  ]
  const name = nameOptions[Math.floor(seededRandom() * nameOptions.length)]

  // Generate personality traits
  const traitPool = [
    'friendly', 'curious', 'helpful', 'creative', 'analytical', 'empathetic',
    'adventurous', 'thoughtful', 'playful', 'wise', 'energetic', 'calm',
    'witty', 'sincere', 'bold', 'gentle', 'optimistic', 'pragmatic'
  ]
  
  const traits: string[] = []
  const numTraits = 3 + Math.floor(seededRandom() * 2) // 3-4 traits
  const usedIndices = new Set<number>()
  
  while (traits.length < numTraits) {
    const idx = Math.floor(seededRandom() * traitPool.length)
    if (!usedIndices.has(idx)) {
      traits.push(traitPool[idx])
      usedIndices.add(idx)
    }
  }

  // Generate personality description
  const personalityStyles = [
    `${traits[0]} and ${traits[1]}`,
    `a ${traits[0]} companion with a ${traits[1]} nature`,
    `${traits[0]}, ${traits[1]}, and ${traits[2]}`,
    `an AI with ${traits[0]} energy and ${traits[1]} spirit`
  ]
  const personality = personalityStyles[Math.floor(seededRandom() * personalityStyles.length)]

  // Generate conversation style
  const conversationStyles = ['friendly', 'professional', 'casual', 'formal'] as const
  const conversationStyle = conversationStyles[Math.floor(seededRandom() * conversationStyles.length)]

  // Generate response settings
  const responseLengths = ['short', 'medium', 'long'] as const
  const responseLength = responseLengths[Math.floor(seededRandom() * responseLengths.length)]

  const emotionalTones = ['neutral', 'warm', 'enthusiastic', 'calm'] as const
  const emotionalTone = emotionalTones[Math.floor(seededRandom() * emotionalTones.length)]

  // Generate language preference (weighted towards English)
  const languages = ['en', 'en', 'en', 'es', 'fr', 'de', 'ja', 'zh']
  const language = languages[Math.floor(seededRandom() * languages.length)]

  // Generate emotional traits (-100 to +100)
  const randomTrait = () => Math.floor(seededRandom() * 201) - 100

  const emotionalTraits = {
    happiness: randomTrait(),
    energy: randomTrait(),
    confidence: randomTrait(),
    calmness: randomTrait(),
    optimism: randomTrait(),
    socialness: randomTrait(),
    creativity: randomTrait(),
    patience: randomTrait(),
    empathy: randomTrait(),
    curiosity: randomTrait(),
  }

  // Generate system prompt based on traits
  const systemPrompt = `You are ${name}, a ${personality} AI companion. ${traits.map(t => `You are ${t}.`).join(' ')} Be helpful and engaging in your responses.`

  return {
    name,
    personality,
    systemPrompt,
    traits,
    emotionalTraits,
    language,
    conversationStyle,
    responseLength,
    emotionalTone,
  }
}

/**
 * Generates a completely random Soul configuration (for testing)
 */
export function generateRandomSoul(): SoulConfig {
  const randomDna = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  
  return generateSoulFromDNA(randomDna)
}
