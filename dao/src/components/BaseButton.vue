<template>
  <component
    :is="to ? 'router-link' : (href ? 'a' : 'button')"
    :to="to"
    :href="href"
    :target="target"
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  to?: string;
  href?: string;
  target?: string;
  type?: 'button' | 'submit' | 'reset';
  color?: 'primary' | 'gray' | 'green' | 'red';
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  icon?: string;
}>(), {
  type: 'button',
  color: 'primary',
  variant: 'solid',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.color}`,
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  { 'base-button--block': props.block },
  { 'base-button--loading': props.loading },
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.base-button--xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.base-button--sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.base-button--md {
  padding: 0.625rem 1rem;
  font-size: 1rem;
}

.base-button--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Colors - Solid */
.base-button--primary.base-button--solid {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.base-button--primary.base-button--solid:hover:not(:disabled) {
  opacity: 0.9;
}

.base-button--gray.base-button--solid {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.base-button--gray.base-button--solid:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

/* Colors - Outline */
.base-button--primary.base-button--outline {
  border-color: #667eea;
  color: #667eea;
  background: transparent;
}

.base-button--primary.base-button--outline:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
}

/* Colors - Ghost */
.base-button--gray.base-button--ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
}

.base-button--gray.base-button--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

/* Block */
.base-button--block {
  width: 100%;
}

/* Loading */
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
