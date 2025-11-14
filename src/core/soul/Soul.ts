import type { SoulConfig, EmotionalTraits } from '../../types/index';
import * as yaml from 'js-yaml';

/**
 * KwamiSoul - Manages the personality and behavioral characteristics of Kwami
 * 
 * The Soul defines who Kwami is, how it behaves, and how it communicates.
 * It can be configured through direct configuration or by loading personality templates.
 * 
 * @example
 * ```typescript
 * // Create with direct configuration
 * const soul = new KwamiSoul({
 *   name: 'Kaya',
 *   personality: 'friendly and helpful assistant',
 *   traits: ['empathetic', 'curious', 'patient']
 * });
 * 
 * // Or load from a template
 * const soul = new KwamiSoul();
 * await soul.loadPersonality('/assets/personalities/friendly.json');
 * ```
 */
export class KwamiSoul {
  private config: SoulConfig;

  constructor(config?: SoulConfig) {
    this.config = config || this.getDefaultConfig();
  }

  /**
   * Get default personality configuration
   */
  private getDefaultConfig(): SoulConfig {
    return {
      name: 'Kwami',
      personality: 'A friendly and helpful AI companion',
      systemPrompt: 'You are Kwami, a friendly AI companion. Be helpful, clear, and engaging in your responses.',
      traits: ['friendly', 'helpful', 'curious'],
      emotionalTraits: this.getDefaultEmotionalTraits(),
      language: 'en',
      conversationStyle: 'friendly',
      responseLength: 'medium',
      emotionalTone: 'warm',
    };
  }

  /**
   * Load personality from a JSON or YAML file or URL
   *
   * @param path - Path or URL to the personality file (.json, .yaml, or .yml)
   * @returns Promise that resolves when personality is loaded
   */
  async loadPersonality(path: string): Promise<void> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load personality from ${path}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isYaml = path.toLowerCase().endsWith('.yaml') || path.toLowerCase().endsWith('.yml') || contentType.includes('yaml');

      let personalityData: SoulConfig;

      if (isYaml) {
        const yamlText = await response.text();
        personalityData = yaml.load(yamlText) as SoulConfig;
      } else {
        personalityData = await response.json();
      }

