<template>
  <div
    v-if="ui.videoGrid.show"
    class="absolute inset-0 h-screen min-w-screen w-full overflow-hidden bg-black"
  >
    <!-- Enhanced skeleton grid -->
    <!-- <LayoutBgSkeletonGrid
      v-if="showSkeleton"
      :num-columns="ui.videoGrid.numColumns"
      :item-padding="ui.videoGrid.itemPadding"
      :border-radius="ui.videoGrid.borderRadius"
      :border-width="ui.videoGrid.borderWidth"
      :phone-width="ui.videoGrid.phoneWidth"
      :phone-height="ui.videoGrid.phoneHeight"
      :opacity="skeletonOpacity"
      :animate="ui.videoGrid.animate"
      :screens-per-column="ui.videoGrid.screensPerColumn"
      :column-positions="columnPositions"
      :column-durations="columnDurations"
      class="transition-opacity duration-500 ease-out"
    /> -->

    <!-- Video grid with smooth transition -->
    <Transition
      name="video-grid"
      appear
    >
      <div
        v-if="!showSkeleton"
        ref="columnsWrapper"
        class="flex flex-wrap h-full w-full overflow-hidden"
        :style="gridWrapperStyles"
      >
        <template
          v-for="(column, colIndex) in columnsData"
          :key="colIndex"
        >
          <div class="video-column relative h-full min-w-0 overflow-hidden" :style="getFlexColumnStyle()">
            <div
              class="scrolling-content flex flex-col"
              :class="ui.videoGrid.animate ? column.animationClass : ''"
              :style="getColumnStyle(colIndex, column)"
            >
              <template
                v-for="videoItem in column.videos"
                :key="videoItem.uniqueId"
              >
                <div
                  class="video-item relative w-full shrink-0 overflow-hidden"
                  :class="ui.videoGrid.borderWidth
                    && 'border-white10 dark:border-white10'"
                  :style="getVideoWrapperStyle"
                  @mouseenter="onVideoMouseEnter"
                  @mouseleave="onVideoMouseLeave"
                >
                  <div class="relative h-full w-full">
                    <USkeleton
                      v-if="isLoading || !thumbLoadedStates[videoItem.uniqueId]"
                      class="absolute inset-0"
                      :style="{ borderRadius: `${ui.videoGrid.borderRadius}px` }"
                    />
                    <NuxtImg
                      :src="videoItem.thumbnail"
                      loading="lazy"
                      class="absolute inset-0 h-full w-full object-cover
                          transition-opacity duration-500"
                      :style="getThumbStyle(videoItem.uniqueId)"
                      @load="markThumbLoaded(videoItem.uniqueId)"
                    />
                    <video
                      muted
                      loop
                      playsinline
                      preload="none"
                      :data-src="videoItem.src"
                      :poster="videoItem.thumbnail"
                      class="absolute inset-0 h-full w-full object-cover
                          transition-opacity duration-500"
                      :style="getVideoStyle(videoItem.uniqueId)"
                      @loadeddata="markVideoLoaded(videoItem.uniqueId)"
                      @error="onVideoError(videoItem.src, $event)"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </Transition>
    <div
      v-if="!ui.videoGrid.animate"
      class="absolute inset-0 z-[-1] flex items-center justify-center bg-black/10"
    >
      <p class="text-white/70">
        {{ $t('info.no_videos_available') }}
      </p>
    </div>
    <div
      v-if="$slots.default"
      class="content-overlay pointer-events-none absolute inset-0
        z-50 flex h-full w-full items-center justify-center"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface BackendVideo {
  platform: string;
  code: string;
  src: string;
  thumbnail: string;
}
interface VideoItem {
  id: string;
  uniqueId: string;
  src: string;
  thumbnail: string;
}
interface ColumnData {
  videos: VideoItem[];
  animationClass: string;
  animationDuration: number;
}

const { ui, auth } = useStore();

