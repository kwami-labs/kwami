import type { AgentConfig, AgentPipeline, PipelineConnectOptions, SoulConfig, ToolDefinition } from '../types/index.js'
import type { AgentAdapter } from './adapters/types.js'
import type { VoicePipelineConfig } from './voice/types.js'
import { LiveKitAdapter } from './adapters/LiveKitAdapter.js'
import { logger } from '../utils/logger.js'

/** The states a voice session reports. */
export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'initializing'

/**
 * Call every listener, isolating each one: a consumer callback that throws must not stop the
 * others from running, nor propagate into LiveKit's event emitter.
 */
function dispatch<T>(listeners: Set<(value: T) => void>, value: T, label: string): void {
  for (const listener of listeners) {
    try {
      listener(value)
    } catch (error) {
      logger.error(`${label} listener threw:`, error)
    }
  }
}

/** The `VoicePipelineConfig` keys whose values are objects and must merge, not replace. */
const NESTED_VOICE_KEYS = ['vad', 'stt', 'llm', 'tts', 'realtime', 'turnDetection', 'noiseCancellation'] as const

/**
 * Merge a partial voice config into the current one, one level deep.
 *
 * Top-level scalars replace. The provider blocks merge field by field, so updating a single
 * field (`{ tts: { voice: 'nova' } }`) keeps the provider and model already configured.
 */
function mergeVoiceConfig(
  current: VoicePipelineConfig | undefined,
  update: Partial<VoicePipelineConfig>,
): VoicePipelineConfig {
  const merged = { ...current, ...update } as Record<string, unknown>
  const base = (current ?? {}) as Record<string, unknown>
  const patch = update as Record<string, unknown>

  for (const key of NESTED_VOICE_KEYS) {
    const existing = base[key]
    const incoming = patch[key]
    if (isMergeableObject(existing) && isMergeableObject(incoming)) {
      merged[key] = { ...existing, ...incoming }
    }
  }

  return merged as VoicePipelineConfig
}

function isMergeableObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The states a voice session reports. */
export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'initializing'

/**
 * Call every listener, isolating each one: a consumer callback that throws must not stop the
 * others from running, nor propagate into LiveKit's event emitter.
 */
function dispatch<T>(listeners: Set<(value: T) => void>, value: T, label: string): void {
  for (const listener of listeners) {
    try {
      listener(value)
    } catch (error) {
      logger.error(`${label} listener threw:`, error)
    }
  }
}

/** The `VoicePipelineConfig` keys whose values are objects and must merge, not replace. */
const NESTED_VOICE_KEYS = ['vad', 'stt', 'llm', 'tts', 'realtime', 'turnDetection', 'noiseCancellation'] as const

/**
 * Merge a partial voice config into the current one, one level deep.
 *
 * Top-level scalars replace. The provider blocks merge field by field, so updating a single
 * field (`{ tts: { voice: 'nova' } }`) keeps the provider and model already configured.
 */
function mergeVoiceConfig(
  current: VoicePipelineConfig | undefined,
  update: Partial<VoicePipelineConfig>,
): VoicePipelineConfig {
  const merged = { ...current, ...update } as Record<string, unknown>
  const base = (current ?? {}) as Record<string, unknown>
  const patch = update as Record<string, unknown>

  for (const key of NESTED_VOICE_KEYS) {
    const existing = base[key]
    const incoming = patch[key]
    if (isMergeableObject(existing) && isMergeableObject(incoming)) {
      merged[key] = { ...existing, ...incoming }
    }
  }

  return merged as VoicePipelineConfig
}

function isMergeableObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Forward declaration to avoid circular dependency
interface KwamiRef {
  id: string
  soul: { getConfig(): SoulConfig }
}

/**
 * Agent - Manages AI processing pipelines
 * 
 * The Agent is responsible for:
 * - Creating and managing the appropriate pipeline (voice, realtime, multimodal)
 * - Connecting to backend services via adapters (LiveKit, etc.)
 * - Handling conversation flow
 * - Syncing configuration updates to the backend in real-time
 * 
 * The actual AI processing happens on the backend (Python agent deployed to LiveKit).
 * This class manages the frontend connection and configuration.
 */
export class Agent {
  private config: AgentConfig
  private adapter: AgentAdapter | null = null
  private pipeline: AgentPipeline | null = null
  /** In-flight connect, so a second call joins it instead of building a second pipeline. */
  private connecting: Promise<void> | null = null
  private clientTools: Map<string, (args: Record<string, unknown>) => Promise<unknown>> = new Map()

