# ElevenLabs Conversational AI - Correct Implementation

## API Flow

The correct flow for ElevenLabs Conversational AI is:

### 1. Create Agent (One-time, in Dashboard or API)
Create your agent at https://elevenlabs.io/app/conversational-ai or via API

### 2. Get Signed URL (Per Session)
```javascript
// Request a signed WebSocket URL
const response = await fetch(
  `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
  {
    method: 'GET',
    headers: {
      'xi-api-key': 'YOUR_API_KEY'
    }
  }
);

const data = await response.json();
const signedUrl = data.signed_url;
```

### 3. Connect WebSocket
```javascript
// Connect to the signed URL
const ws = new WebSocket(signedUrl);
```

### 4. Stream Audio
- Send: PCM16 audio data at 16kHz as binary
- Receive: PCM16 audio responses and text transcripts

## Message Protocol

### Outgoing (Client → Server)
- **Binary data**: PCM16 audio chunks (16-bit, 16kHz, mono)
- No JSON wrapping needed for audio
- The signed URL handles authentication

### Incoming (Server → Client)
- **Binary data**: PCM16 audio from agent
- **JSON messages**: Transcripts and events

## Audio Format
- **Sample Rate**: 16000 Hz (16kHz)
- **Format**: PCM16 (16-bit signed integers)
- **Channels**: Mono
- **Byte Order**: Little-endian

## Implementation Notes

1. **No manual authentication** - The signed URL includes auth
2. **Direct binary streaming** - Send raw PCM16, not wrapped in JSON
3. **Automatic conversation start** - Begins when WebSocket connects
4. **Session-based** - Each signed URL is for one conversation session

## Error Handling

Common issues:
- **401**: Invalid API key
- **404**: Agent ID doesn't exist
- **403**: Agent not active or permissions issue
- **WebSocket fails**: Signed URL expired (get a new one)

## Testing

1. Verify agent exists in dashboard
2. Check API key is valid
3. Ensure agent is active/deployed
4. Test microphone permissions
5. Monitor console for WebSocket events
