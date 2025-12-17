import type {
  ActionDefinition,
  AnyActionDefinition,
  ActionRegistryEntry,
  ActionContext,
  ActionResult,
  ActionExecutionOptions,
  ActionFilterOptions,
  ActionHandler,
  ActionTrigger,
  ActionCollection,
} from './types';
import { logger } from '../../utils/logger';
import * as yaml from 'js-yaml';

/**
 * ActionManager - Manages the Kwami action system
 * 
 * The ActionManager is part of the Soul component and serves as the bridge
 * between Mind (AI capabilities) and Body (visual representation).
 * 
 * Responsibilities:
 * - Register and manage actions from multiple sources
 * - Validate and execute actions with proper context
 * - Provide action discovery for context menus and AI agents
 * - Support MCP (Model Context Protocol) for AI integration
 * - Load actions from configuration files (JSON/YAML)
 * 
 * @example
 * ```typescript
 * const actionManager = new ActionManager(kwami);
 * 
 * // Register an action
 * actionManager.registerAction({
 *   id: 'change-transparency',
 *   name: 'Change Blob Transparency',
 *   category: 'body',
 *   handler: async (context, params) => {
 *     kwami.body.blob.setOpacity(params.opacity);
 *     return { success: true, actionId: 'change-transparency', executionTime: 0 };
 *   }
 * });
 * 
 * // Execute an action
 * await actionManager.executeAction('change-transparency', { opacity: 0.5 });
 * ```
 */
export class ActionManager {
  private registry: Map<string, ActionRegistryEntry> = new Map();
  private kwami: any; // Reference to main Kwami instance
  private executionHistory: Array<{ actionId: string; timestamp: number; result: ActionResult }> = [];
  private maxHistorySize = 100;
  private followClickEnabled = false; // Track follow-click mode state

  constructor(kwami: any) {
    this.kwami = kwami;
    this.loadBuiltInActions();
  }

  /**
   * Register a new action
   */
  registerAction(
    definition: AnyActionDefinition,
    source: 'built-in' | 'config' | 'plugin' | 'api' = 'config'
  ): void {
    // Validate action definition
    if (!definition.id || !definition.name || !definition.category) {
      throw new Error('Action definition must include id, name, and category');
    }

    // Check for conflicts
    if (this.registry.has(definition.id)) {
      logger.warn(`Action '${definition.id}' already registered. Overwriting.`);
    }

    // Create registry entry
    const entry: ActionRegistryEntry = {
      definition,
      source,
      loadedAt: new Date(),
      executionCount: 0,
    };

    this.registry.set(definition.id, entry);
    logger.info(`✅ Registered action: ${definition.name} (${definition.id})`);
  }

  /**
   * Unregister an action
   */
  unregisterAction(actionId: string): boolean {
    const deleted = this.registry.delete(actionId);
    if (deleted) {
      logger.info(`🗑️ Unregistered action: ${actionId}`);
    }
    return deleted;
  }

  /**
   * Get an action definition by ID
   */
  getAction(actionId: string): AnyActionDefinition | undefined {
    return this.registry.get(actionId)?.definition;
  }

  /**
   * Get all registered actions
   */
  getAllActions(filter?: ActionFilterOptions): AnyActionDefinition[] {
    let actions = Array.from(this.registry.values()).map((entry) => entry.definition);

    if (!filter) {
      return actions;
    }

    // Apply filters
    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
      actions = actions.filter((action) => categories.includes(action.category));
    }

    if (filter.tags && filter.tags.length > 0) {
      actions = actions.filter(
        (action) =>
          action.tags && action.tags.some((tag) => filter.tags!.includes(tag))
      );
    }

    if (filter.triggers && filter.triggers.length > 0) {
      actions = actions.filter(
        (action) =>
          action.triggers && action.triggers.some((trigger) => filter.triggers!.includes(trigger))
      );
    }

