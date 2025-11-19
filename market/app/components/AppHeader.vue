<template>
  <header class="sticky top-0 z-40 glass border-b border-gray-800">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3 group">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-kwami-purple rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="text-2xl">👻</span>
          </div>
          <div>
            <h1 class="text-xl font-bold gradient-text">KWAMI</h1>
            <p class="text-xs text-gray-400">Marketplace</p>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-1">
          <NuxtLink
            to="/"
            class="nav-link"
            active-class="nav-link-active"
          >
            Explore
          </NuxtLink>
          <NuxtLink
            to="/my-kwamis"
            class="nav-link"
            active-class="nav-link-active"
          >
            My KWAMIs
          </NuxtLink>
          <NuxtLink
            to="/activity"
            class="nav-link"
            active-class="nav-link-active"
          >
            Activity
          </NuxtLink>
          <NuxtLink
            to="/create"
            class="nav-link"
            active-class="nav-link-active"
          >
            Create
          </NuxtLink>
        </nav>

        <!-- Wallet Button -->
        <div class="flex items-center space-x-4">
          <WalletButton />
          
          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <nav
          v-if="mobileMenuOpen"
          class="md:hidden py-4 border-t border-gray-800"
        >
          <NuxtLink
            to="/"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Explore</span>
          </NuxtLink>
          <NuxtLink
            to="/my-kwamis"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>My KWAMIs</span>
          </NuxtLink>
          <NuxtLink
            to="/activity"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span>Activity</span>
          </NuxtLink>
          <NuxtLink
            to="/create"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Create</span>
          </NuxtLink>
        </nav>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>
