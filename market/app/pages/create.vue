<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold mb-2">Create Your KWAMI</h1>
      <p class="text-gray-400">
        Mint a unique AI companion NFT with DNA-based uniqueness
      </p>
    </div>

    <!-- Info Card -->
    <div class="card mb-8 bg-primary-500/10 border-primary-500/30">
      <div class="flex items-start space-x-3">
        <svg class="w-6 h-6 text-primary-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h3 class="font-bold text-primary-400 mb-2">Creating KWAMIs</h3>
          <p class="text-sm text-gray-300">
            To create a KWAMI NFT, you'll need to use the main KWAMI application. 
            This marketplace is for buying, selling, and trading existing KWAMIs.
          </p>
        </div>
      </div>
    </div>

    <!-- Steps -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold mb-6">How to Create a KWAMI</h2>
      
      <div class="space-y-6">
        <!-- Step 1 -->
        <div class="flex items-start space-x-4">
          <div class="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
            1
          </div>
          <div>
            <h3 class="font-bold mb-1">Configure Your KWAMI</h3>
            <p class="text-gray-400 text-sm">
              Use the main KWAMI application to design your AI companion. 
              Customize its body, mind, and soul to create a unique DNA hash.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex items-start space-x-4">
          <div class="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
            2
          </div>
          <div>
            <h3 class="font-bold mb-1">Verify DNA Uniqueness</h3>
            <p class="text-gray-400 text-sm">
              The system will check if your KWAMI's DNA is unique. 
              Each KWAMI must have a one-of-a-kind DNA hash.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex items-start space-x-4">
          <div class="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
            3
          </div>
          <div>
            <h3 class="font-bold mb-1">Upload to Arweave</h3>
            <p class="text-gray-400 text-sm">
              Your KWAMI's assets (3D model, thumbnail) and metadata are uploaded to Arweave for permanent storage.
            </p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex items-start space-x-4">
          <div class="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
            4
          </div>
          <div>
            <h3 class="font-bold mb-1">Mint NFT</h3>
            <p class="text-gray-400 text-sm">
              The NFT is minted on Solana using Metaplex standard. 
              Your KWAMI's DNA is registered on-chain to prevent duplicates.
            </p>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="flex items-start space-x-4">
          <div class="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
            5
          </div>
          <div>
            <h3 class="font-bold mb-1">List on Marketplace</h3>
            <p class="text-gray-400 text-sm">
              Once minted, you can list your KWAMI for sale on this marketplace or keep it in your collection.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Requirements -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold mb-4">Requirements</h2>
      <ul class="space-y-3">
        <li class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>Solana wallet with SOL for transaction fees (~0.01 SOL)</span>
        </li>
        <li class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>Additional SOL for Arweave storage (~0.001 SOL per NFT)</span>
        </li>
        <li class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>Unique KWAMI configuration (DNA must not exist)</span>
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4">
      <a
        href="https://github.com/your-repo/kwami"
        target="_blank"
        class="btn btn-primary flex-1"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
        </svg>
        <span>Open KWAMI App</span>
      </a>
      <NuxtLink to="/" class="btn btn-outline flex-1">
        Browse Marketplace
      </NuxtLink>
    </div>

    <!-- Educational Section -->
    <div class="mt-12 pt-8 border-t border-gray-800">
      <h2 class="text-2xl font-bold mb-6">Learn More</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://docs.solana.com"
          target="_blank"
          class="card hover:border-primary-500/50 transition-all"
        >
          <h3 class="font-bold mb-2">Solana NFT Standard</h3>
          <p class="text-sm text-gray-400">
            Learn about Solana's NFT implementation and Metaplex
          </p>
        </a>
        <a
          href="https://docs.metaplex.com"
          target="_blank"
          class="card hover:border-primary-500/50 transition-all"
        >
          <h3 class="font-bold mb-2">Metaplex Documentation</h3>
          <p class="text-sm text-gray-400">
            Understand how Metaplex NFTs work on Solana
          </p>
        </a>
        <a
          href="https://www.arweave.org"
          target="_blank"
          class="card hover:border-primary-500/50 transition-all"
        >
          <h3 class="font-bold mb-2">Arweave Storage</h3>
          <p class="text-sm text-gray-400">
            Discover permanent decentralized storage
          </p>
        </a>
        <NuxtLink
          to="/activity"
          class="card hover:border-primary-500/50 transition-all"
        >
          <h3 class="font-bold mb-2">Recent Activity</h3>
          <p class="text-sm text-gray-400">
            See the latest KWAMI mints and sales
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>
