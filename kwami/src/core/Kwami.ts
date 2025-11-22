import { KwamiBody } from './body/Body';
import { KwamiMind } from './mind/Mind';
import { KwamiSoul } from './soul/Soul';
import { SkillManager } from './mind/skills/SkillManager';
import type { KwamiConfig, KwamiState } from '../types/index';

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
 *   initialSkin: 'tricolor'
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

  private state: KwamiState = 'idle';

  /**
   * Get the current version of Kwami
   * @returns The version string (e.g., "2.2.0")
   */
  static getVersion(): string {
    return '1.5.5';
  }

  constructor(canvas: HTMLCanvasElement, config?: KwamiConfig) {
    // Initialize the body (visual representation)
    this.body = new KwamiBody(canvas, config?.body);

    // Initialize soul (AI personality)
    this.soul = new KwamiSoul(config?.soul);

    // Initialize mind (AI capabilities) with reference to audio for visualization
    this.mind = new KwamiMind(this.body.audio, config?.mind);
    
    // Initialize skills system (behavior programming)
    this.skills = new SkillManager(this);
    
    // Set parent reference in audio for state management during conversations
    this.body.audio.parentKwami = this;
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
    // Update blob animation based on state
    // Different states could trigger different animation patterns
    switch (state) {
      case 'listening':
        // More responsive, higher spike values
        this.body.blob.setSpikes(0.4, 0.4, 0.4);
        this.body.blob.setTime(1.5, 1.5, 1.5);
        break;
      case 'thinking':
        // Slower, more contemplative movement
        this.body.blob.setSpikes(0.15, 0.15, 0.15);
        this.body.blob.setTime(0.5, 0.5, 0.5);
        break;
      case 'speaking':
        // Active, dynamic movement
        this.body.blob.setSpikes(0.3, 0.3, 0.3);
        this.body.blob.setTime(1.2, 1.2, 1.2);
        break;
      case 'idle':
      default:
        // Default, calm movement
        this.body.blob.setSpikes(0.2, 0.2, 0.2);
        this.body.blob.setTime(1, 1, 1);
        break;
    }
  }

  /**
   * Kwami starts listening (microphone input)
   */
  async listen(): Promise<void> {
    this.setState('listening');
    try {
      await this.mind.listen();
    } catch (error) {
      console.error('Error starting to listen:', error);
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
      console.error('Error speaking:', error);
      this.setState('idle');
      throw error;
    }
  }

  /**
   * Start a conversation with Kwami using ElevenLabs Conversational AI
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
      console.error('Error starting conversation:', error);
      this.setState('idle');
      throw error;
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
      // Toggle conversation on double-click
      if (this.isConversationActive()) {
        await this.stopConversation();
      } else {
        await this.startConversation(conversationCallbacks);
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
