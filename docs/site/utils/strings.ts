export const humanizeSlug = (value: string): string => {
  if (!value) {
    return 'Overview'
  }

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const labelFromPath = (path: string): string => {
  if (!path) {
    return 'Overview'
  }

  const segments = path.split('/').filter(Boolean)
  const fallback = segments.at(-2) ?? 'Overview'
  const candidate = segments.at(-1)

  if (!candidate) {
    return humanizeSlug(fallback)
  }

  const normalized = candidate.toLowerCase()

  if (normalized === 'readme' || normalized === 'index') {
    return humanizeSlug(fallback)
  }

  return humanizeSlug(candidate)
}

export const normalizePath = (path: string): string => {
  if (!path) {
    return '/'
  }

  const normalized = path.replace(/\/+/g, '/')
  return normalized.endsWith('/') && normalized !== '/'
    ? normalized.slice(0, -1)
    : normalized
}

