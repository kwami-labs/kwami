# 🏪 Metaplex Auction House Integration Guide

This guide explains how to integrate Metaplex Auction House for a fully decentralized marketplace.

## 📋 Overview

The current implementation uses a simplified P2P marketplace model. For production, you should integrate Metaplex Auction House which provides:

- ✅ On-chain escrow for safe trading
- ✅ Configurable marketplace fees (2-10%)
- ✅ Automatic royalty enforcement
- ✅ Bid and offer system
- ✅ On-chain listing management
- ✅ Decentralized architecture

## 🏗️ Architecture

### Current (Simplified) vs Auction House

**Current Implementation:**
```
User Wallet → Direct Transfer → Buyer Wallet
     ↓
Marketplace tracks listings in local state
```

**With Auction House:**
```
Seller → List NFT → Auction House Escrow → Buyer Purchases → NFT Transfer
                          ↓
                    Fees & Royalties Distributed
```

## 🚀 Setup Steps

### 1. Deploy Auction House

```bash
# Install Metaplex CLI
npm install -g @metaplex-foundation/mpl-auction-house-cli

# Or use Solana CLI with Auction House program
solana program deploy auction_house.so
```

### 2. Create Auction House Instance

```typescript
// utils/createAuctionHouse.ts
import { Keypair, Connection } from '@solana/web3.js'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'

export async function createAuctionHouse() {
  const connection = new Connection('https://api.devnet.solana.com')
  const authority = Keypair.fromSecretKey(/* your secret key */)
  
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(authority))
  
  const { auctionHouse } = await metaplex.auctionHouse().create({
    sellerFeeBasisPoints: 250, // 2.5% fee
    requiresSignOff: false,
    canChangeSalePrice: true,
  })
  
  console.log('Auction House Address:', auctionHouse.address.toString())
  
  return auctionHouse
}
```

### 3. Update Environment Variables

Add to `.env`:
```env
NUXT_PUBLIC_AUCTION_HOUSE_ADDRESS=YourAuctionHouseAddressHere
NUXT_PUBLIC_AUCTION_HOUSE_AUTHORITY=YourAuthorityPubkeyHere
NUXT_PUBLIC_AUCTION_HOUSE_FEE_ACCOUNT=YourFeeAccountHere
```

## 📝 Implementation

### Create Auction House Composable

```typescript
// composables/useAuctionHouse.ts
import { ref } from 'vue'
import { PublicKey } from '@solana/web3.js'
import { Metaplex } from '@metaplex-foundation/js'
import { useSolana } from './useSolana'
import { useRuntimeConfig } from '#app'

export const useAuctionHouse = () => {
  const { getConnection } = useSolana()
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const auctionHouseAddress = computed(() => 
    new PublicKey(config.public.auctionHouseAddress as string)
  )
  
  /**
   * Get Auction House instance
   */
  const getAuctionHouse = async (metaplex: Metaplex) => {
    return await metaplex
      .auctionHouse()
      .findByAddress({ address: auctionHouseAddress.value })
  }
  
  /**
   * List NFT on Auction House
   */
  const listNft = async (
    metaplex: Metaplex,
    mintAddress: PublicKey,
    price: number
  ) => {
    try {
      loading.value = true
      error.value = null
      
      const auctionHouse = await getAuctionHouse(metaplex)
      
      const { listing } = await metaplex
        .auctionHouse()
        .list({
          auctionHouse,
          mintAccount: mintAddress,
          price: { basisPoints: price * 1_000_000_000, currency: { symbol: 'SOL', decimals: 9 } },
        })
      
      return listing
    } catch (err: any) {
      console.error('Error listing NFT:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Cancel listing
   */
  const cancelListing = async (
    metaplex: Metaplex,
    mintAddress: PublicKey
  ) => {
    try {
      loading.value = true
      error.value = null
      
      const auctionHouse = await getAuctionHouse(metaplex)
      
      await metaplex
        .auctionHouse()
        .cancelListing({
          auctionHouse,
          mintAccount: mintAddress,
        })
      
      return true
    } catch (err: any) {
      console.error('Error canceling listing:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Buy NFT from Auction House
   */
  const buyNft = async (
    metaplex: Metaplex,
    mintAddress: PublicKey,
    price: number
  ) => {
    try {
      loading.value = true
      error.value = null
      
      const auctionHouse = await getAuctionHouse(metaplex)
      
      const { bid } = await metaplex
        .auctionHouse()
        .bid({
          auctionHouse,
          mintAccount: mintAddress,
          price: { basisPoints: price * 1_000_000_000, currency: { symbol: 'SOL', decimals: 9 } },
        })
      
      // Execute sale
      await metaplex
        .auctionHouse()
        .executeSale({
          auctionHouse,
          listing: await metaplex.auctionHouse().findListingByTradeState({
            auctionHouse,
            tradeStateAddress: /* listing trade state */,
          }),
          bid,
        })
      
      return true
    } catch (err: any) {
      console.error('Error buying NFT:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get all listings
   */
  const getAllListings = async (metaplex: Metaplex) => {
    try {
      loading.value = true
      error.value = null
      
      const auctionHouse = await getAuctionHouse(metaplex)
      
      const listings = await metaplex
        .auctionHouse()
        .findListings({
          auctionHouse,
        })
      
      return listings
    } catch (err: any) {
      console.error('Error fetching listings:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    auctionHouseAddress,
    getAuctionHouse,
    listNft,
    cancelListing,
    buyNft,
    getAllListings,
  }
}
```

