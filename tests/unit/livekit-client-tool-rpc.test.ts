import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RpcError } from 'livekit-client';
import type * as LiveKitClient from 'livekit-client';
import { FakeRoom } from '../helpers/fake-livekit';

vi.mock('livekit-client', async (importOriginal) => {
  // Keep the real enums and RpcError; swap only the transport.
  const actual = await importOriginal<typeof LiveKitClient>();
  const { FakeRoom: Fake } = await import('../helpers/fake-livekit');
  return { ...actual, Room: Fake, createLocalTracks: vi.fn(async () => []) };
});

const { LiveKitAdapter, CLIENT_TOOL_RPC_ATTRIBUTE, CLIENT_TOOL_RPC_METHOD, fitUtf8 } = await import(
  '../../src/agent/adapters/LiveKitAdapter'
);

const AGENT = 'agent-7f3a';

async function connectedPipeline(executor?: (name: string, args: Record<string, unknown>) => Promise<string>) {
  const adapter = new LiveKitAdapter({
    url: 'wss://example.invalid',
    token: 'test-token',
    audioInputEnabled: false,
    agentIdentity: AGENT,
  });
  const pipeline = adapter.createPipeline();
  const toolExecutor = vi.fn(executor ?? (async () => 'tool-result'));
  pipeline.setToolExecutor(toolExecutor);
  await pipeline.connect({ kwamiId: 'k1', kwamiName: 'Luna' });
  const room = FakeRoom.last;
  const handler = room.rpcHandlers.get(CLIENT_TOOL_RPC_METHOD);
  if (!handler) throw new Error('the client tool RPC method was not registered');
  return { pipeline, toolExecutor, room, handler };
}

function invocation(payload: unknown, callerIdentity = AGENT) {
  return {
    requestId: 'req-1',
    callerIdentity,
    payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
    responseTimeout: 30_000,
  };
}

async function rpcError(promise: Promise<unknown>): Promise<RpcError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(RpcError);
    return error as RpcError;
  }
  throw new Error('expected the RPC handler to throw');
}

beforeEach(() => {
  FakeRoom.reset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('client tools over RPC', () => {
  it('registers the method and only then advertises it to the agent', async () => {
    const { room } = await connectedPipeline();

    expect(room.rpcHandlers.has(CLIENT_TOOL_RPC_METHOD)).toBe(true);
    expect(room.localParticipant.setAttributes).toHaveBeenCalledWith({
      [CLIENT_TOOL_RPC_ATTRIBUTE]: 'rpc',
    });
  });

  it('runs the tool the agent asked for and returns its result', async () => {
    const { handler, toolExecutor } = await connectedPipeline(async () => 'dark mode on');

    const result = await handler(
      invocation({ toolCallId: 'c1', name: 'set_theme', arguments: { mode: 'dark' } }),
    );

    expect(result).toBe('dark mode on');
    expect(toolExecutor).toHaveBeenCalledWith('set_theme', { mode: 'dark' });
  });

  it('accepts arguments sent as a JSON string, the data-channel shape', async () => {
    const { handler, toolExecutor } = await connectedPipeline();

    await handler(invocation({ name: 'set_theme', arguments: '{"mode":"light"}' }));

    expect(toolExecutor).toHaveBeenCalledWith('set_theme', { mode: 'light' });
  });

  it('treats missing or non-object arguments as none', async () => {
    const { handler, toolExecutor } = await connectedPipeline();

    await handler(invocation({ name: 'ping' }));
    await handler(invocation({ name: 'ping', arguments: [1, 2] }));

    expect(toolExecutor).toHaveBeenNthCalledWith(1, 'ping', {});
    expect(toolExecutor).toHaveBeenNthCalledWith(2, 'ping', {});
  });

  it('refuses a participant that is not the agent', async () => {
    // Same rule as the data-channel tool_call: only the agent runs host tools.
    const { handler, toolExecutor } = await connectedPipeline();

    const error = await rpcError(handler(invocation({ name: 'transferFunds' }, 'user_1699999')));

    expect(error.code).toBe(RpcError.ErrorCode.APPLICATION_ERROR);
    expect(toolExecutor).not.toHaveBeenCalled();
  });

  it('answers a malformed or nameless call with an error the model can read', async () => {
    const { handler } = await connectedPipeline();

    expect((await rpcError(handler(invocation('{not json')))).message).toBe(
      'Malformed client tool call',
    );
    expect((await rpcError(handler(invocation({ arguments: {} })))).message).toBe(
      'Client tool call without a name',
    );
  });

  it("turns the tool's own failure into an application error", async () => {
    const { handler } = await connectedPipeline(async () => {
      throw new Error('no such panel');
    });

    const error = await rpcError(handler(invocation({ name: 'open_panel' })));

    expect(error.code).toBe(RpcError.ErrorCode.APPLICATION_ERROR);
    expect(error.message).toBe('no such panel');
  });

  it('serialises a non-string result rather than dropping it', async () => {
    const { handler } = await connectedPipeline(
      async () => ({ ok: true }) as unknown as string,
    );

    expect(await handler(invocation({ name: 'read_state' }))).toBe('{"ok":true}');
  });

  it('sends an agent without an executor back to the data channel', async () => {
    const adapter = new LiveKitAdapter({
      url: 'wss://example.invalid',
      token: 'test-token',
      audioInputEnabled: false,
      agentIdentity: AGENT,
    });
    const pipeline = adapter.createPipeline();
    await pipeline.connect({ kwamiId: 'k1', kwamiName: 'Luna' });
    const handler = FakeRoom.last.rpcHandlers.get(CLIENT_TOOL_RPC_METHOD)!;

    const error = await rpcError(handler(invocation({ name: 'set_theme' })));

    // UNSUPPORTED_METHOD is what makes the agent retry over the data channel.
    expect(error.code).toBe(RpcError.ErrorCode.UNSUPPORTED_METHOD);
  });

  it('keeps connecting when the attribute cannot be set', async () => {
    const adapter = new LiveKitAdapter({
      url: 'wss://example.invalid',
      token: 'test-token',
      audioInputEnabled: false,
      agentIdentity: AGENT,
    });
    const pipeline = adapter.createPipeline();
    const original = FakeRoom.prototype.connect;
    vi.spyOn(FakeRoom.prototype, 'connect').mockImplementation(async function (this: FakeRoom, url, token) {
      this.localParticipant.setAttributes.mockRejectedValueOnce(new Error('no permission'));
      return original.call(this, url, token);
    });

    await expect(pipeline.connect({ kwamiId: 'k1', kwamiName: 'Luna' })).resolves.toBeUndefined();
  });
});

describe('fitUtf8', () => {
  it('leaves a short text alone', () => {
    expect(fitUtf8('hola', 10)).toBe('hola');
  });

  it('cuts by bytes, never through a character', () => {
    // "ñ" is two bytes, so five of them do not fit in nine.
    expect(fitUtf8('ñññññ', 9)).toBe('ññññ');
    // An emoji is a surrogate pair: never keep half of it.
    const cut = fitUtf8('ab😀', 5);
    expect(cut).toBe('ab');
  });

  it('caps a huge tool result under the RPC limit', () => {
    const cut = fitUtf8('x'.repeat(50_000));
    expect(new TextEncoder().encode(cut).length).toBeLessThanOrEqual(14_000);
  });
});
