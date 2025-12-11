<template>
  <div class="proposal-detail">
    <div v-if="!proposal" class="loading">
      <BaseIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Loading proposal...</p>
    </div>
    
    <div v-else class="proposal-content">
      <div class="back-button">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="ghost"
          @click="router.back()"
        >
          Back
        </BaseButton>
      </div>
      
      <div class="proposal-header">
        <div class="title-row">
          <h1>{{ proposal.title }}</h1>
          <BaseBadge :color="statusColor" size="lg">
            {{ proposal.status }}
          </BaseBadge>
        </div>
        
        <div class="meta">
          <span>Created by {{ truncateAddress(proposal.creator) }}</span>
          <span>•</span>
          <span>{{ formatDate(proposal.createdAt) }}</span>
          <span>•</span>
          <span>{{ timeRemaining }}</span>
        </div>
      </div>
      
      <div class="proposal-body">
        <h3>Description</h3>
        <p>{{ proposal.description }}</p>
        
        <div class="requirements">
          <div class="requirement">
            <BaseIcon name="i-heroicons-users" />
            <span>Quorum: {{ proposal.quorum.toLocaleString() }} QWAMI</span>
          </div>
          <div class="requirement">
            <BaseIcon name="i-heroicons-ticket" />
            <span>Min. to create: {{ proposal.qwamiRequired }} QWAMI</span>
          </div>
        </div>
      </div>
      
      <div class="voting-section">
        <h3>Current Results</h3>
        
        <div class="vote-stats">
          <div class="vote-stat">
            <span class="label">For</span>
            <div class="bar">
              <div class="fill for" :style="{ width: `${forPercentage}%` }" />
            </div>
            <span class="value">{{ proposal.votesFor.toLocaleString() }} QWAMI</span>
          </div>
          
          <div class="vote-stat">
            <span class="label">Against</span>
            <div class="bar">
              <div class="fill against" :style="{ width: `${againstPercentage}%` }" />
            </div>
            <span class="value">{{ proposal.votesAgainst.toLocaleString() }} QWAMI</span>
          </div>
          
          <div class="vote-stat">
            <span class="label">Abstain</span>
            <div class="bar">
              <div class="fill abstain" :style="{ width: `${abstainPercentage}%` }" />
            </div>
            <span class="value">{{ proposal.votesAbstain.toLocaleString() }} QWAMI</span>
          </div>
        </div>
        
        <div v-if="hasVoted" class="voted-status">
          <BaseIcon name="i-heroicons-check-circle" />
          <p>You voted <strong>{{ userVote?.vote }}</strong> with {{ userVote?.qwamiAmount }} QWAMI</p>
        </div>
        
        <div v-else-if="auth.canParticipate.value && proposal.status === 'active'" class="vote-form">
          <h3>Cast Your Vote</h3>
          
          <div class="vote-amount">
            <label for="qwami-amount">QWAMI Amount</label>
            <input
              id="qwami-amount"
              v-model.number="voteAmount"
              type="number"
              :min="1"
              :max="qwamiStore.balance"
              placeholder="Enter QWAMI amount"
            />
            <span class="max-button" @click="voteAmount = qwamiStore.balance">Max</span>
          </div>
          
          <div class="vote-buttons">
            <UButton
              color="green"
              size="lg"
              icon="i-heroicons-hand-thumb-up"
              :loading="isVoting"
              :disabled="!canVote"
              @click="vote('for')"
            >
              Vote For
            </BaseButton>
            
            <UButton
              color="red"
              size="lg"
              icon="i-heroicons-hand-thumb-down"
              :loading="isVoting"
              :disabled="!canVote"
              @click="vote('against')"
            >
              Vote Against
            </BaseButton>
            
            <UButton
              color="gray"
              size="lg"
              icon="i-heroicons-minus-circle"
              :loading="isVoting"
              :disabled="!canVote"
              @click="vote('abstain')"
            >
              Abstain
            </BaseButton>
          </div>
        </div>
        
        <div v-else-if="!auth.canParticipate.value" class="cannot-vote">
          <BaseIcon name="i-heroicons-exclamation-triangle" />
          <p>You need to hold a KWAMI NFT and have at least 100 QWAMI to vote</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { publicKey } = useWallet();
