/**
 * AgentConfigBuilder - Fluent API for building ElevenLabs Agent configurations
 * 
 * @example
 * ```typescript
 * const config = new AgentConfigBuilder()
 *   .withName('My Assistant')
 *   .withPrompt('You are a helpful assistant')
 *   .withLLM('gpt-4o')
 *   .withVoice('pNInz6obpgDQGcFmaJgB')
 *   .withFirstMessage('Hello! How can I help you today?')
 *   .withMaxDuration(1800)
 *   .build();
 * ```
 */
import type {
  CreateAgentRequestFull,
  ConversationalConfigAPIModel,
  PromptConfig,
  LLMProvider,
  TTSConversationalConfig,
  ASRConversationalConfig,
  TurnConfig,
  ToolConfig,
  KnowledgeBaseLocator,
  ClientEvent,
  AgentWorkflow,
  PlatformSettings,
  SecretConfig,
} from '../../types/elevenlabs-agents';

export class AgentConfigBuilder {
  private config: CreateAgentRequestFull;

  constructor() {
    this.config = {
      conversation_config: {},
    };
  }

  /**
   * Set the agent's name
   */
  withName(name: string): this {
    this.config.name = name;
    return this;
  }

  /**
   * Add tags to the agent for organization
   */
  withTags(tags: string[]): this {
    this.config.tags = tags;
    return this;
  }

  /**
   * Set the system prompt for the agent
   */
  withPrompt(prompt: string): this {
    this.ensureAgentConfig();
    if (!this.config.conversation_config!.agent!.prompt) {
      this.config.conversation_config!.agent!.prompt = {};
    }
    this.config.conversation_config!.agent!.prompt!.prompt = prompt;
    return this;
  }

  /**
   * Set the LLM model to use
   */
  withLLM(model: LLMProvider): this {
    this.ensureAgentConfig();
    if (!this.config.conversation_config!.agent!.prompt) {
      this.config.conversation_config!.agent!.prompt = {};
    }
    this.config.conversation_config!.agent!.prompt!.llm = model;
    return this;
  }

  /**
   * Set LLM temperature (0-1)
   */
  withTemperature(temp: number): this {
    if (temp < 0 || temp > 1) {
      throw new Error('Temperature must be between 0 and 1');
    }
    this.ensureAgentConfig();
    if (!this.config.conversation_config!.agent!.prompt) {
      this.config.conversation_config!.agent!.prompt = {};
    }
    this.config.conversation_config!.agent!.prompt!.temperature = temp;
    return this;
  }

  /**
   * Set maximum tokens for LLM responses
   */
  withMaxTokens(tokens: number): this {
    if (tokens < 1) {
      throw new Error('Max tokens must be positive');
    }
    this.ensureAgentConfig();
    if (!this.config.conversation_config!.agent!.prompt) {
      this.config.conversation_config!.agent!.prompt = {};
    }
    this.config.conversation_config!.agent!.prompt!.max_tokens = tokens;
    return this;
  }

  /**
   * Configure the agent's voice and TTS settings
   */
  withVoice(voiceId: string, settings?: Partial<TTSConversationalConfig>): this {
    if (!this.config.conversation_config!.tts) {
      this.config.conversation_config!.tts = { voice_id: voiceId };
    } else {
      this.config.conversation_config!.tts.voice_id = voiceId;
    }
    
    if (settings) {
      this.config.conversation_config!.tts = {
        ...this.config.conversation_config!.tts,
        ...settings,
      };
    }
    
    return this;
  }

  /**
   * Configure ASR (Automatic Speech Recognition) settings
   */
  withASR(config: Partial<ASRConversationalConfig>): this {
    this.config.conversation_config!.asr = {
      ...this.config.conversation_config!.asr,
      ...config,
    };
    return this;
  }

  /**
   * Configure turn management (timeouts, eagerness, etc.)
   */
  withTurnConfig(config: Partial<TurnConfig>): this {
    this.config.conversation_config!.turn = {
      ...this.config.conversation_config!.turn,
      ...config,
    };
    return this;
  }

  /**
   * Add tools that the agent can use
   */
  withTools(tools: ToolConfig[]): this {
    this.ensureAgentConfig();
    if (!this.config.conversation_config!.agent!.prompt) {
      this.config.conversation_config!.agent!.prompt = {};
    }
    this.config.conversation_config!.agent!.prompt!.tools = tools;
    return this;
  }

  /**
   * Add knowledge bases for the agent to reference
   */
  withKnowledgeBase(kbs: KnowledgeBaseLocator[]): this {
    this.ensureAgentConfig();
    if (!this.config.conversation_config!.agent!.prompt) {
      this.config.conversation_config!.agent!.prompt = {};
    }
    this.config.conversation_config!.agent!.prompt!.knowledge_base = kbs;
    return this;
  }

  /**
   * Set the agent's first message (greeting)
   */
  withFirstMessage(message: string): this {
    this.ensureAgentConfig();
    this.config.conversation_config!.agent!.first_message = message;
    return this;
  }

