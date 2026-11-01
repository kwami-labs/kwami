import { describe, expect, it, vi } from 'vitest';
import { Mesh, MeshBasicMaterial, type BufferAttribute, type BufferGeometry } from 'three';
import { createBlobXyzGeometry } from '../../src/avatar/renderers/blob-xyz/geometry';
import {
  computeVertexNormalsInto,
  displaceVertices,
  restDirectionsFrom,
  type DisplacementFrame,
  type Noise3D,
} from '../../src/avatar/renderers/blob-xyz/displacement';
import {
  createDisplacementHandler,
  type DisplacementMessage,
} from '../../src/avatar/renderers/blob-xyz/displacementProtocol';
import {
  BlobDisplacementWorker,
  type DisplacementWorkerLike,
} from '../../src/avatar/renderers/blob-xyz/displacementWorker';

/**
 * The blob re-shapes its surface in a Web Worker by default. These pin that the worker path
 * draws the same blob the main thread would, and that the main-thread client around it paces,
 * recycles and falls back correctly — all without a real Worker or a GL context.
 */

/** Deterministic stand-in for simplex noise: smooth, bounded, the same on both paths. */
const noise: Noise3D = (x, y, z) => Math.sin(x * 1.7 + y * 0.9) * Math.cos(z * 1.3 - x * 0.4);

function frame(overrides: Partial<DisplacementFrame> = {}): DisplacementFrame {
  return {
    tX: 0.4,
    tY: 0.7,
    tZ: 1.1,
    freqX: 3.1,
    freqY: 3.6,
    freqZ: 2.8,
    ampX: 0.95,
    ampY: 1,
    ampZ: 0.88,
    audioPush: 0,
    audioFreqBoost: 1,
    audioActive: false,
    responseSpeed: 0.65,
    listeningBlend: 0,
    thinkingBlend: 0,
    thinkingProgress: 0,
    touches: [],
    liquidVX: 0,
    liquidVY: 0,
    liquidStretch: 0.6,
    ...overrides,
  };
}

function blobMesh(segments = 24): Mesh {
  return new Mesh(createBlobXyzGeometry(segments), new MeshBasicMaterial());
}

/** Run the worker's handler in-process, the way the real worker entry does. */
function runWorkerFrame(geometry: BufferGeometry, frames: DisplacementFrame[]) {
  const handle = createDisplacementHandler(noise);
  const rest = Float32Array.from(geometry.attributes.position!.array as ArrayLike<number>);
  const index = Uint32Array.from(geometry.index!.array as ArrayLike<number>);
  handle({ type: 'init', generation: 1, positions: rest, index });
  let out: { positions: Float32Array; normals: Float32Array } = {
    positions: new Float32Array(rest.length),
    normals: new Float32Array(rest.length),
  };
  for (const f of frames) {
    const reply = handle({ type: 'frame', generation: 1, frame: f, ...out })!;
    expect(reply.message.stale).toBe(false);
    out = { positions: reply.message.positions, normals: reply.message.normals };
  }
  return out;
}

