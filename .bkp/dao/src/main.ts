import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { ensureBaseUiStyles, createGlassPanel } from 'kwami/ui'

// Match market/candy: inject KWAMI base UI + glass styles before rendering.
ensureBaseUiStyles()
createGlassPanel({ content: '' })

// Default to dark theme (Tailwind `darkMode: 'class'`)
// Check localStorage first to avoid flash, but default to dark if not set
try {
  const stored = localStorage.getItem('kwami-theme')
  if (stored !== 'light') {
    document.documentElement.classList.add('dark')
  }
} catch {
  document.documentElement.classList.add('dark')
}

mount(App, { target: document.getElementById('app')! })
