<template>
  <UPopover mode="hover" class="z-50 ml-2">
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
        name="i-heroicons-language"
        class="h-5 w-5"
      />
    </UButton>
    <template #panel>
      <div v-for="lang in langs" :key="lang.value">
        <UButton
          class="w-full text-left"
          :class="ui.locale === lang.value
            ? 'bg-primary-500 text-white'
            : 'hover:bg-primary-500/10'"
          @click="selectedLang.value = lang"
        >
          {{ lang.label }}
        </UButton>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">

const { ui } = useStore();
const langs = useLangs();
const { locale } = useI18n();

locale.value = ui.locale;

const selectedLang = ref(langs[ui.iLocale]);

watch(selectedLang, (v) => {
  ui.locale = v.value;
  locale.value = v.value;
  langs.forEach((lang: LangOption, i: number) => {
    if (lang.value === v.value) { ui.iLocale = i; }
  });
});

</script>
