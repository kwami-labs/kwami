<template>
  <CommonBackgroundVideos
    v-if="ui.showVideo"
    :class="opacity"
  />
  <!-- <button
    class="bg-red-500 !z-50 !cursor-pointer"
    @click="q.body?.body.blob.exportGLTF()"
  >
    Download
  </button> -->
  <canvas
    ref="canvas"
    class="fixed h-screen w-screen !bg-transparent"
    @mousemove="handleMouseMove"
    @dblclick="ui.showVideo ? switchVideo() : () => {}"
  />
</template>

<script setup lang="ts">
const { q, ui } = useStore();

const isMounted = ref(false);
const canvas = ref<HTMLCanvasElement>();

const opacity = ref('opacity-50');
watch(() => ui.opacityVideo, (v) => {
  opacity.value = `opacity-${v}`;
  const x = `opacity-${v}`;
  opacity.value = x;
});

const switchVideo = () => {
  ui.keyVideo++;
};

const isMouseDown = ref(false);
const mouseMoved = ref(false);

const handleMouseMove = () => {
  if (isMouseDown.value) {
    mouseMoved.value = true;
  }
};

onMounted(() => {
  if (!canvas.value) { return; }
  q.init(canvas.value);
  if (q.body) {
    q.body.body.blob.setRandomBlob();
  }
  isMounted.value = true;
});
</script>