### Update useMarketplace Composable

Replace the existing implementation with Auction House calls:

```typescript
// composables/useMarketplace.ts (updated)
import { ref } from 'vue'
import { PublicKey } from '@solana/web3.js'
import { useMetaplex } from './useMetaplex'
import { useAuctionHouse } from './useAuctionHouse'
import { useMarketplaceStore } from '~/stores/marketplace'
import type { NFTListing } from '~/stores/marketplace'

export const useMarketplace = () => {
  const { getMetaplex } = useMetaplex()
  const { listNft: ahListNft, buyNft: ahBuyNft, cancelListing: ahCancelListing } = useAuctionHouse()
  const marketplaceStore = useMarketplaceStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Buy NFT from marketplace (using Auction House)
   */
  const buyNft = async (nft: NFTListing, buyerPublicKey: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      const phantom = (window as any).solana
      if (!phantom) {
        throw new Error('Wallet not connected')
      }

      // Get Metaplex instance with wallet
      const metaplex = getMetaplex(phantom)
      const mintAddress = new PublicKey(nft.mint)

      // Buy through Auction House
      const success = await ahBuyNft(metaplex, mintAddress, nft.price!)
      
      if (success) {
        marketplaceStore.removeNft(nft.mint)
      }

      return success
    } catch (err: any) {
      console.error('Error buying NFT:', err)
      error.value = err.message || 'Failed to buy NFT'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * List NFT for sale (using Auction House)
   */
  const listNft = async (
    nft: NFTListing,
    price: number,
    ownerPublicKey: string
  ): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      if (price <= 0) {
        throw new Error('Price must be greater than 0')
      }

      const phantom = (window as any).solana
      if (!phantom) {
        throw new Error('Wallet not connected')
      }

      const metaplex = getMetaplex(phantom)
      const mintAddress = new PublicKey(nft.mint)

      // List through Auction House
      const listing = await ahListNft(metaplex, mintAddress, price)
      
      if (listing) {
        const listedNft: NFTListing = {
          ...nft,
          price,
          listed: true,
          listedAt: Date.now(),
        }
        marketplaceStore.addNft(listedNft)
      }

      return !!listing
    } catch (err: any) {
      console.error('Error listing NFT:', err)
      error.value = err.message || 'Failed to list NFT'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Unlist NFT from marketplace (using Auction House)
   */
  const unlistNft = async (
    mintAddress: string,
    ownerPublicKey: string
  ): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      const phantom = (window as any).solana
      if (!phantom) {
        throw new Error('Wallet not connected')
      }

      const metaplex = getMetaplex(phantom)
      const mint = new PublicKey(mintAddress)

      // Cancel listing through Auction House
      const success = await ahCancelListing(metaplex, mint)
      
      if (success) {
        marketplaceStore.removeNft(mintAddress)
      }

      return success
    } catch (err: any) {
      console.error('Error unlisting NFT:', err)
      error.value = err.message || 'Failed to unlist NFT'
      return false
    } finally {
      loading.value = false
    }
  }

  // ... rest of the functions

  return {
    loading,
    error,
    buyNft,
    listNft,
    unlistNft,
    // ... rest of exports
  }
}
```

