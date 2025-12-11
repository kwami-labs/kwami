import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './assets/css/main.css'
import App from './App.vue'
import routes from './routes'
import * as UIComponents from './components/ui'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(pinia)
app.use(router)

// Register UI components globally
for (const [key, component] of Object.entries(UIComponents)) {
  app.component(key, component)
}

app.mount('#app')
