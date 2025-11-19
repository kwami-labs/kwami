import { vi } from 'vitest';

// Mock Three.js for testing
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn(function(this: any) {
      this.setSize = vi.fn();
      this.setPixelRatio = vi.fn();
      this.render = vi.fn();
      this.dispose = vi.fn();
      this.shadowMap = { enabled: false, type: null };
      this.domElement = document.createElement('canvas');
      return this;
    }),
    Scene: vi.fn(function(this: any) {
      this.add = vi.fn();
      this.remove = vi.fn();
      this.background = null;
      return this;
    }),
    PerspectiveCamera: vi.fn(function(this: any) {
      this.position = { 
        x: 0, 
        y: 0, 
        z: 5,
        set: vi.fn(function(x: number, y: number, z: number) {
          this.x = x;
          this.y = y;
          this.z = z;
        })
      };
      this.aspect = 1;
      this.updateProjectionMatrix = vi.fn();
      this.lookAt = vi.fn();
      return this;
    }),
  };
});

// Mock AudioContext for audio tests
class MockAudioContext {
  destination = {};
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createMediaElementSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createAnalyser = vi.fn(() => ({
    frequencyBinCount: 128,
    fftSize: 2048,
    smoothingTimeConstant: 0.35,
    minDecibels: -90,
    maxDecibels: -10,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createBiquadFilter = vi.fn(() => ({
    type: 'lowpass',
    frequency: { value: 220 },
    Q: { value: 0.85 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  decodeAudioData = vi.fn((buffer) => Promise.resolve(buffer));
  close = vi.fn(() => Promise.resolve());
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

// Mock MediaStreamTrack
class MockMediaStreamTrack {
  kind = 'audio';
  id = 'mock-track-id';
  label = 'Mock Audio Track';
  enabled = true;
  muted = false;
  readyState = 'live';
  
  stop() {
    this.readyState = 'ended';
  }
  
  clone() {
    return new MockMediaStreamTrack();
  }
}

// Mock MediaStream
class MockMediaStream {
  id = 'mock-stream-id';
  active = true;
  private tracks: MockMediaStreamTrack[] = [new MockMediaStreamTrack()];

  getAudioTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return [];
  }

  getTracks() {
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
    const sourceBuffer = {
      mode: 'sequence',
      onupdateend: null as (() => void) | null,
      appendBuffer: vi.fn(function() {
        // Trigger onupdateend asynchronously
        setTimeout(() => {
          if (sourceBuffer.onupdateend) {
            sourceBuffer.onupdateend();
          }
        }, 0);
      }),
    };
    return sourceBuffer;
  }

  endOfStream() {
    // Trigger onsourceended after endOfStream is called
    setTimeout(() => {
      if (this.onsourceended) {
        this.onsourceended();
      }
    }, 0);
  }
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
global.URL.createObjectURL = vi.fn((obj: any) => {
  // If it's a MediaSource, trigger onsourceopen asynchronously
  if (obj instanceof MockMediaSource) {
    setTimeout(() => {
      if (obj.onsourceopen) {
        obj.onsourceopen();
      }
    }, 0);
  }
  return 'blob:mock-url';
});
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

