<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  variant?: 'solid' | 'subtle';
}>(), {
  color: 'blue',
  variant: 'subtle',
});

const badgeClasses = computed(() => [
  'base-badge',
  `base-badge--${props.color}`,
  `base-badge--${props.variant}`,
]);
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Blue */
.base-badge--blue.base-badge--subtle {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* Green */
.base-badge--green.base-badge--subtle {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

/* Orange */
.base-badge--orange.base-badge--subtle {
  background: rgba(251, 146, 60, 0.2);
  color: #fb923c;
}

/* Red */
.base-badge--red.base-badge--subtle {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Purple */
.base-badge--purple.base-badge--subtle {
  background: rgba(168, 85, 247, 0.2);
  color: #a78bfa;
}

/* Gray */
.base-badge--gray.base-badge--subtle {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}
</style>
