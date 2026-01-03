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
      :disabled="false"
      :block="true"
      @click="handleConnect"
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
      <p>Minting cost: ~{{ mintCostSol.toFixed(1) }} SOL + network fees</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useNFTStore } from '@/stores/nft'
import KwamiGlassButton from '@/components/KwamiGlassButton.vue'
import { purchaseRoll } from '@/utils/solanaHelpers'

const props = defineProps<{
  blobPreviewRef?: any
  onRequestConnect?: () => void | Promise<void>
}>()

const wallet = useWalletStore()
const nftStore = useNFTStore()

const mintCostSol = computed(() => {
  // Linear schedule: 2026=0.1, 2027=0.2, 2028=0.3, ...
  const year = new Date().getUTCFullYear()
  const y = Math.max(2026, year)
  const steps = y - 2025
  return steps * 0.1
})

const safeName = computed(() => {
  // Use sequential numbering based on total minted
  // The on-chain counter is incremented before minting, so use current count
  return `KWAMI #${nftStore.totalMinted}`
})

const handleConnect = async () => {
  // Prefer opening the header wallet popover (same UX as top-right Connect Wallet)
  if (props.onRequestConnect) {
    await props.onRequestConnect()
    return
  }

  // Fallback: directly trigger wallet connect
  await wallet.connect()
}

const handleMint = async () => {
  if (nftStore.mintingStatus !== 'idle') return

  try {
    // Clear any previous error
    nftStore.error = null

    // Fetch latest total minted count for accurate numbering
    await nftStore.fetchStats()

    // 1) Pay first (wallet tx appears immediately)
    nftStore.mintingStatus = 'paying'
    const { rollId } = await purchaseRoll(wallet.wallet)
    nftStore.mintingStatus = 'confirming-payment'
    console.log('[MintPanel] Roll purchased. rollId:', rollId)

    // 2) Roll to pick a config, then verify DNA; if duplicate, roll again.
    nftStore.mintingStatus = 'rolling'
    if (!props.blobPreviewRef?.rollCandyMachine) {
      throw new Error('Blob preview not ready (cannot roll)')
    }

    let config: any | null = null
    let dna: string | null = null
    const maxAttempts = 8
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await props.blobPreviewRef.rollCandyMachine({ minSpins: 12, maxSpins: 24 })
      config = props.blobPreviewRef.getConfig?.()
      dna = props.blobPreviewRef.getDna?.()

      if (!config || !dna) {
        throw new Error('Failed to derive rolled config/DNA. Please try again.')
      }

      nftStore.mintingStatus = 'checking'
      const exists = await nftStore.checkDnaExists(dna)
      console.log(`[MintPanel] DNA check attempt ${attempt}/${maxAttempts}:`, exists ? 'DUPLICATE' : 'OK')
      if (!exists) break

      nftStore.mintingStatus = 'rolling'
      if (attempt === maxAttempts) {
        throw new Error('Could not find a unique DNA after several rolls. Please try again.')
      }
    }

    // 3) Capture assets for the final rolled config
    nftStore.mintingStatus = 'capturing'

    const image = await props.blobPreviewRef.captureImage?.()
    if (!image) {
      throw new Error('Failed to capture image. Please try again.')
    }

    // Capture short 3-second video at 20fps for small file size
    const videoCapture = await props.blobPreviewRef.captureVideo?.({ durationMs: 3_000, fps: 20, download: false })
    console.log('[MintPanel] Video capture result:', {
      hasBuffer: !!videoCapture?.buffer,
      bufferSize: videoCapture?.buffer?.length,
      mimeType: videoCapture?.mimeType,
      durationMs: videoCapture?.durationMs
    })
    if (!videoCapture?.buffer) {
      throw new Error('Failed to capture video. Please try again.')
    }

    // 4) Upload, then 5) finalize mint (wallet tx #2)
    await nftStore.mintKwami(
      config!,
      {
        name: safeName.value,
        description: 'A unique KWAMI NFT with animated video',
      },
      undefined,
      image,
      undefined,
      videoCapture.buffer,
      {
        rollId,
      }
    )
  } catch (error: any) {
    console.error('Minting failed:', error)
    nftStore.error = error?.message ?? String(error)
    nftStore.mintingStatus = 'error'
  }
}

const handleReset = () => {
  nftStore.resetMintingStatus()
}

const getMintingStatusText = () => {
  switch (nftStore.mintingStatus) {
    case 'preparing':
      return 'Preparing mint...'
    case 'capturing':
      return 'Capturing preview media...'
    case 'paying':
      return 'Paying mint cost...'
    case 'confirming-payment':
      return 'Confirming payment...'
    case 'rolling':
      return 'Rolling KWAMI...'
    case 'generating-dna':
      return 'Generating unique DNA...'
    case 'checking':
      return 'Checking DNA uniqueness...'
    case 'uploading-image':
      return 'Uploading image to IPFS...'
    case 'uploading-gif':
      return 'Uploading GIF to IPFS...'
    case 'uploading-video':
      return 'Uploading video to IPFS...'
    case 'uploading-metadata':
      return 'Uploading metadata to IPFS...'
    case 'minting':
      return 'Minting on Solana...'
    case 'confirming-mint':
      return 'Confirming mint...'
    case 'refreshing':
      return 'Finalizing & refreshing...'
    default:
      return 'Processing...'
  }
}
</script>
