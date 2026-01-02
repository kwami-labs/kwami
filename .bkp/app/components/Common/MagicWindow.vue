<template>
  <div
    class="flex justify-center items-center relative w-screen
      bg-transparent border-none rounded-xl transition-transform duration-500"
  >
    <div
      ref="modalRef"
      class="fixed inset-5 overflow-visible inline-block
        align-middle rounded-xl rounded-b-xl text-left shadow-lg transform
        sm:align-middle sm:max-w-lg sm:w-fit bg-opacity-60
        backdrop-blur-md border z-50 lg:-mt-5 lg:-ml-5 h-fit
        hover:border-primary-500/80 dark:hover:border-primary-400 select-none
        hover:shadow-primary-500/50 hover:dark:shadow-primary-400
        border-gray-500/20 transition-transform duration-500"
    >
      <div
        class="flex justify-between w-full cursor-move draggable-handle
          border-b border-gray-800/20 rounded-t-xl pt-[10px] pb-[6px]
          hover:border-primary-500/50 dark:hover:border-primary-400/50 px-[10px]
          bg-slate-500/10 select-none"
        :class="isOpen ? 'rounded-t-xl' : 'rounded-xl'"
        @mousedown="startDrag"
        @dblclick="resetPosition"
      >
        <div v-if="isOpen" class="text-sm flex">
          <UIcon
            :name="icon"
            class="w-4 h-4 ml-1 mt-1.5 opacity-80"
          />
          <h1 class="ml-1.5 mt-1 uppercase text-sm">
            {{ title }}
          </h1>
        </div>
        <div
          v-if="isOpen && tabs && tabs.length > 1 && selectedTab"
          class="flex"
          :class="`-ml-${menuToLeft || 0}`"
        >
          <div
            v-for="tab in tabs"
            :key="tab.title + tab.icon"
            class="flex"
          >
            <div
              class="h-6 border-r border-gray-600/30
                dark:border-gray-400/30 mx-1"
            />
            <CommonMagicTab
              :label="tab.title"
              :icon="tab.icon"
              class="-mt-0.5"
              :class="selectedTab.title === tab.title ?
                `!border !border-gray-600/30 !shadow-inner !shadow-gray-600/20
                  py-[14px] dark:!border-gray-300/30 dark:!shadow-gray-300/20
                  text-primary-600 dark:text-primary-400 hover:text-primary-500
                  dark:hover:text-primary-400`
                : ''"
              @click="emit('tab-click', tab)"
            />
          </div>
          <div
            class="h-6 border-r border-gray-600/30
                dark:border-gray-400/30 mx-1"
          />
        </div>
        <div
          class="flex rounded-b-xl mb-1"
          :class="isOpen ? ' ml-2' : ''"
        >
          <CommonBtnModal
            :is-open="isOpen"
            :title="title"
            :icon="icon"
            :on-click="() => isOpen = !isOpen"
            :is-tooltip="true"
          />
        </div>
      </div>
      <div
        :class="isOpen ? 'block' : 'hidden'"
        class="shadow-inner hover:shadow-primary-500 p-2 max-h-[500px]
          rounded-b-xl flex justify-center sm:max-h-[900px]
          overflow-x-scroll transition-transform duration-500"
      >
        <slot name="tabs" />
        <slot name="header" />
        <slot />
        <slot name="footer" class="w-full border-t" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const { title, defaultPosition, isModalOpen } = defineProps<{
  title: string;
  icon: string;
  tabs?: Tab[];
  selectedTab?: Tab;
  menuToLeft?: number;
  defaultPosition?: { x: number, y: number };
  isModalOpen?: boolean;
}>();

const emit = defineEmits(['tab-click', 'width', 'height']);

const { ui } = useStore();

const isOpen = ref(isModalOpen || false);
const modalRef = ref<HTMLElement>();
let isDragging = false;
let offsetX: number, offsetY: number;

if (isModalOpen) {
  onMounted(() => {
    isOpen.value = true;
  });
}

const moveWindow = (x: number, y: number) => {
  modalRef.value!.style.transform = `translate(${x}px, ${y}px)`;
  ui.windows[title] = { top: y, left: x };
};

onMounted(() => {
  const savedPosition = ui.windows[title];
  if (savedPosition && typeof savedPosition.top === 'number' &&
      typeof savedPosition.left === 'number') {
    moveWindow(savedPosition.left, savedPosition.top);
  } else if (defaultPosition) {
    moveWindow(defaultPosition.x, defaultPosition.y);
  }
});

const startDrag = (e: MouseEvent) => {
  isDragging = true;
  offsetX = e.clientX - modalRef.value!.getBoundingClientRect().left;
  offsetY = e.clientY - modalRef.value!.getBoundingClientRect().top;
};

const doDrag = (e: MouseEvent) => {
  if (!isDragging) { return; }
  requestAnimationFrame(() => {
    const modalRect = modalRef.value!.getBoundingClientRect();
    let top = e.clientY - offsetY;
    let left = e.clientX - offsetX;
    top = Math.max(0, Math.min(top, window.innerHeight - modalRect.height));
    left = Math.max(0, Math.min(left, window.innerWidth - modalRect.width));
    moveWindow(left, top);
  });
};

const endDrag = () => {
  isDragging = false;
};

const resetPosition = () => {
  if (!defaultPosition) { return; }
  moveWindow(defaultPosition.x, defaultPosition.y);
};

onMounted(() => {
  window.addEventListener('mousemove', doDrag);
  window.addEventListener('mouseup', endDrag);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', doDrag);
  window.removeEventListener('mouseup', endDrag);
});

onMounted(() => {
  const savedPosition = ui.windows[title];
  if (savedPosition && typeof savedPosition.top === 'number' &&
  typeof savedPosition.left === 'number') {
    moveWindow(savedPosition.left, savedPosition.top);
  } else if (defaultPosition) {
    moveWindow(defaultPosition.x, defaultPosition.y);
  }
});

</script>
