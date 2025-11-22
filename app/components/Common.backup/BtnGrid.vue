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
      icon="i-hugeicons-grid-table"
    />
    <template #content>
      <div class="space-y-2 py-5 pl-[24px] pr-0">
        <div class="grid grid-cols-2 gap-2">
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.show')"
              label-for="show"
              :ui="{ label: '!text-xs' }"
            >
              <USwitch
                v-model="ui.videoGrid.show"
                class="mt-1.5"
                color="neutral"
                size="sm"
              />
            </UFormField>
          </div>
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.animate')"
              label-for="animate"
              :ui="{ label: '!text-xs' }"
            >
              <USwitch
                v-model="ui.videoGrid.animate"
                class="mt-1.5"
                color="neutral"
                size="sm"
              />
            </UFormField>
          </div>
          <div class="w-16 pt-1">
            <UFormField
              :label="$t('account.videoGridConfig.opacity')"
              label-for="opacity"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.opacity"
                class="w-10"
                color="neutral"
                size="xs"
                :min="0.1"
                :max="1"
                :step="0.1"
              />
            </UFormField>
          </div>
          <div class="w-16 pt-1">
            <UFormField
              :label="$t('account.videoGridConfig.duration')"
              label-for="duration"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.scrollDurationSec"
                class="w-10"
                color="neutral"
                size="xs"
                :min="100"
                :max="500"
                :step="1"
              />
            </UFormField>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-0.5">
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.columns')"
              label-for="columns"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.numColumns"
                class="w-10"
                color="neutral"
                size="xs"
                :min="3"
                :max="10"
                :step="1"
              />
            </UFormField>
          </div>
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.padding')"
              label-for="padding"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.itemPadding"
                class="w-10"
                color="neutral"
                size="xs"
                :min="0"
                :max="120"
                :step="1"
              />
            </UFormField>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-0.5">
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.borderWidth')"
              label-for="borderWidth"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.borderWidth"
                class="w-10"
                color="neutral"
                size="xs"
                :min="0"
                :max="10"
                :step="1"
              />
            </UFormField>
          </div>
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.borderRadius')"
              label-for="borderRadius"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.borderRadius"
                class="w-10"
                color="neutral"
                size="xs"
                :min="0"
                :max="100"
                :step="1"
              />
            </UFormField>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-0.5">
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.phoneWidth')"
              label-for="phoneWidth"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.phoneWidth"
                class="w-10"
                color="neutral"
                size="xs"
                :min="1"
                :max="100"
                :step="1"
              />
            </UFormField>
          </div>
          <div class="w-16">
            <UFormField
              :label="$t('account.videoGridConfig.phoneHeight')"
              label-for="phoneHeight"
              :ui="{ label: '!text-xs' }"
            >
              <UInput
                v-model="ui.videoGrid.phoneHeight"
                class="w-10"
                color="neutral"
                size="xs"
                :min="1"
                :max="100"
                :step="1"
              />
            </UFormField>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
defineProps<{
  side?: 'top' | 'bottom' | 'left' | 'right';
}>();

const { ui } = useStore();
</script>
