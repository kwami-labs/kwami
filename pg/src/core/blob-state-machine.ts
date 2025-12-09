/**
 * Blob State Machine
 * 
 * Manages the lifecycle and states of the Kwami blob using XState
 * States: idle, listening, thinking, speaking, error, minimized
 */

import { createMachine, interpret, StateFrom, assign } from 'xstate';

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
      entry: ['onEnterIdle', { type: 'recordStateTransition', params: { state: 'idle' } }],
      on: {
        START_LISTENING: {
          target: 'listening'
        },
        START_THINKING: {
          target: 'thinking'
        },
        MINIMIZE: {
          target: 'minimized'
        },
        ERROR: {
          target: 'error',
          actions: 'setErrorMessage'
        }
      }
    },
    
    listening: {
      entry: ['onEnterListening', { type: 'recordStateTransition', params: { state: 'listening' } }],
      on: {
        START_THINKING: {
          target: 'thinking'
        },
        STOP: {
          target: 'idle'
        },
        ERROR: {
          target: 'error',
          actions: 'setErrorMessage'
        },
        UPDATE_AUDIO: {
          actions: 'updateAudioLevel'
        }
      }
    },
    
    thinking: {
      entry: ['onEnterThinking', { type: 'recordStateTransition', params: { state: 'thinking' } }],
      on: {
        START_SPEAKING: {
          target: 'speaking'
        },
        STOP: {
          target: 'idle'
        },
        ERROR: {
          target: 'error',
          actions: 'setErrorMessage'
        }
      },
      after: {
        10000: {
          target: 'idle'
        }
      }
    },
    
    speaking: {
      entry: ['onEnterSpeaking', { type: 'recordStateTransition', params: { state: 'speaking' } }],
      on: {
        START_LISTENING: {
          target: 'listening'
        },
        STOP: {
          target: 'idle'
        },
        ERROR: {
          target: 'error',
          actions: 'setErrorMessage'
        },
        UPDATE_AUDIO: {
          actions: 'updateAudioLevel'
        }
      }
    },
    
    error: {
      entry: ['onEnterError', { type: 'recordStateTransition', params: { state: 'error' } }],
      on: {
        RECOVER: {
          target: 'idle',
          actions: 'clearErrorMessage'
        },
        STOP: {
          target: 'idle',
          actions: 'clearErrorMessage'
        }
      },
      after: {
        5000: {
          target: 'idle',
          actions: 'clearErrorMessage'
        }
      }
    },
    
    minimized: {
      entry: ['onEnterMinimized', { type: 'recordStateTransition', params: { state: 'minimized' } }],
      on: {
        RESTORE: {
          target: 'idle'
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
    
    setErrorMessage: assign(({ event }) => {
      if (event.type === 'ERROR') {
        return { errorMessage: event.message };
      }
      return {};
    }),
    
    clearErrorMessage: assign({
      errorMessage: null
    }),
    
    updateAudioLevel: assign(({ event }) => {
      if (event.type === 'UPDATE_AUDIO') {
        return { audioLevel: event.level };
      }
      return {};
    }),
    
    recordStateTransition: assign(({ context }, params: { state: BlobState }) => {
      const currentState = params.state;
      const newHistory = [...context.stateHistory, currentState];
      
      // Keep only last 20 states
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      
      return {
        lastState: context.stateHistory[context.stateHistory.length - 1] || null,
        stateHistory: newHistory
      };
    })
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


