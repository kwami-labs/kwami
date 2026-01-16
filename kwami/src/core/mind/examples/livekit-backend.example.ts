/**
 * Example: Using LiveKit via Backend API
 * 
 * This example shows how to use the LiveKit provider through
 * the Kwami backend API proxy for secure, centralized management.
 */

import { Kwami } from '../../../index';
import { LiveKitAgentConfigBuilder } from '../LiveKitAgentConfigBuilder';

async function main() {
  // Create Kwami instance with backend API provider
  const kwami = new Kwami({
    mind: {
      provider: 'livekit-api',
      livekitApi: {
        baseUrl: process.env.KWAMI_BACKEND_URL || 'http://localhost:8080',
        apiKey: process.env.KWAMI_BACKEND_API_KEY // optional
      },
      livekit: {
        roomName: `kwami-room-${Date.now()}`,
        participantName: 'user'
      },
      language: 'en'
    },
    soul: {
      name: 'Kwami',
      personality: 'friendly and helpful',
      systemPrompt: 'You are Kwami, a friendly AI assistant.'
    }
  });

  // Initialize
  console.log('Initializing Kwami with backend API...');
  await kwami.initialize();
  console.log('Kwami initialized!');

  // Example: Create an agent via backend API
  try {
    const agent = await kwami.mind.createAgent({
      name: 'Demo Agent',
      conversation_config: {
        agent: {
          prompt: {
            prompt: 'You are a helpful assistant',
            llm: 'gpt-4'
          },
          first_message: 'Hello! How can I help you?',
          language: 'en'
        }
      }
    });
    console.log('Created agent:', agent.agent_id);

    // List agents
    const agents = await kwami.mind.listAgents({ page_size: 10 });
    console.log('Available agents:', agents.agents?.length || 0);

    // Get agent details
    const agentDetails = await kwami.mind.getAgent(agent.agent_id);
    console.log('Agent details:', agentDetails);

  } catch (error) {
    console.error('Agent management error:', error);
  }

  // Start a conversation
  console.log('Starting conversation...');
  await kwami.mind.startConversation(
    'You are a helpful assistant',
    {
      onAgentResponse: (text) => {
        console.log('Agent:', text);
      },
      onUserTranscript: (text) => {
        console.log('User:', text);
      },
      onError: (error) => {
        console.error('Error:', error);
      },
      onTurnStart: () => {
        console.log('Turn started');
      },
      onTurnEnd: () => {
        console.log('Turn ended');
      }
    }
  );

  // Example: Get conversation token
  try {
    const tokenResponse = await kwami.mind.getConversationToken(
      'agent-id-here',
      'participant-name'
    );
    console.log('Got token:', tokenResponse.token);
  } catch (error) {
    console.error('Token generation error:', error);
  }

  console.log('Conversation active. Press Ctrl+C to stop.');
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nStopping conversation...');
    await kwami.mind.stopConversation();
    kwami.dispose();
    process.exit(0);
  });
}

main().catch(console.error);
