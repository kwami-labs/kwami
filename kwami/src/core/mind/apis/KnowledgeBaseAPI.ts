/**
 * ElevenLabs Knowledge Base API
 * Manage knowledge bases that agents can reference during conversations
 * 
 * API Reference: https://elevenlabs.io/docs/api-reference/knowledge-base
 */

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
}

export interface KnowledgeBaseResponse {
  knowledge_base_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  document_count?: number;
  size_bytes?: number;
}

export interface UpdateKnowledgeBaseRequest {
  name?: string;
  description?: string;
}

export interface ListKnowledgeBasesOptions {
  page_size?: number;
  page_token?: string;
}

export interface ListKnowledgeBasesResponse {
  knowledge_bases: KnowledgeBaseResponse[];
  next_page_token?: string;
  has_more?: boolean;
}

export interface CreateKnowledgeBaseDocumentFromURLRequest {
  url: string;
  name?: string;
}

export interface CreateKnowledgeBaseDocumentFromTextRequest {
  text: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface CreateKnowledgeBaseDocumentFromFileRequest {
  file: File | Blob;
  name?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeBaseDocumentResponse {
  document_id: string;
  knowledge_base_id: string;
  name: string;
  type: 'url' | 'text' | 'file';
  size_bytes?: number;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface ListKnowledgeBaseDocumentsOptions {
  page_size?: number;
  page_token?: string;
}

export interface ListKnowledgeBaseDocumentsResponse {
  documents: KnowledgeBaseDocumentResponse[];
  next_page_token?: string;
  has_more?: boolean;
}

export interface DocumentContent {
  content: string;
  metadata?: Record<string, any>;
}

export interface DocumentChunk {
  chunk_id: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface GetDocumentChunkOptions {
  chunk_id: string;
}

export interface RAGIndexResponse {
  status: 'indexing' | 'ready' | 'failed';
  indexed_chunks?: number;
  total_chunks?: number;
  error?: string;
}

export interface RAGIndexOverview {
  knowledge_base_id: string;
  total_documents: number;
  total_chunks: number;
  index_size_bytes: number;
  status: 'ready' | 'indexing' | 'failed';
}

/**
 * Knowledge Base API Client
 */
export class KnowledgeBaseAPI {
  constructor(private apiKey: string) {}

  // ==================== Knowledge Base Management ====================

  /**
   * Create a new knowledge base
   */
  async createKnowledgeBase(request: CreateKnowledgeBaseRequest): Promise<KnowledgeBaseResponse> {
    console.log('📚 Creating new knowledge base:', request.name);

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-bases/create', {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to create knowledge base: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Knowledge base created:', data.knowledge_base_id);
    return data as KnowledgeBaseResponse;
  }

  /**
   * Get a knowledge base by ID
   */
  async getKnowledgeBase(knowledgeBaseId: string): Promise<KnowledgeBaseResponse> {
    console.log('🔍 Fetching knowledge base:', knowledgeBaseId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get knowledge base: ${error}`);
    }

    return await response.json() as KnowledgeBaseResponse;
  }

  /**
   * List all knowledge bases
   */
  async listKnowledgeBases(options?: ListKnowledgeBasesOptions): Promise<ListKnowledgeBasesResponse> {
    console.log('📋 Listing knowledge bases...');

    const queryParams = new URLSearchParams();
    if (options?.page_size) queryParams.append('page_size', options.page_size.toString());
    if (options?.page_token) queryParams.append('page_token', options.page_token);

    const url = `https://api.elevenlabs.io/v1/convai/knowledge-bases${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to list knowledge bases: ${error}`);
    }

    return await response.json() as ListKnowledgeBasesResponse;
  }

  /**
   * Update a knowledge base
   */
  async updateKnowledgeBase(
    knowledgeBaseId: string,
    request: UpdateKnowledgeBaseRequest
  ): Promise<KnowledgeBaseResponse> {
    console.log('✏️ Updating knowledge base:', knowledgeBaseId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to update knowledge base: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Knowledge base updated successfully');
    return data as KnowledgeBaseResponse;
  }

  /**
   * Delete a knowledge base
   */
  async deleteKnowledgeBase(knowledgeBaseId: string): Promise<void> {
    console.log('🗑️ Deleting knowledge base:', knowledgeBaseId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to delete knowledge base: ${error}`);
    }

    console.log('✅ Knowledge base deleted successfully');
  }

  // ==================== Document Management ====================

  /**
   * Create a document from a URL
   */
  async createDocumentFromURL(
    knowledgeBaseId: string,
    request: CreateKnowledgeBaseDocumentFromURLRequest
  ): Promise<KnowledgeBaseDocumentResponse> {
    console.log('📄 Creating document from URL:', request.url);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/create-from-url`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to create document from URL: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Document created:', data.document_id);
    return data as KnowledgeBaseDocumentResponse;
  }

  /**
   * Create a document from text
   */
  async createDocumentFromText(
    knowledgeBaseId: string,
    request: CreateKnowledgeBaseDocumentFromTextRequest
  ): Promise<KnowledgeBaseDocumentResponse> {
    console.log('📄 Creating document from text');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/create-from-text`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to create document from text: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Document created:', data.document_id);
    return data as KnowledgeBaseDocumentResponse;
  }

  /**
   * Create a document from a file
   */
  async createDocumentFromFile(
    knowledgeBaseId: string,
    request: CreateKnowledgeBaseDocumentFromFileRequest
  ): Promise<KnowledgeBaseDocumentResponse> {
    console.log('📄 Creating document from file');

    const formData = new FormData();
    formData.append('file', request.file);
    if (request.name) formData.append('name', request.name);
    if (request.metadata) formData.append('metadata', JSON.stringify(request.metadata));

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/create-from-file`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to create document from file: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Document created:', data.document_id);
    return data as KnowledgeBaseDocumentResponse;
  }

  /**
   * Get a document
   */
  async getDocument(
    knowledgeBaseId: string,
    documentId: string
  ): Promise<KnowledgeBaseDocumentResponse> {
    console.log('🔍 Fetching document:', documentId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get document: ${error}`);
    }

    return await response.json() as KnowledgeBaseDocumentResponse;
  }

  /**
   * List documents in a knowledge base
   */
  async listDocuments(
    knowledgeBaseId: string,
    options?: ListKnowledgeBaseDocumentsOptions
  ): Promise<ListKnowledgeBaseDocumentsResponse> {
    console.log('📋 Listing documents...');

    const queryParams = new URLSearchParams();
    if (options?.page_size) queryParams.append('page_size', options.page_size.toString());
    if (options?.page_token) queryParams.append('page_token', options.page_token);

    const url = `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to list documents: ${error}`);
    }

    return await response.json() as ListKnowledgeBaseDocumentsResponse;
  }

  /**
   * Delete a document
   */
  async deleteDocument(knowledgeBaseId: string, documentId: string): Promise<void> {
    console.log('🗑️ Deleting document:', documentId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to delete document: ${error}`);
    }

    console.log('✅ Document deleted successfully');
  }

  /**
   * Get document content
   */
  async getDocumentContent(knowledgeBaseId: string, documentId: string): Promise<DocumentContent> {
    console.log('📖 Fetching document content:', documentId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/content`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get document content: ${error}`);
    }

    return await response.json() as DocumentContent;
  }

  /**
   * Get a specific document chunk
   */
  async getDocumentChunk(
    knowledgeBaseId: string,
    documentId: string,
    chunkId: string
  ): Promise<DocumentChunk> {
    console.log('📄 Fetching document chunk:', chunkId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/chunks/${chunkId}`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get document chunk: ${error}`);
    }

    return await response.json() as DocumentChunk;
  }

  // ==================== RAG Index Management ====================

  /**
   * Compute RAG index for a knowledge base
   */
  async computeRAGIndex(knowledgeBaseId: string): Promise<RAGIndexResponse> {
    console.log('🔍 Computing RAG index for knowledge base:', knowledgeBaseId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/rag-index/compute`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to compute RAG index: ${error}`);
    }

    const data = await response.json();
    console.log('✅ RAG index computation started');
    return data as RAGIndexResponse;
  }

  /**
   * Get RAG index status
   */
  async getRAGIndex(knowledgeBaseId: string): Promise<RAGIndexResponse> {
    console.log('🔍 Getting RAG index status:', knowledgeBaseId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/rag-index`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get RAG index: ${error}`);
    }

    return await response.json() as RAGIndexResponse;
  }

