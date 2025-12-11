<template>
  <div class="create-proposal">
    <div class="page-header">
      <h1>Create a Proposal</h1>
      <p>Submit a proposal to the KWAMI DAO for community voting</p>
    </div>
    
    <div v-if="!auth.isAuthenticated.value" class="auth-required">
      <BaseIcon name="i-heroicons-lock-closed" class="icon" />
      <h3>Authentication Required</h3>
      <p>You need to connect a wallet with a KWAMI NFT to create proposals</p>
      <WalletButton />
    </div>
    
    <div v-else-if="!qwamiStore.hasEnoughForGovernance" class="insufficient-balance">
      <BaseIcon name="i-heroicons-exclamation-triangle" class="icon" />
      <h3>Insufficient QWAMI Balance</h3>
      <p>You need at least 100 QWAMI tokens to create a proposal</p>
      <p class="balance">Your balance: {{ qwamiStore.formattedBalance }} QWAMI</p>
    </div>
    
    <div v-else class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">Proposal Title *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Enter a clear, concise title"
            required
            maxlength="100"
          />
          <span class="char-count">{{ form.title.length }}/100</span>
        </div>
        
        <div class="form-group">
          <label for="description">Proposal Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Provide a detailed description of your proposal, including rationale, expected impact, and implementation details."
            required
            rows="10"
            maxlength="2000"
          />
          <span class="char-count">{{ form.description.length }}/2000</span>
        </div>
        
        <div class="form-group">
          <label for="qwami-amount">QWAMI Stake *</label>
          <p class="helper-text">
            You must stake QWAMI tokens to create a proposal. This helps prevent spam and shows commitment to your proposal.
          </p>
          <input
            id="qwami-amount"
            v-model.number="form.qwamiAmount"
            type="number"
            :min="minimumStake"
            :max="qwamiStore.balance"
            placeholder="Enter QWAMI amount"
            required
          />
          <div class="stake-info">
            <span>Minimum: {{ minimumStake }} QWAMI</span>
            <span class="max-stake" @click="form.qwamiAmount = qwamiStore.balance">
              Max: {{ qwamiStore.formattedBalance }} QWAMI
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Voting Period</label>
          <select v-model.number="form.votingDays">
            <option :value="3">3 days</option>
            <option :value="5">5 days</option>
            <option :value="7">7 days (recommended)</option>
            <option :value="14">14 days</option>
          </select>
        </div>
        
        <div class="preview-section">
          <h3>Preview</h3>
          <div class="preview-card">
            <div class="preview-header">
              <h4>{{ form.title || 'Your proposal title' }}</h4>
              <BaseBadge color="blue">Active</BaseBadge>
            </div>
            <p class="preview-description">
              {{ form.description || 'Your proposal description will appear here...' }}
            </p>
            <div class="preview-meta">
              <span>{{ form.votingDays }} day voting period</span>
              <span>•</span>
              <span>{{ form.qwamiAmount }} QWAMI staked</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <UButton
            type="button"
            variant="outline"
            @click="router.back()"
          >
            Cancel
          </BaseButton>
          
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            Create Proposal
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const auth = useAuth();
const qwamiStore = useQwamiStore();
const governanceStore = useGovernanceStore();

const minimumStake = 100;
const isSubmitting = ref(false);

const form = reactive({
  title: '',
  description: '',
  qwamiAmount: minimumStake,
  votingDays: 7,
});

const isFormValid = computed(() => 
  form.title.length >= 10 &&
  form.description.length >= 50 &&
  form.qwamiAmount >= minimumStake &&
  form.qwamiAmount <= qwamiStore.balance
);

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    const proposal = await governanceStore.createProposal(
      form.title,
      form.description,
      form.qwamiAmount
    );
    
    // Success - redirect to the new proposal
    router.push(`/proposals/${proposal.id}`);
  } catch (error) {
    console.error('Error creating proposal:', error);
    // TODO: Show error notification
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.create-proposal {
  width: 100%;
  max-width: 800px;
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

.auth-required,
.insufficient-balance {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  text-align: center;
}

.icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.auth-required h3,
.insufficient-balance h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.auth-required p,
.insufficient-balance p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem 0;
}

.balance {
  font-weight: 600;
  color: #667eea;
}

.form-container {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.helper-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.form-group textarea {
  resize: vertical;
  min-height: 150px;
}

.char-count {
  position: absolute;
  right: 0.5rem;
  bottom: -1.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.stake-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.max-stake {
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
}

.max-stake:hover {
  color: #7c8fe9;
}

.preview-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.preview-card {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  flex: 1;
}

.preview-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 1rem 0;
  word-break: break-word;
}

.preview-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>

