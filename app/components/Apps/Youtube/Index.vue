<template>
  <div v-if="videoId" class="youtube-player">
    <youtube
      ref="youtubePlayer"
      :video-id="videoId"
      :player-vars="playerVars"
    />
  </div>
  <input v-model="youtubeUrl" placeholder="Enter YouTube URL">
  <button @click="playVideo">
    Play Video
  </button>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
// import { useYoutube } from 'vue-youtube-embed';

// useYoutube();

// Reactive properties
const youtubeUrl = ref('');
const videoId = ref<string | null>(null);
const playerVars = ref({
  autoplay: 1, // Autoplay the video
  controls: 0, // Hide player controls
  showinfo: 0, // Hide video info
  modestbranding: 1, // Reduce YouTube branding
  rel: 0, // Do not show related videos
  fs: 0 // Disable full-screen button
});

const youtubePlayer = ref(null);

// Extract YouTube video ID from URL
function extractVideoId (url: string): string | null {
  const regex =
    // eslint-disable-next-line max-len
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Play the YouTube video
function playVideo () {
  const id = extractVideoId(youtubeUrl.value);
  if (id) {
    videoId.value = id;
  } else {
    alert('Please enter a valid YouTube URL');
  }
}
</script>

<style scoped>
.youtube-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

input {
  padding: 8px;
  font-size: 16px;
  margin-right: 10px;
}

button {
  padding: 8px 16px;
  font-size: 16px;
}
</style>
