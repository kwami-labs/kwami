<template>
  <div class="soul-config-panel space-y-4">
    <!-- Header -->
    <div class="text-center mb-4">
      <div class="flex items-center justify-center gap-2 mb-1">
        <Icon name="solar:star-bold" size="lg" class="text-primary-500" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          Soul Configuration
        </h3>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Define your Kwami's personality and character
      </p>
    </div>

    <!-- Basic Info -->
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name
        </label>
        <input
          v-model="soulConfig.name"
          type="text"
          placeholder="e.g., Kaya"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          maxlength="32"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Personality
        </label>
        <input
          v-model="soulConfig.personality"
          type="text"
          placeholder="e.g., friendly and curious"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          maxlength="100"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Traits (comma-separated)
        </label>
        <input
          v-model="traitsInput"
          type="text"
          placeholder="e.g., friendly, helpful, curious"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          @blur="updateTraits"
        />
      </div>
    </div>

    <!-- Settings -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Language
        </label>
        <select
          v-model="soulConfig.language"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Conversation Style
        </label>
        <select
          v-model="soulConfig.conversationStyle"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="friendly">Friendly</option>
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Response Length
        </label>
        <select
          v-model="soulConfig.responseLength"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Emotional Tone
        </label>
        <select
          v-model="soulConfig.emotionalTone"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="neutral">Neutral</option>
          <option value="warm">Warm</option>
          <option value="enthusiastic">Enthusiastic</option>
          <option value="calm">Calm</option>
        </select>
      </div>
    </div>

    <!-- Emotional Traits -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Emotional Traits
        </label>
        <button
          type="button"
          class="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
          @click="randomizeTraits"
        >
          <Icon name="solar:shuffle-bold" size="sm" />
          Randomize
        </button>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Values range from -100 to +100
      </p>

      <div class="space-y-2">
        <div v-for="(value, trait) in soulConfig.emotionalTraits" :key="trait" class="flex items-center gap-3">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400 w-24 capitalize">
            {{ trait }}
          </label>
          <input
            v-model.number="soulConfig.emotionalTraits![trait as keyof typeof soulConfig.emotionalTraits]"
            type="range"
            min="-100"
            max="100"
            step="5"
            class="flex-1"
          />
          <span class="text-xs font-mono text-gray-600 dark:text-gray-400 w-12 text-right">
            {{ soulConfig.emotionalTraits![trait as keyof typeof soulConfig.emotionalTraits] }}
          </span>
        </div>
      </div>
    </div>

    <!-- Advanced: System Prompt (collapsible) -->
    <details class="group">
      <summary class="cursor-pointer flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
        <Icon name="solar:settings-bold" size="sm" />
        Advanced: System Prompt
      </summary>
      <div class="mt-2">
        <textarea
          v-model="soulConfig.systemPrompt"
          rows="4"
          placeholder="You are Kwami, a friendly AI companion..."
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Icon from '@/components/Icon.vue'
import type { SoulConfig } from '@/utils/prepareKwamiMetadata'
import { getDefaultSoulConfig } from '@/utils/prepareKwamiMetadata'

const props = defineProps<{
  modelValue: SoulConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SoulConfig): void
}>()

const soulConfig = ref<SoulConfig>({ ...props.modelValue })
const traitsInput = ref(props.modelValue.traits?.join(', ') || '')

// Watch for changes and emit
watch(soulConfig, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// Update traits array from comma-separated input
const updateTraits = () => {
  if (traitsInput.value.trim()) {
    soulConfig.value.traits = traitsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
  } else {
    soulConfig.value.traits = []
  }
}

// Randomize emotional traits
const randomizeTraits = () => {
  const random = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  if (soulConfig.value.emotionalTraits) {
    soulConfig.value.emotionalTraits = {
      happiness: random(-100, 100),
      energy: random(-100, 100),
      confidence: random(-100, 100),
      calmness: random(-100, 100),
      optimism: random(-100, 100),
      socialness: random(-100, 100),
      creativity: random(-100, 100),
      patience: random(-100, 100),
      empathy: random(-100, 100),
      curiosity: random(-100, 100),
    }
  }
}
</script>

<style scoped>
/* Custom range input styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #10b981 100%);
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: currentColor;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: currentColor;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}
</style>
