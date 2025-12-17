<template>
  <div class="mint-panel space-y-4">
    <!-- Minting Status -->
    <div
      v-if="nftStore.mintingStatus !== 'idle' && nftStore.mintingStatus !== 'success' && nftStore.mintingStatus !== 'error'"
      class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-primary-500/50"
    >
      <div class="flex items-center space-x-3">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-primary-500 dark:text-primary-400" />
        <div>
          <p class="font-semibold text-gray-900 dark:text-white">{{ getMintingStatusText() }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Please wait...</p>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <UAlert
      v-if="nftStore.error"
      color="red"
      variant="subtle"
      :title="nftStore.error"
      @close="nftStore.error = null"
    />

    <!-- Success Message -->
    <UAlert
      v-if="nftStore.mintingStatus === 'success'"
      color="green"
      variant="subtle"
      title="KWAMI Minted Successfully!"
      description="Your unique KWAMI NFT has been created on the Solana blockchain."
    />

    <!-- Mint Button -->
    <UButton
      v-if="!wallet.connected"
      block
      size="xl"
      disabled
      color="gray"
    >
      Connect Wallet to Roll & Mint
    </UButton>

    <UButton
      v-else-if="nftStore.mintingStatus === 'success'"
      block
      size="xl"
      color="green"
      @click="handleReset"
    >
      Mint Another KWAMI
    </UButton>

    <UButton
      v-else
      block
      size="xl"
      color="primary"
      :loading="nftStore.mintingStatus !== 'idle'"
      :disabled="nftStore.mintingStatus !== 'idle'"
      @click="handleMint"
    >
      🍬 Roll & Mint KWAMI
    </UButton>

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

    // Mint KWAMI (no user-entered name/description)
    await nftStore.mintKwami(
      config,
      {
        name: safeName.value,
        description: '',
      },
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
