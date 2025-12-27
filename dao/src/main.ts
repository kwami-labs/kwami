import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { ensureBaseUiStyles, createGlassPanel } from 'kwami/ui'

// Match market/candy: inject KWAMI base UI + glass styles before rendering.
ensureBaseUiStyles()
createGlassPanel({ content: '' })

// Default to dark theme (Tailwind `darkMode: 'class'`)
document.documentElement.classList.add('dark')

mount(App, { target: document.getElementById('app')! })
