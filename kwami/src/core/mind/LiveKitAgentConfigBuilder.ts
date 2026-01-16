/**
 * LiveKitAgentConfigBuilder - Fluent API for building LiveKit Agent configurations
 * 
 * @example
 * ```typescript
 * const config = new LiveKitAgentConfigBuilder()
 *   .withRoomName('my-room')
 *   .withParticipantName('assistant')
 *   .withSystemPrompt('You are a helpful assistant')
 *   .withLLM('gpt-4')
 *   .withTemperature(0.7)
 *   .build();
 * ```
 */

export interface LiveKitAgentConfig {
  // Room configuration
  roomName?: string;
  participantName?: string;
  participantIdentity?: string;
  
  // Agent behavior
  systemPrompt?: string;
  firstMessage?: string;
  language?: string;
  
  // LLM configuration
  llm?: {
    model: string;
    provider?: string;
    temperature?: number;
    maxTokens?: number;
  };
  
  // Voice configuration
  voice?: {
    provider?: string;
    voiceId?: string;
    settings?: {
      stability?: number;
      speed?: number;
      pitch?: number;
    };
  };
  
  // STT configuration
  stt?: {
    provider?: string;
    model?: string;
    language?: string;
  };
  
  // Turn management
  turn?: {
    silenceTimeout?: number;
    maxDuration?: number;
  };
  
  // Additional metadata
  metadata?: Record<string, any>;
}

export class LiveKitAgentConfigBuilder {
  private config: LiveKitAgentConfig;

  constructor() {
    this.config = {};
  }

  /**
   * Set the room name to join or create
   */
  withRoomName(roomName: string): this {
    this.config.roomName = roomName;
    return this;
  }

  /**
   * Set the participant name (display name)
   */
  withParticipantName(name: string): this {
    this.config.participantName = name;
    return this;
  }

  /**
   * Set the participant identity (unique identifier)
   */
  withParticipantIdentity(identity: string): this {
    this.config.participantIdentity = identity;
    return this;
  }

  /**
   * Set the system prompt for the agent
   */
  withSystemPrompt(prompt: string): this {
    this.config.systemPrompt = prompt;
    return this;
  }

  /**
   * Set the agent's first message (greeting)
   */
  withFirstMessage(message: string): this {
    this.config.firstMessage = message;
    return this;
  }

  /**
   * Set the agent's primary language
   */
  withLanguage(lang: string): this {
    this.config.language = lang;
    return this;
  }

  /**
   * Set the LLM model to use
   */
  withLLM(model: string, provider?: string): this {
    if (!this.config.llm) {
      this.config.llm = { model };
    } else {
      this.config.llm.model = model;
    }
    if (provider) {
      this.config.llm.provider = provider;
    }
    return this;
  }

  /**
   * Set LLM temperature (0-2)
   */
  withTemperature(temp: number): this {
    if (temp < 0 || temp > 2) {
      throw new Error('Temperature must be between 0 and 2');
    }
    if (!this.config.llm) {
      this.config.llm = { model: 'gpt-4', temperature: temp };
    } else {
      this.config.llm.temperature = temp;
    }
    return this;
  }

  /**
   * Set maximum tokens for LLM responses
   */
  withMaxTokens(tokens: number): this {
    if (tokens < 1) {
      throw new Error('Max tokens must be positive');
    }
    if (!this.config.llm) {
      this.config.llm = { model: 'gpt-4', maxTokens: tokens };
    } else {
      this.config.llm.maxTokens = tokens;
    }
    return this;
  }

  /**
   * Configure the agent's voice
   */
  withVoice(voiceId: string, provider?: string, settings?: any): this {
    this.config.voice = {
      voiceId,
      provider,
      settings,
    };
    return this;
  }

  /**
   * Configure STT (Speech-to-Text) settings
   */
  withSTT(provider: string, model?: string, language?: string): this {
    this.config.stt = {
      provider,
      model,
      language,
    };
    return this;
  }

  /**
   * Configure turn management (timeouts, etc.)
   */
  withTurnConfig(silenceTimeout?: number, maxDuration?: number): this {
    this.config.turn = {
      silenceTimeout,
      maxDuration,
    };
    return this;
  }

  /**
   * Add custom metadata
   */
  withMetadata(metadata: Record<string, any>): this {
    this.config.metadata = {
      ...this.config.metadata,
      ...metadata,
    };
    return this;
  }

  /**
   * Build the final agent configuration
   */
  build(): LiveKitAgentConfig {
    this.validate();
    return this.config;
  }

  /**
   * Get the current configuration (without validation)
   */
  peek(): LiveKitAgentConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.config = {};
    return this;
  }

  /**
   * Load an existing configuration for modification
   */
  fromExisting(config: Partial<LiveKitAgentConfig>): this {
    this.config = { ...config };
    return this;
  }

  // Private helpers

  private validate(): void {
    const errors: string[] = [];

    // Validate temperature range
    const temp = this.config.llm?.temperature;
    if (temp !== undefined && (temp < 0 || temp > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    // Validate max_tokens
    const maxTokens = this.config.llm?.maxTokens;
    if (maxTokens !== undefined && maxTokens < 1) {
      errors.push('Max tokens must be positive');
    }

    // Validate turn config
    const silenceTimeout = this.config.turn?.silenceTimeout;
    if (silenceTimeout !== undefined && silenceTimeout < 0) {
      errors.push('Silence timeout must be non-negative');
    }

    const maxDuration = this.config.turn?.maxDuration;
    if (maxDuration !== undefined && maxDuration < 1) {
      errors.push('Max duration must be positive');
    }

    if (errors.length > 0) {
      throw new Error(`Agent configuration validation failed:\n- ${errors.join('\n- ')}`);
    }
  }
}

/**
 * Quick helper to create a basic LiveKit agent configuration
 */
export function createBasicLiveKitAgentConfig(
  roomName: string,
  systemPrompt: string,
  options?: {
    participantName?: string;
    firstMessage?: string;
    language?: string;
    llmModel?: string;
  }
): LiveKitAgentConfig {
  const builder = new LiveKitAgentConfigBuilder()
    .withRoomName(roomName)
    .withSystemPrompt(systemPrompt);

  if (options?.participantName) builder.withParticipantName(options.participantName);
  if (options?.firstMessage) builder.withFirstMessage(options.firstMessage);
  if (options?.language) builder.withLanguage(options.language);
  if (options?.llmModel) builder.withLLM(options.llmModel);

  return builder.build();
}
