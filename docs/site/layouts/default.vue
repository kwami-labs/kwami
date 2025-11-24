<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header
      class="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur"
    >
      <UContainer class="flex items-center gap-3 py-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 font-semibold tracking-tight"
        >
          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-lg text-emerald-300"
          >
            KW
          </span>
          <div>
            <p class="text-base">KWAMI Docs</p>
            <p class="text-xs font-normal text-slate-400">
              One knowledge base for every surface.
            </p>
          </div>
        </NuxtLink>

        <div class="ml-auto flex items-center gap-2">
          <UButton
            icon="i-ph-github-logo-duotone"
            variant="ghost"
            color="white"
            target="_blank"
            href="https://github.com/kwami-io"
            aria-label="Open KWAMI GitHub organisation"
          />
          <UButton
            :icon="isDark ? 'i-ph-moon-stars-duotone' : 'i-ph-sun-duotone'"
            variant="ghost"
            color="white"
            aria-label="Toggle color mode"
            @click="toggleColorMode"
          />
          <UButton
            icon="i-ph-list-duotone"
            class="lg:hidden"
            variant="ghost"
            color="white"
            aria-label="Toggle navigation"
            @click="sidebarOpen = true"
          />
        </div>
      </UContainer>
    </header>

    <div class="flex">
      <aside
        class="hidden h-[calc(100vh-76px)] w-72 border-r border-white/5 lg:block"
      >
        <DocSidebar class="h-full" />
      </aside>

      <main class="flex-1">
        <UContainer class="py-10">
          <slot />
        </UContainer>
      </main>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur lg:hidden"
          @click.self="sidebarOpen = false"
        >
          <div
            class="absolute inset-y-0 left-0 w-80 max-w-full border-r border-white/5 bg-slate-950/95 p-6"
          >
            <div class="flex items-center justify-between pb-4">
              <p class="text-sm font-semibold tracking-wide text-slate-300">
                Navigation
              </p>
              <UButton
                icon="i-ph-x-duotone"
                variant="ghost"
                color="white"
                aria-label="Close navigation"
                @click="sidebarOpen = false"
              />
            </div>
            <DocSidebar class="h-[calc(100vh-140px)]" @navigate="sidebarOpen = false" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