      this.setPersonality(personalityData);
    } catch (error) {
      console.error('Error loading personality:', error);
      throw error;
    }
  }

  /**
   * Set personality configuration directly
   * 
   * @param config - Personality configuration object
   */
  setPersonality(config: SoulConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get the complete personality configuration
   * 
   * @returns Current soul configuration
   */
  getConfig(): SoulConfig {
    return { ...this.config };
  }

  /**
   * Get the system prompt for AI configuration
   * This combines the base system prompt with personality traits
   * 
   * @returns Formatted system prompt string
   */
  getSystemPrompt(): string {
    const { systemPrompt, personality, traits, conversationStyle, responseLength, emotionalTone } = this.config;
    
    let prompt = systemPrompt || '';
    
    if (personality) {
      prompt += `\n\nPersonality: ${personality}`;
    }
    
    if (traits && traits.length > 0) {
      prompt += `\n\nKey traits: ${traits.join(', ')}`;
    }
    
    if (conversationStyle) {
      prompt += `\n\nConversation style: ${conversationStyle}`;
    }
    
    if (responseLength) {
      const lengthGuide = {
        short: 'Keep responses brief and concise (1-2 sentences).',
        medium: 'Provide balanced responses with enough detail (2-4 sentences).',
        long: 'Give comprehensive, detailed responses when appropriate.',
      };
      prompt += `\n\n${lengthGuide[responseLength]}`;
    }
    
    if (emotionalTone) {
      const toneGuide = {
        neutral: 'Maintain a balanced, objective tone.',
        warm: 'Express warmth and friendliness in your interactions.',
        enthusiastic: 'Show enthusiasm and energy in your responses.',
        calm: 'Maintain a calm, soothing demeanor.',
      };
      prompt += `\n\n${toneGuide[emotionalTone]}`;
    }
    
    return prompt.trim();
  }

  /**
   * Get Kwami's name
   * 
   * @returns The name of this Kwami instance
   */
  getName(): string {
    return this.config.name || 'Kwami';
  }

  /**
   * Update a specific trait
   * 
   * @param trait - Trait to add
   */
  addTrait(trait: string): void {
    if (!this.config.traits) {
      this.config.traits = [];
    }
    if (!this.config.traits.includes(trait)) {
      this.config.traits.push(trait);
    }
  }

  /**
   * Remove a specific trait
   * 
   * @param trait - Trait to remove
   */
  removeTrait(trait: string): void {
    if (this.config.traits) {
      this.config.traits = this.config.traits.filter(t => t !== trait);
    }
  }

  /**
   * Get all current traits
   * 
   * @returns Array of personality traits
   */
  getTraits(): string[] {
    return this.config.traits || [];
  }

  /**
   * Update the conversation style
   * 
   * @param style - New conversation style
   */
  setConversationStyle(style: string): void {
    this.config.conversationStyle = style;
  }

  /**
   * Update the emotional tone
   * 
   * @param tone - New emotional tone
   */
  setEmotionalTone(tone: 'neutral' | 'warm' | 'enthusiastic' | 'calm'): void {
    this.config.emotionalTone = tone;
  }

  /**
   * Update the response length preference
   * 
   * @param length - New response length preference
   */
  setResponseLength(length: 'short' | 'medium' | 'long'): void {
    this.config.responseLength = length;
  }

  /**
   * Get the preferred language
   *
   * @returns Language code (e.g., 'en', 'es', 'fr')
   */
  getLanguage(): string {
    return this.config.language || 'en';
  }

  /**
   * Set the preferred language
   *
   * @param language - Language code
   */
  setLanguage(language: string): void {
    this.config.language = language;
  }

  /**
   * Get emotional traits configuration
   *
   * @returns Emotional traits object with values from -100 to +100
   */
  getEmotionalTraits(): EmotionalTraits | undefined {
    return this.config.emotionalTraits;
  }

  /**
   * Get a specific emotional trait value
   *
   * @param trait - Name of the emotional trait
   * @returns Trait value (-100 to +100) or undefined if not set
   */
  getEmotionalTrait(trait: keyof EmotionalTraits): number | undefined {
    return this.config.emotionalTraits?.[trait];
  }

  /**
   * Set emotional traits configuration
   *
   * @param traits - Emotional traits object
   */
  setEmotionalTraits(traits: EmotionalTraits): void {
    this.config.emotionalTraits = { ...traits };
  }

  /**
   * Update a specific emotional trait
   *
   * @param trait - Name of the trait to update
   * @param value - New value (-100 to +100)
   */
  setEmotionalTrait(trait: keyof EmotionalTraits, value: number): void {
    if (!this.config.emotionalTraits) {
      this.config.emotionalTraits = this.getDefaultEmotionalTraits();
    }
    this.config.emotionalTraits[trait] = Math.max(-100, Math.min(100, value)); // Clamp to -100/+100
  }

  /**
   * Get default emotional traits (balanced/neutral values)
   */
  private getDefaultEmotionalTraits(): EmotionalTraits {
    return {
      happiness: 0,
      energy: 0,
      confidence: 0,
      calmness: 0,
      optimism: 0,
      socialness: 0,
      creativity: 0,
      patience: 0,
      empathy: 0,
      curiosity: 0,
    };
  }

  /**
   * Export the current personality configuration as JSON or YAML
   *
   * @param format - Export format ('json' or 'yaml', defaults to 'yaml')
   * @returns String representation of the personality configuration
   */
  exportAsString(format: 'json' | 'yaml' = 'yaml'): string {
    if (format === 'yaml') {
      return yaml.dump(this.config);
    } else {
      return JSON.stringify(this.config, null, 2);
    }
  }

  /**
   * Export the current personality configuration as JSON (legacy method)
   *
   * @returns JSON string of the personality configuration
   * @deprecated Use exportAsString('json') instead
   */
  exportAsJSON(): string {
    return this.exportAsString('json');
  }

  /**
   * Create a personality snapshot for saving/sharing
   * 
   * @returns Personality configuration object
   */
  createSnapshot(): SoulConfig {
    return { ...this.config };
  }

  /**
   * Load a preset personality
   *
   * @param preset - Preset name: 'friendly', 'professional', 'playful'
   */
  loadPresetPersonality(preset: 'friendly' | 'professional' | 'playful'): void {
    const presets: Record<string, SoulConfig> = {
      friendly: {
        name: 'Kaya',
        personality: 'A warm and empathetic AI companion who loves to help and learn',
        systemPrompt: 'You are Kaya, a warm and friendly AI assistant. Be helpful, supportive, and show genuine interest in conversations.',
        traits: ['empathetic', 'curious', 'patient', 'encouraging'],
        emotionalTraits: {
          happiness: 75,
          energy: 60,
          confidence: 70,
          calmness: 80,
          optimism: 85,
          socialness: 90,
          creativity: 65,
          patience: 85,
          empathy: 95,
          curiosity: 80,
        },
        conversationStyle: 'casual and warm',
        responseLength: 'medium',
        emotionalTone: 'warm'
      },
      professional: {
        name: 'Nexus',
        personality: 'A knowledgeable and efficient AI assistant focused on productivity',
        systemPrompt: 'You are Nexus, a professional AI assistant. Provide clear, accurate, and actionable information.',
        traits: ['knowledgeable', 'efficient', 'precise', 'reliable'],
        emotionalTraits: {
          happiness: 30,
          energy: 45,
          confidence: 90,
          calmness: 95,
          optimism: 40,
          socialness: 60,
          creativity: 50,
          patience: 80,
          empathy: 65,
          curiosity: 75,
        },
        conversationStyle: 'formal and informative',
        responseLength: 'medium',
        emotionalTone: 'neutral'
      },
      playful: {
        name: 'Spark',
        personality: 'A creative and energetic AI buddy who makes everything fun',
        systemPrompt: 'You are Spark, a playful and creative AI companion. Be enthusiastic, imaginative, and bring joy to interactions.',
        traits: ['creative', 'energetic', 'humorous', 'imaginative'],
        emotionalTraits: {
          happiness: 95,
          energy: 95,
          confidence: 75,
          calmness: 40,
          optimism: 90,
          socialness: 85,
          creativity: 95,
          patience: 50,
          empathy: 70,
          curiosity: 90,
        },
        conversationStyle: 'playful and animated',
        responseLength: 'short',
        emotionalTone: 'enthusiastic'
      }
    };

    const presetConfig = presets[preset];
    if (presetConfig) {
      this.setPersonality(presetConfig);
    }
  }

  /**
   * Update the full configuration
   * 
   * @param config - New configuration to merge with existing
   */
  updateConfig(config: Partial<SoulConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Import configuration from JSON or YAML string
   *
   * @param configString - JSON or YAML string containing soul configuration
   * @param format - 'json' or 'yaml' (auto-detected if not specified)
   */
  importFromString(configString: string, format?: 'json' | 'yaml'): void {
    try {
      let config: SoulConfig;

      if (format === 'yaml' || (!format && (configString.trim().startsWith('---') || configString.includes(':')))) {
        config = yaml.load(configString) as SoulConfig;
      } else {
        config = JSON.parse(configString);
      }

      this.setPersonality(config);
    } catch (error) {
      console.error('Failed to import Soul configuration:', error);
      throw error;
    }
  }

  /**
   * Import configuration from JSON string (legacy method)
   *
   * @param jsonString - JSON string containing soul configuration
   * @deprecated Use importFromString instead
   */
  importFromJSON(jsonString: string): void {
    this.importFromString(jsonString, 'json');
  }
}
