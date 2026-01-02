<template>
  <div :key="key">
    <video
      v-show="showFirstVideo"
      autoplay
      muted
      loop
      class="fixed top-0 left-0 h-screen w-screen cursor-pointer
        z-0 object-cover transition-opacity duration-500 ease-in-out"
      :class="isBlurred ? 'blur' : 'no-blur'"
      :style="{ opacity: showFirstVideo ? 1 : 0 }"
      @click="getVideo"
      @loadeddata="handleVideoLoaded"
    >
      <source :src="video1" type="video/mp4">
      {{ $t('error.video') }}
    </video>
    <video
      v-show="!showFirstVideo"
      autoplay
      muted
      loop
      class="fixed top-0 left-0 h-screen w-screen cursor-pointer
        z-0 object-cover transition-opacity duration-500 ease-in-out"
      :class="isBlurred ? 'blur' : 'no-blur'"
      :style="{ opacity: showFirstVideo ? 0 : 1 }"
      @click="getVideo"
      @loadeddata="handleVideoLoaded"
    >
      <source :src="video2" type="video/mp4">
      {{ $t('error.video') }}
    </video>
  </div>
</template>

<script setup lang="ts">
import videos from 'assets/vid/links.json';

const NO_REPEAT = 40;

const { ui } = useStore();

const key = ref(0);

const video1 = ref(videos[ui.iVideo]);
const video2 = ref(videos[ui.iVideo]);
const showFirstVideo = ref(true);
const isBlurred = ref(true);

const lastRandoms: number[] = [];
const getVideo = () => {
  const ln = videos.length;
  let n = getRandomInt(ln);
  while (lastRandoms.includes(n)) {
    n = getRandomInt(ln);
  }
  ui.iVideo = n;
  lastRandoms.push(n);
  if (lastRandoms.length > NO_REPEAT) {
    lastRandoms.shift();
  }
  isBlurred.value = true;
  setTimeout(() => {
    if (showFirstVideo.value) {
      video2.value = videos[n];
    } else {
      video1.value = videos[n];
    }
    showFirstVideo.value = !showFirstVideo.value;
    key.value++;
  }, 500);
};

const handleVideoLoaded = () => {
  setTimeout(() => {
    isBlurred.value = false;
  }, 300);
};

watch(() => ui.keyVideo, () => {
  getVideo();
});

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.blur {
  filter: blur(10px);
  transition: filter 1s;
}

.no-blur {
  filter: blur(0);
  transition: filter 0.5s;
}
</style>
