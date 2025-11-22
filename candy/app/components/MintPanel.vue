<template>
  <div class="mint-panel space-y-6">
    <!-- Name Input -->
    <UFormGroup label="KWAMI Name" required>
      <UInput
        v-model="form.name"
        placeholder="My Awesome KWAMI"
        :maxlength="32"
        :disabled="nftStore.mintingStatus !== 'idle'"
      />
      <template #help>
        <span class="text-xs text-gray-500">{{ form.name.length }}/32 characters</span>
      </template>
    </UFormGroup>

    <!-- Description -->
    <UFormGroup label="Description">
      <UTextarea
        v-model="form.description"
        placeholder="Describe your unique KWAMI..."
        :rows="3"
        :maxlength="200"
        :disabled="nftStore.mintingStatus !== 'idle'"
      />
      <template #help>
        <span class="text-xs text-gray-500">{{ form.description.length }}/200 characters</span>
      </template>
    </UFormGroup>

    <!-- DNA Preview -->
    <div v-if="nftStore.currentDna" class="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-400">DNA Hash</span>
        <UBadge color="green" variant="subtle">Unique</UBadge>
      </div>
      <p class="font-mono text-xs break-all text-gray-300">{{ nftStore.currentDna }}</p>
    </div>

    <!-- Minting Status -->
    <div v-if="nftStore.mintingStatus !== 'idle'" class="p-4 bg-gray-900 rounded-lg border border-primary-500/50">
      <div class="flex items-center space-x-3">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-primary-400" />
        <div>
          <p class="font-semibold">{{ getMintingStatusText() }}</p>
          <p class="text-sm text-gray-400">Please wait...</p>
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
      Connect Wallet to Mint
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
      :disabled="!isFormValid || nftStore.mintingStatus !== 'idle'"
      @click="handleMint"
    >
      Mint KWAMI NFT
    </UButton>

    <!-- Cost Info -->
    <div class="text-center text-sm text-gray-500">
      <p>Minting cost: ~0.01 SOL + network fees</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  blobPreviewRef?: any
}>()

const wallet = useWalletStore()
const nftStore = useNFTStore()

const form = reactive({
  name: '',
  description: '',
})

const isFormValid = computed(() => {
  return form.name.trim().length >= 3 && form.name.trim().length <= 32
})

const handleMint = async () => {
  if (!isFormValid.value) return
  
  try {
    // Get blob configuration and capture image
    let config: any
    let imageBuffer: Buffer | null = null
    
    if (props.blobPreviewRef) {
      // Get configuration from BlobPreview component
      config = props.blobPreviewRef.getConfig()
      
      // Capture image from canvas
      imageBuffer = await props.blobPreviewRef.captureImage()
      
      if (!imageBuffer) {
        console.warn('[MintPanel] Failed to capture image, continuing with mock')
      }
    } else {
      // Fallback to default configuration
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
    
    // Store config and image buffer
    nftStore.setBlobConfig(config)
    nftStore.setImageBuffer(imageBuffer)
    
    // Mint KWAMI
    await nftStore.mintKwami(config, {
      name: form.name.trim(),
      description: form.description.trim(),
    }, imageBuffer)
  } catch (error: any) {
    console.error('Minting failed:', error)
  }
}

const handleReset = () => {
  nftStore.resetMintingStatus()
  form.name = ''
  form.description = ''
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