const columnsWrapper = ref<HTMLDivElement | null>(null);
const phoneVideoItemHeightPx = ref(250);
const columnPositions = ref<Record<number, number>>({});
const columnDurations = ref<Record<number, number>>({});
const columnsData = ref<ColumnData[]>([]);
const thumbLoadedStates = ref<Record<string, boolean>>({});
const videoLoadedStates = ref<Record<string, boolean>>({});
const isLoading = ref(true);
const showSkeleton = ref(true);
// const skeletonOpacity = ref(1);

let uidCounter = 0;

const { data: allVideos, error: err, pending } = useLazyFetch<BackendVideo[]>(
  '/api/app/assets/video-grid',
  {
    headers: { Authorization: `Bearer ${auth.token.accessToken}` },
    server: false,
  },
);
watch(err, e => e && (ui.videoGrid.show = false));

/* IntersectionObserver for lazy loading */
let io: IntersectionObserver | null = null;
const setupObserver = () => {
  if (!columnsWrapper.value) return;
  io?.disconnect();
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (!ent.isIntersecting) return;
        const v = ent.target as HTMLVideoElement;
        if (!v.src && v.dataset.src) {
          v.src = v.dataset.src;
          v.load();
        }
        io?.unobserve(v);
      });
    },
    { root: columnsWrapper.value, rootMargin: '400px' },
  );

  nextTick(() => {
    columnsWrapper.value!
      .querySelectorAll<HTMLVideoElement>('video[data-src]:not([src])')
      .forEach(v => io!.observe(v));
  });
};
onBeforeUnmount(() => io?.disconnect());

/* Grid layout */
const makeItem = (v: BackendVideo, c: number, r: number): VideoItem => {
  return {
    id: `c${c}-r${r}-${v.src.slice(-8)}`,
    uniqueId: `vid-${c}-${r}-${uidCounter++}`,
    src: v.src,
    thumbnail: v.thumbnail,
  };
};

const layout = () => {
  if (
    !columnsWrapper.value
    || !allVideos.value?.length
    || ui.videoGrid.numColumns <= 0
  ) {
    columnsData.value = [];
    return;
  }

  const { offsetWidth: ww, offsetHeight: wh } = columnsWrapper.value;
  const colW = ww / ui.videoGrid.numColumns;
  const innerH
    = ((colW / ui.videoGrid.phoneWidth) * ui.videoGrid.phoneHeight);

  phoneVideoItemHeightPx.value = innerH;

  const perScreen = Math.ceil(wh / phoneVideoItemHeightPx.value);
  const perSet = Math.max(2, Math.ceil(perScreen * ui.videoGrid.screensPerColumn * 2));

  const minDur = ui.videoGrid.scrollDurationSec * 0.3;
  const maxDur = ui.videoGrid.scrollDurationSec;

  const cols: ColumnData[] = [];
  const thumb: Record<string, boolean> = {};
  const vid: Record<string, boolean> = {};
  columnPositions.value = {};
  columnDurations.value = {};
  uidCounter = 0;

  let idx = 0;
  for (let c = 0; c < ui.videoGrid.numColumns; c++) {
    const items: VideoItem[] = [];
    for (let r = 0; r < perSet; r++) {
      const it = makeItem(allVideos.value[idx % allVideos.value.length], c, r);
      items.push(it);
      thumb[it.uniqueId] = false;
      vid[it.uniqueId] = false;
      idx++;
    }
    const dup = items.map(v => ({ ...v, uniqueId: `${v.uniqueId}-d` }));
    dup.forEach((d) => {
      thumb[d.uniqueId] = false;
      vid[d.uniqueId] = false;
    });

    const duration = Math.random() * (maxDur - minDur) + minDur;
    columnDurations.value[c] = duration;
    columnPositions.value[c] = Math.random() * -350;

    cols.push({
      videos: [...items, ...dup],
      animationClass: c % 2 ? 'animate-scroll-down' : 'animate-scroll-up',
      animationDuration: duration,
    });
  }

  columnsData.value = cols;
  thumbLoadedStates.value = thumb;
  videoLoadedStates.value = vid;
  isLoading.value = false;

  setupObserver();
};

