<template>
  <div class="absolute inset-0 h-screen min-w-screen w-full overflow-hidden bg-black">
    <div
      ref="columnsWrapper"
      class="flex flex-wrap h-full w-full overflow-hidden"
      :style="gridWrapperStyles"
    >
      <template
        v-for="(col, colIndex) in numColumns"
        :key="col"
      >
        <div class="video-column relative h-full min-w-0 overflow-hidden" :style="getFlexColumnStyle()">
          <div
            class="scrolling-content flex flex-col"
            :class="colIndex % 2 ? 'animate-scroll-down' : 'animate-scroll-up'"
            :style="getColumnStyle(colIndex)"
          >
            <template
              v-for="item in itemsPerColumn"
              :key="item"
            >
              <div
                class="video-item relative w-full shrink-0 overflow-hidden
                bg-black10 dark:bg-white10 animate-pulse"
                :style="getVideoWrapperStyle"
              />
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  numColumns: number;
  itemPadding: number;
  borderRadius: number;
  borderWidth: number;
  phoneWidth: number;
  phoneHeight: number;
  opacity: number;
  animate: boolean;
  screensPerColumn: number;
  columnPositions: Record<number, number>;
  columnDurations: Record<number, number>;
}>();

const columnsWrapper = ref<HTMLDivElement | null>(null);
const itemsPerColumn = ref(6);

const phoneVideoItemHeightPx = computed(() => {
  if (!columnsWrapper.value) return 250;
  const { offsetWidth: ww } = columnsWrapper.value;
  const colW = ww / props.numColumns;
  return (colW / props.phoneWidth) * props.phoneHeight;
});

const gridWrapperStyles = computed(() => ({
  opacity: props.opacity,
  gap: `${props.itemPadding}px`,
}));

const getFlexColumnStyle = () => {
  const columnWidth = `calc((100% - ${(props.numColumns - 1) * props.itemPadding}px) / ${props.numColumns})`;
  return {
    width: columnWidth,
    flexShrink: 0,
  };
};

const getColumnStyle = (colIndex: number) => {
  // Create staggered starting positions for each column
  const staggeredOffset = (colIndex * -30) % 100; // Different starting point

  return {
    gap: `${props.itemPadding}px`,
    animationDuration: props.animate ? `${props.columnDurations[colIndex]}s` : '0s',
    transform: `translateY(${props.columnPositions[colIndex] ?? staggeredOffset}px)`,
  };
};

const getVideoWrapperStyle = computed(() => ({
  height: `${phoneVideoItemHeightPx.value}px`,
  borderRadius: `${props.borderRadius}px`,
}));

onMounted(() => {
  nextTick(() => {
    if (!columnsWrapper.value) return;
    const { offsetHeight: wh } = columnsWrapper.value;
    const perScreen = Math.ceil(wh / phoneVideoItemHeightPx.value);
    itemsPerColumn.value = Math.max(
      2,
      Math.ceil(perScreen * props.screensPerColumn),
    );
  });
});
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

/* Shimmer animation for skeleton loading */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Dark mode shimmer */
.dark .shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 80%,
    rgba(255, 255, 255, 0) 100%
  );
}
</style>
