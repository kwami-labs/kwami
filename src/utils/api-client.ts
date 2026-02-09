/**
 * API Client for interacting with Kwami Backend API
 */

export interface MemoryNode {
    id: string
    label: string
    type: string
    val?: number
    summary?: string
    uuid?: string
    created_at?: string
    labels?: string[]
}

export interface MemoryEdge {
    source: string
    target: string
    relation: string
}

export interface MemoryGraph {
    nodes: MemoryNode[]
    edges: MemoryEdge[]
}

export interface ApiClientOptions {
    authToken?: string
}

/**
 * Build headers for API requests
 */
function buildHeaders(options?: ApiClientOptions): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }
    if (options?.authToken) {
        headers['Authorization'] = `Bearer ${options.authToken}`
    }
    return headers
}

/**
 * Fetch memory graph for a user
 * @param apiBaseUrl Base URL of the Kwami API (e.g. http://localhost:8080)
 * @param userId User ID to fetch memory for
 * @param options Optional settings including auth token
 */
export async function getMemoryGraph(
    apiBaseUrl: string,
    userId: string,
    options?: ApiClientOptions
): Promise<MemoryGraph> {
    const url = `${apiBaseUrl}/memory/${userId}/graph`
    const response = await fetch(url, {
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        if (response.status === 404) {
            return { nodes: [], edges: [] }
        }
        throw new Error(`Failed to fetch memory graph: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Fetch facts for a user
 * @param apiBaseUrl Base URL of the Kwami API (e.g. http://localhost:8080)
 * @param userId User ID to fetch memory for
 * @param options Optional settings including auth token
 */
export async function getUserFacts(
    apiBaseUrl: string,
    userId: string,
    options?: ApiClientOptions
): Promise<string[]> {
    const url = `${apiBaseUrl}/memory/${userId}/facts`
    const response = await fetch(url, {
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        if (response.status === 404) {
            return []
        }
        throw new Error(`Failed to fetch facts: ${response.statusText}`)
    }

    return response.json()
}

// =============================================================================
// Memory Editing Types
// =============================================================================

export interface UpdateNodePayload {
    name?: string
    summary?: string
    labels?: string[]
}

export interface UpdateEdgePayload {
    fact?: string
    name?: string
    source_node_uuid?: string
    target_node_uuid?: string
    valid_at?: string | null
    invalid_at?: string | null
}

export interface UpdateNodeResponse {
    success: boolean
    old_node_uuid: string
    new_node_uuid: string | null
    name: string
    summary: string | null
    recreated_edges: number
}

export interface UpdateEdgeResponse {
    success: boolean
    old_edge_uuid: string
    new_edge_uuid: string | null
    fact: string
    name: string
    source_node_uuid: string
    target_node_uuid: string
}

// =============================================================================
// Memory Editing Functions
// =============================================================================

/**
 * Update a memory node (entity) for a user
 */
export async function updateMemoryNode(
    apiBaseUrl: string,
    userId: string,
    nodeUuid: string,
    data: UpdateNodePayload,
    options?: ApiClientOptions
): Promise<UpdateNodeResponse> {
    const url = `${apiBaseUrl}/memory/${userId}/node/${nodeUuid}`
    const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(options),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to update node: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Update a memory edge (fact/relationship) for a user
 */
export async function updateMemoryEdge(
    apiBaseUrl: string,
    userId: string,
    edgeUuid: string,
    data: UpdateEdgePayload,
    options?: ApiClientOptions
): Promise<UpdateEdgeResponse> {
    const url = `${apiBaseUrl}/memory/${userId}/edge/${edgeUuid}`
    const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(options),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to update edge: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Delete a memory node (entity) for a user
 */
export async function deleteMemoryNode(
    apiBaseUrl: string,
    userId: string,
    nodeUuid: string,
    options?: ApiClientOptions
): Promise<{ success: boolean; deleted_node: string }> {
    const url = `${apiBaseUrl}/memory/${userId}/node/${nodeUuid}`
    const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to delete node: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Delete a memory edge (fact) for a user
 */
export async function deleteMemoryEdge(
    apiBaseUrl: string,
    userId: string,
    edgeUuid: string,
    options?: ApiClientOptions
): Promise<{ success: boolean; deleted_edge: string }> {
    const url = `${apiBaseUrl}/memory/${userId}/edge/${edgeUuid}`
    const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to delete edge: ${response.statusText}`)
    }

    return response.json()
}

// =============================================================================
// Fact Rating
// =============================================================================

export interface FactRatingExamples {
    high: string
    medium: string
    low: string
}

export interface FactRatingConfig {
    configured: boolean
    instruction: string | null
    examples: FactRatingExamples | null
}

export interface SetFactRatingPayload {
    instruction: string
    examples: FactRatingExamples
}

export async function getFactRating(
    apiBaseUrl: string,
    userId: string,
    options?: ApiClientOptions
): Promise<FactRatingConfig> {
    const url = `${apiBaseUrl}/memory/${userId}/fact-rating`
    const response = await fetch(url, {
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to get fact rating: ${response.statusText}`)
    }

    return response.json()
}

export async function setFactRating(
    apiBaseUrl: string,
    userId: string,
    data: SetFactRatingPayload,
    options?: ApiClientOptions
): Promise<{ success: boolean }> {
    const url = `${apiBaseUrl}/memory/${userId}/fact-rating`
    const response = await fetch(url, {
        method: 'PUT',
        headers: buildHeaders(options),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to set fact rating: ${response.statusText}`)
    }

    return response.json()
}

// =============================================================================
// Custom Instructions
// =============================================================================

export interface CustomInstruction {
    name: string
    text: string
}

export async function getCustomInstructions(
    apiBaseUrl: string,
    userId: string,
    options?: ApiClientOptions
): Promise<{ instructions: CustomInstruction[]; count: number }> {
    const url = `${apiBaseUrl}/memory/${userId}/instructions`
    const response = await fetch(url, {
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to get instructions: ${response.statusText}`)
    }

    return response.json()
}

export async function addCustomInstructions(
    apiBaseUrl: string,
    userId: string,
    instructions: CustomInstruction[],
    options?: ApiClientOptions
): Promise<{ success: boolean; added: number }> {
    const url = `${apiBaseUrl}/memory/${userId}/instructions`
    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(options),
        body: JSON.stringify({ instructions }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to add instructions: ${response.statusText}`)
    }

    return response.json()
}

export async function deleteCustomInstructions(
    apiBaseUrl: string,
    userId: string,
    names?: string[],
    options?: ApiClientOptions
): Promise<{ success: boolean }> {
    let url = `${apiBaseUrl}/memory/${userId}/instructions`
    if (names && names.length > 0) {
        url += `?names=${encodeURIComponent(names.join(','))}`
    }
    const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to delete instructions: ${response.statusText}`)
    }

    return response.json()
}

// =============================================================================
// Data Re-ingestion
// =============================================================================

export interface IngestPayload {
    data: string
    type?: 'text' | 'json' | 'message'
    source_description?: string
}

export async function ingestData(
    apiBaseUrl: string,
    userId: string,
    payload: IngestPayload,
    options?: ApiClientOptions
): Promise<{ success: boolean; episode_uuid: string | null }> {
    const url = `${apiBaseUrl}/memory/${userId}/ingest`
    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(options),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to ingest data: ${response.statusText}`)
    }

    return response.json()
}

