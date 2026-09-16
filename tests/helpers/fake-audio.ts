/**
 * A minimal Web Audio graph, enough for `KwamiAudio` to initialize and wire itself up.
 * happy-dom has no `AudioContext`, and the real one needs a user gesture and an output device.
 *
 * Plain methods with counters rather than `vi.fn()`: the spy types are not nameable across the
 * pnpm store, which trips TS2742 under this repo's declaration settings.
 */

export class FakeAudioNode {
  readonly connected: FakeAudioNode[] = [];
  disconnectCalls = 0;

  connect(target: FakeAudioNode): FakeAudioNode {
    this.connected.push(target);
    return target;
  }

  disconnect(): void {
    this.disconnectCalls += 1;
    this.connected.length = 0;
  }
}

export class FakeAnalyserNode extends FakeAudioNode {
  fftSize = 2048;
  smoothingTimeConstant = 0;
  minDecibels = -100;
  maxDecibels = -30;

  get frequencyBinCount(): number {
    return this.fftSize / 2;
  }

  getByteFrequencyData(): void {}
  getByteTimeDomainData(): void {}
}

export class FakeBiquadFilterNode extends FakeAudioNode {
  type = 'lowpass';
  frequency = { value: 0 };
  Q = { value: 0 };
}

export class FakeMediaStreamTrack {
  readyState: 'live' | 'ended' = 'live';
  stopCalls = 0;

  stop(): void {
    this.stopCalls += 1;
    this.readyState = 'ended';
  }
}

export class FakeMediaStream {
  readonly tracks: FakeMediaStreamTrack[];

  constructor(trackCount = 1) {
    this.tracks = Array.from({ length: trackCount }, () => new FakeMediaStreamTrack());
  }

  getTracks(): FakeMediaStreamTrack[] {
    return this.tracks;
  }

  /** True while every track is still usable by whoever owns this stream. */
  get live(): boolean {
    return this.tracks.every((t) => t.readyState === 'live');
  }
}

export class FakeMediaStreamAudioSourceNode extends FakeAudioNode {
  constructor(public readonly mediaStream: FakeMediaStream) {
    super();
  }
}

export class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  state: 'running' | 'suspended' | 'closed' = 'running';
  destination = new FakeAudioNode();
  closeCalls = 0;

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  static reset(): void {
    FakeAudioContext.instances = [];
  }

  createMediaElementSource(): FakeAudioNode {
    return new FakeAudioNode();
  }

  createAnalyser(): FakeAnalyserNode {
    return new FakeAnalyserNode();
  }

  createBiquadFilter(): FakeBiquadFilterNode {
    return new FakeBiquadFilterNode();
  }

  createMediaStreamSource(stream: FakeMediaStream): FakeMediaStreamAudioSourceNode {
    return new FakeMediaStreamAudioSourceNode(stream);
  }

  async resume(): Promise<void> {
    this.state = 'running';
  }

  async close(): Promise<void> {
    this.closeCalls += 1;
    this.state = 'closed';
  }
}

/** Install the fake graph on `window`. Returns a restore function. */
export function installFakeAudio(): () => void {
  const target = window as unknown as Record<string, unknown>;
  const previous = target.AudioContext;
  target.AudioContext = FakeAudioContext;
  FakeAudioContext.reset();
  return () => {
    target.AudioContext = previous;
  };
}
