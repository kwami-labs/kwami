import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './assets/css/main.css'
import App from './App.vue'
import routes from './routes'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(pinia)
app.use(router)

app.mount('#app')
