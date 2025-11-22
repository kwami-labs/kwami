import { vi } from 'vitest';

/**
 * Create a mock HTMLCanvasElement for testing
 */
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  
  // Mock getContext
  canvas.getContext = vi.fn((contextType: string) => {
    if (contextType === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
      };
    } else if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        getParameter: vi.fn(),
        getExtension: vi.fn(),
        createShader: vi.fn(),
        createProgram: vi.fn(),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        useProgram: vi.fn(),
        createBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        clear: vi.fn(),
        clearColor: vi.fn(),
        viewport: vi.fn(),
      };
    }
    return null;
  });
  
  return canvas;
}

/**
 * Create a mock Audio element
 */
export function createMockAudioElement(): HTMLAudioElement {
  const audio = document.createElement('audio') as HTMLAudioElement;
  
  Object.defineProperties(audio, {
    play: {
      value: vi.fn(() => Promise.resolve()),
      writable: true,
    },
    pause: {
      value: vi.fn(),
      writable: true,
    },
    load: {
      value: vi.fn(),
      writable: true,
    },
    volume: {
      value: 1,
      writable: true,
    },
    currentTime: {
      value: 0,
      writable: true,
    },
    duration: {
      value: 100,
      writable: true,
    },
    paused: {
      value: true,
      writable: true,
    },
    ended: {
      value: false,
      writable: true,
    },
  });
  
  return audio;
}

/**
 * Mock implementation of ElevenLabs provider
 */
export function createMockElevenLabsProvider() {
  return {
    initialize: vi.fn(() => Promise.resolve()),
    isReady: vi.fn(() => true),
    speak: vi.fn(() => Promise.resolve()),
    listen: vi.fn(() => Promise.resolve(new MediaStream())),
    stopListening: vi.fn(),
    startConversation: vi.fn(() => Promise.resolve()),
    stopConversation: vi.fn(() => Promise.resolve()),
    isConversationActive: vi.fn(() => false),
    sendConversationMessage: vi.fn(),
    getAvailableVoices: vi.fn(() => Promise.resolve([])),
    generateSpeechBlob: vi.fn(() => Promise.resolve(new Blob())),
    testMicrophone: vi.fn(() => Promise.resolve(true)),
    updateConfig: vi.fn(),
    dispose: vi.fn(),
    createAgent: vi.fn(() => Promise.resolve({ agent_id: 'test-agent' })),
    getAgent: vi.fn(() => Promise.resolve({ agent_id: 'test-agent' })),
    listAgents: vi.fn(() => Promise.resolve({ agents: [], has_more: false })),
    updateAgent: vi.fn(() => Promise.resolve({ agent_id: 'test-agent' })),
    deleteAgent: vi.fn(() => Promise.resolve()),
    duplicateAgent: vi.fn(() => Promise.resolve({ agent_id: 'test-agent-copy' })),
    getAgentLink: vi.fn(() => Promise.resolve({ link_url: 'https://example.com', agent_id: 'test', enabled: true })),
    simulateConversation: vi.fn(() => Promise.resolve({ status: 'success', agent_response: 'Test response' })),
    simulateConversationStream: vi.fn(() => Promise.resolve()),
    calculateLLMUsage: vi.fn(() => Promise.resolve({ 
      estimated_prompt_tokens: 100,
      estimated_completion_tokens: 50,
      estimated_total_tokens: 150,
    })),
    listConversations: vi.fn(() => Promise.resolve({ conversations: [], has_more: false })),
    getConversation: vi.fn(() => Promise.resolve({ 
      conversation_id: 'test-conv',
      agent_id: 'test-agent',
      status: 'done',
      transcript: [],
      metadata: { start_time_unix_secs: 0, call_duration_secs: 0 },
      has_audio: false,
      has_user_audio: false,
      has_response_audio: false,
    })),
    deleteConversation: vi.fn(() => Promise.resolve()),
    getConversationAudio: vi.fn(() => Promise.resolve(new Blob())),
    sendConversationFeedback: vi.fn(() => Promise.resolve()),
    getConversationToken: vi.fn(() => Promise.resolve({ token: 'test-token' })),
    getConversationSignedUrl: vi.fn(() => Promise.resolve({ signed_url: 'https://example.com' })),
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 10
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock blob data URL
 */
export function createMockBlobURL(data: string = 'test-data'): string {
  return `blob:${data}`;
}

