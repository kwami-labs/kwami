<template>
  <div class="mint-panel space-y-4">
    <!-- Minting Status -->
    <div
      v-if="nftStore.mintingStatus !== 'idle' && nftStore.mintingStatus !== 'success' && nftStore.mintingStatus !== 'error'"
      class="p-4 rounded-lg border border-primary-500/30 bg-white/20 dark:bg-black/20"
    >
      <div class="flex items-center space-x-3">
        <div class="w-4 h-4 rounded-full border-2 border-primary-500/40 border-t-primary-500 animate-spin" />
        <div>
          <p class="font-semibold text-gray-900 dark:text-white">{{ getMintingStatusText() }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Please wait...</p>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="nftStore.error" class="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
      <div class="flex items-start justify-between gap-3">
        <div class="text-sm font-semibold">{{ nftStore.error }}</div>
        <button
          type="button"
          class="text-xs opacity-70 hover:opacity-100"
          @click="nftStore.error = null"
        >
          Close
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="nftStore.mintingStatus === 'success'"
      class="p-4 rounded-lg border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
    >
      <div class="text-sm font-semibold">KWAMI Minted Successfully!</div>
      <div class="text-xs opacity-80 mt-1">Your unique KWAMI NFT has been created on Solana.</div>
    </div>

    <!-- Mint Button -->
    <KwamiGlassButton
      v-if="!wallet.connected"
      label="Connect Wallet"
      mode="outline"
      size="lg"
      :disabled="true"
      :block="true"
    />

    <KwamiGlassButton
      v-else-if="nftStore.mintingStatus === 'success'"
      label="Mint Another KWAMI"
      mode="outline"
      size="lg"
      :block="true"
      @click="handleReset"
    />

    <KwamiGlassButton
      v-else
      :label="nftStore.mintingStatus !== 'idle' ? 'Rolling…' : '🍬 Roll & Mint KWAMI'"
      mode="primary"
      size="lg"
      :disabled="nftStore.mintingStatus !== 'idle'"
      :block="true"
      @click="handleMint"
    />

    <!-- Cost Info -->
    <div class="text-center text-sm text-gray-500">
      <p>Minting cost: ~0.01 SOL + network fees</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useNFTStore } from '@/stores/nft'
import KwamiGlassButton from '@/components/KwamiGlassButton.vue'

const props = defineProps<{
  blobPreviewRef?: any
}>()

const wallet = useWalletStore()
const nftStore = useNFTStore()

const safeName = computed(() => {
  const dna = nftStore.currentDna
  if (dna && dna.length >= 10) {
    return `KWAMI ${dna.slice(0, 8).toUpperCase()}`
  }
  return 'KWAMI'
})

const handleMint = async () => {
  if (nftStore.mintingStatus !== 'idle') return

  try {
    // Slot-machine roll: randomize 12–24 times before minting
    if (props.blobPreviewRef?.rollCandyMachine) {
      await props.blobPreviewRef.rollCandyMachine({
        minSpins: 12,
        maxSpins: 24,
      })
    }

    // Get blob configuration and capture image
    let config: any
    let imageBuffer: Buffer | null = null

    if (props.blobPreviewRef) {
      config = props.blobPreviewRef.getConfig()
      imageBuffer = await props.blobPreviewRef.captureImage()

      if (!imageBuffer) {
        console.warn('[MintPanel] Failed to capture image, continuing with mock')
      }
    } else {
      console.warn('[MintPanel] BlobPreview ref not available, using default config')
      config = {
        resolution: 128,
        colors: { x: 0.8, y: 0.2, z: 0.9 },
        spikes: { x: 0.3, y: 0.3, z: 0.3 },
        rotation: { x: 0.01, y: 0.01, z: 0.01 },
        baseScale: 1.5,
        shininess: 50,
        opacity: 1.0,
      }
    }

    nftStore.setBlobConfig(config)
    nftStore.setImageBuffer(imageBuffer)

    // Mint KWAMI
    // (Soul config not wired in candy yet; pass undefined)
    await nftStore.mintKwami(
      config,
      {
        name: safeName.value,
        description: '',
      },
      undefined,
      imageBuffer
    )
  } catch (error: any) {
    console.error('Minting failed:', error)
  }
}

const handleReset = () => {
  nftStore.resetMintingStatus()
}

const getMintingStatusText = () => {
  switch (nftStore.mintingStatus) {
    case 'generating-dna':
      return 'Generating unique DNA...'
    case 'checking':
      return 'Checking DNA uniqueness...'
    case 'uploading':
      return 'Uploading to Arweave...'
    case 'minting':
      return 'Minting on Solana...'
    default:
      return 'Processing...'
  }
}
</script>