  /**
   * Listener sets, one per event.
   *
   * These replace a mix of two broken registration styles: `onUserSpeech`/`onAgentText` wrapped
   * each new callback around the previous one, building a closure chain that grew without
   * bound and could never be unsubscribed, while `onStateChange`/`onAgentAudioStream` were
   * last-wins and silently dropped the previously registered listener. Every `on*` method now
   * adds to a set and hands back an unsubscribe function.
   */
  private readonly listeners = {
    userSpeech: new Set<(transcript: string) => void>(),
    agentText: new Set<(text: string) => void>(),
    interimTranscript: new Set<(text: string) => void>(),
    agentAudioStream: new Set<(stream: MediaStream) => void>(),
    error: new Set<(error: Error) => void>(),
    stateChange: new Set<(state: AgentState) => void>(),
  }

  /** Set once on the adapter's voice session; re-registering would replace, not add. */
  private stateChangeBound = false

  constructor(config?: AgentConfig, _kwamiRef?: KwamiRef) {
    this.config = config ?? {}
    this.initAdapter()
  }

  private initAdapter(): void {
    const adapterType = this.config.adapter ?? 'livekit'

    switch (adapterType) {
      case 'livekit':
        this.adapter = new LiveKitAdapter(this.config.livekit)
        break
      default:
        logger.warn(`Unknown adapter type: ${adapterType}, falling back to livekit`)
        this.adapter = new LiveKitAdapter(this.config.livekit)
    }

    logger.debug(`Agent initialized with ${this.adapter.getName()} adapter`)
  }

  /**
   * Connect to the AI backend and start conversation
   * Dispatches a unique agent instance with the provided configuration
   */
  async connect(options?: PipelineConnectOptions): Promise<void> {
    // Two concurrent connects used to build two pipelines and abandon the first, leaking a
    // live room and an agent dispatch. Callers now join the connect already in flight.
    if (this.connecting) return this.connecting
    if (this.pipeline?.isConnected()) {
      logger.warn('Already connected; ignoring connect()')
      return
    }

    this.connecting = this.doConnect(options).finally(() => {
      this.connecting = null
    })
    return this.connecting
  }

  private async doConnect(options?: PipelineConnectOptions): Promise<void> {
    if (!this.adapter) {
      throw new Error('No adapter configured')
    }

    if (!this.adapter.isConfigured()) {
      throw new Error('Adapter is not properly configured. Check your credentials.')
    }

    // Built into a local first. Assigning this.pipeline up front meant a failed connect left
    // the Agent holding a half-built pipeline that still reported isConnected() === true.
    const pipeline = this.adapter.createPipeline()

    // One stable dispatcher per event, registered once. Listeners can then come and go over
    // the life of the Agent without touching the pipeline.
    pipeline.onUserSpeech((transcript) => dispatch(this.listeners.userSpeech, transcript, 'onUserSpeech'))
    pipeline.onAgentText((text) => dispatch(this.listeners.agentText, text, 'onAgentText'))
    if (typeof pipeline.onInterimTranscript === 'function') {
      pipeline.onInterimTranscript((text) => dispatch(this.listeners.interimTranscript, text, 'onInterimTranscript'))
    }

    // Out-of-band failures reach the consumer's onError callbacks from here.
    pipeline.onError?.((error) => this.emitError(error))

    // Wire up agent audio stream callback for avatar visualization
    if ('onAgentAudioStream' in pipeline) {
      (pipeline as AgentPipeline & { onAgentAudioStream: (cb: (s: MediaStream) => void) => void })
        .onAgentAudioStream((stream) => dispatch(this.listeners.agentAudioStream, stream, 'onAgentAudioStream'))
    }

    // Register tool executor
    pipeline.setToolExecutor(this.handleToolExecution.bind(this))

    // NOTE: tools registered through `Agent.registerTool(name, handler)` alone are executable
    // but never advertised — only definitions passed in `options.tools` (which `Kwami`
    // populates from the ToolRegistry) reach the backend, so the LLM never learns about a
    // handler-only tool. Fixing that means `registerTool` taking a definition too.
    try {
      await pipeline.connect(options ?? {})
    } catch (error) {
      // The pipeline cleans up its own room; drop our reference to it too.
      await Promise.resolve(pipeline.dispose()).catch(() => {})
      throw error
    }

    this.pipeline = pipeline
    logger.info('Agent connected')
  }

  /** Fan an error out to every registered listener. */
  private emitError(error: Error): void {
    dispatch(this.listeners.error, error, 'onError')
  }

  /**
   * Disconnect from the AI backend
   */
  async disconnect(): Promise<void> {
    const pipeline = this.pipeline
    this.pipeline = null
    if (pipeline) {
      await pipeline.disconnect()
      await pipeline.dispose()
    }
    logger.info('Agent disconnected')
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.pipeline?.isConnected() ?? false
  }

  // ---------------------------------------------------------------------------
  // Voice Configuration
  // ---------------------------------------------------------------------------

  /**
   * Get the current voice pipeline configuration
   */
  getVoiceConfig(): VoicePipelineConfig | undefined {
    return this.config.livekit?.voice
  }

