// New Theme System (recommended)
export * from './core/theme';

// New Components (theme-aware)
export { createButton, createGlassButton, type ButtonOptions, type ButtonHandle } from './components/Button';
export { createCard, createGlassCard, type CardOptions, type CardHandle } from './components/Card';
export { createModal, createGlassModal, type ModalOptions, type ModalHandle } from './components/Modal';
export { createPopover, createGlassPopover, type PopoverOptions, type PopoverHandle } from './components/Popover';
export { createPanel, createGlassPanel, type PanelOptions } from './components/Panel';

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

// Other components
export { createIcon, type IconHandle, type IconOptions } from './components/Icon';
