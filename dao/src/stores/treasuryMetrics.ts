import { writable } from 'svelte/store'
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import type { Idl } from '@coral-xyz/anchor'
import { BorshAccountsCoder } from '@coral-xyz/anchor'
import { Buffer } from 'buffer'

import kwamiDaoIdl from '../../../solana/kwami-dao/target/idl/kwami_dao.json'
import qwamiTokenIdl from '../../../solana/qwami-token/target/idl/qwami_token.json'
import kwamiNftIdl from '../../../solana/kwami-nft/target/idl/kwami_nft.json'

export type TreasuryMetricsState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  network: string
  daoState?: string
  treasuryWallet?: string
  treasurySol?: number
  totalKwamiMinted?: number
  totalQwamiMinted?: number
  totalQwamiBurned?: number
  errorMessage?: string
  lastUpdatedAt?: number
}

const initial: TreasuryMetricsState = {
  status: 'idle',
  network: 'mainnet-beta',
}

export const treasuryMetrics = writable<TreasuryMetricsState>(initial)

function getConnectionForNetwork(network: string): Connection {
  if (network === 'localnet') return new Connection('http://127.0.0.1:8899', 'confirmed')
  if (network === 'devnet' || network === 'testnet' || network === 'mainnet-beta') {
    return new Connection(clusterApiUrl(network), 'confirmed')
  }
  // Fallback: treat unknown strings as mainnet-beta
  return new Connection(clusterApiUrl('mainnet-beta'), 'confirmed')
}

function safeToNumber(v: any): number | undefined {
  if (v == null) return undefined
  if (typeof v === 'number') return v
  if (typeof v === 'bigint') return Number(v)
  if (typeof v?.toNumber === 'function') return v.toNumber()
  return undefined
}

let inflight: Promise<void> | null = null

export function refreshTreasuryMetrics(network: string): Promise<void> {
  if (inflight) return inflight
  inflight = (async () => {
    treasuryMetrics.update((s) => ({ ...s, status: 'loading', network, errorMessage: undefined }))

    try {
      const connection = getConnectionForNetwork(network)

      const daoProgramId = new PublicKey((kwamiDaoIdl as any).address)
      const qwamiProgramId = new PublicKey((qwamiTokenIdl as any).address)
      const kwamiProgramId = new PublicKey((kwamiNftIdl as any).address)

      const [daoState] = PublicKey.findProgramAddressSync([Buffer.from('dao-state')], daoProgramId)

      const daoStateInfo = await connection.getAccountInfo(daoState, 'confirmed')
      if (!daoStateInfo?.data) {
        treasuryMetrics.set({
          status: 'error',
          network,
          daoState: daoState.toBase58(),
          errorMessage: `DAO state not found on ${network}. (Is kwami-dao initialized on this cluster?)`,
          lastUpdatedAt: Date.now(),
        })
        return
      }

      const daoCoder = new BorshAccountsCoder(kwamiDaoIdl as unknown as Idl)
      const dao = daoCoder.decode('DaoState', daoStateInfo.data) as any

      const treasuryWallet = new PublicKey(dao.treasuryWallet)
      const qwamiTokenAuthority = new PublicKey(dao.qwamiTokenAuthority)
      const kwamiCollectionAuthority = new PublicKey(dao.kwamiCollectionAuthority)

      const [treasuryLamports, qwamiAuthInfo, kwamiAuthInfo] = await Promise.all([
        connection.getBalance(treasuryWallet, 'confirmed'),
        connection.getAccountInfo(qwamiTokenAuthority, 'confirmed'),
        connection.getAccountInfo(kwamiCollectionAuthority, 'confirmed'),
      ])

      let totalQwamiMinted: number | undefined
      let totalQwamiBurned: number | undefined
      if (qwamiAuthInfo?.data) {
        const qwamiCoder = new BorshAccountsCoder(qwamiTokenIdl as unknown as Idl)
        const auth = qwamiCoder.decode('TokenAuthority', qwamiAuthInfo.data) as any
        totalQwamiMinted = safeToNumber(auth.totalMinted)
        totalQwamiBurned = safeToNumber(auth.totalBurned)
      }

      let totalKwamiMinted: number | undefined
      if (kwamiAuthInfo?.data) {
        const kwamiCoder = new BorshAccountsCoder(kwamiNftIdl as unknown as Idl)
        const auth = kwamiCoder.decode('CollectionAuthority', kwamiAuthInfo.data) as any
        totalKwamiMinted = safeToNumber(auth.totalMinted)
      }

      treasuryMetrics.set({
        status: 'ready',
        network,
        daoState: daoState.toBase58(),
        treasuryWallet: treasuryWallet.toBase58(),
        treasurySol: treasuryLamports / LAMPORTS_PER_SOL,
        totalKwamiMinted,
        totalQwamiMinted,
        totalQwamiBurned,
        lastUpdatedAt: Date.now(),
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      treasuryMetrics.set({
        status: 'error',
        network,
        errorMessage: msg,
        lastUpdatedAt: Date.now(),
      })
    } finally {
      inflight = null
    }
  })()
  return inflight
}


