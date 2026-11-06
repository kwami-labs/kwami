import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoomEvent, Track } from 'livekit-client';
import type * as LiveKitClient from 'livekit-client';
import { FakeRemoteParticipant, FakeRoom } from '../helpers/fake-livekit';

vi.mock('livekit-client', async (importOriginal) => {
  const actual = await importOriginal<typeof LiveKitClient>();
  const { FakeRoom: Fake } = await import('../helpers/fake-livekit');
  return { ...actual, Room: Fake, createLocalTracks: vi.fn(async () => []) };
});

const { LiveKitAdapter, AGENT_VOICE_ELEMENT_ID, AGENT_EXTRA_AUDIO_ELEMENT_ID, isAgentVoiceTrack } =
  await import('../../src/agent/adapters/LiveKitAdapter');

const AGENT = 'agent-7f3a';

/** A remote audio track: `attach()` makes an element, `detach()` hands back what it made. */
class FakeRemoteAudioTrack {
  readonly kind = Track.Kind.Audio;
  readonly elements: HTMLAudioElement[] = [];
  readonly mediaStreamTrack = { kind: 'audio', id: Math.random().toString(36) };

  attach(): HTMLAudioElement {
    const element = document.createElement('audio');
    this.elements.push(element);
    return element;
  }

  detach(): HTMLAudioElement[] {
    return this.elements.splice(0);
  }
}

async function connectedPipeline() {
  const adapter = new LiveKitAdapter({
    url: 'wss://example.invalid',
    token: 'test-token',
    audioInputEnabled: false,
    agentIdentity: AGENT,
  });
  const pipeline = adapter.createPipeline();
  const streams: unknown[] = [];
  (
    pipeline as unknown as { onAgentAudioStream(cb: (s: unknown) => void): void }
  ).onAgentAudioStream((s) => streams.push(s));
  await pipeline.connect({ kwamiId: 'k1', kwamiName: 'Luna' });
  return { pipeline, room: FakeRoom.last, streams };
}

function subscribe(room: FakeRoom, trackName: string, identity = AGENT) {
  const track = new FakeRemoteAudioTrack();
  room.emit(RoomEvent.TrackSubscribed, track, { trackName }, new FakeRemoteParticipant(identity));
  return track;
}

const voiceElements = () => document.querySelectorAll(`#${AGENT_VOICE_ELEMENT_ID}`);
const extraElements = () => document.querySelectorAll(`#${AGENT_EXTRA_AUDIO_ELEMENT_ID}`);

beforeEach(() => {
  FakeRoom.reset();
  document.body.innerHTML = '';
  vi.stubGlobal(
    'MediaStream',
    class {
      constructor(readonly tracks: unknown[]) {}
    },
  );
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the agent's audio tracks", () => {
  it('plays the voice on its element and feeds it to the avatar', async () => {
    const { room, streams } = await connectedPipeline();

    subscribe(room, 'roomio_audio');

    expect(voiceElements()).toHaveLength(1);
    expect(streams).toHaveLength(1);
  });

  it('plays a background track beside the voice instead of replacing it', async () => {
    const { room, streams } = await connectedPipeline();
    subscribe(room, 'roomio_audio');

    subscribe(room, 'background_audio');

    // The voice is still there, and the avatar still listens to it alone.
    expect(voiceElements()).toHaveLength(1);
    expect(extraElements()).toHaveLength(1);
    expect(streams).toHaveLength(1);
  });

  it('removes a background track when it goes away and leaves the voice playing', async () => {
    const { room } = await connectedPipeline();
    const voice = subscribe(room, 'roomio_audio');
    const background = subscribe(room, 'background_audio');

    room.emit(RoomEvent.TrackUnsubscribed, background, {}, new FakeRemoteParticipant(AGENT));

    expect(extraElements()).toHaveLength(0);
    expect(voiceElements()).toHaveLength(1);
    expect(voice.elements).toHaveLength(1);
  });

  it('still replaces a republished voice rather than stacking two', async () => {
    const { room, streams } = await connectedPipeline();

    subscribe(room, 'roomio_audio');
    subscribe(room, 'roomio_audio');

    expect(voiceElements()).toHaveLength(1);
    expect(streams).toHaveLength(2);
  });

  it('ignores audio from a participant that is not the agent', async () => {
    const { room } = await connectedPipeline();

    subscribe(room, 'background_audio', 'user_1699999');

    expect(extraElements()).toHaveLength(0);
  });

  it('clears every agent element on disconnect', async () => {
    const { pipeline, room } = await connectedPipeline();
    subscribe(room, 'roomio_audio');
    subscribe(room, 'background_audio');

    await pipeline.disconnect();

    expect(voiceElements()).toHaveLength(0);
    expect(extraElements()).toHaveLength(0);
  });
});

describe('isAgentVoiceTrack', () => {
  it('takes any name but the background one as the voice', () => {
    expect(isAgentVoiceTrack('roomio_audio')).toBe(true);
    expect(isAgentVoiceTrack('jarvis_voice')).toBe(true);
    expect(isAgentVoiceTrack(undefined)).toBe(true);
    expect(isAgentVoiceTrack('background_audio')).toBe(false);
  });
});
