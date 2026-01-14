/**
 * Color Configuration
 * Tailwind -500 colors ordered from top to bottom of color spectrum (22 colors)
 */

export const TAILWIND_COLORS_500 = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#dc2626', // red-600 (deeper red)
  '#ea580c', // orange-600
  '#d97706', // amber-600
  '#ca8a04', // yellow-600
  '#65a30d', // lime-600
] as const;

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Helper function to blend two hex colors for middle gradient
 */
export function blendColors(color1: string, color2: string): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round((r1 + r2) / 2);
  const g = Math.round((g1 + g2) / 2);
  const b = Math.round((b1 + b2) / 2);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate color palettes for 22 sections using sequential 2-color gradients
 * Each section uses colors[i] and colors[i+1] with a blended middle color for Kwami
 */
export function generateColorPalettes(): ColorPalette[] {
  return TAILWIND_COLORS_500.map((color, index) => {
    const nextColor = TAILWIND_COLORS_500[(index + 1) % TAILWIND_COLORS_500.length];
    const middleColor = blendColors(color, nextColor);
    
    return {
      primary: color,        // Color 1 for Kwami blob
      secondary: nextColor,  // Color 2 for Kwami blob  
      accent: middleColor    // Blended middle color for Kwami blob
    };
  });
}

/**
 * Precomputed color palettes for convenient reuse
 */
export const COLOR_PALETTES: ColorPalette[] = generateColorPalettes();

/**
 * Generate random color
 */
export function generateRandomColor(): string {
  const hue = Math.random() * 360;
  const saturation = 70 + Math.random() * 30;
  const lightness = 50 + Math.random() * 20;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

