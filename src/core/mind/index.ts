/**
 * Mind Module - Export all Mind-related classes and utilities
 */

// Main Mind class
export { KwamiMind } from './Mind';

// Agent Configuration Builder
export { AgentConfigBuilder, createBasicAgentConfig } from './AgentConfigBuilder';

// Validation utilities
export {
  validateAgentConfig,
  validateTTSConfig,
  validateASRConfig,
  validateTurnConfig,
  validatePromptConfig,
  validateTools,
  validateWorkflow,
  isValidAgentConfig,
  formatValidationErrors,
} from './validation';

// Tools API
export { ToolsAPI, createSimpleTool, createToolParameter } from './apis/ToolsAPI';
export type {
  CreateToolRequest,
  ToolResponse,
  UpdateToolRequest,
  ListToolsOptions,
  ListToolsResponse,
} from './apis/ToolsAPI';

// Knowledge Base API
export { KnowledgeBaseAPI } from './apis/KnowledgeBaseAPI';
export type {
  CreateKnowledgeBaseRequest,
  KnowledgeBaseResponse,
  UpdateKnowledgeBaseRequest,
  ListKnowledgeBasesOptions,
  ListKnowledgeBasesResponse,
  CreateKnowledgeBaseDocumentFromURLRequest,
  CreateKnowledgeBaseDocumentFromTextRequest,
  CreateKnowledgeBaseDocumentFromFileRequest,
  KnowledgeBaseDocumentResponse,
  ListKnowledgeBaseDocumentsOptions,
  ListKnowledgeBaseDocumentsResponse,
  DocumentContent,
  DocumentChunk,
  RAGIndexResponse,
  RAGIndexOverview,
} from './apis/KnowledgeBaseAPI';

// Provider types
export type { MindProvider, MindConversationCallbacks, MindProviderSpeakOptions } from './providers/types';

