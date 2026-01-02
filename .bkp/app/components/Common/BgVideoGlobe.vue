<template>
  <ClientOnly>
    <div
      v-show="props.show"
      class="fixed inset-0 z-0 pointer-events-none select-none bg-black"
      aria-hidden="true"
    >
      <div
        ref="host"
        class="absolute inset-0"
      />
      <!-- subtle vignette to match screenshot -->
      <div
        class="absolute inset-0"
        :style="vignetteStyle"
      />
      <slot />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core';
/*
  LayoutBgVideoGlobe.vue
  - Renders a 3D sphere using Three.js.
  - Texture is a canvas "atlas" composed of rounded-rect tiles.
  - Each tile starts with the thumbnail; tiles in the facing band lazily
    upgrade to playing <video> with a smooth fade-in.
  - The globe rotates slowly to the right at a constant speed.
*/

interface BackendVideo {
  platform: string;
  code: string;
  src: string;
  thumbnail: string;
}

const props = withDefaults(defineProps<{
  show?: boolean; // force visibility independent from ui.videoGrid.show
  speed?: number; // radians per second
  activeBandColumns?: number; // number of columns on each side of center considered active
}>(), {
  show: true,
  speed: 0.25, // ~0.25 rad/s ~ 14 deg/s (gentle)
  activeBandColumns: 2,
});

const { ui, auth } = useStore();

// DOM refs
const host = ref<HTMLDivElement | null>(null);

// Style overlay
const vignetteStyle = computed(() => ({
  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 100%)',
  mixBlendMode: 'normal',
}));

// ------- Three.js (dynamically imported on client) -------
let THREE: any;
let renderer: any; // THREE.WebGLRenderer
let scene: any; // THREE.Scene
let camera: any; // THREE.PerspectiveCamera
let mesh: any; // THREE.Mesh
let texture: any; // THREE.CanvasTexture
let geometry: any; // THREE.SphereGeometry
let material: any; // THREE.MeshBasicMaterial
let rafId: number | null = null;

// ------- Texture atlas (offscreen canvas) -------
let atlasCanvas: HTMLCanvasElement | null = null;
let atlasCtx: CanvasRenderingContext2D | null = null;

// Tiles metadata
interface TileMeta {
  idx: number; // asset index
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  img?: HTMLImageElement;
  video?: HTMLVideoElement;
  videoReady?: boolean;
  fade: number; // 0..1 fade-in opacity for video
}

const tiles: TileMeta[] = [];
let numRows = 0;
let numCols = 0;
let tileW = 180; // will be computed in layout
let tileH = 280;
let pad = 24;
let borderRadius = 16;
let borderWidth = 1;

const MAX_ACTIVE_VIDEOS = 18; // perf cap
let lastDrawAt = 0;

// Data
const { data: allVideos, pending, error } = useLazyFetch<BackendVideo[]>(
  '/api/app/assets/video-grid',
  {
    headers: { Authorization: `Bearer ${auth.token.accessToken}` },
    server: false,
  },
);

watch(error, e => e && console.error('BgVideoGlobe error fetching videos', e));

// ------------ Helpers ---------------
const computeLayout = (assets: BackendVideo[]) => {
  if (!assets.length) return;

  numCols = Math.max(5, ui.videoGrid.numColumns || 7);
  // choose rows similar to screenshot (dense bands)
  numRows = 8;

  // Derive tile size from viewport and config ratio
  const vw = window.innerWidth;
  const ratio = (ui.videoGrid.phoneHeight || 14) / (ui.videoGrid.phoneWidth || 9);
  pad = Math.max(8, Math.min(40, ui.videoGrid.itemPadding || 24));
  borderRadius = Math.max(0, ui.videoGrid.borderRadius || 16);
  borderWidth = Math.max(0, ui.videoGrid.borderWidth || 1);

  tileW = Math.round(
    Math.max(120, Math.min(220, vw / (numCols + 3))),
  );
  tileH = Math.round(tileW * ratio);

  const atlasW = numCols * (tileW + pad) + pad;
  const atlasH = numRows * (tileH + pad) + pad;

  atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = atlasW;
  atlasCanvas.height = atlasH;
  atlasCtx = atlasCanvas.getContext('2d', { willReadFrequently: false });

  tiles.length = 0;
  const totalNeeded = numCols * numRows;
  for (let i = 0; i < totalNeeded; i++) {
    const row = Math.floor(i / numCols);
    const col = i % numCols;
    const x = pad + col * (tileW + pad);
    const y = pad + row * (tileH + pad);
    tiles.push({ idx: i % assets.length, row, col, x, y, w: tileW, h: tileH, fade: 0 });
  }
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
};

