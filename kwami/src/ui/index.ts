// New Theme System (recommended)
export * from './core/theme';

// New Components (theme-aware)
export { createButton, createGlassButton, type ButtonOptions, type ButtonHandle } from './components/Button';
export { createCard, createGlassCard, type CardOptions, type CardHandle } from './components/Card';

// Legacy types and theme
export * from './types';
export * from './theme';

// Other exports
export * from './rings';
export * from './logo';
export * from './welcome';
export * from './wallet';
export * from './nft-login';
export { ensureBaseUiStyles } from './baseUiStyles';
export { normalizeIconifyName } from './iconNames';

// Legacy glass components (still supported)
export { createGlassPopover } from './components/GlassPopover';
export { createGlassModal } from './components/GlassModal';
export { createGlassPanel } from './components/GlassPanel';
export { createIcon, type IconHandle, type IconOptions } from './components/Icon';
