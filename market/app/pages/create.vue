<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4">
        <span class="gradient-text">Create Your KWAMI</span>
      </h1>
      <p class="text-xl text-gray-300">
        Mint a unique AI companion NFT on Solana
      </p>
    </div>

    <!-- Coming Soon Card -->
    <div class="card text-center py-16">
      <div class="text-8xl mb-6 animate-float">👻</div>
      <h2 class="text-3xl font-bold mb-4">KWAMI Creator Coming Soon</h2>
      <p class="text-gray-400 max-w-2xl mx-auto mb-8">
        The KWAMI creation studio is currently under development. Soon you'll be able to:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
        <div class="p-6 bg-gray-800 rounded-lg">
          <div class="text-4xl mb-3">🎨</div>
          <h3 class="font-bold mb-2">Customize Body</h3>
          <p class="text-sm text-gray-400">
            Design unique geometry, colors, and visual effects
          </p>
        </div>

        <div class="p-6 bg-gray-800 rounded-lg">
          <div class="text-4xl mb-3">🧠</div>
          <h3 class="font-bold mb-2">Configure Mind</h3>
          <p class="text-sm text-gray-400">
            Set up AI capabilities and voice preferences
          </p>
        </div>

        <div class="p-6 bg-gray-800 rounded-lg">
          <div class="text-4xl mb-3">💫</div>
          <h3 class="font-bold mb-2">Define Soul</h3>
          <p class="text-sm text-gray-400">
            Create unique personality and behavioral traits
          </p>
        </div>

        <div class="p-6 bg-gray-800 rounded-lg">
          <div class="text-4xl mb-3">🔐</div>
          <h3 class="font-bold mb-2">Mint NFT</h3>
          <p class="text-sm text-gray-400">
            Secure your KWAMI with DNA validation on-chain
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <p class="text-gray-400">
          In the meantime, explore existing KWAMIs on the marketplace
        </p>
        <div class="flex items-center justify-center space-x-4">
          <NuxtLink to="/" class="btn btn-primary text-lg px-8 py-3">
            Browse Marketplace
          </NuxtLink>
          <a 
            href="https://github.com/yourusername/kwami" 
            target="_blank"
            class="btn btn-outline text-lg px-8 py-3"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="text-4xl mb-3">🔒</div>
        <h3 class="font-bold mb-2">DNA Validation</h3>
        <p class="text-sm text-gray-400">
          Each KWAMI has a unique DNA hash verified on-chain
        </p>
      </div>

      <div class="card text-center">
        <div class="text-4xl mb-3">📦</div>
        <h3 class="font-bold mb-2">Arweave Storage</h3>
        <p class="text-sm text-gray-400">
          Permanent storage for your KWAMI's assets and metadata
        </p>
      </div>

      <div class="card text-center">
        <div class="text-4xl mb-3">⚡</div>
        <h3 class="font-bold mb-2">Solana Speed</h3>
        <p class="text-sm text-gray-400">
          Fast and low-cost minting on the Solana blockchain
        </p>
      </div>
    </div>

    <!-- Technical Details -->
    <div class="mt-12 card">
      <h3 class="text-2xl font-bold mb-4">Technical Specifications</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="flex items-start space-x-3">
          <div class="text-2xl">📋</div>
          <div>
            <p class="font-bold mb-1">Standard</p>
            <p class="text-gray-400">Metaplex NFT on Solana</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="text-2xl">🔗</div>
          <div>
            <p class="font-bold mb-1">Smart Contract</p>
            <p class="text-gray-400">Anchor Framework Program</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="text-2xl">💎</div>
          <div>
            <p class="font-bold mb-1">Max Supply</p>
            <p class="text-gray-400">1 Trillion KWAMIs</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="text-2xl">🎨</div>
          <div>
            <p class="font-bold mb-1">Royalty</p>
            <p class="text-gray-400">5% Creator Royalty</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page meta
definePageMeta({
  layout: 'default',
})
</script>

