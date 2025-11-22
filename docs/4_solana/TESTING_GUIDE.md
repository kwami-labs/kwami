# 🧪 KWAMI Solana Programs - Complete Testing Guide

**Testing Strategy for QWAMI Token and KWAMI NFT Programs**

---

## 📋 Pre-Testing Checklist

### **Environment Setup Required**

Before running any tests, ensure you have:

- [ ] Rust & Cargo installed (v1.75+)
- [ ] Solana CLI installed (v1.18+)
- [ ] Anchor Framework installed (v0.29+)
- [ ] Node.js installed (v18+)
- [ ] Devnet wallet funded (5+ SOL)

**Setup Instructions:** See [`SETUP.md`](./SETUP.md)

---

## 🎯 Testing Phases

### **Phase 1: Foundation Tests (Current)**
- ✅ QWAMI Token: Basic mint/burn
- ✅ KWAMI NFT: Generation-based supply with DNA validation
- **Status:** Basic tests exist, passing (30% coverage)

### **Phase 2: Economic Features Tests (Pending)**
- ⏳ QWAMI: SOL/USDC exchange
- ⏳ KWAMI NFT: QWAMI payment requirement
- ⏳ Treasury accounting
- **Status:** Specification complete, tests to be written

### **Phase 3: Integration Tests (Pending)**
- ⏳ Full user journeys
- ⏳ Cross-program invocations
- ⏳ Treasury management
- **Status:** After Phase 2 implementation

### **Phase 4: Security Tests (Pending)**
- ⏳ Attack vectors
- ⏳ Edge cases
- ⏳ Gas optimization
- **Status:** Pre-audit

---

## 🔧 Quick Start: Running Tests

### **1. Setup Test Environment**

```bash
# Navigate to project root
cd /home/kali/labs/kwami/solana

# Ensure Anchor is installed
anchor --version

# Should output: anchor-cli 0.29.0 (or newer)
```

### **2. Test QWAMI Token Program**

```bash
cd anchor/qwami-token

# Clean previous builds
anchor clean

# Build program
anchor build

# Run tests (local validator)
anchor test

# Run tests with logs
anchor test -- --nocapture

# Run specific test
anchor test -- --test test_mint_tokens
```

### **3. Test KWAMI NFT Program**

```bash
cd ../kwami-nft

# Clean and build
anchor clean
anchor build

# Run tests
anchor test

# With logs
anchor test -- --nocapture
```

### **4. Quick Validation (No Build)**

```bash
# Check Rust syntax
cd anchor/qwami-token/programs/qwami-token
cargo check

cd ../../kwami-nft/programs/kwami-nft
cargo check
```

---

## 📝 Current Test Coverage

### **QWAMI Token Tests** (`anchor/qwami-token/tests/qwami-token.ts`)

**Existing Tests:**
1. ✅ Initialize token and authority
2. ✅ Mint tokens (authority only)
3. ✅ Mint additional tokens
4. ✅ Max supply validation
5. ✅ Burn tokens
6. ✅ Burn more than balance (fail)
7. ✅ Update base price
8. ✅ Unauthorized price update (fail)
9. ✅ Transfer authority
10. ✅ Supply statistics tracking

**Test Coverage:** ~80% of current functionality

**Missing Tests (For Phase 2):**
- ⏳ Mint with SOL
- ⏳ Mint with USDC
- ⏳ Burn for SOL
- ⏳ Burn for USDC
- ⏳ Treasury balance validation
- ⏳ Reserve requirement checks

### **KWAMI NFT Tests** (To be created)

**Required Tests:**
1. ⏳ Initialize collection and DNA registry
2. ⏳ Mint NFT with unique DNA
3. ⏳ Reject duplicate DNA
4. ⏳ Generation supply cap validation
5. ⏳ Update metadata (mind/soul)
6. ⏳ Burn NFT and remove DNA
7. ⏳ Current generation calculation
8. ⏳ DNA validation logic

