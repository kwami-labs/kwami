import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/proposals',
      name: 'proposals',
      component: () => import('@/views/ProposalsView.vue'),
    },
    {
      path: '/proposals/:id',
      name: 'proposal-detail',
      component: () => import('@/views/ProposalDetailView.vue'),
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('@/views/CreateView.vue'),
    },
  ],
});

export default router;
