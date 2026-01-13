/**
 * Icon Component Usage Examples
 * 
 * The createIcon function creates framework-agnostic icon elements using Iconify.
 * It supports 200,000+ icons from popular icon sets.
 */

import { createIcon } from './Icon';

// ========================================
// Basic Usage
// ========================================

// Simple icon with default size (md = 20px)
const homeIcon = createIcon({
  name: 'heroicons:home',
});
document.body.appendChild(homeIcon.element);

// Icon with legacy format (automatically normalized)
const searchIcon = createIcon({
  name: 'i-heroicons-magnifying-glass',
});

// ========================================
// Sizes
// ========================================

// Preset sizes: xs, sm, md, lg, xl
const smallIcon = createIcon({
  name: 'heroicons:star',
  size: 'sm', // 16px
});

const largeIcon = createIcon({
  name: 'heroicons:star',
  size: 'lg', // 24px
});

// Custom size
const customIcon = createIcon({
  name: 'heroicons:star',
  size: '32px',
});

// ========================================
// Colors
// ========================================

// Colored icon
const coloredIcon = createIcon({
  name: 'heroicons:heart',
  color: '#ff0000',
});

// Uses currentColor by default (inherits from parent)
const inheritedColorIcon = createIcon({
  name: 'heroicons:check',
});

// ========================================
// Transformations
// ========================================

// Flipped icon
const flippedIcon = createIcon({
  name: 'heroicons:arrow-right',
  flip: 'horizontal',
});

// Rotated icon
const rotatedIcon = createIcon({
  name: 'heroicons:arrow-up',
  rotate: 90, // or '90deg'
});

// ========================================
// Dynamic Updates
// ========================================

const dynamicIcon = createIcon({
  name: 'heroicons:play',
  size: 'md',
});

// Change icon
dynamicIcon.setIcon('heroicons:pause');

// Change size
dynamicIcon.setSize('lg');

// Change color
dynamicIcon.setColor('#00ff00');

// Cleanup when done
dynamicIcon.destroy();

// ========================================
// Integration with Glass Components
// ========================================

import { createGlassButton } from './GlassButton';

// Icon as button content
const iconButton = createGlassButton({
  label: '',
  icon: createIcon({ name: 'heroicons:plus', size: 'sm' }).element,
  mode: 'primary',
  onClick: () => console.log('clicked'),
});

// Icon alongside text
const buttonWithIcon = createGlassButton({
  label: 'Save',
  icon: createIcon({ name: 'heroicons:check', size: 'sm' }).element,
  mode: 'primary',
});

// ========================================
// Popular Icon Sets
// ========================================

// Material Design Icons
const mdiIcon = createIcon({ name: 'mdi:account' });

// Heroicons (default for this project)
const heroIcon = createIcon({ name: 'heroicons:user' });

// Lucide
const lucideIcon = createIcon({ name: 'lucide:user' });

// FontAwesome
const faIcon = createIcon({ name: 'fa:user' });

// Bootstrap Icons
const biIcon = createIcon({ name: 'bi:person' });

// Browse all icons at: https://icon-sets.iconify.design/

// ========================================
// Migration from Emojis
// ========================================

// Instead of: '🏠'
// Use: createIcon({ name: 'heroicons:home' })

// Instead of: '🔍'
// Use: createIcon({ name: 'heroicons:magnifying-glass' })

// Instead of: '⭐'
// Use: createIcon({ name: 'heroicons:star' })

// Instead of: '❤️'
// Use: createIcon({ name: 'heroicons:heart' })

// Instead of: '✓'
// Use: createIcon({ name: 'heroicons:check' })
