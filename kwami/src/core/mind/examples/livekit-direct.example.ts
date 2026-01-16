/**
 * Example: Using LiveKit Provider Directly
 * 
 * This example shows how to use the LiveKit provider directly
 * with the LiveKit Node.js SDK for real-time voice interactions.
 */

import { Kwami } from '../../../index';
import { LiveKitAgentConfigBuilder } from '../LiveKitAgentConfigBuilder';

async function main() {
  // Create Kwami instance with direct LiveKit provider
  const kwami = new Kwami({
    mind: {
      provider: 'livekit',
      livekit: {
        url: process.env.LIVEKIT_URL || 'ws://localhost:7880',
        apiKey: process.env.LIVEKIT_API_KEY || 'devkey',
        apiSecret: process.env.LIVEKIT_API_SECRET || 'secret',
        roomName: 'kwami-demo-room',
        participantName: 'AI Assistant'
      },
      language: 'en'
    },
    soul: {
      name: 'Kwami',
      personality: 'friendly and helpful',
      systemPrompt: 'You are Kwami, a friendly AI assistant who helps users with their questions.'
    }
  });

  // Initialize
  console.log('Initializing Kwami...');
  await kwami.initialize();
  console.log('Kwami initialized!');

  // Build agent configuration
  const agentConfig = new LiveKitAgentConfigBuilder()
    .withRoomName('kwami-demo-room')
    .withParticipantName('AI Assistant')
    .withSystemPrompt('You are a helpful AI assistant')
    .withFirstMessage('Hello! How can I help you today?')
    .withLLM('gpt-4', 'openai')
    .withTemperature(0.7)
    .withLanguage('en')
    .build();

  console.log('Agent config:', agentConfig);

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

  // Test microphone
  const micWorking = await kwami.mind.testMicrophone();
  console.log('Microphone working:', micWorking);

  // Keep the conversation running
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
