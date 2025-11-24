<template>
  <div class="my-8 space-y-4">
    <slot />
  </div>
</template>

<style scoped>
:deep(.step) {
  position: relative;
  padding-left: 2.5rem;
  padding-bottom: 2rem;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

:deep(.step:last-child) {
  border-left-color: transparent;
  padding-bottom: 0;
}

:deep(.step::before) {
  content: attr(data-step);
  position: absolute;
  left: -1.25rem;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #020617;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 0 0 4px #020617;
}
</style>