/* Helpers */
const gridWrapperStyles = computed(() => ({
  opacity: ui.videoGrid.opacity,
  gap: `${ui.videoGrid.itemPadding}px`,
}));

const getFlexColumnStyle = () => {
  const columnWidth = `calc((100% - ${(ui.videoGrid.numColumns - 1) * ui.videoGrid.itemPadding}px) / ${ui.videoGrid.numColumns})`;
  return {
    width: columnWidth,
    flexShrink: 0,
  };
};

const getColumnStyle = (colIndex: number, column: ColumnData) => {
  return {
    animationDuration: ui.videoGrid.animate ? `${column.animationDuration}s` : '0s',
    transform: `translateY(${columnPositions.value[colIndex] ?? 0}px)`,
    gap: `${ui.videoGrid.itemPadding}px`,
  };
};

const getVideoWrapperStyle = computed(() => ({
  height: `${phoneVideoItemHeightPx.value}px`,
  borderRadius: `${ui.videoGrid.borderRadius}px`,
  borderWidth: `${ui.videoGrid.borderWidth}px`,
  borderStyle: ui.videoGrid.borderWidth ? 'solid' : 'none',
}));

const getThumbStyle = (id: string) => {
  return {
    opacity: videoLoadedStates.value[id] ? 0 : 1,
    borderRadius: `${ui.videoGrid.borderRadius}px`,
  };
};
const getVideoStyle = (id: string) => {
  return {
    opacity: videoLoadedStates.value[id] ? 1 : 0,
    borderRadius: `${ui.videoGrid.borderRadius}px`,
  };
};

const markThumbLoaded = (id: string) => {
  thumbLoadedStates.value[id] = true;
};
const markVideoLoaded = (id: string) => {
  videoLoadedStates.value[id] = true;
};

const onVideoMouseEnter = (e: MouseEvent) => {
  const box = e.currentTarget as HTMLElement;
  box.parentElement!.style.animationPlayState = 'paused';
  const v = box.querySelector('video')!;
  if (!v.src && v.dataset.src) {
    v.src = v.dataset.src;
    v.load();
  }
  v.play().catch(() => {});
};
const onVideoMouseLeave = (e: MouseEvent) => {
  const box = e.currentTarget as HTMLElement;
  box.parentElement!.style.animationPlayState = 'running';
  box.querySelector('video')!.pause();
};

const onVideoError = (src: string, e: Event) => {
  console.error('Video error:', src, e);
};

/* Lifecycle */
onMounted(() => {
  nextTick(layout);
  window.addEventListener('resize', layout);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', layout);
});

watchEffect(() => {
  if (!pending.value && allVideos.value) {
    // Videos are ready, hide skeleton to mount the real grid
    showSkeleton.value = false;
  }
});

// When skeleton is hidden and grid is mounted, compute layout
watch(showSkeleton, (val) => {
  if (!val) {
    // Wait for DOM to render columnsWrapper
    nextTick(() => {
      isLoading.value = true;
      layout();
      isLoading.value = false;
    });
  }
});

watch(
  () => [
    ui.videoGrid.numColumns,
    ui.videoGrid.phoneWidth,
    ui.videoGrid.phoneHeight,
    ui.videoGrid.screensPerColumn,
    ui.videoGrid.itemPadding,
    ui.videoGrid.borderRadius,
    ui.videoGrid.scrollDurationSec,
  ],
  layout,
);
</script>

<style scoped>
.video-column .scrolling-content {
  will-change: transform;
}

.animate-scroll-up {
  animation: scrollUp linear infinite;
}

.animate-scroll-down {
  animation: scrollDown linear infinite;
}

@keyframes scrollUp {
  from {
    transform: translateY(0%);
  }
  to {
    transform: translateY(-50%);
  }
}

@keyframes scrollDown {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0%);
  }
}

.video-item > * {
  pointer-events: none;
}

.content-overlay > * {
  pointer-events: auto;
}

/* Elegant skeleton-to-video grid transition */
.video-grid-enter-active {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.video-grid-leave-active {
  transition: all 0.4s ease-in;
}

.video-grid-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.video-grid-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
