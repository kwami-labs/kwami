/**
 * Comprehensive test suite for ElevenLabs Agent APIs
 * Run this to verify all agent management, tools, and knowledge base functionality
 */

import { Kwami } from '../../../core/Kwami';
import { AgentConfigBuilder } from '../AgentConfigBuilder';
import { validateAgentConfig, formatValidationErrors } from '../validation';
import type { 
  CreateAgentRequestFull,
  ToolResponse,
  KnowledgeBaseResponse,
} from '../../../types/elevenlabs-agents';
import { logger } from '../../../../utils/logger';

/**
 * Configuration - Set your API key here or in environment
 */
const API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_API_KEY_HERE';
const TEST_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice

/**
 * Test results tracking
 */
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

function logTest(name: string, status: TestResult['status'], error?: string, data?: any) {
  const result: TestResult = { name, status, error, data };
  results.push(result);
  
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  logger.info(`${icon} ${name}`);
  if (error) logger.error(`   Error: ${error}`);
  if (data) logger.info(`   Data:`, data);
}

/**
 * Test Suite
 */
async function runTests() {
  logger.info('🧪 Starting ElevenLabs Agent API Tests\n');
  logger.info('==========================================\n');

  // Initialize Kwami
  let kwami: Kwami;
  let testAgentId: string | undefined;
  let testToolId: string | undefined;
  let testKnowledgeBaseId: string | undefined;

  try {
    // Create a minimal canvas for initialization
    const canvas = document.createElement('canvas');
    kwami = new Kwami(canvas, {
      mind: {
        provider: 'elevenlabs',
        apiKey: API_KEY,
      },
    });

    await kwami.mind.initialize();
    logTest('Initialize Kwami Mind', 'pass');
  } catch (error: any) {
    logTest('Initialize Kwami Mind', 'fail', error.message);
    return; // Can't continue without initialization
  }

  // Test 1: Agent Config Builder & Validation
  logger.info('\n📋 Testing Agent Configuration\n');

  try {
    const config = new AgentConfigBuilder()
      .withName('Test Agent')
      .withVoice(TEST_VOICE_ID)
      .withPrompt('You are a test agent')
      .withFirstMessage('Hello, this is a test!')
      .withLanguage('en')
      .withLLM('gpt-4o-mini')
      .withTemperature(0.7)
      .withMaxTokens(500)
      .build();

    const validation = validateAgentConfig(config);
    if (validation.valid) {
      logTest('Build & Validate Agent Config', 'pass', undefined, { 
        name: config.name,
        hasVoice: !!config.conversation_config?.tts?.voice_id,
      });
    } else {
      logTest('Build & Validate Agent Config', 'fail', formatValidationErrors(validation.errors));
    }
  } catch (error: any) {
    logTest('Build & Validate Agent Config', 'fail', error.message);
  }

  // Test 2: Create Agent
  logger.info('\n🤖 Testing Agent Creation\n');

  try {
    const config = new AgentConfigBuilder()
      .withName('Kwami Test Agent')
      .withVoice(TEST_VOICE_ID, {
        model_id: 'eleven_turbo_v2_5',
        stability: 0.5,
        similarity_boost: 0.75,
      })
      .withPrompt('You are a friendly test assistant')
      .withFirstMessage('Hi! I am a test agent.')
      .withLanguage('en')
      .withLLM('gpt-4o-mini')
      .withMaxDuration(300) // 5 minutes
      .build();

    const agent = await kwami.mind.createAgent(config);
    testAgentId = agent.agent_id;
    logTest('Create Agent', 'pass', undefined, { agent_id: agent.agent_id });
  } catch (error: any) {
    logTest('Create Agent', 'fail', error.message);
  }

  // Test 3: Get Agent
  logger.info('\n🔍 Testing Agent Retrieval\n');

  if (testAgentId) {
    try {
      const agent = await kwami.mind.getAgent(testAgentId);
      logTest('Get Agent', 'pass', undefined, { 
        agent_id: agent.agent_id,
        name: agent.name,
      });
    } catch (error: any) {
      logTest('Get Agent', 'fail', error.message);
    }
  } else {
    logTest('Get Agent', 'skip', 'No agent ID available');
  }

  // Test 4: List Agents
  logger.info('\n📋 Testing Agent Listing\n');

  try {
    const agents = await kwami.mind.listAgents({ page_size: 5 });
    logTest('List Agents', 'pass', undefined, { 
      count: agents.agents.length,
      has_more: agents.has_more,
    });
  } catch (error: any) {
    logTest('List Agents', 'fail', error.message);
  }

  // Test 5: Update Agent
  logger.info('\n✏️ Testing Agent Update\n');

  if (testAgentId) {
    try {
      const updated = await kwami.mind.updateAgent(testAgentId, {
        conversation_config: {
          agent: {
            first_message: 'Hello! I have been updated.',
          },
        },
      });
      logTest('Update Agent', 'pass', undefined, { agent_id: updated.agent_id });
    } catch (error: any) {
      logTest('Update Agent', 'fail', error.message);
    }
  } else {
    logTest('Update Agent', 'skip', 'No agent ID available');
  }

  // Test 6: Duplicate Agent
  logger.info('\n📋 Testing Agent Duplication\n');

  if (testAgentId) {
    try {
      const duplicate = await kwami.mind.duplicateAgent(testAgentId, {
        new_name: 'Test Agent (Copy)',
      });
      logTest('Duplicate Agent', 'pass', undefined, { 
        original: testAgentId,
        duplicate: duplicate.agent_id,
      });
      
      // Clean up duplicate immediately
      try {
        await kwami.mind.deleteAgent(duplicate.agent_id);
      } catch (e) {
        logger.warn('Failed to clean up duplicate agent');
      }
    } catch (error: any) {
      logTest('Duplicate Agent', 'fail', error.message);
    }
  } else {
    logTest('Duplicate Agent', 'skip', 'No agent ID available');
  }

  // Test 7: Tools API - Create Tool
  logger.info('\n🔧 Testing Tools API\n');

  try {
    const toolsAPI = kwami.mind.getToolsAPI();
    const tool = await toolsAPI.createTool({
      name: 'test_tool',
      description: 'A test tool',
      url: 'https://httpbin.org/post',
      method: 'POST',
      parameters: [
        {
          name: 'input',
          type: 'string',
          description: 'Test input',
          required: true,
        },
      ],
    });
    testToolId = tool.tool_id;
    logTest('Create Tool', 'pass', undefined, { tool_id: tool.tool_id });
  } catch (error: any) {
    logTest('Create Tool', 'fail', error.message);
  }

  // Test 8: List Tools
  try {
    const toolsAPI = kwami.mind.getToolsAPI();
    const tools = await toolsAPI.listTools();
    logTest('List Tools', 'pass', undefined, { count: tools.tools.length });
  } catch (error: any) {
    logTest('List Tools', 'fail', error.message);
  }

  // Test 9: Get Tool
  if (testToolId) {
    try {
      const toolsAPI = kwami.mind.getToolsAPI();
      const tool = await toolsAPI.getTool(testToolId);
      logTest('Get Tool', 'pass', undefined, { tool_id: tool.tool_id });
    } catch (error: any) {
      logTest('Get Tool', 'fail', error.message);
    }
  } else {
    logTest('Get Tool', 'skip', 'No tool ID available');
  }

  // Test 10: Update Tool
  if (testToolId) {
    try {
      const toolsAPI = kwami.mind.getToolsAPI();
      const updated = await toolsAPI.updateTool(testToolId, {
        description: 'Updated test tool description',
      });
      logTest('Update Tool', 'pass', undefined, { tool_id: updated.tool_id });
    } catch (error: any) {
      logTest('Update Tool', 'fail', error.message);
    }
  } else {
    logTest('Update Tool', 'skip', 'No tool ID available');
  }

  // Test 11: Knowledge Base API - Create KB
  logger.info('\n📚 Testing Knowledge Base API\n');

  try {
    const kbAPI = kwami.mind.getKnowledgeBaseAPI();
    const kb = await kbAPI.createKnowledgeBase({
      name: 'Test Knowledge Base',
      description: 'A test knowledge base',
    });
    testKnowledgeBaseId = kb.knowledge_base_id;
    logTest('Create Knowledge Base', 'pass', undefined, { 
      kb_id: kb.knowledge_base_id,
    });
  } catch (error: any) {
    logTest('Create Knowledge Base', 'fail', error.message);
  }

  // Test 12: List Knowledge Bases
  try {
    const kbAPI = kwami.mind.getKnowledgeBaseAPI();
    const kbs = await kbAPI.listKnowledgeBases();
    logTest('List Knowledge Bases', 'pass', undefined, { 
      count: kbs.knowledge_bases.length,
    });
  } catch (error: any) {
    logTest('List Knowledge Bases', 'fail', error.message);
  }

  // Test 13: Add Document from Text
  if (testKnowledgeBaseId) {
    try {
      const kbAPI = kwami.mind.getKnowledgeBaseAPI();
      const doc = await kbAPI.createDocumentFromText(testKnowledgeBaseId, {
        text: 'This is a test document with some information.',
        name: 'Test Document',
        metadata: { version: '1.0' },
      });
      logTest('Add Document from Text', 'pass', undefined, { 
        doc_id: doc.document_id,
      });
    } catch (error: any) {
      logTest('Add Document from Text', 'fail', error.message);
    }
  } else {
    logTest('Add Document from Text', 'skip', 'No KB ID available');
  }

  // Test 14: List Documents
  if (testKnowledgeBaseId) {
    try {
      const kbAPI = kwami.mind.getKnowledgeBaseAPI();
      const docs = await kbAPI.listDocuments(testKnowledgeBaseId);
      logTest('List Documents', 'pass', undefined, { 
        count: docs.documents.length,
      });
    } catch (error: any) {
      logTest('List Documents', 'fail', error.message);
    }
  } else {
    logTest('List Documents', 'skip', 'No KB ID available');
  }

  // Test 15: Compute RAG Index
  if (testKnowledgeBaseId) {
    try {
      const kbAPI = kwami.mind.getKnowledgeBaseAPI();
      const index = await kbAPI.computeRAGIndex(testKnowledgeBaseId);
      logTest('Compute RAG Index', 'pass', undefined, { 
        status: index.status,
      });
    } catch (error: any) {
      logTest('Compute RAG Index', 'fail', error.message);
    }
  } else {
    logTest('Compute RAG Index', 'skip', 'No KB ID available');
  }

  // Cleanup
  logger.info('\n🧹 Cleaning Up Test Resources\n');

  if (testToolId) {
    try {
      const toolsAPI = kwami.mind.getToolsAPI();
      await toolsAPI.deleteTool(testToolId);
      logTest('Delete Test Tool', 'pass');
    } catch (error: any) {
      logTest('Delete Test Tool', 'fail', error.message);
    }
  }

  if (testKnowledgeBaseId) {
    try {
      const kbAPI = kwami.mind.getKnowledgeBaseAPI();
      await kbAPI.deleteKnowledgeBase(testKnowledgeBaseId);
      logTest('Delete Test Knowledge Base', 'pass');
    } catch (error: any) {
      logTest('Delete Test Knowledge Base', 'fail', error.message);
    }
  }

  if (testAgentId) {
    try {
      await kwami.mind.deleteAgent(testAgentId);
      logTest('Delete Test Agent', 'pass');
    } catch (error: any) {
      logTest('Delete Test Agent', 'fail', error.message);
    }
  }

  // Summary
  logger.info('\n==========================================\n');
  logger.info('📊 Test Summary\n');
  
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  const total = results.length;

  logger.info(`✅ Passed:  ${passed}/${total}`);
  logger.info(`❌ Failed:  ${failed}/${total}`);
  logger.info(`⏭️  Skipped: ${skipped}/${total}`);
  
  if (failed > 0) {
    logger.info('\n❌ Failed Tests:\n');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        logger.info(`  • ${r.name}: ${r.error}`);
      });
  }

  logger.info('\n==========================================\n');

  return {
    passed,
    failed,
    skipped,
    total,
    success: failed === 0,
  };
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
  runTests().then((summary) => {
    logger.info(
      summary.success 
        ? '🎉 All tests passed!' 
        : `⚠️ ${summary.failed} test(s) failed.`
    );
  });
}

export { runTests };

