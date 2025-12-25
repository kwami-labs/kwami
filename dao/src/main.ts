import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'

// Default to dark theme (Tailwind `darkMode: 'class'`)
document.documentElement.classList.add('dark')

mount(App, { target: document.getElementById('app')! })