// =============================================================================
// Graph Analysis: Communities, Duplicates, Merge, Reorganize
// =============================================================================

export interface CommunityMember {
    uuid: string
    name: string
    summary: string | null
    labels: string[]
}

export interface Community {
    id: number
    label: string
    members: CommunityMember[]
    size: number
}

export interface CommunitiesResponse {
    communities: Community[]
    count: number
}

export interface DuplicateNodeInfo {
    uuid: string
    name: string
    summary: string | null
    labels: string[]
    edge_count: number
}

export interface DuplicatePair {
    score: number
    keep: DuplicateNodeInfo
    remove: DuplicateNodeInfo
}

export interface DuplicatesResponse {
    duplicates: DuplicatePair[]
    count: number
}

export interface MergeResult {
    success: boolean
    keep_uuid: string
    keep_name: string
    removed_uuid: string
    recreated_edges: number
}

export interface ReorganizeReport {
    orphans_removed: number
    merges_performed: number
    communities_found: number
    errors: string[]
}

export interface ReorganizeResult {
    success: boolean
    report: ReorganizeReport
}

/**
 * Detect communities in the user's knowledge graph using Louvain algorithm
 */
export async function detectCommunities(
    apiBaseUrl: string,
    userId: string,
    resolution?: number,
    options?: ApiClientOptions
): Promise<CommunitiesResponse> {
    let url = `${apiBaseUrl}/memory/${userId}/communities`
    if (resolution !== undefined) {
        url += `?resolution=${resolution}`
    }
    const response = await fetch(url, {
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to detect communities: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Detect potential duplicate nodes using fuzzy string matching
 */
export async function detectDuplicates(
    apiBaseUrl: string,
    userId: string,
    threshold?: number,
    options?: ApiClientOptions
): Promise<DuplicatesResponse> {
    let url = `${apiBaseUrl}/memory/${userId}/duplicates`
    if (threshold !== undefined) {
        url += `?threshold=${threshold}`
    }
    const response = await fetch(url, {
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to detect duplicates: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Merge two duplicate nodes (keep one, re-point edges, delete the other)
 */
export async function mergeNodes(
    apiBaseUrl: string,
    userId: string,
    keepUuid: string,
    removeUuid: string,
    options?: ApiClientOptions
): Promise<MergeResult> {
    const url = `${apiBaseUrl}/memory/${userId}/merge`
    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(options),
        body: JSON.stringify({ keep_uuid: keepUuid, remove_uuid: removeUuid }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to merge nodes: ${response.statusText}`)
    }

    return response.json()
}

/**
 * One-click graph reorganization: remove orphans, auto-merge duplicates, detect communities
 */
export async function reorganizeGraph(
    apiBaseUrl: string,
    userId: string,
    autoMergeThreshold?: number,
    options?: ApiClientOptions
): Promise<ReorganizeResult> {
    let url = `${apiBaseUrl}/memory/${userId}/reorganize`
    if (autoMergeThreshold !== undefined) {
        url += `?auto_merge_threshold=${autoMergeThreshold}`
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(options),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Failed to reorganize graph: ${response.statusText}`)
    }

    return response.json()
}
