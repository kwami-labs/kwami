import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/CreatePage.vue'),
  },
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/views/ActivityPage.vue'),
  },
  {
    path: '/my-kwamis',
    name: 'my-kwamis',
    component: () => import('@/views/MyKwamisPage.vue'),
  },
  {
    path: '/nft/:mint',
    name: 'nft-detail',
    component: () => import('@/views/NftDetailPage.vue'),
    props: true,
  },
  {
    path: '/profile/:address',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
