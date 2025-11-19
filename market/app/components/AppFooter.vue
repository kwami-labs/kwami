<template>
  <footer class="border-t border-gray-800 mt-20">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-kwami-purple rounded-xl flex items-center justify-center">
              <span class="text-2xl">👻</span>
            </div>
            <div>
              <h2 class="text-xl font-bold gradient-text">KWAMI</h2>
              <p class="text-xs text-gray-400">Marketplace</p>
            </div>
          </div>
          <p class="text-gray-400 text-sm max-w-md">
            Discover, collect, and trade unique AI companion NFTs on Solana. Each KWAMI is a one-of-a-kind digital being with its own DNA, personality, and soul.
          </p>
        </div>

        <!-- Marketplace Links -->
        <div>
          <h3 class="font-bold mb-4">Marketplace</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Explore
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/activity" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Activity
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/create" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Create KWAMI
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/my-kwamis" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                My Collection
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h3 class="font-bold mb-4">Resources</h3>
          <ul class="space-y-2">
            <li>
              <a href="https://docs.solana.com" target="_blank" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Solana Docs
              </a>
            </li>
            <li>
              <a href="https://docs.metaplex.com" target="_blank" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Metaplex Docs
              </a>
            </li>
            <li>
              <a href="https://phantom.app" target="_blank" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Get Phantom
              </a>
            </li>
            <li>
              <a href="https://github.com" target="_blank" class="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <p class="text-gray-400 text-sm">
          © {{ new Date().getFullYear() }} KWAMI Marketplace. Built on Solana.
        </p>
        
        <div class="flex items-center space-x-6">
          <a
            href="#"
            class="text-gray-400 hover:text-primary-400 transition-colors"
            title="Twitter"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
            </svg>
          </a>
          <a
            href="#"
            class="text-gray-400 hover:text-primary-400 transition-colors"
            title="Discord"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