const governanceStore = useGovernanceStore();
const qwamiStore = useQwamiStore();

const proposalId = route.params.id as string;
const voteAmount = ref(100);
const isVoting = ref(false);

const proposal = computed(() => 
  governanceStore.proposals.find(p => p.id === proposalId)
);

const totalVotes = computed(() => {
  if (!proposal.value) return 0;
  return proposal.value.votesFor + 
         proposal.value.votesAgainst + 
         proposal.value.votesAbstain;
});

const forPercentage = computed(() => 
  totalVotes.value > 0 && proposal.value 
    ? (proposal.value.votesFor / totalVotes.value) * 100 
    : 0
);

const againstPercentage = computed(() => 
  totalVotes.value > 0 && proposal.value
    ? (proposal.value.votesAgainst / totalVotes.value) * 100 
    : 0
);

const abstainPercentage = computed(() => 
  totalVotes.value > 0 && proposal.value
    ? (proposal.value.votesAbstain / totalVotes.value) * 100 
    : 0
);

const hasVoted = computed(() => 
  governanceStore.hasVoted(proposalId)
);

const userVote = computed(() => 
  governanceStore.getUserVote(proposalId)
);

const statusColor = computed(() => {
  if (!proposal.value) return 'gray';
  switch (proposal.value.status) {
    case 'active': return 'blue';
    case 'passed': return 'green';
    case 'rejected': return 'red';
    case 'executed': return 'purple';
    default: return 'gray';
  }
});

const timeRemaining = computed(() => {
  if (!proposal.value) return '';
  const now = Date.now();
  const remaining = proposal.value.endTime - now;
  
  if (remaining <= 0) return 'Voting ended';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
});

const canVote = computed(() => 
  voteAmount.value > 0 && 
  voteAmount.value <= qwamiStore.balance &&
  !isVoting.value
);

const vote = async (voteType: 'for' | 'against' | 'abstain') => {
  if (!publicKey.value || !canVote.value) return;
  
  isVoting.value = true;
  
  try {
    await governanceStore.vote(
      proposalId,
      voteType,
      voteAmount.value,
      publicKey.value
    );
    
    // Show success message
    console.log('Vote cast successfully!');
  } catch (error) {
    console.error('Error casting vote:', error);
  } finally {
    isVoting.value = false;
  }
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

onMounted(async () => {
  if (governanceStore.proposals.length === 0) {
    await governanceStore.fetchProposals();
  }
  
  if (!proposal.value) {
    router.push('/proposals');
  }
});
</script>

<style scoped>
.proposal-detail {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading svg {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.proposal-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.back-button {
  margin-bottom: -1rem;
}

.proposal-header {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-row h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  flex: 1;
}

.meta {
  display: flex;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.proposal-body {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.proposal-body h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.proposal-body p {
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1.5rem 0;
}

.requirements {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.voting-section {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.voting-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.vote-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.vote-stat {
  display: grid;
  grid-template-columns: 80px 1fr 150px;
  gap: 1rem;
  align-items: center;
}

.vote-stat .label {
  font-weight: 600;
}

.bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s;
}

.fill.for {
  background: linear-gradient(90deg, #10b981, #059669);
}

.fill.against {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.fill.abstain {
  background: linear-gradient(90deg, #6b7280, #4b5563);
}

.vote-stat .value {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
}

.voted-status,
.cannot-vote {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.voted-status {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.cannot-vote {
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  color: #fb923c;
}

.voted-status svg,
.cannot-vote svg {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.voted-status p,
.cannot-vote p {
  margin: 0;
}

.vote-form {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.vote-form h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.vote-amount {
  position: relative;
  margin-bottom: 1.5rem;
}

.vote-amount label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.vote-amount input {
  width: 100%;
  padding: 0.75rem 4rem 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.vote-amount input:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.max-button {
  position: absolute;
  right: 0.75rem;
  top: 2.25rem;
  padding: 0.25rem 0.75rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 0.25rem;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.max-button:hover {
  background: rgba(102, 126, 234, 0.3);
}

.vote-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .vote-buttons {
    grid-template-columns: 1fr;
  }
  
  .vote-stat {
    grid-template-columns: 70px 1fr 120px;
    gap: 0.75rem;
  }
}
</style>