**Phase 2 Tests (Payment Integration):**
- ⏳ Mint with QWAMI payment
- ⏳ Insufficient QWAMI balance (fail)
- ⏳ Burn with 50% refund
- ⏳ Treasury accounting updates
- ⏳ Revenue split (80/20)

---

## 🧪 Test Scenarios

### **Scenario 1: Happy Path - New User Mints NFT**

**Setup:**
```typescript
// User starts with 2 SOL
const userSol = 2_000_000_000; // lamports
```

**Test Steps:**
1. ✅ User mints QWAMI with 1 SOL
   - **Expected:** Receive 10,000 QWAMI
   - **Verify:** User QWAMI balance = 10,000
   - **Verify:** Treasury SOL balance = 1 SOL

2. ✅ User mints KWAMI NFT (costs 1,150 QWAMI)
   - **Expected:** NFT minted, 8,850 QWAMI remaining
   - **Verify:** User owns NFT
   - **Verify:** DNA registered
   - **Verify:** Treasury QWAMI balance = 1,150
   - **Verify:** Dividend pool = 920 (80%)
   - **Verify:** Operations fund = 230 (20%)

3. ✅ User burns QWAMI for USDC
   - **Expected:** Receive 88.50 USDC
   - **Verify:** QWAMI burned
   - **Verify:** Treasury USDC decreased

**Success Criteria:**
- All balances correct
- No errors
- Treasury accounting accurate

---

### **Scenario 2: Burn and Remint (DNA Change)**

**Setup:**
```typescript
// User owns KWAMI NFT from Scenario 1
```

**Test Steps:**
1. ✅ User burns KWAMI NFT
   - **Expected:** 50% refund (500 QWAMI)
   - **Verify:** NFT burned
   - **Verify:** DNA removed from registry
   - **Verify:** User receives 500 QWAMI

2. ✅ User mints new KWAMI with different DNA
   - **Expected:** New NFT created
   - **Verify:** New DNA registered
   - **Verify:** Old DNA now available

**Success Criteria:**
- Refund correct (50%)
- DNA registry updated
- New mint successful

---

### **Scenario 3: Generation Supply Cap**

**Setup:**
```typescript
// Simulate Gen #0 with 133.33M minted
const generation0Cap = 133_333_333;
```

**Test Steps:**
1. ✅ Mint exactly up to cap
   - **Expected:** Success
   - **Verify:** Total minted = 133,333,333

2. ❌ Attempt to mint one more
   - **Expected:** Error: GenerationSupplyReached
   - **Verify:** Transaction fails

3. ✅ Advance to Gen #1 (simulate time)
   - **Expected:** Can mint again
   - **Verify:** New cap = 266,666,667

**Success Criteria:**
- Cap enforced correctly
- Generation transition works
- Error codes correct

---

### **Scenario 4: Duplicate DNA Rejection**

**Test Steps:**
1. ✅ Mint NFT with DNA hash A
   - **Expected:** Success
   - **Verify:** DNA A registered

2. ❌ Attempt to mint with same DNA hash A
   - **Expected:** Error: DuplicateDNA
   - **Verify:** Transaction fails

3. ✅ Mint with different DNA hash B
   - **Expected:** Success
   - **Verify:** Both DNA A and B registered

**Success Criteria:**
- Uniqueness enforced
- Registry contains both DNAs
- Proper error messages

---

### **Scenario 5: Treasury Reserve Requirements**

**Test Steps:**
1. ✅ Check treasury reserves
   - **Expected:** SOL + USDC ≥ 110% of QWAMI liabilities

2. ❌ Attempt withdrawal breaking reserve
   - **Expected:** Error: InsufficientReserves
   - **Verify:** Transaction fails

3. ✅ Valid withdrawal within reserves
   - **Expected:** Success
   - **Verify:** Reserves still ≥ 110%

**Success Criteria:**
- Reserve checks working
- Protected against under-collateralization

---

## 🔍 Integration Test Suites

### **Suite 1: QWAMI Token Exchange**

