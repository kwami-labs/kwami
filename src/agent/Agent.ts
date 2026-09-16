import type { AgentConfig, AgentPipeline, PipelineConnectOptions, SoulConfig, ToolDefinition } from '../types'
import type { AgentAdapter } from './adapters/types'
import type { VoicePipelineConfig } from './voice/types'
import { LiveKitAdapter } from './adapters/LiveKitAdapter'
import { logger } from '../utils/logger'

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

  // Callbacks
  private onUserSpeechCallback?: (transcript: string) => void
  private onAgentTextCallback?: (text: string) => void
  private onInterimTranscriptCallback?: (text: string) => void
  private _onErrorCallback?: (error: Error) => void
  private onAgentAudioStreamCallback?: (stream: MediaStream) => void

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

    // Wire up callbacks
    if (this.onUserSpeechCallback) {
      pipeline.onUserSpeech(this.onUserSpeechCallback)
    }
    if (this.onAgentTextCallback) {
      pipeline.onAgentText(this.onAgentTextCallback)
    }
    if (this.onInterimTranscriptCallback && typeof pipeline.onInterimTranscript === 'function') {
      pipeline.onInterimTranscript(this.onInterimTranscriptCallback)
    }

    // Out-of-band failures reach the consumer's onError callback from here.
    pipeline.onError?.((error) => this.emitError(error))

    // Wire up agent audio stream callback for avatar visualization
    if (this.onAgentAudioStreamCallback && 'onAgentAudioStream' in pipeline) {
      (pipeline as AgentPipeline & { onAgentAudioStream: (cb: (s: MediaStream) => void) => void })
        .onAgentAudioStream(this.onAgentAudioStreamCallback)
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

  /** Invoke the consumer's error callback, never letting it take down the caller. */
  private emitError(error: Error): void {
    try {
      this._onErrorCallback?.(error)
    } catch (callbackError) {
      logger.error('onError callback threw:', callbackError)
    }
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
   * Register callback for user speech transcripts
   */
  onUserSpeech(callback: (transcript: string) => void): void {
    const previous = this.onUserSpeechCallback
    this.onUserSpeechCallback = (transcript: string) => {
      previous?.(transcript)
      callback(transcript)
    }
    this.pipeline?.onUserSpeech(this.onUserSpeechCallback)
  }

  /**
   * Register callback for agent text responses
   */
  onAgentText(callback: (text: string) => void): void {
    const previous = this.onAgentTextCallback
    this.onAgentTextCallback = (text: string) => {
      previous?.(text)
      callback(text)
    }
    this.pipeline?.onAgentText(this.onAgentTextCallback)
  }

  /**
   * Register callback for interim user speech (STT in progress)
   */
  onInterimTranscript(callback: (text: string) => void): void {
    const previous = this.onInterimTranscriptCallback
    this.onInterimTranscriptCallback = (text: string) => {
      previous?.(text)
      callback(text)
    }
    if (this.pipeline && typeof this.pipeline.onInterimTranscript === 'function') {
      this.pipeline.onInterimTranscript(this.onInterimTranscriptCallback)
    }
  }

  /**
   * Register callback for agent audio responses
   */
  onAgentSpeech(callback: (audio: ArrayBuffer) => void): void {
    this.pipeline?.onAgentSpeech(callback)
  }

  /**
   * Register error callback
   */
  onError(callback: (error: Error) => void): void {
    this._onErrorCallback = callback
  }

  /**
   * Register callback for agent audio stream (for avatar visualization)
   */
  onAgentAudioStream(callback: (stream: MediaStream) => void): void {
    this.onAgentAudioStreamCallback = callback
    // If pipeline exists and has the method, register immediately
    if (this.pipeline && 'onAgentAudioStream' in this.pipeline) {
      (this.pipeline as AgentPipeline & { onAgentAudioStream: (cb: (s: MediaStream) => void) => void })
        .onAgentAudioStream(callback)
    }
  }

  /**
   * Register callback for voice session state changes
   */
  onStateChange(callback: (state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'initializing') => void): void {
    // Wire up via adapter's voice session
    if (this.adapter && 'getVoiceSession' in this.adapter) {
      const voiceSession = (this.adapter as LiveKitAdapter).getVoiceSession()
      voiceSession.on({
        onStateChange: callback
      })
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

    // Reinitialize adapter if adapter type changed
    if (config.adapter) {
      this.adapter?.dispose()
      this.initAdapter()
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
    this.onUserSpeechCallback = undefined
    this.onAgentTextCallback = undefined
    this.onInterimTranscriptCallback = undefined
    this.onAgentAudioStreamCallback = undefined
    this._onErrorCallback = undefined
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
