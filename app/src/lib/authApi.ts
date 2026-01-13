/**
 * KWAMI Authentication Server API Client
 * 
 * Provides methods to interact with the Rust backend server for:
 * - Wallet authentication via signature
 * - KWAMI NFT ownership verification
 * - JWT session management
 * - KWAMI selection
 */

export interface NonceResponse {
  nonce: string
  message: string
  expires_in: number
}

export interface KwamiInfo {
  mint: string
  name: string
  symbol: string
  uri: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

export interface LoginResponse {
  token: string
  owned_kwamis: KwamiInfo[]
  pubkey: string
}

export interface SelectKwamiResponse {
  token: string
  kwami_mint: string
  message: string
}

export interface OwnedKwamisResponse {
  owned_kwamis: KwamiInfo[]
  count: number
}

export interface ApiError {
  error: string
  code: number
}

export class KwamiAuthApi {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  /**
   * Request a nonce for wallet signature authentication
   */
  async requestNonce(pubkey: string): Promise<NonceResponse> {
    const response = await fetch(`${this.baseUrl}/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubkey })
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error || 'Failed to generate nonce')
    }

    return response.json()
  }

  /**
   * Login with wallet signature
   */
  async login(params: {
    pubkey: string
    signature: string
    message: string
    nonce: string
  }): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data: LoginResponse = await response.json()
    this.token = data.token
    return data
  }

  /**
   * Select a KWAMI as active identity
   */
  async selectKwami(kwamiMint: string): Promise<SelectKwamiResponse> {
    if (!this.token) {
      throw new Error('Not authenticated. Please login first.')
    }

    const response = await fetch(`${this.baseUrl}/auth/select-kwami`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ kwami_mint: kwamiMint })
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error || 'Failed to select KWAMI')
    }

    const data: SelectKwamiResponse = await response.json()
    this.token = data.token // Update with new token containing kwami_mint
    return data
  }

  /**
   * Get owned KWAMIs for authenticated user
   */
  async getOwnedKwamis(): Promise<OwnedKwamisResponse> {
    if (!this.token) {
      throw new Error('Not authenticated. Please login first.')
    }

    const response = await fetch(`${this.baseUrl}/me/owned-kwamis`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error || 'Failed to fetch owned KWAMIs')
    }

    return response.json()
  }

  /**
   * Check server health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok && await response.text() === 'OK'
    } catch {
      return false
    }
  }

  /**
   * Get current JWT token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Set JWT token (e.g., from localStorage)
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Clear token (logout)
   */
  clearToken(): void {
    this.token = null
  }
}

/**
 * Helper to sign message with Solana wallet
 */
export async function signAuthMessage(
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  message: string
): Promise<string> {
  const encodedMessage = new TextEncoder().encode(message)
  const signature = await signMessage(encodedMessage)
  
  // Convert to base58
  const bs58 = await import('bs58')
  return bs58.default.encode(signature)
}
