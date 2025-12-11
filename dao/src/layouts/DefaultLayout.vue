<template>
  <div class="layout">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1>KWAMI DAO</h1>
            <p>Governance for KWAMI NFT Holders</p>
          </div>
          
          <nav class="nav">
            <RouterLink to="/" class="nav-link">
              <BaseIcon name="i-heroicons-home" />
              Dashboard
            </RouterLink>
            <RouterLink to="/proposals" class="nav-link">
              <BaseIcon name="i-heroicons-document-text" />
              Proposals
            </RouterLink>
            <RouterLink to="/create" class="nav-link">
              <BaseIcon name="i-heroicons-plus-circle" />
              Create
            </RouterLink>
          </nav>
          
          <div class="wallet-section">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
    
    <main class="main">
      <div class="container">
        <slot />
      </div>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 KWAMI DAO. Powered by Solana.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import WalletButton from '@/components/WalletButton.vue';
import BaseIcon from '@/components/BaseIcon.vue';

// Initialize wallet connection on mount
onMounted(() => {
  const walletStore = useWalletStore();
  walletStore.initializeConnection();
});
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.logo p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.nav {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.wallet-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 0;
  text-align: center;
}

.footer p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    width: 100%;
    justify-content: space-around;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>

