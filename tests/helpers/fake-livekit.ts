import { vi } from 'vitest';

/**
 * A stand-in for `livekit-client`'s `Room`, good enough to drive `LiveKitPipeline` through a
 * connect and then hand-deliver room events to whatever it registered.
 *
 * It exists because `LiveKitAdapter.ts` is the largest file in the library and, until this
 * harness, had no test of any kind: everything it does is reached through a live WebRTC room.
 */
export class FakeRoom {
  static instances: FakeRoom[] = [];

  /** Event name → the handlers the pipeline registered, in registration order. */
  readonly handlers = new Map<string, Array<(...args: unknown[]) => void>>();

  readonly remoteParticipants = new Map<string, FakeRemoteParticipant>();
  readonly publishedData: Uint8Array[] = [];
  /** RPC method name -> the handler the pipeline registered. */
  readonly rpcHandlers = new Map<string, (data: unknown) => Promise<string>>();
  /** Text-stream topic -> the handler the pipeline registered. */
  readonly textStreamHandlers = new Map<
    string,
    (reader: { readAll(): Promise<string> }, participant: { identity: string }) => void
  >();

  name = 'fake-room';
  state = 'disconnected';
  connectCalls: Array<{ url: string; token: string }> = [];
  disconnectCalls = 0;

  localParticipant = {
    publishData: vi.fn(async (data: Uint8Array) => {
      this.publishedData.push(data);
    }),
    setMicrophoneEnabled: vi.fn(async () => {}),
    publishTrack: vi.fn(async () => {}),
    unpublishTrack: vi.fn(async () => {}),
    setAttributes: vi.fn(async (attributes: Record<string, string>) => {
      void attributes;
    }),
  };

  registerTextStreamHandler(
    topic: string,
    handler: (reader: { readAll(): Promise<string> }, participant: { identity: string }) => void,
  ): void {
    if (this.textStreamHandlers.has(topic)) {
      throw new Error(`A text stream handler for topic "${topic}" has already been set.`);
    }
    this.textStreamHandlers.set(topic, handler);
  }

  /** Deliver a text stream on `topic` as `identity`, the way the agent's `send_text` would. */
  streamText(topic: string, text: string, identity: string): void {
    const handler = this.textStreamHandlers.get(topic);
    if (!handler) throw new Error(`No text stream handler for ${topic}`);
    handler({ readAll: async () => text }, { identity });
  }

  registerRpcMethod(method: string, handler: (data: unknown) => Promise<string>): void {
    if (this.rpcHandlers.has(method)) {
      throw new Error(`RPC handler already registered for method ${method}`);
    }
    this.rpcHandlers.set(method, handler);
  }

  constructor(public readonly options?: unknown) {
    FakeRoom.instances.push(this);
  }

  static reset(): void {
    FakeRoom.instances = [];
  }

  /** The most recently constructed room — the one the pipeline under test is holding. */
  static get last(): FakeRoom {
    const room = FakeRoom.instances.at(-1);
    if (!room) throw new Error('No FakeRoom has been constructed');
    return room;
  }

  on(event: string, handler: (...args: unknown[]) => void): this {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler);
    this.handlers.set(event, existing);
    return this;
  }

  off(event: string, handler: (...args: unknown[]) => void): this {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(
      event,
      existing.filter((h) => h !== handler),
    );
    return this;
  }

  removeAllListeners(): this {
    this.handlers.clear();
    return this;
  }

  async connect(url: string, token: string): Promise<void> {
    this.connectCalls.push({ url, token });
    this.state = 'connected';
  }

  async disconnect(): Promise<void> {
    this.disconnectCalls += 1;
    this.state = 'disconnected';
  }

  /** Deliver a room event to every handler the pipeline registered for it. */
  emit(event: string, ...args: unknown[]): void {
    for (const handler of this.handlers.get(event) ?? []) handler(...args);
  }

  /** Decode whatever the pipeline published on the data channel. */
  decodePublished(): unknown[] {
    const decoder = new TextDecoder();
    return this.publishedData.map((d) => JSON.parse(decoder.decode(d)) as unknown);
  }
}

export class FakeRemoteParticipant {
  constructor(
    public readonly identity: string,
    public readonly attributes: Record<string, string> = {},
  ) {}
}

/** Encode a data-channel message the way the backend agent would. */
export function encodeMessage(message: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(message));
}
