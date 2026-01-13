<template>
  <span ref="mount" class="inline-flex" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createIcon } from 'kwami/ui'

interface IconHandle {
  element: HTMLElement
  setIcon: (name: string) => void
  setSize: (size: string) => void
  setColor: (color: string) => void
  destroy: () => void
}

const props = withDefaults(defineProps<{
  /** Icon name (e.g., 'solar:home-bold', 'solar:user-outline') */
  name: string
  /** Size preset or custom size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string
  /** Color (uses currentColor by default) */
  color?: string
  /** Additional CSS classes */
  class?: string
  /** Flip icon */
  flip?: 'horizontal' | 'vertical' | 'both'
  /** Rotate icon (in degrees) */
  rotate?: string | number
  /** Custom width */
  width?: string
  /** Custom height */
  height?: string
}>(), {
  size: 'md',
})

const mount = ref<HTMLSpanElement | null>(null)
let iconHandle: IconHandle | null = null

onMounted(() => {
  if (!mount.value) return

  iconHandle = createIcon({
    name: props.name,
    size: props.size,
    color: props.color,
    className: props.class,
    flip: props.flip,
    rotate: props.rotate,
    width: props.width,
    height: props.height,
  })

  mount.value.appendChild(iconHandle.element)
})

// Watch for prop changes
watch(() => props.name, (newName) => {
  iconHandle?.setIcon(newName)
})

watch(() => props.size, (newSize) => {
  if (newSize) iconHandle?.setSize(newSize)
})

watch(() => props.color, (newColor) => {
  if (newColor) iconHandle?.setColor(newColor)
})

onUnmounted(() => {
  iconHandle?.destroy()
  iconHandle = null
})
</script>
