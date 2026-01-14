import { Metaplex } from '@metaplex-foundation/js'
import type { Connection, PublicKey } from '@solana/web3.js'

export type KwamiOwnedNft = {
  mint: string
  name: string
  uri: string
  image?: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
}

export async function fetchOwnedKwamiNfts(args: {
  connection: Connection
  owner: PublicKey
  collectionMint?: string
  symbol?: string
}): Promise<KwamiOwnedNft[]> {
  const metaplex = Metaplex.make(args.connection)

  const all = await metaplex.nfts().findAllByOwner({ owner: args.owner })

  const filtered = args.collectionMint
    ? all.filter(
        (m) => m.collection?.verified && m.collection?.address?.toBase58?.() === args.collectionMint,
      )
    : args.symbol
      ? all.filter((m) => String((m as any)?.symbol ?? '').toUpperCase() === args.symbol!.toUpperCase())
      : all

  const loaded = await Promise.all(
    filtered.map(async (m) => {
      const nft = await metaplex.nfts().load({ metadata: m as any })
      return {
        mint: nft.address.toBase58(),
        name: nft.name,
        uri: nft.uri,
        image: nft.json?.image,
        description: nft.json?.description,
        attributes: Array.isArray(nft.json?.attributes) ? (nft.json?.attributes as any) : undefined,
      } satisfies KwamiOwnedNft
    }),
  )

  loaded.sort((a, b) => (a.name || a.mint).localeCompare(b.name || b.mint))
  return loaded
}


