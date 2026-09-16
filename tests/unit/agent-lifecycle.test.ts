import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoomEvent } from 'livekit-client';
import type * as LiveKitClient from 'livekit-client';
import { FakeRemoteParticipant, FakeRoom, encodeMessage } from '../helpers/fake-livekit';

const createLocalTracks = vi.hoisted(() => vi.fn(async () => [] as unknown[]));

vi.mock('livekit-client', async (importOriginal) => {
  const actual = await importOriginal<typeof LiveKitClient>();
  const { FakeRoom: Fake } = await import('../helpers/fake-livekit');
  return { ...actual, Room: Fake, createLocalTracks };
});

const { Agent } = await import('../../src/agent/Agent');

const AGENT = 'agent-7f3a';

function newAgent(overrides: Record<string, unknown> = {}) {
  return new Agent({
    livekit: {
      url: 'wss://example.invalid',
      token: 'test-token',
      audioInputEnabled: false,
      agentIdentity: AGENT,
      ...overrides,
    },
  });
}

beforeEach(() => {
  FakeRoom.reset();
  createLocalTracks.mockReset();
  createLocalTracks.mockResolvedValue([]);
  for (const level of ['warn', 'info', 'debug', 'error'] as const) {
    vi.spyOn(console, level).mockImplementation(() => {});
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Agent.connect failure handling', () => {
  it('leaves nothing connected when a step after room.connect() fails', async () => {
    // The concrete case: the user denies microphone permission. Before the fix the room stayed
    // connected, isConnected() still returned true, and the caller had no way to release it.
    createLocalTracks.mockRejectedValue(new Error('NotAllowedError: Permission denied'));
    const agent = newAgent({ audioInputEnabled: true });

    await expect(agent.connect({ kwamiId: 'k1' })).rejects.toThrow('Permission denied');

    expect(agent.isConnected()).toBe(false);
    expect(FakeRoom.instances).toHaveLength(1);
    expect(FakeRoom.last.disconnectCalls).toBe(1);
  });

  it('creates exactly one room per retry rather than leaking the failed one', async () => {
    createLocalTracks.mockRejectedValue(new Error('denied'));
    const agent = newAgent({ audioInputEnabled: true });

    await expect(agent.connect({ kwamiId: 'k1' })).rejects.toThrow();
    await expect(agent.connect({ kwamiId: 'k1' })).rejects.toThrow();

    expect(FakeRoom.instances).toHaveLength(2);
    // Both cleaned themselves up; neither is still holding a live session.
    expect(FakeRoom.instances.every((r) => r.disconnectCalls === 1)).toBe(true);
    expect(FakeRoom.instances.every((r) => r.state === 'disconnected')).toBe(true);
  });

  it('recovers on a retry after a transient failure', async () => {
    createLocalTracks.mockRejectedValueOnce(new Error('denied')).mockResolvedValue([]);
    const agent = newAgent({ audioInputEnabled: true });

    await expect(agent.connect({ kwamiId: 'k1' })).rejects.toThrow();
    await agent.connect({ kwamiId: 'k1' });

    expect(agent.isConnected()).toBe(true);
  });
});

describe('Agent.connect re-entrancy', () => {
  it('joins an in-flight connect instead of dispatching a second agent', async () => {
    const agent = newAgent();

    await Promise.all([agent.connect({ kwamiId: 'k1' }), agent.connect({ kwamiId: 'k1' })]);

    expect(FakeRoom.instances).toHaveLength(1);
  });

  it('ignores a connect while already connected', async () => {
    const agent = newAgent();
    await agent.connect({ kwamiId: 'k1' });

    await agent.connect({ kwamiId: 'k1' });

    expect(FakeRoom.instances).toHaveLength(1);
  });
});

describe('Agent error propagation', () => {
  // onError was dead end to end: the agent's own `{type:'error'}` messages were logged and
  // dropped, VoiceSession.triggerError() had zero callers, and Agent._onErrorCallback was
  // stored and never invoked. Nothing a consumer registered ever fired.
  it('delivers an error reported by the backend agent', async () => {
    const agent = newAgent();
    const onError = vi.fn();
    agent.onError(onError);
    await agent.connect({ kwamiId: 'k1' });

    FakeRoom.last.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'error', error: 'LLM provider rejected the request' }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((onError.mock.calls[0][0] as Error).message).toContain('LLM provider rejected');
  });

  it('reports a disconnect the app did not ask for', async () => {
    const agent = newAgent();
    const onError = vi.fn();
    agent.onError(onError);
    await agent.connect({ kwamiId: 'k1' });

    FakeRoom.last.emit(RoomEvent.Disconnected, 'SIGNAL_CLOSE');

    expect(onError).toHaveBeenCalledOnce();
  });

  it('stays quiet on a disconnect the app did ask for', async () => {
    const agent = newAgent();
    const onError = vi.fn();
    agent.onError(onError);
    await agent.connect({ kwamiId: 'k1' });
    const room = FakeRoom.last;

    await agent.disconnect();
    room.emit(RoomEvent.Disconnected, 'CLIENT_INITIATED');

    expect(onError).not.toHaveBeenCalled();
  });

  it('keeps delivering to the other listeners when one throws', async () => {
    const agent = newAgent();
    const bad = vi.fn(() => {
      throw new Error('listener blew up');
    });
    const good = vi.fn();
    agent.onError(bad);
    agent.onError(good);
    await agent.connect({ kwamiId: 'k1' });

    FakeRoom.last.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'error', error: 'boom' }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(bad).toHaveBeenCalledOnce();
    expect(good).toHaveBeenCalledOnce();
  });
});

