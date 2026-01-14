<template>
  <div ref="mount" class="contents" />

  <Teleport v-if="titleTarget" :to="titleTarget">
    <slot name="title" />
  </Teleport>

  <Teleport v-if="headerRightTarget" :to="headerRightTarget">
    <slot name="headerRight" />
  </Teleport>

  <Teleport v-if="bodyTarget" :to="bodyTarget">
    <slot />
  </Teleport>

  <Teleport v-if="footerTarget" :to="footerTarget">
    <slot name="footer" />
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createGlassCard } from 'kwami/ui'

const props = withDefaults(
  defineProps<{
    className?: string
    scrollContent?: boolean
    cursorGlow?: boolean
  }>(),
  {
    scrollContent: true,
    cursorGlow: true,
  }
)

const mount = ref<HTMLDivElement | null>(null)

const titleTarget = ref<HTMLElement | null>(null)
const headerRightTarget = ref<HTMLElement | null>(null)
const bodyTarget = ref<HTMLElement | null>(null)
const footerTarget = ref<HTMLElement | null>(null)

let cardEl: HTMLDivElement | null = null

const build = () => {
  if (!mount.value) return

  // Cleanup old
  mount.value.innerHTML = ''
  titleTarget.value = null
  headerRightTarget.value = null
  bodyTarget.value = null
  footerTarget.value = null

  const card = createGlassCard({
    className: props.className,
    scrollContent: props.scrollContent,
    cursorGlow: props.cursorGlow,
  })

  cardEl = card.element

  // Ensure header exists so Teleports have a place to render.
  card.header.style.display = ''

  titleTarget.value = card.element.querySelector('.kwami-glass-card__title') as HTMLElement | null
  headerRightTarget.value = card.element.querySelector('.kwami-glass-card__headerRight') as HTMLElement | null
  bodyTarget.value = card.body
  footerTarget.value = card.footer

  // Footer is hidden by default in createGlassCard if empty; we allow Teleport to fill it.
  card.footer.style.display = ''

  mount.value.appendChild(card.element)
}

onMounted(() => {
  build()
})

watch(
  () => [props.className, props.scrollContent, props.cursorGlow] as const,
  () => {
    build()
  }
)

onBeforeUnmount(() => {
  if (cardEl?.parentNode) {
    cardEl.parentNode.removeChild(cardEl)
  }
  cardEl = null
})
</script>
