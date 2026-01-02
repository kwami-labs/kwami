<template>
  <UPopover mode="hover" class="z-50">
    <UButton
      variant="ghost"
      class="focus:outline-transparent focus-visible:outline-0
        disabled:cursor-not-allowed disabled:opacity-75
        flex-shrink-0 font-medium rounded-md text-sm gap-x-1.5
        p-1.5 text-gray-900 dark:text-gray-100
        hover:text-primary-600 dark:hover:text-primary-400
        hover:bg-white dark:hover:bg-gray-900
        focus-visible:ring-inset focus-visible:ring-2
        focus-visible:ring-primary-500 align-middle h-[31px] w-[31px]
        dark:focus-visible:ring-primary-400 inline-flex items-center
        hover:border border-gray-300 dark:border-gray-700
        !shadow-gray-900/30 dark:!shadow-gray-100/30
        hover:shadow-inner"
    >
      <UIcon
        name="i-heroicons-paint-brush-solid"
        class="h-5 w-5"
      />
    </UButton>
    <template #panel>
      <UCard class="bg-gray-100 dark:bg-gray-900 min-w-56">
        <template #header>
          <UButton
            class="rounded-full bg-stone-300 dark:bg-stone-700 border-2
            hover:bg-stone-400 dark:hover:bg-stone-600 mr-3"
            :class="theme.ui.gray === 'stone' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.gray = 'stone'"
          />
          <UButton
            class="rounded-full bg-neutral-300 dark:bg-neutral-700 border-2
            hover:bg-neutral-400 dark:hover:bg-neutral-600 mx-3"
            :class="theme.ui.gray === 'neutral' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.gray = 'neutral'"
          />
          <UButton
            class="rounded-full bg-zinc-300 dark:bg-zinc-700 border-2
            hover:bg-zinc-400 dark:hover:bg-zinc-600 mx-3"
            :class="theme.ui.gray === 'zinc' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.gray = 'zinc'"
          />
          <UButton
            class="rounded-full bg-gray-300 dark:bg-gray-700 border-2
            hover:bg-cool-400 dark:hover:bg-cool-600 mx-3"
            :class="theme.ui.gray === 'cool' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.gray = 'cool'"
          />
          <UButton
            class="rounded-full bg-slate-300 dark:bg-slate-700 border-2
              hover:bg-slate-400 dark:hover:bg-slate-600 ml-3"
            :class="theme.ui.gray === 'slate' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.gray = 'slate'"
          />
        </template>
        <div class="mb-3 -mt-2">
          <UButton
            class="rounded-full bg-stone-700 dark:bg-stone-300 border-2
            hover:bg-stone-600 dark:hover:bg-stone-400 mr-3"
            :class="theme.ui.primary === 'stone' ?
              selectedStyle2 : 'border-transparent'"
            @click="() => theme.ui.primary = 'stone'"
          />
          <UButton
            class="rounded-full bg-neutral-700 dark:bg-neutral-300 border-2
            hover:bg-neutral-600 dark:hover:bg-neutral-400 mx-3"
            :class="theme.ui.primary === 'neutral' ?
              selectedStyle2 : 'border-transparent'"
            @click="() => theme.ui.primary = 'neutral'"
          />
          <UButton
            class="rounded-full bg-zinc-700 dark:bg-zinc-300 border-2
            hover:bg-zinc-600 dark:hover:bg-zinc-400 mx-3"
            :class="theme.ui.primary === 'zinc' ?
              selectedStyle2 : 'border-transparent'"
            @click="() => theme.ui.primary = 'zinc'"
          />
          <UButton
            class="rounded-full bg-gray-700 dark:bg-gray-300 border-2
            hover:bg-cool-600 dark:hover:bg-cool-400 mx-3"
            :class="theme.ui.primary === 'cool' ?
              selectedStyle2 : 'border-transparent'"
            @click="() => theme.ui.primary = 'cool'"
          />
          <UButton
            class="rounded-full bg-slate-700 dark:bg-slate-300 border-2
              hover:bg-slate-600 dark:hover:bg-slate-400 ml-3"
            :class="theme.ui.primary === 'slate' ?
              selectedStyle2 : 'border-transparent'"
            @click="() => theme.ui.primary = 'slate'"
          />
        </div>
        <div class="mb-3">
          <UButton
            class="rounded-full bg-orange-500 dark:bg-orange-400
                hover:bg-orange-600 dark:hover:bg-orange-500 mr-3 border-2"
            :class="theme.ui.primary === 'orange' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'orange'"
          />
          <UButton
            class="rounded-full bg-red-500 dark:bg-red-400
                hover:bg-red-600 dark:hover:bg-red-500 mx-3 border-2"
            :class="theme.ui.primary === 'red' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'red'"
          />
          <UButton
            class="rounded-full bg-rose-500 dark:bg-rose-400
                hover:bg-rose-600 dark:hover:bg-rose-500 mx-3 border-2"
            :class="theme.ui.primary === 'rose' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'rose'"
          />
          <UButton
            class="rounded-full bg-pink-500 dark:bg-pink-400
                hover:bg-pink-600 dark:hover:bg-pink-500 mx-3 border-2"
            :class="theme.ui.primary === 'pink' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'pink'"
          />
          <UButton
            class="rounded-full bg-fuchsia-500 dark:bg-fuchsia-400
                hover:bg-fuchsia-600 dark:hover:bg-fuchsia-500 ml-3 border-2"
            :class="theme.ui.primary === 'fuchsia' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'fuchsia'"
          />
        </div>
        <div class="mb-3">
          <UButton
            class="rounded-full bg-purple-500 dark:bg-purple-400
                hover:bg-purple-600 dark:hover:bg-purple-500 mr-3 border-2"
            :class="theme.ui.primary === 'purple' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'purple'"
          />
          <UButton
            class="rounded-full bg-violet-500 dark:bg-violet-400
                hover:bg-violet-600 dark:hover:bg-violet-500 mx-3 border-2"
            :class="theme.ui.primary === 'violet' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'violet'"
          />
          <UButton
            class="rounded-full bg-indigo-500 dark:bg-indigo-400
                hover:bg-indigo-600 dark:hover:bg-indigo-500 mx-3 border-2"
            :class="theme.ui.primary === 'indigo' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'indigo'"
          />
          <UButton
            class="rounded-full bg-sky-500 dark:bg-sky-400
                hover:bg-sky-600 dark:hover:bg-sky-500 mx-3 border-2"
            :class="theme.ui.primary === 'sky' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'sky'"
          />
          <UButton
            class="rounded-full bg-cyan-500 dark:bg-cyan-400
                hover:bg-cyan-600 dark:hover:bg-cyan-500 ml-3 border-2"
            :class="theme.ui.primary === 'cyan' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'cyan'"
          />
        </div>
        <div>
          <UButton
            class="rounded-full bg-teal-500 dark:bg-teal-400
                hover:bg-teal-600 dark:hover:bg-teal-500 mr-3 border-2"
            :class="theme.ui.primary === 'teal' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'teal'"
          />
          <UButton
            class="rounded-full bg-emerald-500 dark:bg-emerald-400
                hover:bg-emerald-600 dark:hover:bg-emerald-500 mx-3 border-2"
            :class="theme.ui.primary === 'emerald' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'emerald'"
          />
          <UButton
            class="rounded-full bg-green-500 dark:bg-green-400
                hover:bg-green-600 dark:hover:bg-green-500 mx-3 border-2"
            :class="theme.ui.primary === 'green' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'green'"
          />
          <UButton
            class="rounded-full bg-lime-500 dark:bg-lime-400
                hover:bg-lime-600 dark:hover:bg-lime-500 mx-3 border-2"
            :class="theme.ui.primary === 'lime' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'lime'"
          />
          <UButton
            class="rounded-full bg-amber-500 dark:bg-amber-400
                hover:bg-amber-600 dark:hover:bg-amber-500 ml-3 border-2"
            :class="theme.ui.primary === 'amber' ?
              selectedStyle : 'border-transparent'"
            @click="() => theme.ui.primary = 'amber'"
          />
        </div>
      </UCard>
    </template>
  </UPopover>
</template>

<script setup lang="ts">

const theme = useAppConfig();
const { ui } = useStore();

// Initialize Nuxt UI palette from store
theme.ui.primary = ui.primary;
theme.ui.gray = ui.gray;

// Keep store legacy fields and new ui.color model in sync with app config
watch(() => theme.ui.primary, (v) => {
  ui.primary = v;
  // Also reflect in new color model (shade 500 by default)
  ui.color.light.primary = `${v}-500`;
  ui.color.dark.primary = `${v}-500`;
});
watch(() => theme.ui.gray, (v) => {
  ui.gray = v;
  // Optionally map gray choice to background/neutral families for consistency
  // Keep backgrounds sensible for each mode
  ui.color.light.background = v === 'stone' ? 'white' : `${v}-50`;
  ui.color.dark.background = v === 'stone' ? 'stone-900' : `${v}-900`;
  ui.color.light.neutral = `${v}-500`;
  ui.color.dark.neutral = `${v}-500`;
});

const selectedStyle = 'border-gray-900 dark:border-gray-100';
const selectedStyle2 = 'border-gray-950 dark:border-gray-50';

</script>