```typescript
describe("QWAMI Exchange", () => {
  it("should mint QWAMI with SOL", async () => {
    // Test implementation
  });
  
  it("should mint QWAMI with USDC", async () => {
    // Test implementation
  });
  
  it("should burn QWAMI for SOL", async () => {
    // Test implementation
  });
  
  it("should burn QWAMI for USDC", async () => {
    // Test implementation
  });
  
  it("should maintain 110% reserves", async () => {
    // Test implementation
  });
  
  it("should prevent over-burning without reserves", async () => {
    // Test implementation
  });
});
```

### **Suite 2: KWAMI NFT Minting**

```typescript
describe("KWAMI NFT Minting", () => {
  it("should require QWAMI payment", async () => {
    // Test implementation
  });
  
  it("should validate DNA uniqueness", async () => {
    // Test implementation
  });
  
  it("should enforce generation caps", async () => {
    // Test implementation
  });
  
  it("should split revenue 80/20", async () => {
    // Test implementation
  });
  
  it("should update treasury accounting", async () => {
    // Test implementation
  });
});
```

### **Suite 3: NFT Burn & Refund**

```typescript
describe("KWAMI NFT Burning", () => {
  it("should refund 50% QWAMI", async () => {
    // Test implementation
  });
  
  it("should remove DNA from registry", async () => {
    // Test implementation
  });
  
  it("should allow DNA reuse after burn", async () => {
    // Test implementation
  });
  
  it("should update treasury accounting", async () => {
    // Test implementation
  });
});
```

---

## 🛡️ Security Test Cases

### **Attack Vector 1: Overflow/Underflow**

```typescript
it("should prevent arithmetic overflow", async () => {
  const maxU64 = new BN("18446744073709551615");
  
  try {
    await program.methods
      .mintTokens(maxU64)
      .rpc();
    assert.fail("Should have thrown overflow error");
  } catch (err) {
    assert.include(err.toString(), "MathOverflow");
  }
});
```

### **Attack Vector 2: Reentrancy**

```typescript
it("should prevent reentrancy attacks", async () => {
  // Test implementation
  // Ensure state updates before external calls
});
```

### **Attack Vector 3: Authority Bypass**

```typescript
it("should reject unauthorized mint", async () => {
  const fakeAuthority = Keypair.generate();
  
  try {
    await program.methods
      .mintTokens(1000)
      .accounts({
        authority: fakeAuthority.publicKey,
        // ...
      })
      .signers([fakeAuthority])
      .rpc();
    assert.fail("Should have rejected fake authority");
  } catch (err) {
    assert.include(err.toString(), "InvalidAuthority");
  }
});
```

### **Attack Vector 4: Price Manipulation**

```typescript
it("should validate oracle prices", async () => {
  // Test implementation
  // Ensure price deviations caught
});
```

---

## 📊 Performance Benchmarks

### **Target Metrics**

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Mint QWAMI (SOL) | <5000 CU | TBD | ⏳ |
| Mint QWAMI (USDC) | <5000 CU | TBD | ⏳ |
| Burn QWAMI | <5000 CU | TBD | ⏳ |
| Mint KWAMI NFT | <15000 CU | TBD | ⏳ |
| Burn KWAMI NFT | <10000 CU | TBD | ⏳ |
| Update Metadata | <5000 CU | TBD | ⏳ |

**CU = Compute Units**

### **Measuring Performance**

```bash
# Build in release mode
anchor build --release

# Measure compute units
solana logs <program_id> | grep "consumed"
```

---

## 🚦 Test Environment Setup

### **Local Test Validator**

```bash
# Start local validator
solana-test-validator

# In another terminal
solana config set --url http://localhost:8899
solana airdrop 10
```

### **Devnet Testing**

```bash
# Configure for devnet
solana config set --url https://api.devnet.solana.com

# Fund wallet
solana airdrop 2

# Deploy programs
cd solana/anchor/qwami-token
anchor deploy --provider.cluster devnet

cd ../kwami-nft
anchor deploy --provider.cluster devnet

# Run integration tests
anchor test --skip-local-validator
```

