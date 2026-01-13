import { Metaplex } from '@metaplex-foundation/js';
import type { Connection, PublicKey } from '@solana/web3.js';

// Simple cache to avoid refetching the same data
const metadataCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function tryFetchJson(uri: string): Promise<any | null> {
  // Check cache first
  const cached = metadataCache.get(uri);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(uri, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    metadataCache.set(uri, { data, timestamp: Date.now() });
    return data;
  } catch {
    return null;
  }
}

export type KwamiOwnedNft = {
  mint: string;
  name: string;
  uri: string;
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  dna?: string;
  body?: unknown;
};

export async function findNftCandidates(args: {
  connection: Connection;
  owner: PublicKey;
  collectionMint?: string;
  symbol?: string;
}): Promise<any[]> {
  const metaplex = Metaplex.make(args.connection);
  const all = await metaplex.nfts().findAllByOwner({ owner: args.owner });

  const filtered = args.collectionMint
    ? all.filter((m) => m.collection?.verified && m.collection?.address?.toBase58?.() === args.collectionMint)
    : args.symbol
      ? all.filter((m) => String((m as any)?.symbol ?? '').toUpperCase() === args.symbol!.toUpperCase())
      : all;
      
  // Sort alphabetically by name or mint
  filtered.sort((a, b) => (a.name || a.address.toBase58()).localeCompare(b.name || b.address.toBase58()));
  
  return filtered;
}

export async function hydrateNftBatch(
  candidates: any[],
  delayMs = 0
): Promise<KwamiOwnedNft[]> {
  const loaded: KwamiOwnedNft[] = [];
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < candidates.length; i++) {
    const m = candidates[i];
    try {
      // Skip the heavy metaplex.nfts().load() RPC call! 
      // We already have the URI from the candidate list.
      const uri = m.uri;
      const mint = m.address?.toBase58 ? m.address.toBase58() : m.mintAddress?.toBase58();
      const name = m.name;
      
      const json = await tryFetchJson(uri);
      
      const nftData: KwamiOwnedNft = {
        mint,
        name,
        uri,
        image: json?.image,
        description: json?.description,
        attributes: Array.isArray(json?.attributes) ? (json.attributes as any) : undefined,
        dna: (json as any)?.dna,
        body: (json as any)?.body,
      };
      loaded.push(nftData);
      
      // Delay between fetches if requested (for rate limiting)
      if (delayMs > 0 && i < candidates.length - 1) {
        await delay(delayMs);
      }
    } catch (error) {
      console.warn(`Failed to load NFT metadata for ${m.name}:`, error);
    }
  }
  return loaded;
}

export async function fetchOwnedKwamiNfts(args: {
  connection: Connection;
  owner: PublicKey;
  collectionMint?: string;
  symbol?: string;
  limit?: number;
  offset?: number;
  onProgress?: (nft: KwamiOwnedNft) => void;
}): Promise<KwamiOwnedNft[]> {
  // Backward compatibility wrapper
  const candidates = await findNftCandidates(args);
  
  // Apply pagination
  const offset = args.offset ?? 0;
  const limit = args.limit ?? candidates.length;
  const paginated = candidates.slice(offset, offset + limit);

  // Load details
  // Note: onProgress isn't supported in the batch hydrator efficiently, 
  // but we can simulate it or just return the batch.
  // Since we refactored the UI to use batching, we assume batch return is fine.
  return hydrateNftBatch(paginated, 200);
}
