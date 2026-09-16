import type { KwamiConfig, KwamiState, KwamiCallbacks, MemoryContext, MemorySearchResult } from './types'
import { Avatar } from './avatar'
import { Agent } from './agent'
import { Soul } from './soul'
import { Memory } from './memory'
import { ToolRegistry } from './tools'
import { SkillManager } from './skills'
import { logger } from './utils/logger'

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const ID_LENGTH = 8
/** 252 = 36 x 7. Bytes at or above it would bias the modulo toward the first four letters. */
const ID_REJECT_ABOVE = 252

/**
 * Generate a unique Kwami ID.
 *
 * Eight characters of `[a-z0-9]`, which is the format consumers and the e2e suite already
 * observe — but drawn from the CSPRNG rather than `Math.random()`, whose output is predictable
 * from previous values. The ID keys `kwamiRegistry`, so a guessable one lets anything holding a
 * reference to the page reach another instance through `Kwami.getInstance()`.
 *
 * Bytes at or above 252 are rejected rather than folded, so every character is equally likely.
 */
function generateKwamiId(): string {
  const random = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto)
  let id = ''

  while (id.length < ID_LENGTH) {
    if (random) {
      for (const byte of random(new Uint8Array(ID_LENGTH))) {
        if (byte < ID_REJECT_ABOVE && id.length < ID_LENGTH) {
          id += ID_ALPHABET[byte % ID_ALPHABET.length]
        }
      }
    } else {
      // No CSPRNG (an old runtime, or a non-secure context). Weaker, but still an id.
      id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]
    }
  }

  return id
}

/**
 * Global registry of active Kwami instances.
 *
 * This is a strong reference: an instance stays reachable — along with its Avatar, WebGL
 * context, Agent and LiveKit room — until `dispose()` removes it. Always dispose a Kwami when
 * you are done with it; a component that unmounts without disposing leaks the whole graph for
 * the lifetime of the page.
 */
const kwamiRegistry = new Map<string, Kwami>()

/**
 * Kwami - 3D AI Companion
 * 
 * Each Kwami instance is a unique AI agent with its own:
 * - Avatar: Visual representation (3D blob, black hole, etc.)
 * - Agent: Voice pipeline (STT, LLM, TTS) deployed to LiveKit
 * - Soul: Personality, traits, and behavior
 * - Memory: Long-term recall (Zep)
 * - Tools: External capabilities (MCP)
 * - Skills: Native behaviors
 * 
 * Multiple Kwami instances can coexist, each running as an independent agent.
 * Configuration can be updated on the fly without reconnecting.
 * 
 * @example
 * ```typescript
 * // Create a friendly assistant
 * const luna = new Kwami(canvas, {
 *   soul: { name: 'Luna', personality: 'friendly and creative' },
 *   agent: { voice: { llm: { model: 'gpt-4o' } } },
 * })
 * 
 * // Create a professional analyst
 * const atlas = new Kwami(canvas2, {
 *   soul: { name: 'Atlas', personality: 'professional and analytical' },
 *   agent: { voice: { llm: { model: 'claude-3-opus' } } },
 * })
 * 
 * // Connect both - each runs as a separate agent
 * await luna.connect('user-123')
 * await atlas.connect('user-123')
 * 
 * // Update config on the fly
 * luna.soul.setEmotionalTone('enthusiastic')
 * atlas.updateVoice({ tts: { voice: 'nova' } })
 * ```
 */
export class Kwami {
  /** Unique identifier for this Kwami instance */
  public readonly id: string
  
  /** Visual representation */
  public avatar: Avatar
  
  /** AI processing */
  public agent: Agent
  
  /** Personality and prompts */
  public soul: Soul
  
  /** Long-term memory */
  public memory: Memory
  
  /** External tools (MCP) */
  public tools: ToolRegistry
  
  /** Native behaviors */
  public skills: SkillManager

  private state: KwamiState = 'idle'
  private callbacks: KwamiCallbacks = {}
  private userId: string | null = null
  /** In-flight connect, so a second call joins it rather than dispatching a second agent. */
  private connecting: Promise<void> | null = null

  /**
   * Get the library version
   */
  static getVersion(): string {
    return '2.0.0'
  }

  /**
   * Get all active Kwami instances
   */
  static getInstances(): Map<string, Kwami> {
    return new Map(kwamiRegistry)
  }

  /**
   * Get a specific Kwami instance by ID
   */
  static getInstance(id: string): Kwami | undefined {
    return kwamiRegistry.get(id)
  }