const drawAtlas = (now: number) => {
  if (!atlasCtx || !atlasCanvas || !allVideos.value?.length) return;
  // Throttle to ~30 FPS for atlas updates
  if (now - lastDrawAt < 33) return;
  lastDrawAt = now;

  atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

  for (const t of tiles) {
    const asset = allVideos.value![t.idx];

    // CommonBackground mask
    roundRect(atlasCtx, t.x, t.y, t.w, t.h, borderRadius);
    atlasCtx.save();
    atlasCtx.clip();

    // Draw thumbnail
    if (!t.img) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.src = asset.thumbnail;
      img.onload = () => { /* next frame will draw */ };
      t.img = img;
    }

    if (t.img && (t.img.complete || (t.img as any).naturalWidth > 0)) {
      atlasCtx.drawImage(t.img, t.x, t.y, t.w, t.h);
    } else {
      atlasCtx.fillStyle = '#111827';
      atlasCtx.fillRect(t.x, t.y, t.w, t.h);
    }

    // Draw video over it with fade
    if (t.video && t.videoReady) {
      atlasCtx.globalAlpha = Math.min(1, t.fade);
      try {
        atlasCtx.drawImage(t.video, t.x, t.y, t.w, t.h);
      } catch {}
      atlasCtx.globalAlpha = 1;
      if (t.fade < 1) t.fade = Math.min(1, t.fade + 0.08);
    }

    atlasCtx.restore();

    // Subtle border
    if (borderWidth > 0) {
      atlasCtx.strokeStyle = 'rgba(255,255,255,0.12)';
      atlasCtx.lineWidth = borderWidth;
      roundRect(atlasCtx, t.x + borderWidth / 2, t.y + borderWidth / 2, t.w - borderWidth, t.h - borderWidth, Math.max(0, borderRadius - borderWidth / 2));
      atlasCtx.stroke();
    }
  }

  if (texture) {
    // Ensure updates are visible even when the same size
    texture.needsUpdate = true;
  }
};

const activeSet = new Set<TileMeta>();

const updateActiveTiles = () => {
  if (!mesh || !tiles.length) return;

  // Map current yaw to a center column (texture is wrapped horizontally)
  // Use negative yaw to align perceived rightward rotation with increasing columns
  const yaw = ((-mesh.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const colAngle = (Math.PI * 2) / numCols;
  let centerCol = Math.round(yaw / colAngle) % numCols;
  if (centerCol < 0) centerCol += numCols;

  // Desired active columns band
  const desiredCols = new Set<number>();
  for (let d = -props.activeBandColumns; d <= props.activeBandColumns; d++) {
    let c = (centerCol + d) % numCols;
    if (c < 0) c += numCols;
    desiredCols.add(c);
  }

  // Promote candidates by closeness to center until cap
  const candidates = tiles.filter(t => desiredCols.has(t.col));
  candidates.sort((a, b) => {
    const da = Math.min(Math.abs(a.col - centerCol), numCols - Math.abs(a.col - centerCol));
    const db = Math.min(Math.abs(b.col - centerCol), numCols - Math.abs(b.col - centerCol));
    return da - db;
  });

  // Count currently playing
  let playing = Array.from(activeSet).length;

  for (const t of candidates) {
    if (playing >= MAX_ACTIVE_VIDEOS) break;
    if (!activeSet.has(t)) {
      promoteToVideo(t);
      activeSet.add(t);
      playing++;
    }
  }

  // Demote tiles not in desired band
  for (const t of Array.from(activeSet)) {
    if (!desiredCols.has(t.col)) {
      demoteFromVideo(t);
      activeSet.delete(t);
    }
  }
};

const promoteToVideo = (t: TileMeta) => {
  if (!allVideos.value) return;
  if (t.video) return;
  const asset = allVideos.value[t.idx];
  const v = document.createElement('video');
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'auto';
  v.crossOrigin = 'anonymous';
  v.src = asset.src; // set on promotion
  try { v.load(); } catch {}

  const markReady = () => {
    t.videoReady = true;
    t.fade = 0;
    v.play().catch(() => {});
  };
  v.addEventListener('loadeddata', markReady, { once: true });
  v.addEventListener('canplay', markReady, { once: true });

  // If supported, redraw on each new frame
  // This ensures motion even if throttle is active
  (v as any).requestVideoFrameCallback?.(() => {
    drawAtlas(performance.now());
  });

  t.video = v;
};

const demoteFromVideo = (t: TileMeta) => {
  if (t.video) {
    try { t.video.pause(); } catch {}
    try { t.video.src = ''; t.video.load(); } catch {}
  }
  t.video = undefined;
  t.videoReady = false;
  t.fade = 0;
};

const buildThree = async () => {
  if (!host.value) return;
  THREE = await import('three');

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  host.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 22;

  geometry = new THREE.SphereGeometry(10, 96, 64);
  texture = new THREE.CanvasTexture(atlasCanvas!);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping; // wrap horizontally across 360°
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (renderer.capabilities.getMaxAnisotropy) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: ui.videoGrid.opacity });
  mesh = new THREE.Mesh(geometry, material);
  // Rotate so portrait tiles stand upright visually
  mesh.rotation.z = -Math.PI / 2;
  scene.add(mesh);
};

const onResize = () => {
  if (!renderer || !camera) return;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

const animate = (time: number) => {
  // Rotate to the right at constant speed
  if (mesh) mesh.rotation.y += props.speed * 0.016; // approx per-frame increment ~60fps baseline

  updateActiveTiles();
  drawAtlas(time);

  renderer.render(scene, camera);
  rafId = requestAnimationFrame(animate);
};

onMounted(async () => {
  // Wait for videos to be available
  await until(pending).toBe(false);
  if (!allVideos.value?.length) return;

  computeLayout(allVideos.value);
  await buildThree();

  // Prime initial draw
  drawAtlas(performance.now());

  window.addEventListener('resize', onResize);

  // Reactivity: opacity
  watch(() => ui.videoGrid.opacity, (op) => {
    if (material) material.opacity = op;
  });

  // Start loop
  rafId = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  if (rafId) cancelAnimationFrame(rafId);
  // Cleanup videos
  for (const t of tiles) demoteFromVideo(t);
  // Dispose three
  try { geometry?.dispose?.(); } catch {}
  try { material?.dispose?.(); } catch {}
  try { texture?.dispose?.(); } catch {}
  try { renderer?.dispose?.(); } catch {}
});
</script>

<style scoped>
/* Ensure canvas fills container */
:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
