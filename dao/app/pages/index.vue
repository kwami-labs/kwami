<template>
  <div class="dashboard">
    <div class="hero">
      <h1>Welcome to KWAMI DAO</h1>
      <p>Decentralized governance for KWAMI NFT holders</p>
    </div>
    
    <div class="dashboard-grid">
      <!-- Left Column: Verification & Balance -->
      <div class="left-column">
        <NFTVerification />
        
        <QwamiBalance v-if="auth.connected.value" />
        
        <div v-if="auth.isAuthenticated.value" class="stats-card">
          <h3>Your DAO Stats</h3>
          <div class="stats">
            <div class="stat">
              <span class="stat-label">KWAMI NFTs Owned</span>
              <span class="stat-value">{{ nftStore.kwamiCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Proposals Voted On</span>
              <span class="stat-value">{{ governanceStore.userVotes.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Voting Power</span>
              <span class="stat-value">{{ qwamiStore.formattedBalance }} QWAMI</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Column: Active Proposals -->
      <div class="right-column">
        <div class="section-header">
          <h2>Active Proposals</h2>
          <UButton
            v-if="auth.canParticipate.value"
            to="/create"
            icon="i-heroicons-plus"
            color="primary"
          >
            Create Proposal
          </UButton>
        </div>
        
        <div v-if="governanceStore.isLoading" class="loading">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
          <p>Loading proposals...</p>
        </div>
        
        <div v-else-if="governanceStore.activeProposals.length === 0" class="empty-state">
          <UIcon name="i-heroicons-document" class="icon" />
          <h3>No Active Proposals</h3>
          <p>Be the first to create a proposal!</p>
        </div>
        
        <div v-else class="proposals-list">
          <ProposalCard
            v-for="proposal in governanceStore.activeProposals"
            :key="proposal.id"
            :proposal="proposal"
            :can-vote="auth.canParticipate.value"
            @vote="handleVote"
            @view="handleView"
          />
        </div>
        
        <div v-if="governanceStore.activeProposals.length > 0" class="view-all">
          <UButton to="/proposals" variant="outline" block>
            View All Proposals
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth();
const nftStore = useNFTStore();
const qwamiStore = useQwamiStore();
const governanceStore = useGovernanceStore();
const router = useRouter();

// Fetch proposals on mount
onMounted(async () => {
  await governanceStore.fetchProposals();
});

const handleVote = (proposalId: string) => {
  router.push(`/proposals/${proposalId}`);
};

const handleView = (proposalId: string) => {
  router.push(`/proposals/${proposalId}`);
};
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-card {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  text-align: center;
}

.loading svg,
.empty-state .icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.view-all {
  margin-top: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>