  constructor(canvas: HTMLCanvasElement, config?: KwamiConfig) {
    // Generate unique ID for this Kwami
    this.id = generateKwamiId()
    
    // Initialize all modules
    this.avatar = new Avatar(canvas, config?.avatar)
    this.agent = new Agent(config?.agent, this)  // Pass Kwami reference for config sync
    this.soul = new Soul(config?.soul)
    this.memory = new Memory(config?.memory)
    this.tools = new ToolRegistry(config?.tools)
    this.skills = new SkillManager(config?.skills)

    // Set Kwami reference in skills for context
    this.skills.setKwamiRef(this)

    // Wire up internal events
    this.wireUp()
    
    // Register this instance
    kwamiRegistry.set(this.id, this)

    logger.info(`Kwami "${this.soul.getName()}" (${this.id}) initialized`)
  }

  /**
   * Wire up internal event handlers
   */
  private wireUp(): void {
    // Agent events → Avatar state + Memory
    this.agent.onUserSpeech((transcript) => {
      this.callbacks.onUserTranscript?.(transcript)
      this.memory.addMessage('user', transcript).catch(e => logger.error('Failed to save user message:', e))
    })

    this.agent.onAgentText((text) => {
      this.callbacks.onAgentResponse?.(text)
      this.memory.addMessage('assistant', text).catch(e => logger.error('Failed to save agent message:', e))
    })

    this.agent.onError((error) => {
      this.callbacks.onError?.(error)
      this.setState('idle')
    })

    // Listen for agent audio stream and connect to avatar for visualization
    this.agent.onAgentAudioStream((stream) => {
      this.avatar.connectMediaStream(stream).catch(e => 
        logger.error('Failed to connect agent audio to avatar:', e)
      )
    })

    // Wire up voice session state changes to avatar
    // Map 'initializing' to 'idle' since avatar doesn't have that state
    this.agent.onStateChange((state) => {
      const mappedState = state === 'initializing' ? 'idle' : state
      this.setState(mappedState)
    })

  }

  /**
   * Get current state
   */
  getState(): KwamiState {
    return this.state
  }

  /**
   * Set state (updates avatar)
   */
  setState(state: KwamiState): void {
    this.state = state
    this.avatar.setState(state)
    this.callbacks.onStateChange?.(state)
  }

  /**
   * Get the full Kwami configuration for agent dispatch
   * This is sent to the backend agent on connect and updates
   */
  getFullConfig(): {
    kwamiId: string
    kwamiName: string
    soul: ReturnType<Soul['getConfig']>
    voice: ReturnType<Agent['getVoiceConfig']>
    tools: ReturnType<ToolRegistry['getToolDefinitions']>
    skills: string[]
  } {
    return {
      kwamiId: this.id,
      kwamiName: this.soul.getName(),
      soul: this.soul.getConfig(),
      voice: this.agent.getVoiceConfig(),
      tools: this.tools.getToolDefinitions(),
      skills: this.skills.getSkillNames(),
    }
  }

