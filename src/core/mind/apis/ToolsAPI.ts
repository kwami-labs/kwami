/**
 * ElevenLabs Tools API
 * Manage tools that agents can use during conversations
 * 
 * API Reference: https://elevenlabs.io/docs/api-reference/tools
 */

import type { ToolParameter as ToolParameterBase } from '../../../types/elevenlabs-agents';

export type ToolParameter = ToolParameterBase;

export interface ToolParameterLegacy {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
}

export interface CreateToolRequest {
  name: string;
  description: string;
  parameters?: ToolParameter[];
  url?: string; // Webhook URL for tool execution
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body_schema?: any; // JSON schema for request body
}

export interface ToolResponse {
  tool_id: string;
  name: string;
  description: string;
  parameters?: ToolParameter[];
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body_schema?: any;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateToolRequest {
  name?: string;
  description?: string;
  parameters?: ToolParameter[];
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body_schema?: any;
}

export interface ListToolsOptions {
  page_size?: number;
  page_token?: string;
}

export interface ListToolsResponse {
  tools: ToolResponse[];
  next_page_token?: string;
  has_more?: boolean;
}

/**
 * Tools API Client
 */
export class ToolsAPI {
  constructor(private apiKey: string) {}

  /**
   * Create a new tool
   */
  async createTool(request: CreateToolRequest): Promise<ToolResponse> {
    console.log('📝 Creating new tool:', request.name);

    const response = await fetch('https://api.elevenlabs.io/v1/convai/tools/create', {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to create tool: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Tool created:', data.tool_id);
    return data as ToolResponse;
  }

  /**
   * Get a tool by ID
   */
  async getTool(toolId: string): Promise<ToolResponse> {
    console.log('🔍 Fetching tool:', toolId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${toolId}`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get tool: ${error}`);
    }

    return await response.json() as ToolResponse;
  }

  /**
   * List all tools
   */
  async listTools(options?: ListToolsOptions): Promise<ListToolsResponse> {
    console.log('📋 Listing tools...');

    const queryParams = new URLSearchParams();
    if (options?.page_size) queryParams.append('page_size', options.page_size.toString());
    if (options?.page_token) queryParams.append('page_token', options.page_token);

    const url = `https://api.elevenlabs.io/v1/convai/tools${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to list tools: ${error}`);
    }

    const data = await response.json();
    return data as ListToolsResponse;
  }

  /**
   * Update an existing tool
   */
  async updateTool(toolId: string, request: UpdateToolRequest): Promise<ToolResponse> {
    console.log('✏️ Updating tool:', toolId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${toolId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to update tool: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Tool updated successfully');
    return data as ToolResponse;
  }

  /**
   * Delete a tool
   */
  async deleteTool(toolId: string): Promise<void> {
    console.log('🗑️ Deleting tool:', toolId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${toolId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to delete tool: ${error}`);
    }

    console.log('✅ Tool deleted successfully');
  }

  /**
   * Get dependent agents (which agents use this tool)
   */
  async getDependentAgents(toolId: string): Promise<{ agent_ids: string[] }> {
    console.log('🔗 Fetching dependent agents for tool:', toolId);

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${toolId}/dependent-agents`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(`Failed to get dependent agents: ${error}`);
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

/**
 * Helper function to create a simple tool
 */
export function createSimpleTool(
  name: string,
  description: string,
  webhookUrl: string,
  parameters?: ToolParameter[]
): CreateToolRequest {
  return {
    name,
    description,
    url: webhookUrl,
    method: 'POST',
    parameters: parameters || [],
  };
}

/**
 * Helper to create a tool parameter
 */
export function createToolParameter(
  name: string,
  type: ToolParameter['type'],
  description: string,
  options?: {
    required?: boolean;
    enum?: string[];
  }
): ToolParameter {
  return {
    name,
    type,
    description,
    required: options?.required,
    enum: options?.enum,
  };
}

