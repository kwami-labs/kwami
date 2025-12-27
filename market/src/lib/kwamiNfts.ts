import { Metaplex } from '@metaplex-foundation/js'
import type { Connection, PublicKey } from '@solana/web3.js'

async function tryFetchJson(uri: string): Promise<any | null> {
  try {
    const res = await fetch(uri, { method: 'GET' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export type KwamiOwnedNft = {
  mint: string
  name: string
  uri: string
  image?: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
  dna?: string
  body?: unknown
}

export async function fetchOwnedKwamiNfts(args: {
  connection: Connection
  owner: PublicKey
  collectionMint?: string
}): Promise<KwamiOwnedNft[]> {
  const metaplex = Metaplex.make(args.connection)

  const all = await metaplex.nfts().findAllByOwner({ owner: args.owner })

  const filtered = args.collectionMint
    ? all.filter((m) => m.collection?.verified && m.collection?.address?.toBase58?.() === args.collectionMint)
    : all

  const loaded = await Promise.all(
    filtered.map(async (m) => {
      // `findAllByOwner` returns a union; `load` accepts the same union type.
      const nft = await metaplex.nfts().load({ metadata: m as any })
      const json = nft.json ?? (await tryFetchJson(nft.uri))
      return {
        mint: nft.address.toBase58(),
        name: nft.name,
        uri: nft.uri,
        image: json?.image,
        description: json?.description,
        attributes: Array.isArray(json?.attributes) ? (json.attributes as any) : undefined,
        dna: (json as any)?.dna,
        body: (json as any)?.body,
      } satisfies KwamiOwnedNft
    }),
  )

  // Stable ordering (newest-ish first is not available without an indexer; just sort by name then mint)
  loaded.sort((a, b) => (a.name || a.mint).localeCompare(b.name || b.mint))
  return loaded
}


