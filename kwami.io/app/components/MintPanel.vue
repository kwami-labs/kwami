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
    const config = {
      // TODO: Get actual blob configuration
      body: {}
    }
    
    await nftStore.mintKwami(config, {
      name: form.name.trim(),
      description: form.description.trim(),
    })
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