  /**
   * Update voice pipeline configuration
   * Use syncConfigToBackend() to push changes to the running agent
   */
  updateVoiceConfig(config: Partial<VoicePipelineConfig>): void {
    if (!this.config.livekit) {
      this.config.livekit = {}
    }
    // Merged one level deep. A shallow spread replaced the whole `tts` object, so the
    // `updateVoice({ tts: { voice: 'nova' } })` in Kwami's own class doc silently dropped
    // tts.provider and tts.model and sent the backend a config it had to guess at.
    this.config.livekit.voice = mergeVoiceConfig(this.config.livekit.voice, config)

    // Update adapter config
    if (this.adapter && 'updateConfig' in this.adapter) {
      (this.adapter as LiveKitAdapter).updateConfig({ voice: this.config.livekit.voice })
    }
  }

  /**
   * Sync configuration changes to the backend agent in real-time
   * This sends a data message to the running agent to update its config
   */
  syncConfigToBackend(
    type: 'voice' | 'soul' | 'tools' | 'full' | 'llm' | 'memory',
    config: VoicePipelineConfig | SoulConfig | ToolDefinition[] | Record<string, unknown>
  ): void {
    if (!this.pipeline?.isConnected()) {
      logger.warn('Cannot sync config: not connected')
      return
    }

    // Send config update via the pipeline's data channel
    if (this.pipeline && 'sendConfigUpdate' in this.pipeline) {
      (this.pipeline as AgentPipeline & { sendConfigUpdate: (type: string, config: unknown) => void })
        .sendConfigUpdate(type, config)
    }
  }

  /**
   * Get the current pipeline (for direct access to sendConfigUpdate, sendSearchSimilar, etc.)
   */
  getPipeline(): AgentPipeline | null {
    return this.pipeline
  }

  /**
   * Ask the agent to search for similar products to the given result (e.g. from "Find similar" on a card).
   */
  sendSearchSimilar(title: string, url: string): void {
    const pipeline = this.getPipeline()
    if (pipeline && 'sendSearchSimilar' in pipeline) {
      (pipeline as AgentPipeline & { sendSearchSimilar: (title: string, url: string) => void })
        .sendSearchSimilar(title, url)
    }
  }

  /**
   * Update voice settings mid-conversation (TTS and STT)
   * This is a convenience method for common voice updates
   */
  updateVoiceLive(options: {
    // TTS options
    tts_provider?: string
    tts_model?: string
    tts_voice?: string
    tts_speed?: number
    // STT options
    stt_provider?: string
    stt_model?: string
    stt_language?: string
    // Legacy aliases
    voice?: string
    speed?: number
    language?: string
    model?: string
  }): void {
    logger.debug('updateVoiceLive:', options)
    this.syncConfigToBackend('voice', options)
  }

  /**
   * Update LLM settings mid-conversation (provider, model, temperature)
   * Note: Changing LLM provider requires agent restart on the backend
   */
  updateLlmLive(options: {
    provider?: string
    model?: string
    temperature?: number
  }): void {
    logger.debug('updateLlmLive:', options)
    this.syncConfigToBackend('llm', options)
  }

  /**
   * Update STT settings mid-conversation (provider, model, language)
   * Note: Changing STT provider requires agent restart on the backend
   */
  updateSttLive(options: {
    provider?: string
    model?: string
    language?: string
  }): void {
    logger.debug('updateSttLive:', options)
    this.syncConfigToBackend('voice', {
      stt_provider: options.provider,
      stt_model: options.model,
      stt_language: options.language,
    })
  }

  /**
   * Update TTS settings mid-conversation (provider, model, voice, speed)
   * Note: Changing TTS provider requires agent restart on the backend
   */
  updateTtsLive(options: {
    provider?: string
    model?: string
    voice?: string
    speed?: number
  }): void {
    logger.debug('updateTtsLive:', options)
    this.syncConfigToBackend('voice', {
      tts_provider: options.provider,
      tts_model: options.model,
      tts_voice: options.voice,
      tts_speed: options.speed,
    })
  }

  /**
   * Update Realtime model settings mid-conversation (provider, model, voice)
   * Note: Changing provider requires agent restart on the backend
   */
  updateRealtimeLive(options: {
    provider?: string
    model?: string
    voice?: string
  }): void {
    logger.debug('updateRealtimeLive:', options)
    this.syncConfigToBackend('voice', {
      realtime_provider: options.provider,
      realtime_model: options.model,
      realtime_voice: options.voice,
    })
  }

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Register callback for user speech transcripts.
   *
   * @returns an unsubscribe function.
   */
  onUserSpeech(callback: (transcript: string) => void): () => void {
    return this.addListener(this.listeners.userSpeech, callback)
  }

