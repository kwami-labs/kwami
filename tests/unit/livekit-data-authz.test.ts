import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoomEvent } from 'livekit-client';
import type * as LiveKitClient from 'livekit-client';
import { FakeRemoteParticipant, FakeRoom, encodeMessage } from '../helpers/fake-livekit';

vi.mock('livekit-client', async (importOriginal) => {
  // Keep the real enums (RoomEvent, Track, ConnectionState) and swap only the transport.
  const actual = await importOriginal<typeof LiveKitClient>();
  const { FakeRoom: Fake } = await import('../helpers/fake-livekit');
  return { ...actual, Room: Fake, createLocalTracks: vi.fn(async () => []) };
});

const { LiveKitAdapter } = await import('../../src/agent/adapters/LiveKitAdapter');

const AGENT = 'agent-7f3a';

async function connectedPipeline(overrides: Record<string, unknown> = {}) {
  const adapter = new LiveKitAdapter({
    url: 'wss://example.invalid',
    token: 'test-token',
    // Skip the microphone: getUserMedia does not exist in happy-dom and is not what is under test.
    audioInputEnabled: false,
    agentIdentity: AGENT,
    ...overrides,
  });
  const pipeline = adapter.createPipeline();
  const toolExecutor = vi.fn(async () => 'tool-result');
  pipeline.setToolExecutor(toolExecutor);
  await pipeline.connect({ kwamiId: 'k1', kwamiName: 'Luna' });
  return { adapter, pipeline, toolExecutor, room: FakeRoom.last };
}

function toolCall(name = 'transferFunds') {
  return encodeMessage({
    type: 'tool_call',
    toolCallId: 'call-1',
    function: { name, arguments: JSON.stringify({ amount: 1_000_000 }) },
  });
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

/**
 * Defends a privilege-escalation bug: `RoomEvent.DataReceived` called `handleAgentData()` for a
 * packet from ANY room participant, while every other handler in the same file gated on the agent
 * check. `handleAgentData()` runs `tool_call` against the host application's registered tools, so
 * a second participant in the room could invoke a host tool with arguments of their choosing.
 */
describe('DataReceived authorization', () => {
  it('executes a tool call that came from the configured agent', async () => {
    const { toolExecutor, room } = await connectedPipeline();

    room.emit(RoomEvent.DataReceived, toolCall(), new FakeRemoteParticipant(AGENT));

    expect(toolExecutor).toHaveBeenCalledWith('transferFunds', { amount: 1_000_000 });
  });

  it('ignores a tool call from another participant in the room', async () => {
    const { toolExecutor, room } = await connectedPipeline();

    room.emit(RoomEvent.DataReceived, toolCall(), new FakeRemoteParticipant('user_1699999'));

    expect(toolExecutor).not.toHaveBeenCalled();
  });

  it('ignores a tool call from a participant who named themselves agent-ish', async () => {
    // Identities are self-chosen. With `agentIdentity` set, looking like the agent is not enough.
    const { toolExecutor, room } = await connectedPipeline();

    room.emit(RoomEvent.DataReceived, toolCall(), new FakeRemoteParticipant('agent-impostor'));

    expect(toolExecutor).not.toHaveBeenCalled();
  });

  it('ignores a packet with no attributable sender', async () => {
    const { toolExecutor, room } = await connectedPipeline();

    room.emit(RoomEvent.DataReceived, toolCall(), undefined);

    expect(toolExecutor).not.toHaveBeenCalled();
  });

  it('does not dispatch spoofed nav_command window events', async () => {
    const { room } = await connectedPipeline();
    const onNav = vi.fn();
    window.addEventListener('kwami:nav_command', onNav);

    room.emit(
      RoomEvent.DataReceived,
      encodeMessage({ type: 'nav_command', action: 'navigate', url: 'https://evil.invalid' }),
      new FakeRemoteParticipant('user_1699999'),
    );

    expect(onNav).not.toHaveBeenCalled();
    window.removeEventListener('kwami:nav_command', onNav);
  });

  it('still accepts the agent when only the legacy name heuristic is available', async () => {
    // Deployments that predate `agentIdentity` must keep working.
    const { toolExecutor, room } = await connectedPipeline({ agentIdentity: undefined });

    room.emit(RoomEvent.DataReceived, toolCall(), new FakeRemoteParticipant('agent-123'));

    expect(toolExecutor).toHaveBeenCalledOnce();
  });
});
