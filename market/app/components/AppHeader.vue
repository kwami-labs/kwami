<template>
  <header class="sticky top-0 z-50 glass border-b border-gray-800">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2 group">
          <div class="w-10 h-10 bg-gradient-to-br from-kwami-purple to-kwami-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="text-2xl">👻</span>
          </div>
          <div>
            <h1 class="text-xl font-bold gradient-text">KWAMI</h1>
            <p class="text-xs text-gray-400">Marketplace</p>
          </div>
        </NuxtLink>

        <!-- Navigation -->
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink to="/" class="nav-link">
            Explore
          </NuxtLink>
          <NuxtLink to="/my-kwamis" class="nav-link">
            My KWAMIs
          </NuxtLink>
          <NuxtLink to="/create" class="nav-link">
            Create
          </NuxtLink>
          <NuxtLink to="/activity" class="nav-link">
            Activity
          </NuxtLink>
        </div>

        <!-- Wallet & Profile -->
        <div class="flex items-center space-x-4">
          <!-- Network Badge -->
          <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-sm text-gray-300">{{ network }}</span>
          </div>

          <!-- Wallet Button -->
          <WalletButton />

          <!-- Mobile Menu -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg hover:bg-gray-800"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                :d="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div 
        v-if="mobileMenuOpen" 
        class="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-2"
      >
        <NuxtLink 
          to="/" 
          class="block px-4 py-2 rounded-lg hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          Explore
        </NuxtLink>
        <NuxtLink 
          to="/my-kwamis" 
          class="block px-4 py-2 rounded-lg hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          My KWAMIs
        </NuxtLink>
        <NuxtLink 
          to="/create" 
          class="block px-4 py-2 rounded-lg hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          Create
        </NuxtLink>
        <NuxtLink 
          to="/activity" 
          class="block px-4 py-2 rounded-lg hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          Activity
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSolana } from '~/composables/useSolana'

const { network } = useSolana()
const mobileMenuOpen = ref(false)
</script>

<style scoped>
.nav-link {
  @apply text-gray-300 hover:text-white font-medium transition-colors relative;
}

.nav-link::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-kwami-purple to-kwami-blue transition-all duration-200;
}

.nav-link:hover::after {
  @apply w-full;
}

.router-link-active {
  @apply text-white;
}

.router-link-active::after {
  @apply w-full;
}
</style>

