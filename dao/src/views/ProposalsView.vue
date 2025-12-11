<template>
  <div class="proposals-page">
    <div class="page-header">
      <h1>Governance Proposals</h1>
      <p>View and vote on community proposals</p>
    </div>
    
    <div class="filters">
      <UButton
        :color="filter === 'active' ? 'primary' : 'gray'"
        variant="soft"
        @click="filter = 'active'"
      >
        Active ({{ governanceStore.activeProposals.length }})
      </BaseButton>
      <UButton
        :color="filter === 'past' ? 'primary' : 'gray'"
        variant="soft"
        @click="filter = 'past'"
      >
        Past ({{ governanceStore.pastProposals.length }})
      </BaseButton>
      <UButton
        :color="filter === 'all' ? 'primary' : 'gray'"
        variant="soft"
        @click="filter = 'all'"
      >
        All ({{ governanceStore.proposals.length }})
      </BaseButton>
    </div>
    
    <div v-if="governanceStore.isLoading" class="loading">
      <BaseIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Loading proposals...</p>
    </div>
    
    <div v-else-if="filteredProposals.length === 0" class="empty-state">
      <BaseIcon name="i-heroicons-document" class="icon" />
      <h3>No {{ filter }} Proposals</h3>
      <p v-if="auth.canParticipate.value">Create the first proposal!</p>
      <UButton
        v-if="auth.canParticipate.value"
        to="/create"
        color="primary"
        class="mt-4"
      >
        Create Proposal
      </BaseButton>
    </div>
    
    <div v-else class="proposals-list">
      <ProposalCard
        v-for="proposal in filteredProposals"
        :key="proposal.id"
        :proposal="proposal"
        :can-vote="auth.canParticipate.value"
        @vote="handleVote"
        @view="handleView"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth();
const governanceStore = useGovernanceStore();
const router = useRouter();

const filter = ref<'all' | 'active' | 'past'>('active');

const filteredProposals = computed(() => {
  switch (filter.value) {
    case 'active':
      return governanceStore.activeProposals;
    case 'past':
      return governanceStore.pastProposals;
    default:
      return governanceStore.proposals;
  }
});

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
.proposals-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.125rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.loading,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  text-align: center;
}

.loading svg,
.empty-state .icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
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
</style>

