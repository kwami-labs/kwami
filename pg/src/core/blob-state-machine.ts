/**
 * Blob State Machine
 * 
 * Manages the lifecycle and states of the Kwami blob using XState
 * States: idle, listening, thinking, speaking, error, minimized
 */

import { createMachine, interpret, StateFrom } from 'xstate';

// ============================================================================
// STATE MACHINE TYPES
// ============================================================================

export type BlobState = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'error' 
  | 'minimized'
  | 'transitioning';

export interface BlobContext {
  audioLevel: number;
  errorMessage: string | null;
  transitionDuration: number;
  lastState: BlobState | null;
  stateHistory: BlobState[];
  audioReactive: boolean;
}

export type BlobEvent =
  | { type: 'START_LISTENING' }
  | { type: 'START_THINKING' }
  | { type: 'START_SPEAKING' }
  | { type: 'STOP' }
  | { type: 'ERROR'; message: string }
  | { type: 'RECOVER' }
  | { type: 'MINIMIZE' }
  | { type: 'RESTORE' }
  | { type: 'UPDATE_AUDIO'; level: number }
  | { type: 'TOGGLE_AUDIO_REACTIVE' };

// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================

export const blobStateMachine = createMachine({
  id: 'kwamiBlob',
  initial: 'idle',
  types: {} as {
    context: BlobContext;
    events: BlobEvent;
  },
  context: {
    audioLevel: 0,
    errorMessage: null,
    transitionDuration: 300,
    lastState: null,
    stateHistory: [],
    audioReactive: true
  },
  states: {
    idle: {
      entry: 'onEnterIdle',
      on: {
        START_LISTENING: {
          target: 'listening',
          actions: 'recordStateTransition'
        },
        START_THINKING: {
          target: 'thinking',
          actions: 'recordStateTransition'
        },
        MINIMIZE: {
          target: 'minimized',
          actions: 'recordStateTransition'
        },
        ERROR: {
          target: 'error',
          actions: ['setErrorMessage', 'recordStateTransition']
        }
      }
    },
    
    listening: {
      entry: 'onEnterListening',
      on: {
        START_THINKING: {
          target: 'thinking',
          actions: 'recordStateTransition'
        },
        STOP: {
          target: 'idle',
          actions: 'recordStateTransition'
        },
        ERROR: {
          target: 'error',
          actions: ['setErrorMessage', 'recordStateTransition']
        },
        UPDATE_AUDIO: {
          actions: 'updateAudioLevel'
        }
      }
    },
    
    thinking: {
      entry: 'onEnterThinking',
      on: {
        START_SPEAKING: {
          target: 'speaking',
          actions: 'recordStateTransition'
        },
        STOP: {
          target: 'idle',
          actions: 'recordStateTransition'
        },
        ERROR: {
          target: 'error',
          actions: ['setErrorMessage', 'recordStateTransition']
        }
      },
      after: {
        10000: {
          target: 'idle',
          actions: 'recordStateTransition'
        }
      }
    },
    
    speaking: {
      entry: 'onEnterSpeaking',
      on: {
        START_LISTENING: {
          target: 'listening',
          actions: 'recordStateTransition'
        },
        STOP: {
          target: 'idle',
          actions: 'recordStateTransition'
        },
        ERROR: {
          target: 'error',
          actions: ['setErrorMessage', 'recordStateTransition']
        },
        UPDATE_AUDIO: {
          actions: 'updateAudioLevel'
        }
      }
    },
    
    error: {
      entry: 'onEnterError',
      on: {
        RECOVER: {
          target: 'idle',
          actions: ['clearErrorMessage', 'recordStateTransition']
        },
        STOP: {
          target: 'idle',
          actions: ['clearErrorMessage', 'recordStateTransition']
        }
      },
      after: {
        5000: {
          target: 'idle',
          actions: ['clearErrorMessage', 'recordStateTransition']
        }
      }
    },
    
    minimized: {
      entry: 'onEnterMinimized',
      on: {
        RESTORE: {
          target: 'idle',
          actions: 'recordStateTransition'
        }
      }
    }
  }
}, {
  actions: {
    onEnterIdle: (context) => {
      console.log('[State Machine] → IDLE');
      if (typeof window !== 'undefined' && window.kwami?.body) {
        window.kwami.body.setState?.('idle');
      }
    },
    
    onEnterListening: (context) => {
      console.log('[State Machine] → LISTENING');
      if (typeof window !== 'undefined' && window.kwami?.body) {
        window.kwami.body.setState?.('listening');
      }
    },
    
    onEnterThinking: (context) => {
      console.log('[State Machine] → THINKING');
      if (typeof window !== 'undefined' && window.kwami?.body) {
        window.kwami.body.setState?.('thinking');
      }
    },
    
    onEnterSpeaking: (context) => {
      console.log('[State Machine] → SPEAKING');
      if (typeof window !== 'undefined' && window.kwami?.body) {
        window.kwami.body.setState?.('speaking');
      }
    },
    
    onEnterError: (context) => {
      console.log('[State Machine] → ERROR:', context.errorMessage);
      if (typeof window !== 'undefined' && window.kwami?.body) {
        window.kwami.body.setState?.('error');
      }
    },
    
    onEnterMinimized: (context) => {
      console.log('[State Machine] → MINIMIZED');
      if (typeof window !== 'undefined' && window.kwami?.body) {
        window.kwami.body.setState?.('minimized');
      }
    },
    
    setErrorMessage: ({ context, event }) => {
      if (event.type === 'ERROR') {
        context.errorMessage = event.message;
      }
    },
    
    clearErrorMessage: ({ context }) => {
      context.errorMessage = null;
    },
    
    updateAudioLevel: ({ context, event }) => {
      if (event.type === 'UPDATE_AUDIO') {
        context.audioLevel = event.level;
      }
    },
    
    recordStateTransition: ({ context }, params) => {
      const currentState = params.self.value as BlobState;
      context.lastState = context.stateHistory[context.stateHistory.length - 1] || null;
      context.stateHistory.push(currentState);
      
      // Keep only last 20 states
      if (context.stateHistory.length > 20) {
        context.stateHistory.shift();
      }
    }
  }
});