## 📊 Query Listings

### Using Program Accounts

```typescript
// Query all listings from Auction House
const connection = new Connection('https://api.devnet.solana.com')
const auctionHouseAddress = new PublicKey('your_auction_house_address')

const listings = await connection.getProgramAccounts(
  new PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk'), // Auction House program
  {
    filters: [
      {
        memcmp: {
          offset: 8,
          bytes: auctionHouseAddress.toBase58(),
        },
      },
    ],
  }
)
```

### Using Metaplex SDK

```typescript
const metaplex = Metaplex.make(connection)
const auctionHouse = await metaplex
  .auctionHouse()
  .findByAddress({ address: auctionHouseAddress })

const allListings = await metaplex
  .auctionHouse()
  .findListings({ auctionHouse })
```

## 🔧 Backend Integration

For production, set up a backend to index Auction House events:

### 1. Event Listener

```typescript
// server/listeners/auctionHouse.ts
import { Connection } from '@solana/web3.js'

export async function listenToAuctionHouse() {
  const connection = new Connection('https://api.devnet.solana.com')
  
  connection.onLogs(
    auctionHouseAddress,
    (logs) => {
      // Parse logs for:
      // - Listing created
      // - Listing canceled
      // - Sale executed
      // - Bid placed
      
      // Store in database
    },
    'confirmed'
  )
}
```

### 2. API Endpoints

```typescript
// server/api/listings.get.ts
export default defineEventHandler(async (event) => {
  // Query database for active listings
  const listings = await db.query('SELECT * FROM listings WHERE active = true')
  return listings
})

// server/api/listings/[mint].get.ts
export default defineEventHandler(async (event) => {
  const mint = getRouterParam(event, 'mint')
  const listing = await db.query('SELECT * FROM listings WHERE mint = $1', [mint])
  return listing
})
```

## 🎯 Best Practices

1. **Always Use Escrow** - Never hold user funds directly
2. **Validate Transactions** - Verify all transaction signatures
3. **Handle Failures** - Implement proper error handling and retries
4. **Cache Data** - Cache listing data to reduce RPC calls
5. **Monitor Fees** - Track marketplace fees and royalties
6. **Test Thoroughly** - Test on devnet before mainnet
7. **Rate Limiting** - Implement rate limits for RPC calls
8. **Transaction Simulation** - Preview transactions before signing

## 📚 Resources

- [Metaplex Auction House Docs](https://docs.metaplex.com/programs/auction-house/)
- [Metaplex JS SDK](https://github.com/metaplex-foundation/js)
- [Auction House CLI](https://www.npmjs.com/package/@metaplex-foundation/mpl-auction-house-cli)
- [Solana Cookbook - NFT Marketplaces](https://solanacookbook.com/references/nfts.html#how-to-create-an-nft-marketplace)
- [Example Marketplaces](https://github.com/metaplex-foundation/marketplace-examples)

## ⚠️ Important Notes

1. **Test on Devnet First** - Always test thoroughly on devnet
2. **Audit Smart Contracts** - Have contracts audited before mainnet
3. **Monitor Transactions** - Track all marketplace activity
4. **Backup Data** - Regular database backups
5. **Security** - Never expose private keys
6. **Compliance** - Check local regulations for NFT marketplaces

## 🆘 Troubleshooting

### Listing Not Appearing
- Check Auction House address is correct
- Verify wallet has approved escrow
- Confirm transaction was successful
- Check indexer is running

### Transaction Failing
- Check wallet has enough SOL for fees
- Verify NFT is not already listed
- Ensure correct Auction House authority
- Check network connection

### Performance Issues
- Implement caching layer
- Use dedicated RPC endpoint
- Index data in database
- Implement pagination

## 🎉 Next Steps

1. Deploy Auction House on devnet
2. Update composables with new implementation
3. Test all marketplace functions
4. Set up backend indexer
5. Monitor and optimize performance
6. Deploy to mainnet when ready

---

**Need Help?** Check the resources above or reach out to the Metaplex community on Discord.

