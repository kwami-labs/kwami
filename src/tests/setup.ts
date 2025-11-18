import { vi } from 'vitest';

// Mock Three.js for testing
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement('canvas'),
    })),
    Scene: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      background: null,
    })),
    PerspectiveCamera: vi.fn(() => ({
      position: { x: 0, y: 0, z: 5 },
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    })),
  };
});

// Mock AudioContext for audio tests
class MockAudioContext {
  destination = {};
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createAnalyser = vi.fn(() => ({
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  decodeAudioData = vi.fn((buffer) => Promise.resolve(buffer));
}

global.AudioContext = MockAudioContext as any;

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';

  static isTypeSupported = vi.fn(() => true);

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.onstop?.();
  }

  addEventListener(event: string, handler: any) {
    if (event === 'dataavailable') {
      this.ondataavailable = handler;
    } else if (event === 'stop') {
      this.onstop = handler;
    }
  }
}

global.MediaRecorder = MockMediaRecorder as any;

// Mock MediaStream
class MockMediaStream {
  id = 'mock-stream-id';
  active = true;
  private tracks: any[] = [];

  getAudioTracks() {
    return this.tracks;
  }

  addTrack(track: any) {
    this.tracks.push(track);
  }

  removeTrack(track: any) {
    this.tracks = this.tracks.filter(t => t !== track);
  }
}

global.MediaStream = MockMediaStream as any;

// Mock MediaSource
class MockMediaSource {
  onsourceended: (() => void) | null = null;
  onsourceopen: (() => void) | null = null;
  
  static isTypeSupported = vi.fn(() => true);

  addSourceBuffer() {
    return {
      mode: 'sequence',
      onupdateend: null,
      appendBuffer: vi.fn(),
    };
  }

  endOfStream() {}
}

global.MediaSource = MockMediaSource as any;

// Mock SpeechSynthesis
class MockSpeechSynthesisUtterance {
  text = '';
  voice: any = null;
  lang = 'en-US';
  rate = 1;
  pitch = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any;

global.speechSynthesis = {
  speak: vi.fn((utterance: any) => {
    setTimeout(() => {
      utterance.onstart?.();
      setTimeout(() => utterance.onend?.(), 100);
    }, 10);
  }),
  getVoices: vi.fn(() => []),
  onvoiceschanged: null,
} as any;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => 
      Promise.resolve(new MockMediaStream())
    ),
    enumerateDevices: vi.fn(() => 
      Promise.resolve([
        { kind: 'audioinput', deviceId: 'default', label: 'Default Microphone' }
      ])
    ),
  },
});

// Mock fetch for loading personality files
global.fetch = vi.fn((url: string) => {
  if (url.includes('.yaml') || url.includes('.yml')) {
    return Promise.resolve({
      ok: true,
      headers: new Headers({ 'content-type': 'text/yaml' }),
      text: () => Promise.resolve('name: Test\npersonality: Test personality'),
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve({ name: 'Test', personality: 'Test personality' }),
  } as Response);
}) as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
class MockFileReader {
  result: any = null;
  onload: ((event: any) => void) | null = null;
  
  readAsArrayBuffer(blob: Blob) {
    this.result = new ArrayBuffer(100);
    setTimeout(() => this.onload?.({ target: this }), 10);
  }
}

global.FileReader = MockFileReader as any;

