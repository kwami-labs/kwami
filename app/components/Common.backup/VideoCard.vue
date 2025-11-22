<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <div class="relative w-full h-full">
      <video
        ref="video"
        class="w-full h-full object-cover"
        :src="src"
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        :playsinline="playsinline"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
      />
      <div
        v-if="!isPlaying"
        class="absolute inset-0 flex items-center justify-center w-full
          h-full bg-black bg-opacity-50"
      >
        <UButton
          class="!p-4"
          :icon="isPaused ? 'play' : 'pause'"
          @click="togglePlay"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const { autoplay } = defineProps<{
  src: string,
  togglePlay:() => void,
  autoplay: boolean,
  loop: boolean,
  muted: boolean,
  playsinline: boolean
}>();

const video = ref<HTMLVideoElement | null>(null);

const isPlaying = ref(false);
const isPaused = ref(false);
const onEnded = () => {
  isPlaying.value = false;
  isPaused.value = false;
};

const onLoadedMetadata = () => {
  if (autoplay) {
    video.value?.play();
    isPlaying.value = true;
  }
};

</script>
