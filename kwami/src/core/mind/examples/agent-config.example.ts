/**
 * Example: LiveKit Agent Configuration
 * 
 * This example demonstrates how to build comprehensive
 * agent configurations using the LiveKitAgentConfigBuilder.
 */

import { LiveKitAgentConfigBuilder, createBasicLiveKitAgentConfig } from '../LiveKitAgentConfigBuilder';

// Example 1: Basic configuration
console.log('=== Basic Configuration ===');
const basicConfig = createBasicLiveKitAgentConfig(
  'my-room',
  'You are a helpful assistant',
  {
    participantName: 'AI Assistant',
    firstMessage: 'Hello! How can I help you today?',
    language: 'en',
    llmModel: 'gpt-4'
  }
);
console.log(JSON.stringify(basicConfig, null, 2));

// Example 2: Advanced configuration
console.log('\n=== Advanced Configuration ===');
const advancedConfig = new LiveKitAgentConfigBuilder()
  .withRoomName('advanced-room')
  .withParticipantName('Advanced AI')
  .withParticipantIdentity('ai-assistant-001')
  .withSystemPrompt(`You are an advanced AI assistant with expertise in:
    - Software development
    - Data science
    - System architecture
    Always provide detailed, accurate answers.`)
  .withFirstMessage('Hello! I\'m your advanced AI assistant. What would you like to know?')
  .withLanguage('en')
  .withLLM('gpt-4', 'openai')
  .withTemperature(0.8)
  .withMaxTokens(4000)
  .withVoice('voice-id-here', 'livekit', {
    stability: 0.7,
    speed: 1.0,
    pitch: 1.0
  })
  .withSTT('deepgram', 'nova-2', 'en')
  .withTurnConfig(3000, 600)
  .withMetadata({
    version: '1.0',
    environment: 'production',
    features: ['code-execution', 'web-search']
  })
  .build();

console.log(JSON.stringify(advancedConfig, null, 2));

// Example 3: Multilingual configuration
console.log('\n=== Multilingual Configuration ===');
const multilingualConfig = new LiveKitAgentConfigBuilder()
  .withRoomName('multilingual-room')
  .withParticipantName('Multilingual Assistant')
  .withSystemPrompt('You are a multilingual assistant fluent in English, Spanish, and French.')
  .withLanguage('en')
  .withLLM('gpt-4', 'openai')
  .withSTT('deepgram', 'nova-2', 'multi')
  .build();

console.log(JSON.stringify(multilingualConfig, null, 2));

// Example 4: Customer support configuration
console.log('\n=== Customer Support Configuration ===');
const supportConfig = new LiveKitAgentConfigBuilder()
  .withRoomName('support-room')
  .withParticipantName('Support Agent')
  .withSystemPrompt(`You are a customer support agent. Your role is to:
    1. Listen carefully to customer issues
    2. Provide clear, step-by-step solutions
    3. Escalate complex issues when needed
    4. Always maintain a professional and empathetic tone`)
  .withFirstMessage('Hello! I\'m here to help. What seems to be the issue?')
  .withLLM('gpt-4', 'openai')
  .withTemperature(0.5) // Lower temperature for more consistent responses
  .withMaxTokens(2000)
  .withTurnConfig(5000, 1800) // Longer timeouts for customer support
  .withMetadata({
    department: 'support',
    priority: 'high',
    escalation_enabled: true
  })
  .build();

console.log(JSON.stringify(supportConfig, null, 2));

// Example 5: Educational tutor configuration
console.log('\n=== Educational Tutor Configuration ===');
const tutorConfig = new LiveKitAgentConfigBuilder()
  .withRoomName('tutor-room')
  .withParticipantName('AI Tutor')
  .withSystemPrompt(`You are an educational tutor specializing in mathematics and science.
    - Break down complex concepts into simple explanations
    - Use analogies and examples
    - Encourage critical thinking
    - Be patient and supportive`)
  .withFirstMessage('Hi! I\'m your AI tutor. What would you like to learn about today?')
  .withLLM('gpt-4', 'openai')
  .withTemperature(0.7)
  .withLanguage('en')
  .withMetadata({
    subject: 'math-science',
    grade_level: 'high-school',
    learning_style: 'interactive'
  })
  .build();

console.log(JSON.stringify(tutorConfig, null, 2));

// Example 6: Validation and error handling
console.log('\n=== Validation Example ===');
try {
  const invalidConfig = new LiveKitAgentConfigBuilder()
    .withTemperature(3.0) // Invalid: temperature > 2
    .build();
} catch (error) {
  console.log('Caught validation error:', (error as Error).message);
}

// Example 7: Configuration modification
console.log('\n=== Configuration Modification ===');
const baseConfig = new LiveKitAgentConfigBuilder()
  .withRoomName('base-room')
  .withSystemPrompt('Base prompt')
  .build();

console.log('Base config:', JSON.stringify(baseConfig, null, 2));

const modifiedConfig = new LiveKitAgentConfigBuilder()
  .fromExisting(baseConfig)
  .withSystemPrompt('Modified prompt')
  .withFirstMessage('Hello from modified config!')
  .build();

console.log('Modified config:', JSON.stringify(modifiedConfig, null, 2));

// Example 8: Peek without validation
console.log('\n=== Peek Example ===');
const builder = new LiveKitAgentConfigBuilder()
  .withRoomName('peek-room')
  .withTemperature(0.7);

console.log('Current state (peek):', JSON.stringify(builder.peek(), null, 2));

builder.withLLM('gpt-4');
console.log('After adding LLM:', JSON.stringify(builder.peek(), null, 2));