    if (filter.enabled !== undefined) {
      actions = actions.filter((action) => action.enabled !== false);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      actions = actions.filter(
        (action) =>
          action.name.toLowerCase().includes(search) ||
          action.description?.toLowerCase().includes(search) ||
          action.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    return actions;
  }

  /**
   * Get actions suitable for context menu
   */
  getContextMenuActions(): AnyActionDefinition[] {
    return this.getAllActions({ enabled: true })
      .filter((action) => {
        // Include if explicitly enabled for context menu or has context-menu trigger
        return (
          action.ui?.showInContextMenu !== false &&
          action.triggers?.includes('context-menu')
        );
      })
      .sort((a, b) => {
        // Sort by menu order if specified
        const orderA = a.ui?.menuOrder ?? 999;
        const orderB = b.ui?.menuOrder ?? 999;
        return orderA - orderB;
      });
  }

  /**
   * Execute an action
   */
  async executeAction(
    actionId: string,
    options: ActionExecutionOptions = {}
  ): Promise<ActionResult> {
    const entry = this.registry.get(actionId);
    
    if (!entry) {
      const error: ActionResult = {
        success: false,
        actionId,
        executionTime: 0,
        error: {
          code: 'ACTION_NOT_FOUND',
          message: `Action '${actionId}' not found`,
        },
      };
      this.addToHistory(actionId, error);
      return error;
    }

    const { definition } = entry;

    // Check if action is enabled
    if (definition.enabled === false) {
      const error: ActionResult = {
        success: false,
        actionId,
        executionTime: 0,
        error: {
          code: 'ACTION_DISABLED',
          message: `Action '${actionId}' is disabled`,
        },
      };
      this.addToHistory(actionId, error);
      return error;
    }

    // Build execution context
    const context: ActionContext = {
      timestamp: Date.now(),
      trigger: options.context?.trigger ?? 'manual',
      user: options.context?.user,
      environment: options.context?.environment,
      session: options.context?.session,
      params: options.params,
    };

    // Validate parameters if not skipped
    if (!options.skipValidation && definition.parameters) {
      const validationError = this.validateParameters(definition.parameters, options.params || {});
      if (validationError) {
        const error: ActionResult = {
          success: false,
          actionId,
          executionTime: 0,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationError,
          },
        };
        this.addToHistory(actionId, error);
        return error;
      }
    }

    // Check for confirmation requirement
    if (
      definition.confirmation?.required &&
      !options.skipConfirmation &&
      typeof window !== 'undefined'
    ) {
      const message = definition.confirmation.message || `Execute action: ${definition.name}?`;
      const confirmed = window.confirm(message);
      if (!confirmed) {
        const error: ActionResult = {
          success: false,
          actionId,
          executionTime: 0,
          error: {
            code: 'USER_CANCELLED',
            message: 'User cancelled the action',
          },
        };
        this.addToHistory(actionId, error);
        return error;
      }
    }

    // Execute the action
    const startTime = Date.now();
    let result: ActionResult;

    try {
      const handler = this.resolveHandler(definition.handler);
      
      // Apply timeout if specified
      const timeout = options.timeout ?? definition.timeout ?? 30000;
      const timeoutPromise = new Promise<ActionResult>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Action execution timeout after ${timeout}ms`)
            ),
          timeout
        )
      );

      const executionPromise = Promise.resolve(handler(context, options.params));
      result = await Promise.race([executionPromise, timeoutPromise]);

      // Update execution statistics
      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      entry.executionCount++;
      entry.lastExecuted = new Date();
      
      // Update average execution time
      if (entry.averageExecutionTime === undefined) {
        entry.averageExecutionTime = executionTime;
      } else {
        entry.averageExecutionTime = (entry.averageExecutionTime + executionTime) / 2;
      }

      logger.info(`✅ Executed action '${definition.name}' in ${executionTime}ms`);
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      result = {
        success: false,
        actionId,
        executionTime,
        error: {
          code: 'EXECUTION_ERROR',
          message: error.message || 'Unknown error',
          details: error,
        },
      };
      logger.error(`❌ Action execution failed: ${definition.name}`, error);
    }

    this.addToHistory(actionId, result);
    return result;
  }

  /**
   * Load actions from a JSON string
   */
  loadActionsFromJSON(jsonString: string, source: 'config' | 'api' = 'config'): number {
    try {
      const data = JSON.parse(jsonString);
      return this.loadActionsFromData(data, source);
    } catch (error: any) {
      logger.error('Failed to parse action JSON:', error);
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  /**
   * Load actions from a YAML string
   */
  loadActionsFromYAML(yamlString: string, source: 'config' | 'api' = 'config'): number {
    try {
      const data = yaml.load(yamlString);
      return this.loadActionsFromData(data, source);
    } catch (error: any) {
      logger.error('Failed to parse action YAML:', error);
      throw new Error(`Invalid YAML: ${error.message}`);
    }
  }

  /**
   * Load actions from a URL (JSON or YAML)
   */
  async loadActionsFromURL(url: string, source: 'config' | 'api' = 'config'): Promise<number> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch actions: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isYAML = url.toLowerCase().endsWith('.yaml') || 
                     url.toLowerCase().endsWith('.yml') || 
                     contentType.includes('yaml');

      const text = await response.text();
      
      if (isYAML) {
        return this.loadActionsFromYAML(text, source);
      } else {
        return this.loadActionsFromJSON(text, source);
      }
    } catch (error: any) {
      logger.error('Failed to load actions from URL:', error);
      throw error;
    }
  }

  /**
   * Export all actions as JSON
   */
  exportAsJSON(filter?: ActionFilterOptions): string {
    const actions = this.getAllActions(filter);
    const collection: ActionCollection = {
      id: 'kwami-actions-export',
      name: 'Kwami Actions Export',
      version: '1.5.12',
      actions,
    };
    return JSON.stringify(collection, null, 2);
  }

  /**
   * Export all actions as YAML
   */
  exportAsYAML(filter?: ActionFilterOptions): string {
    const actions = this.getAllActions(filter);
    const collection: ActionCollection = {
      id: 'kwami-actions-export',
      name: 'Kwami Actions Export',
      version: '1.5.12',
      actions,
    };
    return yaml.dump(collection);
  }

  /**
   * Get action execution history
   */
  getExecutionHistory(limit?: number): Array<{ actionId: string; timestamp: number; result: ActionResult }> {
    if (limit) {
      return this.executionHistory.slice(-limit);
    }
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Get action statistics
   */
  getStatistics(): {
    totalActions: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    totalExecutions: number;
    averageExecutionTime: number;
  } {
    const entries = Array.from(this.registry.values());
    
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalExecutions = 0;
    let totalExecutionTime = 0;
    let executionCount = 0;

    entries.forEach((entry) => {
      // Count by category
      byCategory[entry.definition.category] = (byCategory[entry.definition.category] || 0) + 1;
      
      // Count by source
      bySource[entry.source] = (bySource[entry.source] || 0) + 1;
      
      // Execution stats
      totalExecutions += entry.executionCount;
      if (entry.averageExecutionTime) {
        totalExecutionTime += entry.averageExecutionTime * entry.executionCount;
        executionCount += entry.executionCount;
      }
    });

    return {
      totalActions: entries.length,
      byCategory,
      bySource,
      totalExecutions,
      averageExecutionTime: executionCount > 0 ? totalExecutionTime / executionCount : 0,
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Load actions from parsed data (JSON or YAML)
   */
  private loadActionsFromData(data: any, source: 'config' | 'api'): number {
    let count = 0;

    if (Array.isArray(data)) {
      // Array of actions
      data.forEach((actionDef) => {
        try {
          this.registerAction(actionDef, source);
          count++;
        } catch (error: any) {
          logger.error(`Failed to register action ${actionDef.id}:`, error);
        }
      });
    } else if (data.actions && Array.isArray(data.actions)) {
      // Action collection format
      data.actions.forEach((actionDef: any) => {
        try {
          this.registerAction(actionDef, source);
          count++;
        } catch (error: any) {
          logger.error(`Failed to register action ${actionDef.id}:`, error);
        }
      });
    } else if (data.id && data.name && data.category) {
      // Single action
      this.registerAction(data, source);
      count = 1;
    } else {
      throw new Error('Invalid action data format');
    }

    logger.info(`📦 Loaded ${count} actions from ${source}`);
    return count;
  }

  /**
   * Resolve action handler (string reference or function)
   */
  private resolveHandler(handler: string | ActionHandler): ActionHandler {
    if (typeof handler === 'function') {
      return handler;
    }

    // Handler is a string reference - resolve it from built-in handlers
    const builtInHandler = this.getBuiltInHandler(handler);
    if (builtInHandler) {
      return builtInHandler;
    }

    throw new Error(`Handler '${handler}' not found`);
  }

  /**
   * Get built-in handler by name
   */
  private getBuiltInHandler(name: string): ActionHandler | undefined {
    // Built-in handlers are defined below
    const handlers: Record<string, ActionHandler> = {
      'body.setOpacity': async (context, params) => {
        try {
          let opacity = params?.opacity;
          
          // If no opacity provided, prompt the user
          if (opacity === undefined && typeof window !== 'undefined') {
            const currentOpacity = this.kwami?.body?.blob?.getOpacity() ?? 1;
            const input = window.prompt('Enter blob opacity (0-1):', String(currentOpacity));
            if (input === null) {
              return {
                success: false,
                actionId: 'body.setOpacity',
                executionTime: 0,
                error: { code: 'USER_CANCELLED', message: 'User cancelled' },
              };
            }
            opacity = parseFloat(input);
            if (isNaN(opacity) || opacity < 0 || opacity > 1) {
              return {
                success: false,
                actionId: 'body.setOpacity',
                executionTime: 0,
                error: { code: 'INVALID_INPUT', message: 'Opacity must be 0-1' },
              };
            }
          }
          
          opacity = opacity ?? 1;
          this.kwami.body.blob.setOpacity(opacity);
          logger.info(`✅ Set opacity to ${opacity}`);
          return { success: true, actionId: 'body.setOpacity', executionTime: 0, data: { opacity } };
        } catch (error: any) {
          logger.error('❌ setOpacity failed:', error);
          throw error;
        }
      },
      
      'body.toggleWireframe': async () => {
        const current = this.kwami.body.blob.getWireframe();
        this.kwami.body.blob.setWireframe(!current);
        logger.info(`✅ Wireframe ${!current ? 'ON' : 'OFF'}`);
        return { success: true, actionId: 'body.toggleWireframe', executionTime: 0, data: { wireframe: !current } };
      },
      
      'body.toggleFollowClick': async () => {
        this.followClickEnabled = !this.followClickEnabled;
        if (this.followClickEnabled) {
          this.enableFollowClick();
        } else {
          this.disableFollowClick();
        }
        logger.info(`✅ Follow click ${this.followClickEnabled ? 'ON' : 'OFF'}`);
        return { success: true, actionId: 'body.toggleFollowClick', executionTime: 0, data: { enabled: this.followClickEnabled } };
      },
      
      'body.randomizeBlob': async () => {
        this.kwami.body.randomizeBlob();
        logger.info('✅ Randomized blob');
        return { success: true, actionId: 'body.randomizeBlob', executionTime: 0 };
      },

      'body.randomizeBackground': async () => {
        this.kwami.body.randomizeBackground();
        logger.info('✅ Randomized background');
        return { success: true, actionId: 'body.randomizeBackground', executionTime: 0 };
      },
      
      'body.clearBackground': async () => {
        this.kwami.body.setBackgroundTransparent();
        logger.info('✅ Cleared background');
        return { success: true, actionId: 'body.clearBackground', executionTime: 0 };
      },

      'body.setScale': async (context, params) => {
        try {
          let scale = params?.scale;
          
          if (scale === undefined && typeof window !== 'undefined') {
            const currentScale = this.kwami.body.blob.getScale();
            const input = window.prompt('Enter blob scale (0.1-10):', String(currentScale));
            if (input === null) {
              return {
                success: false,
                actionId: 'body.setScale',
                executionTime: 0,
                error: { code: 'USER_CANCELLED', message: 'User cancelled' },
              };
            }
            scale = parseFloat(input);
            if (isNaN(scale) || scale < 0.1 || scale > 10) {
              return {
                success: false,
                actionId: 'body.setScale',
                executionTime: 0,
                error: { code: 'INVALID_INPUT', message: 'Scale must be 0.1-10' },
              };
            }
          }
          
          scale = scale ?? 4;
          this.kwami.body.blob.setScale(scale);
          logger.info(`✅ Set scale to ${scale}`);
          return { success: true, actionId: 'body.setScale', executionTime: 0, data: { scale } };
        } catch (error: any) {
          logger.error('❌ setScale failed:', error);
          throw error;
        }
      },

      'mind.textToSpeech': async (context, params) => {
        try {
          // Check if browser supports Speech Synthesis API
          if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return {
              success: false,
              actionId: 'mind.textToSpeech',
              executionTime: 0,
              error: { 
                code: 'API_NOT_SUPPORTED', 
                message: 'Speech Synthesis API is not supported in this browser' 
              },
            };
          }

          let text = params?.text;
          let rate = params?.rate ?? 1;
          let pitch = params?.pitch ?? 1;
          let voice = params?.voice;
          
          // If no text provided, prompt the user
          if (!text && typeof window !== 'undefined') {
            text = window.prompt('Enter text to speak:', "Hello world! I'm Kwami your best companion in the upcoming metaverse");
            if (!text) {
              return {
                success: false,
                actionId: 'mind.textToSpeech',
                executionTime: 0,
                error: { code: 'USER_CANCELLED', message: 'User cancelled or provided empty text' },
              };
            }
          }

          if (!text) {
            return {
              success: false,
              actionId: 'mind.textToSpeech',
              executionTime: 0,
              error: { code: 'MISSING_TEXT', message: 'Text parameter is required' },
            };
          }

          // Set Kwami to speaking state for visual animation
          if (this.kwami) {
            this.kwami.setState('speaking');
          }

          // Create speech utterance
          const utter = new SpeechSynthesisUtterance(text);
          utter.rate = rate;
          utter.pitch = pitch;

          // Set voice if specified
          if (voice) {
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(v => v.name === voice || v.lang === voice);
            if (selectedVoice) {
              utter.voice = selectedVoice;
            }
          }

          // Simulate speech frequency data for blob animation
          // Since Speech Synthesis API doesn't provide audio stream access,
          // we'll manually inject realistic frequency data into the animation loop
          let animationFrameId: number | null = null;
          let startTime = Date.now();
          let lastUpdateTime = Date.now();
          
          const analyser = this.kwami?.body?.audio?.getAnalyser();
          if (!analyser) {
            logger.warn('No audio analyser available for TTS animation');
          }
          
          // Store original method once before starting
          if (analyser && !(analyser as any)._originalGetByteFrequencyData) {
            const originalGetByteFrequencyData = analyser.getByteFrequencyData.bind(analyser);
            (analyser as any)._originalGetByteFrequencyData = originalGetByteFrequencyData;
          }
          
          const simulateSpeechFrequencies = () => {
            if (!this.kwami?.body?.audio) return;
            
            const analyser = this.kwami.body.audio.getAnalyser();
            if (!analyser || !(analyser as any)._originalGetByteFrequencyData) return;
            
            const now = Date.now();
            const deltaTime = now - lastUpdateTime;
            lastUpdateTime = now;
            
            const time = (now - startTime) / 1000; // Time in seconds
            
            // Create realistic speech-like frequency patterns
            const frequencyData = new Uint8Array(analyser.frequencyBinCount);
            
            // Speech rhythm: alternating between vowels and consonants
            // Slower, more natural rhythm
            const syllableRate = 3.5 / rate; // syllables per second adjusted by rate
            const syllablePhase = (time * syllableRate) % 1;
            
            // Vowel/consonant envelope (0 = consonant, 1 = vowel)
            const isVowel = Math.sin(time * syllableRate * Math.PI * 2) * 0.5 + 0.5;
            const vowelEnvelope = Math.pow(isVowel, 2); // Sharper transitions
            
            // Overall amplitude envelope with natural variations
            const baseAmplitude = 0.6 + Math.sin(time * 0.8) * 0.2; // Slow variation
            const microAmplitude = Math.sin(time * 6) * 0.15; // Faster variations
            const amplitude = baseAmplitude + microAmplitude;
            
            // Match the blob's frequency band expectations
            // Low: 0-10%, Mid: 10-40%, High: 40-70%, Ultra: 70-100%
            const dataLength = frequencyData.length;
            const lowEnd = Math.floor(dataLength * 0.1);
            const midEnd = Math.floor(dataLength * 0.4);
            const highEnd = Math.floor(dataLength * 0.7);
            
            // Generate frequency data that matches real audio patterns
            for (let i = 0; i < dataLength; i++) {
              const binPosition = i / dataLength; // 0 to 1
              let energy = 0;
              
              // Determine which band we're in
              const isLow = i < lowEnd;
              const isMid = i >= lowEnd && i < midEnd;
              const isHigh = i >= midEnd && i < highEnd;
              const isUltra = i >= highEnd;
              
              // During vowels, emphasize formants in specific bands
              if (vowelEnvelope > 0.3) {
                // Low band (0-10%): Fundamental and first formant
                if (isLow) {
                  energy += 120 * vowelEnvelope * amplitude;
                  energy += Math.sin(time * 3) * 30 * vowelEnvelope;
                }
                
                // Mid band (10-40%): Second formant (main energy for speech)
                if (isMid) {
                  energy += 140 * vowelEnvelope * amplitude;
                  energy += Math.sin(time * 2.5) * 40 * vowelEnvelope;
                  // Add variation across the mid band
                  const midPosition = (i - lowEnd) / (midEnd - lowEnd);
                  energy += Math.sin(midPosition * Math.PI) * 30 * vowelEnvelope;
                }
                
                // High band (40-70%): Third formant
                if (isHigh) {
                  energy += 90 * vowelEnvelope * amplitude;
                  energy += Math.sin(time * 3.5) * 25 * vowelEnvelope;
                }
                
                // Ultra band (70-100%): Harmonics and breathiness
                if (isUltra) {
                  energy += 40 * vowelEnvelope * amplitude;
                  energy += Math.random() * 20 * vowelEnvelope;
                }
              }
              
              // During consonants, different distribution
              if (vowelEnvelope < 0.5) {
                const consonantEnvelope = 1 - vowelEnvelope * 2;
                
                // Consonants have less low frequency energy
                if (isLow) {
                  energy += 40 * consonantEnvelope * amplitude;
                }
                
                // Mid frequencies for voiced consonants
                if (isMid) {
                  energy += 70 * consonantEnvelope * amplitude;
                  energy += Math.random() * 30 * consonantEnvelope;
                }
                
                // High frequencies for fricatives
                if (isHigh) {
                  energy += 100 * consonantEnvelope * amplitude;
                  energy += Math.random() * 50 * consonantEnvelope;
                }
                
                // Ultra high for sibilants
                if (isUltra) {
                  energy += 80 * consonantEnvelope * amplitude;
                  energy += Math.random() * 60 * consonantEnvelope;
                }
                
                // Burst at consonant onset across all bands
                if (syllablePhase < 0.15) {
                  energy += Math.random() * 50 * amplitude;
                }
              }
              
              // Add subtle noise floor
              energy += Math.random() * 10;
              
              // Clamp to valid range (0-255)
              frequencyData[i] = Math.min(255, Math.max(0, energy));
            }
            
            // Store simulated data and override getByteFrequencyData
            (analyser as any)._simulatedData = frequencyData;
            
            // Override to inject our data into whatever array is passed
            if (!(analyser as any)._hasOverride) {
              analyser.getByteFrequencyData = function(array: Uint8Array) {
                if ((this as any)._simulatedData) {
                  // Copy our simulated data into the provided array
                  const simData = (this as any)._simulatedData;
                  const len = Math.min(array.length, simData.length);
                  for (let i = 0; i < len; i++) {
                    array[i] = simData[i];
                  }
                } else {
                  // Fall back to original method
                  (this as any)._originalGetByteFrequencyData.call(this, array);
                }
              };
              (analyser as any)._hasOverride = true;
            }
            
            // Continue animation
            animationFrameId = requestAnimationFrame(simulateSpeechFrequencies);
          };
          
          // Start simulation
          if (analyser) {
            simulateSpeechFrequencies();
          }

          // Create a promise to track speech completion
          await new Promise<void>((resolve, reject) => {
            utter.onend = () => {
              // Stop frequency simulation
              if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
              }
              
              // Restore original getByteFrequencyData method
              const analyser = this.kwami?.body?.audio?.getAnalyser();
              if (analyser && (analyser as any)._originalGetByteFrequencyData) {
                analyser.getByteFrequencyData = (analyser as any)._originalGetByteFrequencyData;
                delete (analyser as any)._simulatedData;
                delete (analyser as any)._originalGetByteFrequencyData;
                delete (analyser as any)._hasOverride;
              }
              
              // Return to idle state
              if (this.kwami) {
                this.kwami.setState('idle');
              }
              
              resolve();
            };
            
            utter.onerror = (event) => {
              // Stop frequency simulation on error
              if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
              }
              
              // Restore original getByteFrequencyData method
              const analyser = this.kwami?.body?.audio?.getAnalyser();
              if (analyser && (analyser as any)._originalGetByteFrequencyData) {
                analyser.getByteFrequencyData = (analyser as any)._originalGetByteFrequencyData;
                delete (analyser as any)._simulatedData;
                delete (analyser as any)._originalGetByteFrequencyData;
                delete (analyser as any)._hasOverride;
              }
              
              if (this.kwami) {
                this.kwami.setState('idle');
              }
              
              reject(new Error(`Speech synthesis error: ${event.error}`));
            };
            
            window.speechSynthesis.speak(utter);
          });

          logger.info(`✅ Spoke text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
          return { 
            success: true, 
            actionId: 'mind.textToSpeech', 
            executionTime: 0, 
            data: { text, rate, pitch, voice: utter.voice?.name } 
          };
        } catch (error: any) {
          logger.error('❌ textToSpeech failed:', error);
          
          // Ensure we return to idle state on error
          if (this.kwami) {
            this.kwami.setState('idle');
          }
          
          return {
            success: false,
            actionId: 'mind.textToSpeech',
            executionTime: 0,
            error: { 
              code: 'EXECUTION_ERROR', 
              message: error.message || 'Failed to speak text' 
            },
          };
        }
      },
    };

    return handlers[name];
  }

  /**
   * Enable follow-click behavior
   */
  private enableFollowClick(): void {
    const canvas = this.kwami.body.getRenderer().domElement;
    const camera = this.kwami.body.getCamera();
    const originalPosition = this.kwami.body.blob.position.clone();
    
    // Store original position for reset
    (canvas as any)._kwamiOriginalPosition = originalPosition;
    
    const handleClick = (event: MouseEvent) => {
      // Ignore right clicks
      if (event.button !== 0) return;
      
      const rect = canvas.getBoundingClientRect();
      // Normalize to -1 to 1 range
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Convert screen coordinates to world position
      // Scale based on camera distance
      const cameraDistance = camera.position.distanceTo(this.kwami.body.blob.position);
      const scaleFactor = cameraDistance * 0.15; // Adjust this for sensitivity
      
      const targetX = x * scaleFactor;
      const targetY = y * scaleFactor;
      
      logger.info(`🎯 Following click to position: (${targetX.toFixed(2)}, ${targetY.toFixed(2)})`);
      
      // Animate blob to click position smoothly
      this.animateBlobToPosition(targetX, targetY, 0, 800);
    };
    
    const handleDoubleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Return to original position
      const origPos = (canvas as any)._kwamiOriginalPosition;
      if (origPos) {
        logger.info('🏠 Returning to original position');
        this.animateBlobToPosition(origPos.x, origPos.y, origPos.z, 800);
      }
    };
    
    // Use capture phase to intercept clicks before blob handlers
    canvas.addEventListener('click', handleClick, { capture: true });
    canvas.addEventListener('dblclick', handleDoubleClick, { capture: true });
    
    // Store handlers for cleanup
    (canvas as any)._kwamiFollowClickHandler = handleClick;
    (canvas as any)._kwamiFollowDoubleClickHandler = handleDoubleClick;
    
    logger.info('✅ Follow-click mode enabled');
  }

  /**
   * Disable follow-click behavior
   */
  private disableFollowClick(): void {
    const canvas = this.kwami.body.getRenderer().domElement;
    const handleClick = (canvas as any)._kwamiFollowClickHandler;
    const handleDoubleClick = (canvas as any)._kwamiFollowDoubleClickHandler;
    
    if (handleClick) {
      canvas.removeEventListener('click', handleClick, { capture: true });
      delete (canvas as any)._kwamiFollowClickHandler;
    }
    
    if (handleDoubleClick) {
      canvas.removeEventListener('dblclick', handleDoubleClick, { capture: true });
      delete (canvas as any)._kwamiFollowDoubleClickHandler;
    }
    
    logger.info('❌ Follow-click mode disabled');
  }

  /**
   * Animate blob to a position smoothly
   */
  private animateBlobToPosition(x: number, y: number, z: number, duration: number): void {
    const blob = this.kwami.body.blob;
    const startPos = blob.position.clone();
    const endPos = { x, y, z };
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      blob.position.set(
        startPos.x + (endPos.x - startPos.x) * eased,
        startPos.y + (endPos.y - startPos.y) * eased,
        startPos.z + (endPos.z - startPos.z) * eased
      );
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * Validate action parameters
   */
  private validateParameters(
    parameterDefs: any[],
    params: Record<string, any>
  ): string | null {
    for (const paramDef of parameterDefs) {
      const value = params[paramDef.name];

      // Check required
      if (paramDef.required && (value === undefined || value === null)) {
        return `Missing required parameter: ${paramDef.name}`;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        const actualType = typeof value;
        const expectedType = paramDef.type;

        if (expectedType === 'number' && actualType !== 'number') {
          return `Parameter '${paramDef.name}' must be a number`;
        }
        if (expectedType === 'string' && actualType !== 'string') {
          return `Parameter '${paramDef.name}' must be a string`;
        }
        if (expectedType === 'boolean' && actualType !== 'boolean') {
          return `Parameter '${paramDef.name}' must be a boolean`;
        }

        // Range validation for numbers
        if (expectedType === 'number') {
          if (paramDef.min !== undefined && value < paramDef.min) {
            return `Parameter '${paramDef.name}' must be >= ${paramDef.min}`;
          }
          if (paramDef.max !== undefined && value > paramDef.max) {
            return `Parameter '${paramDef.name}' must be <= ${paramDef.max}`;
          }
        }

        // Custom validation
        if (paramDef.validation?.custom && !paramDef.validation.custom(value)) {
          return `Parameter '${paramDef.name}' failed custom validation`;
        }
      }
    }

    return null;
  }

  /**
   * Add action result to execution history
   */
  private addToHistory(actionId: string, result: ActionResult): void {
    this.executionHistory.push({
      actionId,
      timestamp: Date.now(),
      result,
    });

    // Limit history size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  /**
   * Load built-in actions
   */
  private loadBuiltInActions(): void {
    // Define built-in actions here
    const builtInActions: AnyActionDefinition[] = [
      {
        id: 'change-blob-opacity',
        name: 'Change Blob Transparency',
        description: 'Adjust the transparency/opacity of the Kwami blob',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['appearance', 'transparency'],
        enabled: true,
        triggers: ['context-menu', 'api'],
        parameters: [
          {
            name: 'opacity',
            type: 'number',
            label: 'Opacity',
            description: 'Opacity value from 0 (transparent) to 1 (opaque)',
            required: false,
            default: 1,
            min: 0,
            max: 1,
          },
        ],
        handler: 'body.setOpacity',
        ui: {
          showInContextMenu: true,
          menuLabel: '🔍 Change Transparency',
          menuOrder: 10,
          menuGroup: 'appearance',
        },
        bodyAction: {
          type: 'appearance',
          target: 'blob',
        },
      },
      {
        id: 'toggle-wireframe',
        name: 'Toggle Wireframe',
        description: 'Toggle wireframe mode on/off',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['appearance', 'wireframe', 'debug'],
        enabled: true,
        triggers: ['context-menu', 'api', 'keyboard'],
        shortcuts: {
          keyboard: 'Ctrl+W',
        },
        handler: 'body.toggleWireframe',
        ui: {
          showInContextMenu: true,
          menuLabel: '🔲 Toggle Wireframe',
          menuOrder: 15,
          menuGroup: 'appearance',
        },
        bodyAction: {
          type: 'appearance',
          target: 'blob',
        },
      },
      {
        id: 'toggle-follow-click',
        name: 'Toggle Follow Click',
        description: 'Make the blob follow your clicks. Double-click to return to original position',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['interaction', 'animation', 'follow'],
        enabled: true,
        triggers: ['context-menu', 'api'],
        handler: 'body.toggleFollowClick',
        ui: {
          showInContextMenu: true,
          menuLabel: '🎯 Toggle Follow Click',
          menuOrder: 17,
          menuGroup: 'interaction',
        },
        bodyAction: {
          type: 'interaction',
          target: 'blob',
        },
      },
      {
        id: 'randomize-blob',
        name: 'Randomize Blob',
        description: 'Randomize the blob appearance with random colors and shapes',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['appearance', 'random'],
        enabled: true,
        triggers: ['context-menu', 'api'],
        handler: 'body.randomizeBlob',
        ui: {
          showInContextMenu: true,
          menuLabel: '🎲 Randomize Blob',
          menuOrder: 20,
          menuGroup: 'appearance',
        },
        bodyAction: {
          type: 'appearance',
          target: 'blob',
        },
      },
      {
        id: 'randomize-background',
        name: 'Randomize Background',
        description: 'Generate a random gradient background',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['background', 'random'],
        enabled: true,
        triggers: ['context-menu', 'api'],
        handler: 'body.randomizeBackground',
        ui: {
          showInContextMenu: true,
          menuLabel: '🎨 Randomize Background',
          menuOrder: 30,
          menuGroup: 'background',
        },
        bodyAction: {
          type: 'appearance',
          target: 'background',
        },
      },
      {
        id: 'clear-background',
        name: 'Clear Background',
        description: 'Remove background and make it transparent',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['background', 'clear'],
        enabled: true,
        triggers: ['context-menu', 'api'],
        handler: 'body.clearBackground',
        ui: {
          showInContextMenu: true,
          menuLabel: '🧹 Clear Background',
          menuOrder: 35,
          menuGroup: 'background',
        },
        bodyAction: {
          type: 'appearance',
          target: 'background',
        },
      },
      {
        id: 'change-blob-scale',
        name: 'Change Blob Size',
        description: 'Adjust the size/scale of the Kwami blob',
        category: 'body',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['size', 'scale'],
        enabled: true,
        triggers: ['context-menu', 'api'],
        parameters: [
          {
            name: 'scale',
            type: 'number',
            label: 'Scale',
            description: 'Scale value (1-10, default is 4)',
            required: false,
            default: 4,
            min: 0.1,
            max: 10,
          },
        ],
        handler: 'body.setScale',
        ui: {
          showInContextMenu: true,
          menuLabel: '📏 Change Size',
          menuOrder: 40,
          menuGroup: 'appearance',
        },
        bodyAction: {
          type: 'appearance',
          target: 'blob',
        },
      },
      {
        id: 'text-to-speech',
        name: 'Text to Speech',
        description: 'Convert text to speech using the browser\'s native Speech Synthesis API',
        category: 'mind',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['speech', 'audio', 'voice', 'tts'],
        enabled: true,
        triggers: ['context-menu', 'api', 'voice-command'],
        parameters: [
          {
            name: 'text',
            type: 'string',
            label: 'Text',
            description: 'Text to be spoken',
            required: false,
          },
          {
            name: 'rate',
            type: 'number',
            label: 'Speech Rate',
            description: 'Speed of speech (0.1-10, default is 1)',
            required: false,
            default: 1,
            min: 0.1,
            max: 10,
          },
          {
            name: 'pitch',
            type: 'number',
            label: 'Pitch',
            description: 'Pitch of the voice (0-2, default is 1)',
            required: false,
            default: 1,
            min: 0,
            max: 2,
          },
          {
            name: 'voice',
            type: 'string',
            label: 'Voice',
            description: 'Voice name or language code (e.g., "en-US")',
            required: false,
          },
        ],
        handler: 'mind.textToSpeech',
        ui: {
          showInContextMenu: true,
          menuLabel: '🔊 Text to Speech',
          menuOrder: 50,
          menuGroup: 'mind',
        },
        mindAction: {
          type: 'speak',
        },
      },
    ];

    builtInActions.forEach((action) => {
      this.registerAction(action, 'built-in');
    });

    logger.info(`📦 Loaded ${builtInActions.length} built-in actions`);
  }
}
