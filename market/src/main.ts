import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.scss'

// Polyfills for Solana
import { Buffer } from 'buffer'
;(window as any).Buffer = Buffer

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