  /**
   * Register callback for agent text responses.
   *
   * @returns an unsubscribe function.
   */
  onAgentText(callback: (text: string) => void): () => void {
    return this.addListener(this.listeners.agentText, callback)
  }

  /**
   * Register callback for interim user speech (STT in progress).
   *
   * @returns an unsubscribe function.
   */
  onInterimTranscript(callback: (text: string) => void): () => void {
    return this.addListener(this.listeners.interimTranscript, callback)
  }

  /**
   * Register callback for agent audio responses
   */
  onAgentSpeech(callback: (audio: ArrayBuffer) => void): void {
    this.pipeline?.onAgentSpeech(callback)
  }

  /**
   * Register a callback for out-of-band failures — an error reported by the backend agent, an
   * unexpected room disconnect, a data-channel send that could not be delivered. Errors raised
   * while `connect()` is running reject that promise instead.
   *
   * @returns an unsubscribe function.
   */
  onError(callback: (error: Error) => void): () => void {
    return this.addListener(this.listeners.error, callback)
  }

  /**
   * Register callback for agent audio stream (for avatar visualization).
   *
   * @returns an unsubscribe function.
   */
  onAgentAudioStream(callback: (stream: MediaStream) => void): () => void {
    return this.addListener(this.listeners.agentAudioStream, callback)
  }

  /**
   * Register callback for voice session state changes.
   *
   * @returns an unsubscribe function.
   */
  onStateChange(callback: (state: AgentState) => void): () => void {
    this.bindStateChange()
    return this.addListener(this.listeners.stateChange, callback)
  }

  private addListener<T>(set: Set<(value: T) => void>, callback: (value: T) => void): () => void {
    set.add(callback)
    return () => set.delete(callback)
  }

  /**
   * Subscribe once to the adapter's voice session. `VoiceSession.on()` merges by key, so
   * registering per listener would mean each new one replaced the last.
   */
  private bindStateChange(): void {
    if (this.stateChangeBound) return
    if (this.adapter && 'getVoiceSession' in this.adapter) {
      ;(this.adapter as LiveKitAdapter).getVoiceSession().on({
        onStateChange: (state) => dispatch(this.listeners.stateChange, state, 'onStateChange'),
      })
      this.stateChangeBound = true
    }
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Send text message to agent
   */
  send(text: string): void {
    if (!this.pipeline?.isConnected()) {
      logger.warn('Cannot send text: not connected')
      return
    }
    this.pipeline.sendText(text)
  }

  /**
   * Interrupt the current agent response
   */
  interrupt(): void {
    this.pipeline?.interrupt()
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  /**
   * Get current configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config }
  }

  /**
   * Update configuration (may require reconnect for some changes)
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config }

    // Reinitialize adapter if adapter type changed. The new adapter brings a new VoiceSession,
    // so the state-change subscription has to be re-established on it.
    if (config.adapter) {
      this.adapter?.dispose()
      this.initAdapter()
      this.stateChangeBound = false
      if (this.listeners.stateChange.size > 0) this.bindStateChange()
    }

    // Update adapter config for livekit changes
    if (config.livekit && this.adapter && 'updateConfig' in this.adapter) {
      (this.adapter as LiveKitAdapter).updateConfig(config.livekit)
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    const pipeline = this.pipeline
    this.pipeline = null
    // Awaited, so callers know the room is actually closed and the microphone released before
    // they build a replacement Agent.
    if (pipeline) await pipeline.dispose()
    this.adapter?.dispose()
    this.adapter = null
    this.connecting = null
    this.clientTools.clear()
    for (const set of Object.values(this.listeners)) set.clear()
    this.stateChangeBound = false
  }

  // ---------------------------------------------------------------------------
  // Tooling
  // ---------------------------------------------------------------------------

  /**
   * Register a client-side tool that the agent can call
   */
  registerTool(
    name: string,
    handler: (args: Record<string, unknown>) => Promise<unknown>
  ): void {
    this.clientTools.set(name, handler)
    logger.info(`Registered client tool: ${name}`)
  }

  /**
   * Unregister a client-side tool so the backend can no longer invoke it.
   */
  unregisterTool(name: string): void {
    this.clientTools.delete(name)
    logger.info(`Unregistered client tool: ${name}`)
  }

  /**
   * Handle dynamic tool execution
   */
  private async handleToolExecution(name: string, args: Record<string, unknown>): Promise<string> {
    const handler = this.clientTools.get(name)
    if (!handler) {
      throw new Error(`Tool not found: ${name}`)
    }

    try {
      logger.info(`Executing tool ${name} with args:`, args)
      const result = await handler(args)

      if (typeof result === 'string') return result
      return JSON.stringify(result)
    } catch (error) {
      logger.error(`Error executing tool ${name}:`, error)
      return `Error: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
