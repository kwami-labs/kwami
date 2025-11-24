<template>
  <div class="mt-12">
    <h2 class="mb-8 text-3xl font-bold text-white">
      Ecosystem Projects
    </h2>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="project in projects"
        :key="project.id"
        :to="project.to"
        class="group transition-all hover:scale-105"
        :ui="{
          background: 'bg-white/5 group-hover:bg-white/10',
          ring: 'ring-1 ring-white/10 group-hover:ring-emerald-400/50',
          rounded: 'rounded-2xl',
          shadow: 'shadow-lg group-hover:shadow-2xl'
        }"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            :class="project.iconBg"
          >
            {{ project.icon }}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold text-white group-hover:text-emerald-300 transition-colors">
              {{ project.title }}
            </h3>
            <p class="mt-1 text-sm text-slate-400">
              {{ project.description }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const projects = [
  {
    id: 'kwami',
    title: 'KWAMI Core',
    description: 'Foundational library with 3D rendering, AI behavior, and state management',
    to: '/1_kwami/README',
    icon: '🎭',
    iconBg: 'bg-purple-500/20 text-purple-300'
  },
  {
    id: 'playground',
    title: 'Playground',
    description: 'Interactive development environment with visual blob editor',
    to: '/2_pg/README',
    icon: '🎨',
    iconBg: 'bg-blue-500/20 text-blue-300'
  },
  {
    id: 'app',
    title: 'KWAMI App',
    description: 'Main Nuxt application with voice interaction and visualization',
    to: '/3_app/README',
    icon: '🚀',
    iconBg: 'bg-emerald-500/20 text-emerald-300'
  },
  {
    id: 'solana',
    title: 'Solana Programs',
    description: 'Blockchain integration with KWAMI NFT and QWAMI token',
    to: '/4_solana/README',
    icon: '⛓️',
    iconBg: 'bg-indigo-500/20 text-indigo-300'
  },
  {
    id: 'candy',
    title: 'Candy Machine',
    description: 'NFT minting interface with DNA generation and validation',
    to: '/5_candy/README',
    icon: '🍬',
    iconBg: 'bg-pink-500/20 text-pink-300'
  },
  {
    id: 'market',
    title: 'NFT Marketplace',
    description: 'Trading platform for buying and selling KWAMI NFTs',
    to: '/6_market/README',
    icon: '🏪',
    iconBg: 'bg-orange-500/20 text-orange-300'
  },
  {
    id: 'dao',
    title: 'DAO',
    description: 'Decentralized governance with proposals and voting',
    to: '/7_dao/README',
    icon: '🏛️',
    iconBg: 'bg-cyan-500/20 text-cyan-300'
  },
  {
    id: 'web',
    title: 'Website',
    description: 'Public-facing website with landing page and feature showcase',
    to: '/8_web/README',
    icon: '🌐',
    iconBg: 'bg-green-500/20 text-green-300'
  }
]
</script>