describe('Agent listener registration', () => {
  it('delivers to every registered listener, not just the last', async () => {
    const agent = newAgent();
    const first = vi.fn();
    const second = vi.fn();
    agent.onUserSpeech(first);
    agent.onUserSpeech(second);
    await agent.connect({ kwamiId: 'k1' });

    FakeRoom.last.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'transcript', transcript: 'hello there', isFinal: true }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(first).toHaveBeenCalledWith('hello there');
    expect(second).toHaveBeenCalledWith('hello there');
  });

  it('stops delivering after unsubscribe', async () => {
    const agent = newAgent();
    const listener = vi.fn();
    const unsubscribe = agent.onUserSpeech(listener);
    await agent.connect({ kwamiId: 'k1' });

    unsubscribe();
    FakeRoom.last.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'transcript', transcript: 'hello there', isFinal: true }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(listener).not.toHaveBeenCalled();
  });

  it('delivers a transcript exactly once per listener', async () => {
    // The old implementation wrapped each new callback around the previous one, so the chain
    // grew and earlier callbacks ran again for every later registration.
    const agent = newAgent();
    const listener = vi.fn();
    agent.onUserSpeech(listener);
    agent.onUserSpeech(vi.fn());
    agent.onUserSpeech(vi.fn());
    await agent.connect({ kwamiId: 'k1' });

    FakeRoom.last.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'transcript', transcript: 'once', isFinal: true }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('accepts listeners registered after connect', async () => {
    const agent = newAgent();
    await agent.connect({ kwamiId: 'k1' });
    const late = vi.fn();
    agent.onAgentText(late);

    FakeRoom.last.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'agent_text', text: 'hi', isFinal: true }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(late).toHaveBeenCalledWith('hi');
  });
});

describe('Agent.dispose', () => {
  it('waits for the room to actually close', async () => {
    const agent = newAgent();
    await agent.connect({ kwamiId: 'k1' });
    const room = FakeRoom.last;

    await agent.dispose();

    expect(room.disconnectCalls).toBe(1);
    expect(room.state).toBe('disconnected');
    expect(agent.isConnected()).toBe(false);
  });

  it('drops listeners so a disposed Agent delivers nothing', async () => {
    const agent = newAgent();
    const listener = vi.fn();
    agent.onUserSpeech(listener);
    await agent.connect({ kwamiId: 'k1' });
    const room = FakeRoom.last;

    await agent.dispose();
    room.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'transcript', transcript: 'after dispose', isFinal: true }),
      new FakeRemoteParticipant(AGENT),
    );

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('Agent.updateVoiceConfig', () => {
  it('keeps sibling fields when a nested provider block is updated', () => {
    // Kwami's own class doc demonstrates `updateVoice({ tts: { voice: 'nova' } })`. A shallow
    // spread replaced the whole tts object and dropped provider and model.
    const agent = new Agent({
      livekit: { voice: { tts: { provider: 'cartesia', model: 'sonic-3', voice: 'alloy' } } },
    });

    agent.updateVoiceConfig({ tts: { voice: 'nova' } });

    expect(agent.getVoiceConfig()?.tts).toEqual({
      provider: 'cartesia',
      model: 'sonic-3',
      voice: 'nova',
    });
  });

  it('merges each provider block independently', () => {
    const agent = new Agent({
      livekit: {
        voice: {
          llm: { provider: 'openai', model: 'gpt-4o' },
          stt: { provider: 'deepgram', model: 'nova-3' },
        },
      },
    });

    agent.updateVoiceConfig({ llm: { model: 'gpt-4o-mini' } });

    expect(agent.getVoiceConfig()?.llm).toEqual({ provider: 'openai', model: 'gpt-4o-mini' });
    expect(agent.getVoiceConfig()?.stt).toEqual({ provider: 'deepgram', model: 'nova-3' });
  });

  it('replaces top-level scalars outright', () => {
    const agent = new Agent({ livekit: { voice: { type: 'stt-llm-tts' } } });

    agent.updateVoiceConfig({ type: 'realtime' });

    expect(agent.getVoiceConfig()?.type).toBe('realtime');
  });
});
