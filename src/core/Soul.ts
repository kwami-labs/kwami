import type { SoulConfig } from '../types/index';

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
      language: 'en',
      conversationStyle: 'friendly',
      responseLength: 'medium',
      emotionalTone: 'warm',
    };
  }

  /**
   * Load personality from a JSON file or URL
   * 
   * @param path - Path or URL to the personality JSON file
   * @returns Promise that resolves when personality is loaded
   */
  async loadPersonality(path: string): Promise<void> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load personality from ${path}: ${response.statusText}`);
      }
      
      const personalityData = await response.json();
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
   * Export the current personality configuration as JSON
   * 
   * @returns JSON string of the personality configuration
   */
  exportAsJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Create a personality snapshot for saving/sharing
   * 
   * @returns Personality configuration object
   */
  createSnapshot(): SoulConfig {
    return { ...this.config };
  }
}
