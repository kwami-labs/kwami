<template>
  <div class="z-50">
    <UButton @click="toggleFullScreen">
      {{ isFullScreen ? 'Exit Full Screen' : 'Full Screen' }}
    </UButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isFullScreen = ref(false);

const toggleFullScreen = () => {
  if (!isFullScreen.value) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    // Firefox and Mozilla
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    // Chrome, Safari, and Opera
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
      // IE/Edge
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    // Firefox and Mozilla
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
    // Chrome, Safari, and Opera
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
    // IE/Edge
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  isFullScreen.value = !isFullScreen.value;
};

document.addEventListener('fullscreenchange', () => {
  isFullScreen.value = !!document.fullscreenElement;
});

</script>
