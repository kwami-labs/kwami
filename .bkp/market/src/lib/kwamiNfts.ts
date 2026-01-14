import { Metaplex } from '@metaplex-foundation/js'
import type { Connection, PublicKey } from '@solana/web3.js'

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

function isRpc429(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '')
  return /\b429\b/.test(msg) || /too many requests/i.test(msg)
}

async function withRpcRetry<T>(fn: () => Promise<T>, opts?: { retries?: number; baseDelayMs?: number }): Promise<T> {
  const retries = opts?.retries ?? 3
  const baseDelayMs = opts?.baseDelayMs ?? 400

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (!isRpc429(e) || attempt === retries) throw e
      const jitter = Math.floor(Math.random() * 150)
      const delay = baseDelayMs * Math.pow(2, attempt) + jitter
      await sleep(delay)
    }
  }

  throw lastErr
}

type NftJson = {
  image?: unknown
  description?: unknown
  attributes?: unknown
  dna?: unknown
  body?: unknown
}

async function tryFetchJson(uri: string): Promise<unknown | null> {
  try {
    const res = await fetch(uri, { method: 'GET' })
    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch {
    return null
  }
}

function asNftJson(v: unknown): NftJson | null {
  if (!v || typeof v !== 'object') return null
  return v as NftJson
}

function asAttributes(v: unknown): Array<{ trait_type: string; value: string | number }> | undefined {
  if (!Array.isArray(v)) return undefined
  const out: Array<{ trait_type: string; value: string | number }> = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const trait = (item as { trait_type?: unknown }).trait_type
    const value = (item as { value?: unknown }).value
    if (typeof trait !== 'string') continue
    if (typeof value !== 'string' && typeof value !== 'number') continue
    out.push({ trait_type: trait, value })
  }
  return out.length ? out : undefined
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (true) {
      const idx = nextIndex
      nextIndex++
      if (idx >= items.length) return
      results[idx] = await mapper(items[idx]!, idx)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
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

  type NftsClient = ReturnType<typeof metaplex.nfts>
  type LoadArgs = Parameters<NftsClient['load']>[0]

  const all = await withRpcRetry(() => metaplex.nfts().findAllByOwner({ owner: args.owner }))

  const filtered = args.collectionMint
    ? all.filter((m) => m.collection?.verified && m.collection?.address?.toBase58?.() === args.collectionMint)
    : all

  // Metaplex loading can trigger a burst of RPC calls (and 429 on shared/public RPCs).
  // Keep concurrency low and retry 429s with backoff.
  const loaded = await mapWithConcurrency(filtered, 3, async (m) => {
    // `findAllByOwner` returns a union; `load` accepts the same union type.
    const nft = await withRpcRetry(() => metaplex.nfts().load({ metadata: m as LoadArgs['metadata'] }))

    const rawJson = (nft as { json?: unknown }).json ?? (await tryFetchJson(nft.uri))
    const json = asNftJson(rawJson)

    const image = typeof json?.image === 'string' ? json.image : undefined
    const description = typeof json?.description === 'string' ? json.description : undefined
    const dna = typeof json?.dna === 'string' ? json.dna : undefined
    const body = json?.body

    return {
      mint: nft.address.toBase58(),
      name: nft.name,
      uri: nft.uri,
      image,
      description,
      attributes: asAttributes(json?.attributes),
      dna,
      body,
    } satisfies KwamiOwnedNft
  })

  // Stable ordering (newest-ish first is not available without an indexer; just sort by name then mint)
  loaded.sort((a, b) => (a.name || a.mint).localeCompare(b.name || b.mint))
  return loaded
}


