/**
 * Kwami Action System Types
 * 
 * Actions are the connection between Mind and Body through the Soul.
 * They define what Kwami can do in response to events, user interaction, or AI decisions.
 * 
 * Design Philosophy:
 * - Actions live in Soul (personality & behavior layer)
 * - Actions can modify Mind state (AI behavior) or Body state (visual/interaction)
 * - MCP (Model Context Protocol) compatible for future AI agent integration
 * - Configurable via JSON/YAML for easy customization
 * - Extensible architecture for complex future actions (Instagram posts, WhatsApp messages, etc.)
 */

/**
 * Action categories based on what they affect
 */
export type ActionCategory = 
  | 'body'        // Visual/interaction changes
  | 'mind'        // AI behavior changes
  | 'soul'        // Personality changes
  | 'integration' // External service integrations
  | 'system';     // System-level operations

/**
 * Action trigger types - when can an action be executed
 */
export type ActionTrigger = 
  | 'context-menu'     // Right-click menu
  | 'keyboard'         // Keyboard shortcut
  | 'voice-command'    // Voice activation
  | 'api'              // API call
  | 'ai-decision'      // AI-initiated
  | 'time-based'       // Scheduled
  | 'event'            // Event-driven
  | 'manual';          // Programmatic

/**
 * Action execution context - runtime information
 */
export interface ActionContext {
  timestamp: number;
  trigger: ActionTrigger;
  user?: {
    id?: string;
    preferences?: Record<string, any>;
  };
  environment?: {
    platform?: string;
    locale?: string;
  };
  session?: {
    id?: string;
    startTime?: number;
  };
  params?: Record<string, any>;
}

/**
 * Action parameter definition for validation and UI generation
 */
export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'file' | 'json';
  label?: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: Array<{ value: any; label: string }>; // For select type
  min?: number;
  max?: number;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean;
  };
}

/**
 * Action execution result
 */
export interface ActionResult {
  success: boolean;
  actionId: string;
  executionTime: number;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  logs?: string[];
}

/**
 * Action permission requirements
 */
export interface ActionPermission {
  level: 'public' | 'user' | 'admin' | 'system';
  scopes?: string[];
  requiresConsent?: boolean;
}

/**
 * MCP Tool Definition (Model Context Protocol compatibility)
 * Allows AI agents to discover and use actions
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Base Action Definition
 */
export interface ActionDefinition {
  // Identity
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  version: string;
  
  // Metadata
  author?: string;
  tags?: string[];
  icon?: string;
  
  // Configuration
  enabled?: boolean;
  triggers?: ActionTrigger[];
  shortcuts?: {
    keyboard?: string;
    voice?: string[];
  };
  
  // Parameters
  parameters?: ActionParameter[];
  
  // Permissions & Safety
  permissions?: ActionPermission;
  confirmation?: {
    required: boolean;
    message?: string;
  };
  
  // MCP Integration
  mcp?: MCPToolDefinition;
  
  // Execution
  handler: string | ActionHandler;
  timeout?: number;
  retryPolicy?: {
    maxAttempts: number;
    delayMs: number;
  };
  
  // UI
  ui?: {
    showInContextMenu?: boolean;
    menuLabel?: string;
    menuIcon?: string;
    menuOrder?: number;
    menuGroup?: string;
  };
}

/**
 * Action Handler Function Type
 */
export type ActionHandler = (
  context: ActionContext,
  params?: Record<string, any>
) => Promise<ActionResult> | ActionResult;

/**
 * Built-in Action Types (can be extended)
 */

/**
 * Body Actions - Visual and interaction modifications
 */
export interface BodyActionDefinition extends ActionDefinition {
  category: 'body';
  bodyAction: {
    type: 'appearance' | 'animation' | 'interaction' | 'position';
    target?: 'blob' | 'background' | 'camera' | 'scene';
  };
}

/**
 * Mind Actions - AI behavior modifications
 */
export interface MindActionDefinition extends ActionDefinition {
  category: 'mind';
  mindAction: {
    type: 'speak' | 'listen' | 'think' | 'learn' | 'configure';
    provider?: string;
  };
}

/**
 * Soul Actions - Personality modifications
 */
export interface SoulActionDefinition extends ActionDefinition {
  category: 'soul';
  soulAction: {
    type: 'trait' | 'mood' | 'personality' | 'behavior';
  };
}

/**
 * Integration Actions - External service integrations
 */
export interface IntegrationActionDefinition extends ActionDefinition {
  category: 'integration';
  integration: {
    service: string;
    type: 'social' | 'messaging' | 'storage' | 'ai' | 'custom';
    endpoint?: string;
    auth?: {
      type: 'oauth' | 'api-key' | 'token' | 'none';
      required: boolean;
    };
  };
}

/**
 * System Actions - System-level operations
 */
export interface SystemActionDefinition extends ActionDefinition {
  category: 'system';
  systemAction: {
    type: 'config' | 'debug' | 'export' | 'import' | 'reset';
  };
}

/**
 * Union of all action types
 */
export type AnyActionDefinition = 
  | BodyActionDefinition
  | MindActionDefinition
  | SoulActionDefinition
  | IntegrationActionDefinition
  | SystemActionDefinition;

/**
 * Action Collection - Group of related actions
 */
export interface ActionCollection {
  id: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  actions: AnyActionDefinition[];
}

/**
 * Action Registry Entry
 */
export interface ActionRegistryEntry {
  definition: AnyActionDefinition;
  source: 'built-in' | 'config' | 'plugin' | 'api';
  loadedAt: Date;
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTime?: number;
}

/**
 * Action Execution Options
 */
export interface ActionExecutionOptions {
  context?: Partial<ActionContext>;
  params?: Record<string, any>;
  skipValidation?: boolean;
  skipConfirmation?: boolean;
  timeout?: number;
  onProgress?: (progress: number, message?: string) => void;
}

/**
 * Action Filter Options
 */
export interface ActionFilterOptions {
  category?: ActionCategory | ActionCategory[];
  tags?: string[];
  triggers?: ActionTrigger[];
  enabled?: boolean;
  search?: string;
}