  /**
   * Get RAG index overview (summary of all indexes)
   */
  async getRAGIndexOverview(): Promise<RAGIndexOverview[]> {
    console.log('📊 Getting RAG index overview');

    const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-bases/rag-index/overview', {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get RAG index overview: ${error}`);
    }

    return await response.json() as RAGIndexOverview[];
  }

  /**
   * Delete RAG index
   */
  async deleteRAGIndex(knowledgeBaseId: string): Promise<void> {
    console.log('🗑️ Deleting RAG index:', knowledgeBaseId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/rag-index`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to delete RAG index: ${error}`);
    }

    console.log('✅ RAG index deleted successfully');
  }

  /**
   * Get dependent agents (which agents use this knowledge base)
   */
  async getDependentAgents(knowledgeBaseId: string): Promise<{ agent_ids: string[] }> {
    console.log('🔗 Fetching dependent agents for knowledge base:', knowledgeBaseId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/dependent-agents`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get dependent agents: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get knowledge base size estimate
   */
  async getKnowledgeBaseSize(knowledgeBaseId: string): Promise<{ size_bytes: number }> {
    console.log('📏 Getting knowledge base size:', knowledgeBaseId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-bases/${knowledgeBaseId}/size`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get knowledge base size: ${error}`);
    }

    return await response.json();
  }

  // Helper methods

  private async parseError(response: Response): Promise<string> {
    try {
      const data = await response.json();
      return data.error || data.message || response.statusText;
    } catch {
      return response.statusText;
    }
  }
}