describe('displacement worker path', () => {
  it('draws the same surface and normals as the main thread does', () => {
    const frames = [
      frame(),
      frame({ tX: 0.45, audioPush: 0.8, audioFreqBoost: 2.2, audioActive: true }),
    ];

    // Main-thread reference: the kernel on the geometry's own arrays, then three's normals.
    const main = blobMesh();
    const position = main.geometry.attributes.position!;
    const rest = restDirectionsFrom(position.array as Float32Array);
    const previous = new Float32Array(position.count).fill(1);
    for (const f of frames)
      displaceVertices(f, rest, previous, position.array as Float32Array, noise);
    main.geometry.computeVertexNormals();

    const worker = runWorkerFrame(blobMesh().geometry, frames);

    expect(Array.from(worker.positions)).toEqual(Array.from(position.array as Float32Array));
    const reference = main.geometry.attributes.normal!.array as Float32Array;
    let worst = 0;
    for (let i = 0; i < reference.length; i++)
      worst = Math.max(worst, Math.abs((worker.normals[i] ?? 0) - (reference[i] ?? 0)));
    expect(worst).toBeLessThan(1e-5);
  });

  it('keeps the per-vertex smoothing between frames, so the surface eases instead of jumping', () => {
    const geometry = blobMesh().geometry;
    const one = runWorkerFrame(geometry, [
      frame({ audioPush: 2, audioFreqBoost: 4, audioActive: true }),
    ]);
    const two = runWorkerFrame(geometry, [
      frame({ audioPush: 2, audioFreqBoost: 4, audioActive: true }),
      frame({ audioPush: 2, audioFreqBoost: 4, audioActive: true }),
    ]);
    const radius = (p: Float32Array, i: number) =>
      Math.hypot(p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!);
    // The same target twice: the second frame moves further toward it than the first did.
    let further = 0;
    for (let i = 0; i < one.positions.length / 3; i++) {
      if (Math.abs(radius(two.positions, i) - 1) > Math.abs(radius(one.positions, i) - 1))
        further++;
    }
    expect(further).toBeGreaterThan(one.positions.length / 3 / 2);
  });

  it('marks a frame for a superseded geometry stale and hands its buffers back untouched', () => {
    const handle = createDisplacementHandler(noise);
    const geometry = blobMesh(12).geometry;
    const rest = Float32Array.from(geometry.attributes.position!.array as ArrayLike<number>);
    handle({ type: 'init', generation: 2, positions: rest, index: null });
    const positions = new Float32Array(rest.length).fill(7);
    const reply = handle({
      type: 'frame',
      generation: 1,
      frame: frame(),
      positions,
      normals: new Float32Array(rest.length),
    })!;
    expect(reply.message.stale).toBe(true);
    expect(reply.message.positions).toBe(positions);
    expect(positions[0]).toBe(7);
  });
});

describe('computeVertexNormalsInto', () => {
  it("matches three on the blob's merged sphere, displaced", () => {
    const mesh = blobMesh(32);
    const position = mesh.geometry.attributes.position!;
    const arr = position.array as Float32Array;
    for (let i = 0; i < position.count; i++) {
      const k = 1 + 0.2 * Math.sin(i * 0.37);
      arr[i * 3]! *= k;
      arr[i * 3 + 1]! *= k;
      arr[i * 3 + 2]! *= k;
    }
    mesh.geometry.computeVertexNormals();
    const ours = new Float32Array(arr.length);
    computeVertexNormalsInto(arr, mesh.geometry.index!.array, ours);
    const theirs = mesh.geometry.attributes.normal!.array as Float32Array;
    for (let i = 0; i < ours.length; i++) expect(ours[i]).toBeCloseTo(theirs[i]!, 5);
  });
});

/** An in-process Worker: runs the real handler and answers on a microtask, like a real one. */
class FakeWorker implements DisplacementWorkerLike {
  posted: DisplacementMessage[] = [];
  terminated = false;
  private listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
  private handle = createDisplacementHandler(noise);
  auto = true;
  private queue: Array<() => void> = [];

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    (this.listeners[type] ??= []).push(listener);
  }
  postMessage(message: unknown): void {
    const msg = message as DisplacementMessage;
    this.posted.push(msg);
    const reply = this.handle(msg);
    if (!reply) return;
    const deliver = () =>
      this.listeners.message?.forEach((l) => l({ data: reply.message } as MessageEvent));
    if (this.auto) queueMicrotask(deliver);
    else this.queue.push(deliver);
  }
  flush(): void {
    const q = this.queue.splice(0);
    q.forEach((d) => d());
  }
  emit(type: 'error'): void {
    this.listeners[type]?.forEach((l) => l({} as MessageEvent));
  }
  terminate(): void {
    this.terminated = true;
  }
}

const tick = () => new Promise<void>((r) => queueMicrotask(r));

