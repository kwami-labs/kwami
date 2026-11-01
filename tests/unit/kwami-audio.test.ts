import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KwamiAudio } from '../../src/avatar/audio/KwamiAudio';
import {
  FakeAudioContext,
  FakeMediaStream,
  installFakeAudio,
  type FakeAudioNode,
} from '../helpers/fake-audio';

let restoreAudio: () => void;

beforeEach(() => {
  restoreAudio = installFakeAudio();
  for (const level of ['warn', 'info', 'debug', 'error'] as const) {
    vi.spyOn(console, level).mockImplementation(() => {});
  }
});

afterEach(() => {
  restoreAudio();
  vi.restoreAllMocks();
});

/** `connectMediaStream` takes a real MediaStream; the fake is structurally what it uses. */
function attach(audio: KwamiAudio, stream: FakeMediaStream, options?: { owned?: boolean }) {
  return audio.connectMediaStream(stream as unknown as MediaStream, options);
}

describe('KwamiAudio stream ownership', () => {
  /**
   * Defends a cross-system bug. `connectMediaStream()` is documented "for VISUALIZATION ONLY"
   * and `Kwami.wireUp()` feeds the agent's LiveKit track into it. `dispose()` routed through
   * `stopMicrophoneListening()`, which called `.stop()` on every track of whatever stream was
   * attached — so disposing a Kwami ended the remote participant's audio for the entire host
   * application, leaving LiveKit holding a track in readyState 'ended'.
   */
  it('leaves a borrowed stream playing after dispose', async () => {
    const audio = new KwamiAudio();
    const borrowed = new FakeMediaStream(2);
    await attach(audio, borrowed);

    audio.dispose();

    expect(borrowed.live).toBe(true);
    expect(borrowed.tracks.every((t) => t.stopCalls === 0)).toBe(true);
  });

  it('leaves a borrowed stream playing after an explicit stop', async () => {
    const audio = new KwamiAudio();
    const borrowed = new FakeMediaStream();
    await attach(audio, borrowed);

    audio.stopMicrophoneListening();

    expect(borrowed.live).toBe(true);
  });

  it('still stops a stream it opened itself', async () => {
    const audio = new KwamiAudio();
    const owned = new FakeMediaStream(2);
    await attach(audio, owned, { owned: true });

    audio.dispose();

    expect(owned.live).toBe(false);
    expect(owned.tracks.every((t) => t.stopCalls === 1)).toBe(true);
  });

  it('treats the microphone as owned', async () => {
    const microphone = new FakeMediaStream();
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: { getUserMedia: async () => microphone },
    });
    const audio = new KwamiAudio();

    await audio.startMicrophoneListening();
    audio.stopMicrophoneListening();

    expect(microphone.live).toBe(false);
    vi.unstubAllGlobals();
  });

  it('forgets ownership when a stream is swapped for a borrowed one', async () => {
    const audio = new KwamiAudio();
    const owned = new FakeMediaStream();
    const borrowed = new FakeMediaStream();

    await attach(audio, owned, { owned: true });
    audio.disconnectMediaStream();
    await attach(audio, borrowed);
    audio.dispose();

    expect(borrowed.live).toBe(true);
  });

  it('detaches a borrowed stream from the graph even though it does not stop it', async () => {
    const audio = new KwamiAudio();
    const borrowed = new FakeMediaStream();
    await attach(audio, borrowed);

    audio.dispose();

    expect(audio.isStreamConnected()).toBe(false);
  });
});

/** Whether audio fed into `from` comes out of `to`, following the fake graph's edges. */
function reaches(from: FakeAudioNode, to: FakeAudioNode, seen = new Set<FakeAudioNode>()): boolean {
  if (from === to) return true;
  if (seen.has(from)) return false;
  seen.add(from);
  return from.connected.some((next) => reaches(next, to, seen));
}

/** The graph's private ends, read the way the browser would hear them. */
function graphOf(audio: KwamiAudio) {
  const internals = audio as unknown as {
    sourceNode: FakeAudioNode;
    streamSource: FakeAudioNode | null;
  };
  return {
    speakers: FakeAudioContext.instances.at(-1)!.destination,
    element: internals.sourceNode,
    stream: internals.streamSource,
    analyser: audio.getAnalyser() as unknown as FakeAudioNode,
  };
}

describe('KwamiAudio playback routing', () => {
  /**
   * Defends the "two voices, slightly delayed, metallic" echo heard on kwami.io. The agent's
   * voice is already audible through the <audio> element LiveKit attaches. The constructor
   * builds the element graph, which used to end `analyser -> destination`; `connectMediaStream()`
   * then fed the agent's track into that same analyser, so the voice came out of the speakers a
   * second time through the AudioContext, a few milliseconds behind the element.
   */
  it('never sends a connected stream to the speakers', async () => {
    const audio = new KwamiAudio();
    await attach(audio, new FakeMediaStream());
    const graph = graphOf(audio);

    expect(reaches(graph.stream!, graph.speakers)).toBe(false);
    // ...while the avatar can still see it.
    expect(reaches(graph.stream!, graph.analyser)).toBe(true);
  });

  it('keeps the stream off the speakers when a filter rebuilds the graph', async () => {
    const audio = new KwamiAudio();
    await attach(audio, new FakeMediaStream());
    audio.enableHighpassFilter();
    audio.enableLowpassFilter();
    audio.disableHighpassFilter();
    const graph = graphOf(audio);

    expect(reaches(graph.stream!, graph.speakers)).toBe(false);
  });

  it('still plays music from the element, filtered, and still visualizes it', () => {
    const audio = new KwamiAudio();
    audio.enableLowpassFilter();
    const graph = graphOf(audio);

    expect(reaches(graph.element, graph.speakers)).toBe(true);
    expect(reaches(graph.element, graph.analyser)).toBe(true);
  });
});

describe('KwamiAudio disposal', () => {
  it('closes the AudioContext and releases it', () => {
    const audio = new KwamiAudio();
    const context = FakeAudioContext.instances.at(-1);

    audio.dispose();

    expect(context?.closeCalls).toBe(1);
    expect(audio.getAudioContext()).toBeNull();
  });

  it('is safe to call twice', () => {
    const audio = new KwamiAudio();

    audio.dispose();

    expect(() => audio.dispose()).not.toThrow();
  });
});
