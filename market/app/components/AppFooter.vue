<template>
  <footer class="border-t border-gray-800 mt-16">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div>
          <h3 class="font-bold text-lg mb-4">KWAMI Marketplace</h3>
          <p class="text-gray-400 text-sm">
            Trade unique AI companion NFTs on Solana. Each KWAMI has its own DNA, personality, and soul.
          </p>
        </div>

        <!-- Marketplace -->
        <div>
          <h4 class="font-semibold mb-4">Marketplace</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><NuxtLink to="/" class="hover:text-white">Explore</NuxtLink></li>
            <li><NuxtLink to="/my-kwamis" class="hover:text-white">My KWAMIs</NuxtLink></li>
            <li><NuxtLink to="/activity" class="hover:text-white">Activity</NuxtLink></li>
            <li><NuxtLink to="/create" class="hover:text-white">Create</NuxtLink></li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="font-semibold mb-4">Resources</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white">Documentation</a></li>
            <li><a href="#" class="hover:text-white">API</a></li>
            <li><a href="#" class="hover:text-white">Smart Contracts</a></li>
            <li><a href="#" class="hover:text-white">GitHub</a></li>
          </ul>
        </div>

        <!-- Community -->
        <div>
          <h4 class="font-semibold mb-4">Community</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white">Discord</a></li>
            <li><a href="#" class="hover:text-white">Twitter</a></li>
            <li><a href="#" class="hover:text-white">Blog</a></li>
            <li><a href="#" class="hover:text-white">Help Center</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
        <p>&copy; 2025 KWAMI. All rights reserved.</p>
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <a href="#" class="hover:text-white">Privacy Policy</a>
          <a href="#" class="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

