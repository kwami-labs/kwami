# 🧪 KWAMI DAO Testing Checklist

## Pre-Flight Check

Before running the DAO, ensure:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created (copy from `.env.example`)
- [ ] Solana wallet extension installed (Phantom recommended)

## Development Server

### Start Server

```bash
cd dao
npm run dev
```

Expected output:
```
Nuxt 4.2.1 with Nitro 2.x
Local:    http://localhost:3000
```

### Verify Server

Visit: `http://localhost:3000`

Expected: DAO dashboard loads with gradient background

## Feature Testing

### 1. Wallet Connection ✅

**Test:** Connect Phantom wallet

Steps:
1. Click "Select Wallet" button
2. Choose Phantom from wallet list
3. Approve connection in Phantom popup

Expected:
- Button changes to show wallet address
- NFT verification component appears
- QWAMI balance loads

### 2. NFT Verification ✅

**Test:** Verify KWAMI NFT ownership

Auto-runs after wallet connection.

Expected outcomes:

**If you own KWAMI NFT(s):**
- ✅ "Verified KWAMI Holder" message
- Shows number of NFTs owned
- Displays selected NFT image and name
- Dropdown to switch between NFTs (if multiple)

**If you don't own KWAMI NFT:**
- ❌ "No KWAMI NFT Found" message
- Link to mint KWAMI NFT
- Cannot access governance features

### 3. QWAMI Balance ✅

**Test:** Check QWAMI token balance

Auto-runs after wallet connection.

Expected:
- Shows QWAMI balance (formatted with decimals)
- Badge: "Eligible for Governance" (if ≥100) or "Need 100+ QWAMI"
- Refresh button to update balance

### 4. View Proposals ✅

**Test:** Browse governance proposals

Navigate to: `/proposals`

Expected:
- Filter buttons: Active / Past / All
- List of proposals with:
  - Title and description
  - Creator address
  - Creation date
  - Voting statistics (For/Against/Abstain)
  - Time remaining
  - Status badge
- Empty state if no proposals

### 5. Proposal Details ✅

**Test:** View detailed proposal

Click any proposal card.

Expected:
- Full proposal details
- Description and metadata
- Voting statistics with progress bars
- Requirements (Quorum, Min QWAMI)
- Vote form (if eligible)
- "Already voted" status (if voted)

### 6. Create Proposal ✅

**Test:** Submit new proposal

Navigate to: `/create`

Prerequisites:
- Connected wallet
- Own ≥1 KWAMI NFT
- Hold ≥100 QWAMI

Steps:
1. Fill in:
   - Title (10-100 chars)
   - Description (50-2000 chars)
   - QWAMI stake (min 100)
   - Voting period (3-14 days)
2. Preview proposal
3. Click "Create Proposal"

Expected:
- Form validation works
- Preview updates in real-time
- Redirects to new proposal after creation

### 7. Vote on Proposal ✅

**Test:** Cast vote

Prerequisites:
- Connected wallet
- Own ≥1 KWAMI NFT
- Hold QWAMI tokens
- Active proposal available

Steps:
1. Open proposal detail page
2. Enter QWAMI amount to vote with
3. Click: "Vote For" / "Vote Against" / "Abstain"

Expected:
- Vote amount validated (within balance)
- Voting stats update
- "Voted" badge appears
- Cannot vote again on same proposal

## Component Testing

### WalletButton Component
- [ ] Shows "Select Wallet" when disconnected
- [ ] Shows wallet address when connected
- [ ] Dropdown menu works
- [ ] Disconnect function works

### NFTVerification Component
- [ ] Loading state displays
- [ ] Shows correct verification status
- [ ] NFT images load correctly
- [ ] NFT selector works (if multiple NFTs)

### QwamiBalance Component
- [ ] Balance displays correctly
- [ ] Formatted with 2 decimals
- [ ] Eligibility badge shows correct status
- [ ] Refresh button updates balance

### ProposalCard Component
- [ ] All proposal info displays
- [ ] Voting bars animate correctly
- [ ] Status badge shows correct color
- [ ] Vote/View buttons work
- [ ] "Already voted" badge appears when applicable

## Error Handling

### Test Error Scenarios

1. **No Wallet Extension**
   - Expected: Opens wallet installation page

2. **Wallet Connection Rejected**
   - Expected: Shows error, returns to disconnected state

3. **Network Error**
   - Expected: Error message, retry option

4. **Insufficient Balance**
   - Expected: Warning message, disabled vote button

5. **No NFT Ownership**
   - Expected: Access restricted, link to mint page

## Performance Testing

### Load Times
- [ ] Initial page load < 3s
- [ ] Wallet connection < 2s
- [ ] NFT verification < 5s
- [ ] Proposal list load < 2s
- [ ] Page transitions smooth

### Responsiveness
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## Browser Testing

Test in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Brave
- [ ] Edge

## Network Testing

### Devnet
- [ ] RPC connection works
- [ ] NFT detection works
- [ ] Token balance loads
- [ ] Transactions simulate

### Mainnet (Future)
- [ ] All devnet features work
- [ ] Real token transfers
- [ ] Real NFT verification

## Known Limitations

⚠️ **Current Status:**

- ✅ Frontend fully functional
- ✅ Wallet integration complete
- ✅ NFT verification working
- ⚠️ **Mock proposal data** (not on-chain)
- ⚠️ **Voting not on-chain yet**
- ⚠️ No smart contracts deployed

## Next Steps

To make it production-ready:

1. [ ] Deploy governance smart contract
2. [ ] Integrate on-chain proposal creation
3. [ ] Integrate on-chain voting
4. [ ] Add proposal execution
5. [ ] Security audit
6. [ ] Extensive devnet testing
7. [ ] Mainnet deployment

## Troubleshooting

### Common Issues

**Wallet won't connect**
- Check wallet extension installed
- Try refreshing page
- Clear browser cache

**NFT not detected**
- Verify NFT in wallet
- Check collection address in `.env`
- Wait for blockchain sync

**Balance shows 0**
- Verify token mint address in `.env`
- Check you have QWAMI tokens
- Click refresh button

**Page won't load**
- Check dev server is running
- Verify port 3000 is available
- Check console for errors

## Success Criteria

✅ All tests pass  
✅ No console errors  
✅ All features functional  
✅ Responsive on all devices  
✅ Works in all browsers  
✅ Error handling works  
✅ Loading states display  
✅ Performance acceptable  

---

**Test Status:** Ready for Testing  
**Last Updated:** 2025-11-19  
**Version:** 1.5.10

