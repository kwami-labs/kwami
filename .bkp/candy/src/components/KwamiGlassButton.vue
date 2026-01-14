<template>
  <div ref="mount" class="inline-flex" :class="block ? 'w-full' : ''" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createGlassButton } from 'kwami/ui'

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const props = withDefaults(
  defineProps<{
    label: string
    mode?: 'primary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    block?: boolean
  }>(),
  {
    mode: 'primary',
    size: 'md',
    disabled: false,
    block: false,
  }
)

const mount = ref<HTMLDivElement | null>(null)
let handle: ReturnType<typeof createGlassButton> | null = null

const rebuild = () => {
  if (!mount.value) return
  mount.value.innerHTML = ''

  handle = createGlassButton({
    label: props.label,
    mode: props.mode,
    size: props.size,
    disabled: props.disabled,
    onClick: (event) => emit('click', event),
  })

  if (props.block) {
    handle.element.style.width = '100%'
  }

  mount.value.appendChild(handle.element)
}

onMounted(() => {
  rebuild()
})

watch(
  () => [props.label, props.mode, props.size, props.disabled, props.block] as const,
  () => {
    // Minimal updates where possible
    if (!handle) {
      rebuild()
      return
    }

    handle.setLabel(props.label)
    handle.setDisabled(!!props.disabled)

    // Mode/size affect styles; simplest is rebuild when they change.
    // We detect changes via the watch list and just rebuild always.
    rebuild()
  }
)

onBeforeUnmount(() => {
  if (handle?.element?.parentNode) {
    handle.element.parentNode.removeChild(handle.element)
  }
  handle = null
})
</script>
