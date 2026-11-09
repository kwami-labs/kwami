import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as LiveKitClient from 'livekit-client';
import { FakeRoom } from '../helpers/fake-livekit';

vi.mock('livekit-client', async (importOriginal) => {
  const actual = await importOriginal<typeof LiveKitClient>();
  const { FakeRoom: Fake } = await import('../helpers/fake-livekit');
  return { ...actual, Room: Fake, createLocalTracks: vi.fn(async () => []) };
});

const { LiveKitAdapter, AGENT_MESSAGE_TOPIC, AGENT_MESSAGES_ATTRIBUTE, CLIENT_TOOL_RPC_ATTRIBUTE } =
  await import('../../src/agent/adapters/LiveKitAdapter');

const AGENT = 'agent-7f3a';

async function connectedPipeline() {
  const adapter = new LiveKitAdapter({
    url: 'wss://example.invalid',
    token: 'test-token',
    audioInputEnabled: false,
    agentIdentity: AGENT,
  });
  const pipeline = adapter.createPipeline();
  const toolExecutor = vi.fn(async () => 'tool-result');
  pipeline.setToolExecutor(toolExecutor);
  await pipeline.connect({ kwamiId: 'k1', kwamiName: 'Luna' });
  return { pipeline, toolExecutor, room: FakeRoom.last };
}

async function settle() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

beforeEach(() => {
  FakeRoom.reset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('agent messages over a text stream', () => {
  it('registers the topic and advertises it with the RPC method, in one call', async () => {
    const { room } = await connectedPipeline();

    expect(room.textStreamHandlers.has(AGENT_MESSAGE_TOPIC)).toBe(true);
    expect(room.localParticipant.setAttributes).toHaveBeenCalledTimes(1);
    expect(room.localParticipant.setAttributes).toHaveBeenCalledWith({
      [CLIENT_TOOL_RPC_ATTRIBUTE]: 'rpc',
      [AGENT_MESSAGES_ATTRIBUTE]: 'stream',
    });
  });

  it('handles a streamed message exactly like a data packet', async () => {
    // A tool call is the strongest proof: it reaches the host's executor.
    const { room, toolExecutor } = await connectedPipeline();
    const message = {
      type: 'tool_call',
      toolCallId: 'c1',
      function: { name: 'set_theme', arguments: JSON.stringify({ mode: 'dark' }) },
    };

    room.streamText(AGENT_MESSAGE_TOPIC, JSON.stringify(message), AGENT);
    await settle();

    expect(toolExecutor).toHaveBeenCalledWith('set_theme', { mode: 'dark' });
  });

  it('dispatches a large message to the app whole, not trimmed', async () => {
    const { room } = await connectedPipeline();
    const seen: unknown[] = [];
    const listener = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener('kwami:agent_message', listener);
    const big = { type: 'something_new', results: 'x'.repeat(60_000) };

    room.streamText(AGENT_MESSAGE_TOPIC, JSON.stringify(big), AGENT);
    await settle();
    window.removeEventListener('kwami:agent_message', listener);

    expect(seen).toEqual([big]);
  });

  it('ignores a stream from a participant that is not the agent', async () => {
    const { room, toolExecutor } = await connectedPipeline();
    const message = {
      type: 'tool_call',
      toolCallId: 'c1',
      function: { name: 'transferFunds', arguments: '{}' },
    };

    room.streamText(AGENT_MESSAGE_TOPIC, JSON.stringify(message), 'user_1699999');
    await settle();

    expect(toolExecutor).not.toHaveBeenCalled();
  });

  it('survives a stream that is not JSON', async () => {
    const { room } = await connectedPipeline();

    room.streamText(AGENT_MESSAGE_TOPIC, '{not json', AGENT);
    await settle();

    expect(console.error).toHaveBeenCalled();
  });

  it('advertises only what registered', async () => {
    const original = FakeRoom.prototype.registerTextStreamHandler;
    vi.spyOn(FakeRoom.prototype, 'registerTextStreamHandler').mockImplementation(function () {
      throw new Error('already set');
    });

    const { room } = await connectedPipeline();

    expect(room.localParticipant.setAttributes).toHaveBeenCalledWith({
      [CLIENT_TOOL_RPC_ATTRIBUTE]: 'rpc',
    });
    FakeRoom.prototype.registerTextStreamHandler = original;
  });

  it('advertises nothing when nothing registered', async () => {
    vi.spyOn(FakeRoom.prototype, 'registerTextStreamHandler').mockImplementation(function () {
      throw new Error('no streams');
    });
    vi.spyOn(FakeRoom.prototype, 'registerRpcMethod').mockImplementation(function () {
      throw new Error('no rpc');
    });

    const { room } = await connectedPipeline();

    expect(room.localParticipant.setAttributes).not.toHaveBeenCalled();
  });
});
