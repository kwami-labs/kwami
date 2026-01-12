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

export async function fetchOwnedKwamiNfts(args: {
  connection: Connection;
  owner: PublicKey;
  collectionMint?: string;
  symbol?: string;
  limit?: number;
  offset?: number;
}): Promise<KwamiOwnedNft[]> {
  const metaplex = Metaplex.make(args.connection);

  // Add delay to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const all = await metaplex.nfts().findAllByOwner({ owner: args.owner });

  const filtered = args.collectionMint
    ? all.filter((m) => m.collection?.verified && m.collection?.address?.toBase58?.() === args.collectionMint)
    : args.symbol
      ? all.filter((m) => String((m as any)?.symbol ?? '').toUpperCase() === args.symbol!.toUpperCase())
      : all;

  // Apply pagination
  const offset = args.offset ?? 0;
  const limit = args.limit ?? filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  // Load metadata with delays to avoid rate limiting
  const loaded: KwamiOwnedNft[] = [];
  for (let i = 0; i < paginated.length; i++) {
    const m = paginated[i];
    try {
      const nft = await metaplex.nfts().load({ metadata: m as any });
      const json = nft.json ?? (await tryFetchJson(nft.uri));
      loaded.push({
        mint: nft.address.toBase58(),
        name: nft.name,
        uri: nft.uri,
        image: json?.image,
        description: json?.description,
        attributes: Array.isArray(json?.attributes) ? (json.attributes as any) : undefined,
        dna: (json as any)?.dna,
        body: (json as any)?.body,
      });
      
      // Add small delay every 5 NFTs to avoid rate limiting
      if ((i + 1) % 5 === 0 && i < paginated.length - 1) {
        await delay(100);
      }
    } catch (error) {
      console.warn(`Failed to load NFT metadata:`, error);
      // Continue with next NFT
    }
  }

  loaded.sort((a, b) => (a.name || a.mint).localeCompare(b.name || b.mint));
  return loaded;
}