describe('BlobDisplacementWorker', () => {
  it('sends the rest pose once, then writes each result into the geometry', async () => {
    const mesh = blobMesh(16);
    const fake = new FakeWorker();
    const client = new BlobDisplacementWorker(mesh, fake);
    const position = mesh.geometry.attributes.position as BufferAttribute;
    const before = Float32Array.from(position.array as Float32Array);
    const version = position.version;

    client.submit(frame());
    await tick();

    expect(fake.posted.map((m) => m.type)).toEqual(['init', 'frame']);
    expect(position.version).toBeGreaterThan(version);
    expect(Array.from(position.array as Float32Array)).not.toEqual(Array.from(before));
    expect((mesh.geometry.attributes.normal as BufferAttribute).version).toBeGreaterThan(0);
  });

  it('keeps one frame in flight: a frame that comes up while the worker is busy is skipped', async () => {
    const mesh = blobMesh(16);
    const fake = new FakeWorker();
    fake.auto = false;
    const client = new BlobDisplacementWorker(mesh, fake);
    client.submit(frame());
    client.submit(frame());
    client.submit(frame());
    expect(fake.posted.filter((m) => m.type === 'frame')).toHaveLength(1);
    fake.flush();
    client.submit(frame());
    expect(fake.posted.filter((m) => m.type === 'frame')).toHaveLength(2);
  });

  it('recycles the transferred buffers instead of allocating new ones every frame', async () => {
    const mesh = blobMesh(16);
    const fake = new FakeWorker();
    const client = new BlobDisplacementWorker(mesh, fake);
    client.submit(frame());
    await tick();
    client.submit(frame());
    const frames = fake.posted.filter(
      (m): m is Extract<DisplacementMessage, { type: 'frame' }> => m.type === 'frame',
    );
    expect(frames[1]!.positions).toBe(frames[0]!.positions);
  });

  it('re-inits on a mesh-detail change and never writes an old frame into the new geometry', async () => {
    const mesh = blobMesh(16);
    const fake = new FakeWorker();
    fake.auto = false;
    const client = new BlobDisplacementWorker(mesh, fake);
    client.submit(frame()); // init(gen 1) + frame(gen 1), reply held back

    mesh.geometry = createBlobXyzGeometry(20); // setResolution swaps the geometry like this
    const fresh = mesh.geometry.attributes.position!;
    const untouched = Float32Array.from(fresh.array as Float32Array);
    client.submit(frame()); // re-inits (gen 2); the gen-1 frame is still in flight, so no frame yet

    fake.flush(); // the old frame lands
    expect(Array.from(fresh.array as Float32Array)).toEqual(Array.from(untouched));

    client.submit(frame()); // now a gen-2 frame goes out
    const inits = fake.posted.filter((m) => m.type === 'init');
    expect(inits.map((m) => m.generation)).toEqual([1, 2]);
    fake.flush();
    expect(Array.from(fresh.array as Float32Array)).not.toEqual(Array.from(untouched));
  });

  it('steps aside on a worker error, so BlobXyz displaces on the main thread again', () => {
    const mesh = blobMesh(12);
    const fake = new FakeWorker();
    const client = new BlobDisplacementWorker(mesh, fake);
    expect(client.active).toBe(true);
    fake.emit('error');
    expect(client.active).toBe(false);
    expect(fake.terminated).toBe(true);
    client.submit(frame()); // a no-op now, not a throw
  });

  it('is not created where there is no Worker, or where starting one throws (CSP)', () => {
    const mesh = blobMesh(12);
    vi.stubGlobal('Worker', undefined);
    expect(BlobDisplacementWorker.create(mesh, () => new FakeWorker())).toBeNull();
    vi.unstubAllGlobals();
    vi.stubGlobal('Worker', class {});
    expect(
      BlobDisplacementWorker.create(mesh, () => {
        throw new Error('blocked by CSP');
      }),
    ).toBeNull();
    vi.unstubAllGlobals();
  });
});