  /**
   * Set the agent's primary language
   */
  withLanguage(lang: string): this {
    this.ensureAgentConfig();
    this.config.conversation_config!.agent!.language = lang;
    return this;
  }

  /**
   * Set maximum conversation duration in seconds
   */
  withMaxDuration(seconds: number): this {
    if (seconds < 1) {
      throw new Error('Max duration must be positive');
    }
    if (!this.config.conversation_config!.conversation) {
      this.config.conversation_config!.conversation = {};
    }
    this.config.conversation_config!.conversation.max_duration_seconds = seconds;
    return this;
  }

  /**
   * Specify which client events to receive
   */
  withClientEvents(events: ClientEvent[]): this {
    if (!this.config.conversation_config!.conversation) {
      this.config.conversation_config!.conversation = {};
    }
    this.config.conversation_config!.conversation.client_events = events;
    return this;
  }

  /**
   * Enable text-only mode (no voice)
   */
  withTextOnly(enabled: boolean = true): this {
    if (!this.config.conversation_config!.conversation) {
      this.config.conversation_config!.conversation = {};
    }
    this.config.conversation_config!.conversation.text_only = enabled;
    return this;
  }

  /**
   * Configure agent workflow (for multi-agent systems)
   */
  withWorkflow(workflow: AgentWorkflow): this {
    this.config.workflow = workflow;
    return this;
  }

  /**
   * Set platform-specific settings (widget, telephony, etc.)
   */
  withPlatformSettings(settings: PlatformSettings): this {
    this.config.platform_settings = settings;
    return this;
  }

  /**
   * Add secrets (API keys, credentials) for tool authentication
   */
  withSecrets(secrets: SecretConfig[]): this {
    this.config.secrets = secrets;
    return this;
  }

  /**
   * Add a single secret
   */
  withSecret(name: string, value: string): this {
    if (!this.config.secrets) {
      this.config.secrets = [];
    }
    this.config.secrets.push({ name, value });
    return this;
  }

  /**
   * Build the final agent configuration
   */
  build(): CreateAgentRequestFull {
    this.validate();
    return this.config;
  }

  /**
   * Get the current configuration (without validation)
   */
  peek(): CreateAgentRequestFull {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.config = {
      conversation_config: {},
    };
    return this;
  }

  /**
   * Load an existing configuration for modification
   */
  fromExisting(config: Partial<CreateAgentRequestFull>): this {
    this.config = {
      conversation_config: config.conversation_config || {},
      ...config,
    };
    return this;
  }

  // Private helpers

  private ensureAgentConfig(): void {
    if (!this.config.conversation_config!.agent) {
      this.config.conversation_config!.agent = {};
    }
  }

  private validate(): void {
    const errors: string[] = [];

    // Validate TTS voice_id is set
    if (!this.config.conversation_config?.tts?.voice_id) {
      errors.push('Voice ID is required (use withVoice)');
    }

    // Validate temperature range
    const temp = this.config.conversation_config?.agent?.prompt?.temperature;
    if (temp !== undefined && (temp < 0 || temp > 1)) {
      errors.push('Temperature must be between 0 and 1');
    }

    // Validate max_tokens
    const maxTokens = this.config.conversation_config?.agent?.prompt?.max_tokens;
    if (maxTokens !== undefined && maxTokens < 1) {
      errors.push('Max tokens must be positive');
    }

    // Validate max_duration
    const maxDuration = this.config.conversation_config?.conversation?.max_duration_seconds;
    if (maxDuration !== undefined && maxDuration < 1) {
      errors.push('Max duration must be positive');
    }

    // Validate TTS settings ranges
    const tts = this.config.conversation_config?.tts;
    if (tts) {
      if (tts.stability !== undefined && (tts.stability < 0 || tts.stability > 1)) {
        errors.push('TTS stability must be between 0 and 1');
      }
      if (tts.speed !== undefined && (tts.speed < 0.25 || tts.speed > 4.0)) {
        errors.push('TTS speed must be between 0.25 and 4.0');
      }
      if (tts.similarity_boost !== undefined && (tts.similarity_boost < 0 || tts.similarity_boost > 1)) {
        errors.push('TTS similarity_boost must be between 0 and 1');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Agent configuration validation failed:\n- ${errors.join('\n- ')}`);
    }
  }
}

/**
 * Quick helper to create a basic agent configuration
 */
export function createBasicAgentConfig(
  voiceId: string,
  prompt: string,
  options?: {
    name?: string;
    firstMessage?: string;
    language?: string;
    llm?: LLMProvider;
  }
): CreateAgentRequestFull {
  const builder = new AgentConfigBuilder()
    .withVoice(voiceId)
    .withPrompt(prompt);

  if (options?.name) builder.withName(options.name);
  if (options?.firstMessage) builder.withFirstMessage(options.firstMessage);
  if (options?.language) builder.withLanguage(options.language);
  if (options?.llm) builder.withLLM(options.llm);

  return builder.build();
}

