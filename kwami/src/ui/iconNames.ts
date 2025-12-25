/**
 * Normalizes app-local icon names to Iconify names.
 *
 * Candy currently uses `i-heroicons-arrow-path` style names; Iconify expects
 * collections like `heroicons:arrow-path`.
 */
export function normalizeIconifyName(name: string): string {
  return name.replace(/^i-/, '').replace('-', ':');
}