  /**
   * Connect to AI backend and start conversation
   * Creates a unique agent instance for this Kwami on LiveKit
   * 
   * @param userId - User identifier for memory and room naming
   * @param callbacks - Event callbacks
   */
  async connect(userId?: string, callbacks?: KwamiCallbacks): Promise<void> {
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks }
    }

    if (this.connecting) return this.connecting
    this.connecting = this.doConnect(userId).finally(() => {
      this.connecting = null
    })
    return this.connecting
  }

  private async doConnect(userId?: string): Promise<void> {
    this.userId = userId ?? `user_${Date.now()}`

    try {
      // Finish tool setup before the definitions are read below — MCP servers connect
      // asynchronously and their tools would otherwise miss the dispatch payload.
      await this.tools.ready()

      // Initialize memory for this user
      if (this.memory.getConfig().adapter) {
        await this.memory.initialize(this.userId)
      }

      // Get memory context for system prompt
      let memoryContext: MemoryContext | undefined
      if (this.memory.isInitialized()) {
        memoryContext = await this.memory.getContext()
      }

      // Get system prompt with memory context
      const systemPrompt = this.soul.getSystemPrompt(memoryContext)

      // Get tool definitions
      const tools = this.tools.getToolDefinitions()

      // Connect agent with full Kwami config
      // This dispatches a unique agent instance on LiveKit
      // Use userId for kwamiId to ensure memory persistence across sessions
      await this.agent.connect({
        kwamiId: this.userId,
        kwamiName: this.soul.getName(),
        soul: {
          systemPrompt,
          ...this.soul.getConfig(),
        },
        voice: this.agent.getVoiceConfig(),
        tools,
      })

      this.setState('listening')
      logger.info(`Kwami "${this.soul.getName()}" (${this.id}) connected with userId: ${this.userId}`)
    } catch (error) {
      logger.error(`Kwami "${this.id}" failed to connect:`, error)
      this.setState('idle')
      throw error
    }
  }

  /**
   * Disconnect from AI backend
   */
  async disconnect(): Promise<void> {
    await this.agent.disconnect()
    this.setState('idle')
    logger.info(`Kwami "${this.soul.getName()}" (${this.id}) disconnected`)
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.agent.isConnected()
  }

  /**
   * Send a text message to the agent
   */
  sendMessage(text: string): void {
    if (!this.isConnected()) {
      logger.warn('Cannot send message: not connected')
      return
    }
    this.agent.send(text)
  }

  /**
   * Interrupt the current agent response
   */
  interrupt(): void {
    this.agent.interrupt()
  }

  /**
   * Register event callbacks
   */
  on(callbacks: KwamiCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // ---------------------------------------------------------------------------
  // Dynamic Configuration Updates (sync to backend in real-time)
  // ---------------------------------------------------------------------------

  /**
   * Update voice pipeline configuration on the fly
   * Changes are synced to the backend agent immediately
   */
  updateVoice(config: Parameters<Agent['updateVoiceConfig']>[0]): void {
    this.agent.updateVoiceConfig(config)
    const voiceConfig = this.agent.getVoiceConfig()
    if (this.isConnected() && voiceConfig) {
      this.agent.syncConfigToBackend('voice', voiceConfig)
    }
  }

  /**
   * Update soul configuration on the fly
   * Changes are synced to the backend agent immediately
   */
  updateSoul(config: Parameters<Soul['updateConfig']>[0]): void {
    this.soul.updateConfig(config)
    if (this.isConnected()) {
      this.agent.syncConfigToBackend('soul', this.soul.getConfig())
    }
  }

  /**
   * Register a new tool and sync to backend
   */
  registerTool(tool: Parameters<ToolRegistry['register']>[0]): void {
    this.tools.register(tool)
    if (tool.handler) {
      this.agent.registerTool(tool.name, tool.handler)
    }
    if (this.isConnected()) {
      this.agent.syncConfigToBackend('tools', this.tools.getToolDefinitions())
    }
  }

  /**
   * Unregister a tool and sync to backend
   */
  unregisterTool(name: string): void {
    this.tools.unregister(name)
    this.agent.unregisterTool(name)
    if (this.isConnected()) {
      this.agent.syncConfigToBackend('tools', this.tools.getToolDefinitions())
    }
  }

  // ---------------------------------------------------------------------------
  // Skill & Tool Execution
  // ---------------------------------------------------------------------------

  /**
   * Execute a skill by name
   */
  async executeSkill(skillName: string, params?: Record<string, unknown>): Promise<void> {
    await this.skills.execute(skillName, params)
  }

  /**
   * Execute a tool by name
   */
  async executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    return this.tools.execute(toolName, params)
  }

  // ---------------------------------------------------------------------------
  // Memory
  // ---------------------------------------------------------------------------

  /**
   * Get memory context
   */
  async getMemoryContext(): Promise<MemoryContext> {
    return this.memory.getContext()
  }

  /**
   * Search memory
   */
  async searchMemory(query: string, limit?: number): Promise<MemorySearchResult[]> {
    return this.memory.search(query, limit)
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Cleanup all resources
   */
  async dispose(): Promise<void> {
    // Every step runs even if an earlier one throws. Previously a disconnect() that rejected —
    // a room already gone, a network blip — skipped the rest, leaking the WebGL context, the
    // audio graph and the registry entry.
    const name = this.soul.getName()
    const failures: unknown[] = []
    const step = async (label: string, run: () => unknown): Promise<void> => {
      try {
        await run()
      } catch (error) {
        failures.push(error)
        logger.error(`Kwami "${this.id}" failed to dispose ${label}:`, error)
      }
    }

    await step('agent connection', () => this.disconnect())
    await step('avatar', () => this.avatar.dispose())
    await step('agent', () => this.agent.dispose())
    await step('memory', () => this.memory.dispose())
    await step('tools', () => this.tools.dispose())
    await step('skills', () => this.skills.dispose())

    kwamiRegistry.delete(this.id)
    this.callbacks = {}

    logger.info(`Kwami "${name}" (${this.id}) disposed`)

    if (failures.length > 0) {
      throw new AggregateError(failures, `Kwami "${this.id}" disposed with ${failures.length} error(s)`)
    }
  }
}
