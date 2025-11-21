<template>
  <CommonMagicWindow
    :title="$t('music')"
    icon="i-icon-park-solid-music-one"
    :default-position="{ x: 10, y: 130 }"
    :is-modal-open="isModalOpen"
  >
    <UButton
      variant="ghost"
      color="gray"
      icon="i-material-symbols-skip-previous-rounded"
      @click="prevAudio()"
    />
    <UButton
      variant="ghost"
      color="gray"
      :icon="playing
        ? 'i-heroicons-pause-circle-16-solid'
        : 'i-heroicons-play-circle-16-solid'"
      @click="toggleAudio()"
    />
    <UButton
      variant="ghost"
      color="gray"
      icon="i-material-symbols-skip-next-rounded"
      @click="nextAudio()"
    />
  </CommonMagicWindow>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  isModalOpen?: boolean;
}>(), { isModalOpen: false });

const { q } = useStore();
const playing = ref(false);

const toggleAudio = async () => {
  if (!q.body) return;

  if (q.body.body.audio.getAudioElement().paused) {
    await q.body.body.audio.play();
    q.body.setState('speaking');
    playing.value = true;
  } else {
    q.body.body.audio.pause();
    q.body.setState('idle');
    playing.value = false;
  }
};

const nextAudio = () => {
  if (q.body) {
    q.body.body.audio.next();
  }
};

const prevAudio = () => {
  if (q.body) {
    q.body.body.audio.previous();
  }
};
</script>
