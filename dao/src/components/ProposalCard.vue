<template>
  <div class="proposal-card">
    <div class="proposal-header">
      <div class="proposal-title-row">
        <h3 class="proposal-title">{{ proposal.title }}</h3>
        <BaseBadge :color="statusColor" variant="subtle">
          {{ proposal.status }}
        </BaseBadge>
      </div>
      <p class="proposal-meta">
        By {{ truncateAddress(proposal.creator) }} • 
        {{ formatDate(proposal.createdAt) }}
      </p>
    </div>
    
    <p class="proposal-description">{{ proposal.description }}</p>
    
    <div class="voting-stats">
      <div class="stat-row">
        <span class="stat-label">For</span>
        <div class="stat-bar">
          <div 
            class="stat-fill for" 
            :style="{ width: `${forPercentage}%` }"
          />
        </div>
        <span class="stat-value">{{ proposal.votesFor.toLocaleString() }}</span>
      </div>
      
      <div class="stat-row">
        <span class="stat-label">Against</span>
        <div class="stat-bar">
          <div 
            class="stat-fill against" 
            :style="{ width: `${againstPercentage}%` }"
          />
        </div>
        <span class="stat-value">{{ proposal.votesAgainst.toLocaleString() }}</span>
      </div>
      
      <div class="stat-row">
        <span class="stat-label">Abstain</span>
        <div class="stat-bar">
          <div 
            class="stat-fill abstain" 
            :style="{ width: `${abstainPercentage}%` }"
          />
        </div>
        <span class="stat-value">{{ proposal.votesAbstain.toLocaleString() }}</span>
      </div>
    </div>
    
    <div class="proposal-footer">
      <div class="time-remaining">
        <BaseIcon name="i-heroicons-clock" />
        <span>{{ timeRemaining }}</span>
      </div>
      
      <div class="actions">
        <UButton
          v-if="!hasVoted && canVote"
          color="primary"
          @click="$emit('vote', proposal.id)"
        >
          Vote
        </BaseButton>
        <BaseBadge v-else-if="hasVoted" color="green">
          Voted {{ userVote?.vote }}
        </BaseBadge>
        <UButton
          variant="outline"
          @click="$emit('view', proposal.id)"
        >
          View Details
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Proposal } from '@/stores/governance';
import { useGovernanceStore } from '@/stores/governance';
import BaseIcon from '@/components/BaseIcon.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseBadge from '@/components/BaseBadge.vue';

const props = defineProps<{
  proposal: Proposal;
  canVote: boolean;
}>();

defineEmits<{
  vote: [proposalId: string];
  view: [proposalId: string];
}>();

const governanceStore = useGovernanceStore();

const totalVotes = computed(() => 
  props.proposal.votesFor + 
  props.proposal.votesAgainst + 
  props.proposal.votesAbstain
);

const forPercentage = computed(() => 
  totalVotes.value > 0 ? (props.proposal.votesFor / totalVotes.value) * 100 : 0
);

const againstPercentage = computed(() => 
  totalVotes.value > 0 ? (props.proposal.votesAgainst / totalVotes.value) * 100 : 0
);

const abstainPercentage = computed(() => 
  totalVotes.value > 0 ? (props.proposal.votesAbstain / totalVotes.value) * 100 : 0
);

const hasVoted = computed(() => 
  governanceStore.hasVoted(props.proposal.id)
);

const userVote = computed(() => 
  governanceStore.getUserVote(props.proposal.id)
);

const statusColor = computed(() => {
  switch (props.proposal.status) {
    case 'active': return 'blue';
    case 'passed': return 'green';
    case 'rejected': return 'red';
    case 'executed': return 'purple';
    default: return 'gray';
  }
});

const timeRemaining = computed(() => {
  const now = Date.now();
  const remaining = props.proposal.endTime - now;
  
  if (remaining <= 0) return 'Ended';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
});

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
</script>

<style scoped>
.proposal-card {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  transition: all 0.2s;
}

.proposal-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

.proposal-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.proposal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  flex: 1;
}

.proposal-meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.proposal-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.voting-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  gap: 1rem;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.stat-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  transition: width 0.3s;
}

.stat-fill.for {
  background: linear-gradient(90deg, #10b981, #059669);
}

.stat-fill.against {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.stat-fill.abstain {
  background: linear-gradient(90deg, #6b7280, #4b5563);
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
}

.proposal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.time-remaining {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>

