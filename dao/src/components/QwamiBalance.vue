<template>
  <div class="qwami-balance">
    <div class="balance-card">
      <div class="balance-header">
        <h3>QWAMI Balance</h3>
        <UButton
          icon="i-heroicons-arrow-path"
          size="xs"
          color="gray"
          variant="ghost"
          :loading="qwamiStore.isLoading"
          @click="refreshBalance"
        />
      </div>
      
      <div class="balance-amount">
        <span class="amount">{{ qwamiStore.formattedBalance }}</span>
        <span class="currency">QWAMI</span>
      </div>
      
      <div class="balance-status">
        <UBadge
          :color="qwamiStore.hasEnoughForGovernance ? 'green' : 'orange'"
          variant="subtle"
        >
          {{ qwamiStore.hasEnoughForGovernance ? 'Eligible for Governance' : 'Need 100+ QWAMI' }}
        </BaseBadge>
      </div>
      
      <div v-if="!qwamiStore.hasEnoughForGovernance" class="warning">
        <BaseIcon name="i-heroicons-exclamation-triangle" />
        <p>You need at least 100 QWAMI tokens to participate in governance.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useWallet } from 'solana-wallets-vue';
import { useQwamiStore } from '@/stores/qwami';
import BaseButton from '@/components/BaseButton.vue';
import BaseBadge from '@/components/BaseBadge.vue';
import BaseIcon from '@/components/BaseIcon.vue';

const { publicKey } = useWallet();
const qwamiStore = useQwamiStore();

const refreshBalance = async () => {
  if (publicKey.value) {
    await qwamiStore.fetchBalance(publicKey.value);
  }
};

// Auto-refresh balance every 30 seconds
onMounted(() => {
  const interval = setInterval(() => {
    if (publicKey.value) {
      refreshBalance();
    }
  }, 30000);
  
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.qwami-balance {
  width: 100%;
}

.balance-card {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.balance-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.currency {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.balance-status {
  margin-bottom: 1rem;
}

.warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #fb923c;
}

.warning svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.warning p {
  margin: 0;
}
</style>

