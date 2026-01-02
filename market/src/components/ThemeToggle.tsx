import { useEffect, useState } from 'react'
import { KwamiGlassButton } from './KwamiGlassButton'

type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem('kwami-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('kwami-theme', theme)
  }, [theme])

  return (
    <KwamiGlassButton
      label={theme === 'dark' ? 'Dark' : 'Light'}
      mode="ghost"
      size="md"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    />
  )
}





