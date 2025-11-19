/**
 * Validation utilities for ElevenLabs Agent configurations
 */
import type {
  CreateAgentRequestFull,
  UpdateAgentRequestFull,
  TTSConversationalConfig,
  ASRConversationalConfig,
  TurnConfig,
  ToolConfig,
  AgentWorkflow,
  ValidationError,
  ValidationResult,
} from '../../types/elevenlabs-agents';

/**
 * Validate a complete agent configuration
 */
export function validateAgentConfig(config: CreateAgentRequestFull): ValidationResult {
  const errors: ValidationError[] = [];

  // Voice ID is required
  if (!config.conversation_config?.tts?.voice_id) {
    errors.push({
      field: 'conversation_config.tts.voice_id',
      message: 'Voice ID is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Validate TTS settings
  if (config.conversation_config?.tts) {
    errors.push(...validateTTSConfig(config.conversation_config.tts));
  }

  // Validate ASR settings
  if (config.conversation_config?.asr) {
    errors.push(...validateASRConfig(config.conversation_config.asr));
  }

  // Validate Turn settings
  if (config.conversation_config?.turn) {
    errors.push(...validateTurnConfig(config.conversation_config.turn));
  }

  // Validate Agent prompt settings
  if (config.conversation_config?.agent?.prompt) {
    errors.push(...validatePromptConfig(config.conversation_config.agent.prompt));
  }

  // Validate Tools
  if (config.conversation_config?.agent?.prompt?.tools) {
    errors.push(...validateTools(config.conversation_config.agent.prompt.tools));
  }

  // Validate Workflow
  if (config.workflow) {
    errors.push(...validateWorkflow(config.workflow));
  }

  // Validate max duration
  const maxDuration = config.conversation_config?.conversation?.max_duration_seconds;
  if (maxDuration !== undefined && maxDuration < 1) {
    errors.push({
      field: 'conversation_config.conversation.max_duration_seconds',
      message: 'Max duration must be at least 1 second',
      code: 'INVALID_VALUE',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate TTS configuration
 */
export function validateTTSConfig(config: TTSConversationalConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Stability: 0-1
  if (config.stability !== undefined && (config.stability < 0 || config.stability > 1)) {
    errors.push({
      field: 'tts.stability',
      message: 'Stability must be between 0 and 1',
      code: 'OUT_OF_RANGE',
    });
  }

  // Speed: 0.25-4.0
  if (config.speed !== undefined && (config.speed < 0.25 || config.speed > 4.0)) {
    errors.push({
      field: 'tts.speed',
      message: 'Speed must be between 0.25 and 4.0',
      code: 'OUT_OF_RANGE',
    });
  }

  // Similarity boost: 0-1
  if (config.similarity_boost !== undefined && (config.similarity_boost < 0 || config.similarity_boost > 1)) {
    errors.push({
      field: 'tts.similarity_boost',
      message: 'Similarity boost must be between 0 and 1',
      code: 'OUT_OF_RANGE',
    });
  }

  // Optimize streaming latency: 0-4 (as string)
  if (config.optimize_streaming_latency !== undefined) {
    const level = parseInt(config.optimize_streaming_latency);
    if (isNaN(level) || level < 0 || level > 4) {
      errors.push({
        field: 'tts.optimize_streaming_latency',
        message: 'Optimize streaming latency must be "0", "1", "2", "3", or "4"',
        code: 'INVALID_VALUE',
      });
    }
  }

  return errors;
}

/**
 * Validate ASR configuration
 */
export function validateASRConfig(config: ASRConversationalConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Quality must be 'high' or 'low'
  if (config.quality && !['high', 'low'].includes(config.quality)) {
    errors.push({
      field: 'asr.quality',
      message: 'Quality must be "high" or "low"',
      code: 'INVALID_VALUE',
    });
  }

  // Provider validation
  if (config.provider && !['elevenlabs', 'scribe_realtime'].includes(config.provider)) {
    errors.push({
      field: 'asr.provider',
      message: 'Provider must be "elevenlabs" or "scribe_realtime"',
      code: 'INVALID_VALUE',
    });
  }

  return errors;
}

/**
 * Validate Turn configuration
 */
export function validateTurnConfig(config: TurnConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Timeouts must be positive
  if (config.turn_timeout !== undefined && config.turn_timeout < 0) {
    errors.push({
      field: 'turn.turn_timeout',
      message: 'Turn timeout must be non-negative',
      code: 'INVALID_VALUE',
    });
  }

  if (config.initial_wait_time !== undefined && config.initial_wait_time < 0) {
    errors.push({
      field: 'turn.initial_wait_time',
      message: 'Initial wait time must be non-negative',
      code: 'INVALID_VALUE',
    });
  }

  if (config.silence_end_call_timeout !== undefined && config.silence_end_call_timeout < 0) {
    errors.push({
      field: 'turn.silence_end_call_timeout',
      message: 'Silence end call timeout must be non-negative',
      code: 'INVALID_VALUE',
    });
  }

  // Soft timeout validation
  if (config.soft_timeout_config) {
    if (config.soft_timeout_config.timeout_seconds !== undefined && config.soft_timeout_config.timeout_seconds < 0) {
      errors.push({
        field: 'turn.soft_timeout_config.timeout_seconds',
        message: 'Soft timeout seconds must be non-negative',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Turn eagerness validation
  if (config.turn_eagerness && !['patient', 'normal', 'eager'].includes(config.turn_eagerness)) {
    errors.push({
      field: 'turn.turn_eagerness',
      message: 'Turn eagerness must be "patient", "normal", or "eager"',
      code: 'INVALID_VALUE',
    });
  }

  return errors;
}

/**
 * Validate Prompt configuration
 */
export function validatePromptConfig(config: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Temperature: 0-1
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
    errors.push({
      field: 'agent.prompt.temperature',
      message: 'Temperature must be between 0 and 1',
      code: 'OUT_OF_RANGE',
    });
  }

  // Max tokens must be positive
  if (config.max_tokens !== undefined && config.max_tokens < 1) {
    errors.push({
      field: 'agent.prompt.max_tokens',
      message: 'Max tokens must be at least 1',
      code: 'INVALID_VALUE',
    });
  }

  return errors;
}

/**
 * Validate Tools configuration
 */
export function validateTools(tools: ToolConfig[]): ValidationError[] {
  const errors: ValidationError[] = [];

  tools.forEach((tool, index) => {
    if (!tool.name) {
      errors.push({
        field: `agent.prompt.tools[${index}].name`,
        message: 'Tool name is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!tool.description) {
      errors.push({
        field: `agent.prompt.tools[${index}].description`,
        message: 'Tool description is required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Validate tool parameters
    if (tool.parameters) {
      tool.parameters.forEach((param, paramIndex) => {
        if (!param.name) {
          errors.push({
            field: `agent.prompt.tools[${index}].parameters[${paramIndex}].name`,
            message: 'Parameter name is required',
            code: 'REQUIRED_FIELD',
          });
        }

        if (!param.type) {
          errors.push({
            field: `agent.prompt.tools[${index}].parameters[${paramIndex}].type`,
            message: 'Parameter type is required',
            code: 'REQUIRED_FIELD',
          });
        }

        const validTypes = ['string', 'number', 'boolean', 'object', 'array'];
        if (param.type && !validTypes.includes(param.type)) {
          errors.push({
            field: `agent.prompt.tools[${index}].parameters[${paramIndex}].type`,
            message: `Parameter type must be one of: ${validTypes.join(', ')}`,
            code: 'INVALID_VALUE',
          });
        }
      });
    }
  });

  return errors;
}

/**
 * Validate Workflow configuration
 */
export function validateWorkflow(workflow: AgentWorkflow): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check that nodes exist
  if (!workflow.nodes || Object.keys(workflow.nodes).length === 0) {
    errors.push({
      field: 'workflow.nodes',
      message: 'Workflow must have at least one node',
      code: 'REQUIRED_FIELD',
    });
    return errors; // Can't validate further without nodes
  }

  // Check that edges reference valid nodes
  if (workflow.edges) {
    Object.entries(workflow.edges).forEach(([edgeId, edge]) => {
      if (!workflow.nodes[edge.source]) {
        errors.push({
          field: `workflow.edges[${edgeId}].source`,
          message: `Edge references non-existent source node: ${edge.source}`,
          code: 'INVALID_REFERENCE',
        });
      }

      if (!workflow.nodes[edge.target]) {
        errors.push({
          field: `workflow.edges[${edgeId}].target`,
          message: `Edge references non-existent target node: ${edge.target}`,
          code: 'INVALID_REFERENCE',
        });
      }
    });
  }

  // Check for required start node
  const hasStartNode = Object.values(workflow.nodes).some(node => node.type === 'start');
  if (!hasStartNode) {
    errors.push({
      field: 'workflow.nodes',
      message: 'Workflow must have at least one start node',
      code: 'REQUIRED_FIELD',
    });
  }

  // Validate node-specific requirements
  Object.entries(workflow.nodes).forEach(([nodeId, node]) => {
    if (node.type === 'standalone_agent' && !('agent_id' in node)) {
      errors.push({
        field: `workflow.nodes[${nodeId}].agent_id`,
        message: 'Standalone agent node must have agent_id',
        code: 'REQUIRED_FIELD',
      });
    }

    if (node.type === 'tool' && (!('tools' in node) || !node.tools || node.tools.length === 0)) {
      errors.push({
        field: `workflow.nodes[${nodeId}].tools`,
        message: 'Tool node must have at least one tool',
        code: 'REQUIRED_FIELD',
      });
    }

    if (node.type === 'phone_number' && !('phone_number' in node)) {
      errors.push({
        field: `workflow.nodes[${nodeId}].phone_number`,
        message: 'Phone number node must have phone_number',
        code: 'REQUIRED_FIELD',
      });
    }
  });

  return errors;
}

/**
 * Quick helper to check if a configuration is valid
 */
export function isValidAgentConfig(config: CreateAgentRequestFull): boolean {
  const result = validateAgentConfig(config);
  return result.valid;
}

/**
 * Format validation errors as a readable string
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }

  return errors.map(err => `[${err.field}] ${err.message} (${err.code})`).join('\n');
}

