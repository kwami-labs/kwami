<template>
  <button :disabled="isRecording" @click="startRecording">
    {{ isRecording ? 'Recording...' : 'Start Recording' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isRecording = ref(false);
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

async function startRecording () {
  if (isRecording.value) { return; }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioFile = new File([audioBlob], 'recording.wav', {
        type: 'audio/wav'
      });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('audio', audioFile);

      try {
        // Send the recorded audio to the Nuxt 3 API
        const response = await fetch('/api/request/audio', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to send audio to server');
        }

        // Handle the response from the server (optional)
        const result = await response.json();
        console.log('Transcription result:', result);
      } catch (error) {
        console.error('Error uploading audio:', error);
      }
    };

    mediaRecorder.start();
    isRecording.value = true;

    // Automatically stop recording after a certain time (optional)
    setTimeout(() => stopRecording(), 10000); // Stop after 10 seconds
  } catch (error) {
    console.error('Error accessing microphone:', error);
  }
}

function stopRecording () {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
  }
}
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