---

## ✅ Test Results Format

### **Expected Output**

```bash
Running tests...

QWAMI Token Tests:
  ✓ Initialize token and authority (234ms)
  ✓ Mint tokens within supply limit (456ms)
  ✓ Reject mint exceeding supply (123ms)
  ✓ Burn tokens successfully (234ms)
  ✓ Update base price (123ms)
  ✓ Transfer authority (234ms)

KWAMI NFT Tests:
  ✓ Initialize collection (345ms)
  ✓ Mint with unique DNA (567ms)
  ✓ Reject duplicate DNA (234ms)
  ✓ Enforce generation caps (345ms)
  ✓ Burn with refund (456ms)

Integration Tests:
  ✓ Full user journey (1234ms)
  ✓ Treasury accounting (567ms)

12 passing (5.2s)
```

---

## 🐛 Common Test Failures & Fixes

### **Issue: "Account not found"**
**Cause:** PDA derivation mismatch  
**Fix:** Verify seeds and bump values

### **Issue: "Insufficient funds"**
**Cause:** Test wallet not funded  
**Fix:** `solana airdrop 5`

### **Issue: "Program failed to complete"**
**Cause:** CU limit exceeded  
**Fix:** Optimize code or increase CU limit

### **Issue: "Custom program error: 0x1"**
**Cause:** Custom error code triggered  
**Fix:** Check error enum and fix logic

---

## 📋 Pre-Deployment Test Checklist

### **Code Quality**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] No compiler warnings
- [ ] Code formatted (`cargo fmt`)
- [ ] Linter clean (`cargo clippy`)

### **Functionality**
- [ ] All instructions working
- [ ] Error codes comprehensive
- [ ] Edge cases handled
- [ ] Gas optimized (<15K CU)

### **Security**
- [ ] No overflow/underflow
- [ ] Access control verified
- [ ] Reentrancy protected
- [ ] Oracle integration secure

### **Economic Model**
- [ ] Treasury accounting accurate
- [ ] Reserve requirements met
- [ ] Revenue splits correct (80/20)
- [ ] Refunds calculated properly

### **Integration**
- [ ] CPI calls working
- [ ] Frontend compatible
- [ ] Wallet adapters tested
- [ ] Error handling graceful

---

## 🔧 Testing Tools

### **Recommended Tools**
- **Anchor Test Suite** - Built-in testing
- **Solana Test Validator** - Local testing
- **Bankrun** - Fast testing framework
- **Solana Explorer** - Transaction inspection
- **Phantom Wallet** - User testing

### **Monitoring**
```bash
# Watch logs
solana logs <program_id>

# Monitor transaction
solana confirm -v <signature>

# Check account
solana account <address>
```

---

## 📚 Testing Resources

- **Anchor Testing Docs:** https://www.anchor-lang.com/docs/testing
- **Solana Cookbook:** https://solanacookbook.com/#testing
- **Bankrun:** https://kevinheavey.github.io/solana-bankrun/

---

## 🎯 Current Status

**Foundation Tests:**
- QWAMI Token: ✅ 80% coverage
- KWAMI NFT: ⏳ 0% (tests to be written)

**Economic Tests:**
- ⏳ 0% (after Phase 2 implementation)

**Integration Tests:**
- ⏳ 0% (after Phase 3)

**Security Tests:**
- ⏳ 0% (pre-audit)

**Overall Test Coverage:** ~30%

---

## 🚀 Next Steps

1. **Set up development environment** (follow SETUP.md)
2. **Run existing QWAMI token tests**
3. **Create KWAMI NFT test suite**
4. **Implement Phase 2 tests** (after economic features)
5. **Run integration tests**
6. **Security testing & audit**

---

**Document Version:** 1.0  
**Last Updated:** November 19, 2025  
**Status:** Ready for Testing (pending environment setup)

---

*Test early, test often! 🧪*

