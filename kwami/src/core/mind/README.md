# Kwami Mind - LiveKit Integration

The Kwami Mind module provides real-time AI voice interactions powered by LiveKit, with two integration options:

1. **Direct LiveKit SDK** - Use LiveKit's Node.js SDK directly in your application
2. **Backend API Proxy** - Use the Kwami Rust backend as a proxy to LiveKit services

## Architecture

```
kwami/src/core/mind/
├── Mind.ts                          # Main KwamiMind orchestrator
├── LiveKitAgentConfigBuilder.ts     # Builder for LiveKit agent configs
├── providers/
│   ├── types.ts                     # Provider interface definitions
│   ├── factory.ts                   # Provider factory
│   ├── livekit/
│   │   └── LiveKitProvider.ts       # Direct LiveKit SDK provider
│   └── livekit-api/
│       └── LiveKitAPIProvider.ts    # Backend API proxy provider
└── skills/                          # Skill management system
```

## Provider Selection

### 1. Direct LiveKit Provider (`livekit`)

Use this when you want to integrate LiveKit directly in your Node.js application.

**Pros:**
- Direct connection to LiveKit servers
- Lower latency
- Full control over LiveKit features
- No backend dependency

**Cons:**
- Requires LiveKit credentials in frontend/client
- More complex setup
- Need to manage LiveKit SDK directly

**Example:**

```typescript
import { Kwami } from 'kwami';

const kwami = new Kwami({
  mind: {
    provider: 'livekit',
    livekit: {
      url: 'wss://your-livekit-server.com',
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
      roomName: 'my-room',
      participantName: 'assistant'
    }
  }
});

await kwami.initialize();
await kwami.mind.startConversation('You are a helpful assistant');
```

### 2. Backend API Provider (`livekit-api`)

Use this when you want to proxy LiveKit through your Kwami backend.

**Pros:**
- Secure - credentials stay on backend
- Centralized management
- Easy token generation
- Room management via API
- Agent management capabilities

**Cons:**
- Requires backend service running
- Additional network hop
- Backend must be maintained

**Example:**

```typescript
import { Kwami } from 'kwami';

const kwami = new Kwami({
  mind: {
    provider: 'livekit-api',
    livekitApi: {
      baseUrl: 'http://localhost:8080',
      apiKey: 'your-backend-api-key' // optional
    },
    livekit: {
      roomName: 'my-room',
      participantName: 'assistant'
    }
  }
});

await kwami.initialize();
await kwami.mind.startConversation('You are a helpful assistant');
```

## LiveKit Agent Configuration

Use the `LiveKitAgentConfigBuilder` for creating agent configurations:

```typescript
import { LiveKitAgentConfigBuilder } from 'kwami/core/mind';

const config = new LiveKitAgentConfigBuilder()
  .withRoomName('my-room')
  .withParticipantName('AI Assistant')
  .withSystemPrompt('You are a helpful AI assistant')
  .withFirstMessage('Hello! How can I help you today?')
  .withLLM('gpt-4', 'openai')
  .withTemperature(0.7)
  .withMaxTokens(2000)
  .withLanguage('en')
  .withVoice('voice-id-here', 'livekit')
  .withSTT('deepgram', 'nova-2', 'en')
  .withTurnConfig(3000, 300)
  .build();

// Use with Mind
kwami.mind.updateConfig({ 
  conversational: {
    agentConfig: config
  }
});
```

## Backend API Endpoints

The Kwami backend provides these LiveKit-related endpoints:

### Token Management
- `POST /api/livekit/token` - Generate access token for room

### Room Management
- `POST /api/livekit/rooms` - Create a room
- `GET /api/livekit/rooms` - List all rooms
- `GET /api/livekit/rooms/:name` - Get room details
- `DELETE /api/livekit/rooms/:name` - Delete a room

### Participant Management
- `GET /api/livekit/rooms/:name/participants` - List participants
- `GET /api/livekit/rooms/:name/participants/:identity` - Get participant
- `DELETE /api/livekit/rooms/:name/participants/:identity` - Remove participant
- `PUT /api/livekit/rooms/:name/participants/:identity/mute` - Mute/unmute

### Agent Management (via Backend API Provider)
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents
- `GET /api/agents/:id` - Get agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent


## Environment Variables

### For Direct LiveKit Provider:
```bash
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### For Backend API Provider:
```bash
KWAMI_BACKEND_URL=http://localhost:8080
KWAMI_BACKEND_API_KEY=your-backend-key
```

### For Backend Service:
```bash
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

## Features

### Current Features:
- ✅ Provider abstraction (LiveKit + Backend API)
- ✅ Room management
- ✅ Token generation
- ✅ Participant management
- ✅ Configuration builders
- ✅ Type-safe interfaces

### Coming Soon:
- 🚧 LiveKit Agents SDK integration
- 🚧 Real-time STT/TTS
- 🚧 Multi-agent conversations
- 🚧 Voice activity detection
- 🚧 Recording and playback

## Development

### Running the Backend:
```bash
npm run server
# or for release mode
npm run server:release
```

### Testing:
```bash
npm test
```

### Building:
```bash
npm run build
```

## Examples

See the `examples/` directory for complete examples:
- `livekit-direct.example.ts` - Direct LiveKit SDK usage
- `livekit-backend.example.ts` - Backend API proxy usage
- `agent-config.example.ts` - Agent configuration examples

## Troubleshooting

### "LiveKit provider not initialized"
Make sure you call `await kwami.initialize()` before using Mind features.

### "Backend API health check failed"
Ensure your backend service is running on the correct port.

### "Failed to create room"
Check your LiveKit credentials and server URL.

### Token generation errors
Verify your API key and secret are correct.

## Resources

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit Agents](https://docs.livekit.io/agents)
- [Kwami Backend API](../../backend/api/README.md)
