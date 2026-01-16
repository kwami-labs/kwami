import { KwamiBody } from './body/Body';
import { KwamiMind } from './mind/Mind';
import { KwamiSoul } from './soul/Soul';
import { SkillManager } from './mind/skills/SkillManager';
import { ActionManager } from './actions/ActionManager';
import type { KwamiConfig, KwamiState, KwamiAppsConfig } from '../types/index';
import { logger } from '../utils/logger';

/**
 * Kwami - The main class for the Kwami AI companion
 *
 * Kwami is composed of three main parts:
 * - Body: The visual 3D blob representation
 * - Mind: The AI configuration and capabilities (LLM, TTS, STT)
 * - Soul: The AI personality and behavior
 *
 * @example
 * ```typescript
 * const canvas = document.querySelector('canvas');
 * const kwami = new Kwami(canvas, {
 *   audioFiles: ['/audio/track1.mp3', '/audio/track2.mp3'],
 *   initialSkin: { skin: 'tricolor', subtype: 'poles' }
 * });
 *
 * // Play audio
 * kwami.body.audio.play();
 *
 * // Change appearance
 * kwami.body.blob.setRandomBlob();
 * ```
 */
export class Kwami {
  public body: KwamiBody;
  public mind: KwamiMind;
  public soul: KwamiSoul;
  public skills: SkillManager;
  public actions: ActionManager;
  private apps?: KwamiAppsConfig;

  private state: KwamiState = 'idle';

  /**
   * Get the current version of Kwami
   * @returns The version string (e.g., "2.2.0")
   */
  static getVersion(): string {
    return '1.5.12';
  }

  constructor(canvas: HTMLCanvasElement, config?: KwamiConfig) {
    // Initialize the body (visual representation)
    this.body = new KwamiBody(canvas, config?.body);

    this.apps = config?.apps;

    // Initialize the shared action manager (core-level)
    this.actions = new ActionManager(this);

    // Initialize soul (AI personality) referencing shared actions
    this.soul = new KwamiSoul(config?.soul, this.actions);

    // Initialize mind (AI capabilities) with reference to audio for visualization
    this.mind = new KwamiMind(this.body.audio, config?.mind);
    
    // Initialize skills system (behavior programming)
    this.skills = new SkillManager(this);
    
    // Set parent reference in audio for state management during conversations
    this.body.audio.parentKwami = this;
    
    // Set Kwami instance in body for context menu access to actions
    this.body.setKwamiInstance(this);
  }

  getAppsConfig(): KwamiAppsConfig | undefined {
    return this.apps;
  }

  /**
   * Get current state of Kwami
   */
  getState(): KwamiState {
    return this.state;
  }

  /**
   * Set the state of Kwami (affects visual representation)
   */
  setState(state: KwamiState): void {
    this.state = state;
    // We no longer override blob parameters (spikes, time, etc.) based on state.
    // This allows the user's custom configuration or randomization to persist
    // regardless of whether the agent is listening, thinking, or speaking.
    // Visual feedback should be handled by the animation loop (animation.ts) 
    // or by overlay effects, not by resetting geometry parameters.
  }

  /**
   * Kwami starts listening (microphone input)
   */
  async listen(): Promise<void> {
    this.setState('listening');
    try {
      await this.mind.listen();
    } catch (error) {
      logger.error('Error starting to listen:', error);
      this.setState('idle');
      throw error;
    }
  }

  /**
   * Kwami is thinking (processing)
   */
  think(): void {
    this.setState('thinking');
    // Visual animation is handled by setState
  }

  /**
   * Kwami speaks (audio output using ElevenLabs TTS)
   * The blob will automatically animate to the speech audio
   */
  async speak(text: string): Promise<void> {
    this.setState('speaking');
    try {
      // Generate speech using Mind (ElevenLabs) with Soul's personality
      const systemPrompt = this.soul.getSystemPrompt();
      await this.mind.speak(text, systemPrompt);
      
      // Return to idle when speech is done
      // Note: This happens immediately after starting playback
      // You may want to listen to audio events to detect when speech actually ends
      this.body.audio.getAudioElement().addEventListener('ended', () => {
        this.setState('idle');
      }, { once: true });
    } catch (error) {
      logger.error('Error speaking:', error);
      this.setState('idle');
      throw error;
    }
  }

  /**
   * Start a conversation with Kwami using LiveKit agents
   * This enables real-time voice interactions with automatic voice activity detection
   * 
   * @param callbacks - Optional event callbacks for conversation events
   */
  async startConversation(callbacks?: {
    onAgentResponse?: (text: string) => void;
    onUserTranscript?: (text: string) => void;
    onError?: (error: Error) => void;
    onTurnStart?: () => void;
    onTurnEnd?: () => void;
  }): Promise<void> {
    try {
      await this.mind.initialize();
      const systemPrompt = this.soul.getSystemPrompt();
      
      // Enhanced callbacks with state management
      const enhancedCallbacks = {
        ...callbacks,
        onTurnStart: () => {
          this.setState('speaking');
          callbacks?.onTurnStart?.();
        },
        onTurnEnd: () => {
          this.setState('listening');
          callbacks?.onTurnEnd?.();
        },
        onError: (error: Error) => {
          this.setState('idle');
          callbacks?.onError?.(error);
        }
      };
      
      await this.mind.startConversation(systemPrompt, enhancedCallbacks);
      this.setState('listening');
    } catch (error) {
      logger.error('Error starting conversation:', error);
      this.setState('idle');
      
      // Use the provided onError callback if available to handle the error gracefully
      // otherwise re-throw to let the caller handle it
      if (callbacks?.onError) {
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      } else {
        throw error;
      }
    }
  }

  /**
   * Stop the current conversation
   */
  async stopConversation(): Promise<void> {
    await this.mind.stopConversation();
    this.setState('idle');
  }

  /**
   * Check if a conversation is currently active
   * 
   * @returns True if conversation is active
   */
  isConversationActive(): boolean {
    return this.mind.isConversationActive();
  }

  /**
   * Send a text message during conversation (hybrid mode)
   * 
   * @param text - Text to send to the agent
   */
  sendConversationMessage(text: string): void {
    this.mind.sendConversationMessage(text);
  }

  /**
   * Enable blob interaction including double-click for conversations
   * @param callbacks - Optional conversation callbacks for when double-click starts a conversation
   */
  enableBlobInteraction(conversationCallbacks?: any): void {
    this.body.enableBlobInteraction(async () => {
      try {
        // Toggle conversation on double-click
        if (this.isConversationActive()) {
          await this.stopConversation();
        } else {
          await this.startConversation(conversationCallbacks);
        }
      } catch (error) {
        // If startConversation threw (because no onError callback was provided or handled),
        // catch it here to prevent Uncaught Promise Rejection in the event handler.
        // We can check if it was already handled by checking if the state is idle
        // but safe to log if it wasn't.
        if (conversationCallbacks?.onError) {
           // It should have been handled inside startConversation if we updated it, 
           // but just in case it bubbled up.
        } else {
           logger.error('Unhandled conversation toggle error:', error);
        }
      }
    });
  }
  
  /**
   * Disable blob interaction
   */
  disableBlobInteraction(): void {
    this.body.disableBlobInteraction();
  }

  /**
   * Cleanup and dispose all resources
   */
  dispose(): void {
    // Stop any active conversations
    if (this.isConversationActive()) {
      this.stopConversation();
    }
    this.body.dispose();
  }
}
