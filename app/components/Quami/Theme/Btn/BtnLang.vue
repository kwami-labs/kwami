<template>
  <UPopover
    class="z-50"
    :ui="{
      content: 'bg-white dark:bg-black',
    }"
    :content="{
      side,
    }"
    arrow
  >
    <CommonBtnIcon
      size="sm"
      :icon="selectedLang?.icon"
    />
    <template #content>
      <div class="space-y-1 p-2">
        <div
          v-for="(e, i) in langs"
          :key="e.value"
        >
          <CommonBtnIcon
            size="sm"
            :icon="e.icon"
            :class="selectedLang?.value === e.value
              ? `bg-black10 dark:bg-white10` : ''"
            @click="selectedLang = langs[i]"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
defineProps<{
  side?: 'top' | 'bottom' | 'left' | 'right';
}>();

const { setLocale } = useI18n();
const { ui } = useStore();
const langs = useLangs();

const selectedLang = ref(
  langs.find((lang: LangOption) => lang.value === (ui.lang || 'en')) || langs[0],
);

watch(selectedLang, (v) => {
  ui.lang = v.value;
  setLocale(v.value as LangCode);
}, { immediate: true });

onMounted(() => {
  setLocale((ui.lang as LangCode) || 'en');
  selectedLang.value = langs.find(
    (lang: LangOption) => lang.value === (ui.lang || 'en')) || langs[0];
});
</script>