// ============================================================================
// STATE MACHINE SERVICE
// ============================================================================

export class BlobStateMachineService {
  private service: ReturnType<typeof interpret<typeof blobStateMachine>>;
  private listeners: Set<(state: StateFrom<typeof blobStateMachine>) => void>;

  constructor() {
    this.service = interpret(blobStateMachine);
    this.listeners = new Set();
    
    // Subscribe to state changes
    this.service.subscribe((state) => {
      this.notifyListeners(state);
    });
  }

  /**
   * Start the state machine
   */
  start(): void {
    this.service.start();
    console.log('[State Machine] Started');
  }

  /**
   * Stop the state machine
   */
  stop(): void {
    this.service.stop();
    console.log('[State Machine] Stopped');
  }

  /**
   * Send an event to the state machine
   */
  send(event: BlobEvent): void {
    this.service.send(event);
  }

  /**
   * Get current state
   */
  getState(): StateFrom<typeof blobStateMachine> {
    return this.service.getSnapshot();
  }

  /**
   * Get current state value (simplified)
   */
  getCurrentState(): BlobState {
    return this.service.getSnapshot().value as BlobState;
  }

  /**
   * Get context
   */
  getContext(): BlobContext {
    return this.service.getSnapshot().context;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: StateFrom<typeof blobStateMachine>) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(state: StateFrom<typeof blobStateMachine>): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[State Machine] Error in listener:', error);
      }
    });
  }

  /**
   * Check if in specific state
   */
  isInState(state: BlobState): boolean {
    return this.getCurrentState() === state;
  }

  /**
   * Get state history
   */
  getStateHistory(): BlobState[] {
    return [...this.getContext().stateHistory];
  }

  /**
   * Transition to idle with stop event
   */
  stopAndReset(): void {
    this.send({ type: 'STOP' });
  }

  /**
   * Start listening mode
   */
  startListening(): void {
    this.send({ type: 'START_LISTENING' });
  }

  /**
   * Start thinking mode
   */
  startThinking(): void {
    this.send({ type: 'START_THINKING' });
  }

  /**
   * Start speaking mode
   */
  startSpeaking(): void {
    this.send({ type: 'START_SPEAKING' });
  }

  /**
   * Trigger error state
   */
  error(message: string): void {
    this.send({ type: 'ERROR', message });
  }

  /**
   * Recover from error
   */
  recover(): void {
    this.send({ type: 'RECOVER' });
  }

  /**
   * Minimize blob
   */
  minimize(): void {
    this.send({ type: 'MINIMIZE' });
  }

  /**
   * Restore blob from minimized
   */
  restore(): void {
    this.send({ type: 'RESTORE' });
  }

  /**
   * Update audio level (for reactive animations)
   */
  updateAudioLevel(level: number): void {
    this.send({ type: 'UPDATE_AUDIO', level });
  }

  /**
   * Toggle audio reactivity
   */
  toggleAudioReactive(): void {
    this.send({ type: 'TOGGLE_AUDIO_REACTIVE' });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let blobStateMachineInstance: BlobStateMachineService | null = null;

export function getBlobStateMachine(): BlobStateMachineService {
  if (!blobStateMachineInstance) {
    blobStateMachineInstance = new BlobStateMachineService();
    blobStateMachineInstance.start();
  }
  return blobStateMachineInstance;
}

export function resetBlobStateMachine(): void {
  if (blobStateMachineInstance) {
    blobStateMachineInstance.stop();
    blobStateMachineInstance = null;
  }
}


