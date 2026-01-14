import 'iconify-icon';
import { normalizeIconifyName } from '../utils/iconNames';

export interface IconOptions {
  /** Icon name in either format: 'i-heroicons-home' or 'heroicons:home' */
  name: string;
  /** Size preset or custom size (e.g., '24px', '1.5rem') */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Color (uses currentColor by default) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: Partial<CSSStyleDeclaration>;
  /** Flip icon horizontally */
  flip?: 'horizontal' | 'vertical' | 'both';
  /** Rotate icon (in degrees or predefined: '90deg', '180deg', '270deg') */
  rotate?: string | number;
  /** Width (overrides size) */
  width?: string;
  /** Height (overrides size) */
  height?: string;
}

export interface IconHandle {
  element: HTMLElement;
  setIcon: (name: string) => void;
  setSize: (size: string) => void;
  setColor: (color: string) => void;
  destroy: () => void;
}

const sizePresets: Record<string, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
};

function resolveSize(size?: string): string {
  if (!size) return sizePresets.md;
  return sizePresets[size] ?? size;
}

export function createIcon(options: IconOptions): IconHandle {
  if (typeof document === 'undefined') {
    throw new Error('createIcon can only be used in a browser environment');
  }

  const {
    name,
    size = 'md',
    color,
    className,
    style,
    flip,
    rotate,
    width,
    height,
  } = options;

  // Create iconify-icon element
  const icon = document.createElement('iconify-icon') as HTMLElement;

  // Set icon name (normalize if needed)
  const iconName = name.startsWith('i-') ? normalizeIconifyName(name) : name;
  icon.setAttribute('icon', iconName);

  // Set size
  const resolvedSize = resolveSize(size);
  if (width) {
    icon.setAttribute('width', width);
  } else {
    icon.setAttribute('width', resolvedSize);
  }
  
  if (height) {
    icon.setAttribute('height', height);
  } else {
    icon.setAttribute('height', resolvedSize);
  }

  // Set color
  if (color) {
    icon.style.color = color;
  }

  // Set flip
  if (flip) {
    icon.setAttribute('flip', flip);
  }

  // Set rotate
  if (rotate) {
    const rotateValue = typeof rotate === 'number' ? `${rotate}deg` : rotate;
    icon.setAttribute('rotate', rotateValue);
  }

  // Set class
  if (className) {
    icon.className = className;
  }

  // Apply inline styles
  if (style) {
    Object.assign(icon.style, style);
  }

  // Default styles for better integration
  icon.style.display = 'inline-flex';
  icon.style.alignItems = 'center';
  icon.style.justifyContent = 'center';
  icon.style.verticalAlign = 'middle';

  return {
    element: icon,
    
    setIcon(newName: string) {
      const normalized = newName.startsWith('i-') ? normalizeIconifyName(newName) : newName;
      icon.setAttribute('icon', normalized);
    },
    
    setSize(newSize: string) {
      const resolved = resolveSize(newSize);
      icon.setAttribute('width', resolved);
      icon.setAttribute('height', resolved);
    },
    
    setColor(newColor: string) {
      icon.style.color = newColor;
    },
    
    destroy() {
      icon.remove();
    },
  };
}
