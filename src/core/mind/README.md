# Kwami Mind Architecture

Kwami's mind consists of two main components: **Soul** (personality) and **Mind** (AI providers). The Soul defines who Kwami is and how it behaves, while the Mind handles AI capabilities through various providers.

## Personality System (Soul)

Kwami's personality is defined through the `KwamiSoul` class, which manages behavioral characteristics and emotional traits. Personalities can be loaded from YAML files and include both qualitative traits and quantitative emotional dimensions.

### Personality Files

Personalities are stored as `.yaml` files in `src/core/soul/personalities/`:

- `friendly.yaml` - Warm, empathetic companion (Kaya)
- `professional.yaml` - Knowledgeable, efficient assistant (Nexus)
- `playful.yaml` - Creative, energetic buddy (Spark)

### Emotional Traits Spectrum

Each personality includes 10 emotional traits with values ranging from -100 to +100:

- **Happiness/Sadness**: Overall mood baseline
- **Energy/Exhaustion**: Activity level and enthusiasm
- **Confidence/Anxiety**: Self-assurance level
- **Calmness/Anger**: Emotional regulation
- **Optimism/Pessimism**: Outlook on life/events
- **Socialness/Shyness**: Comfort with social interactions
- **Creativity/Rigidity**: Openness to new ideas
- **Patience/Impatience**: Tolerance for waiting/delays
- **Empathy/Selfishness**: Concern for others vs. self-focus
- **Curiosity/Indifference**: Interest in learning/exploration

### Creating Custom Personalities

Developers can create custom personalities by adding new `.yaml` files to the personalities folder:

```yaml
name: "CustomAI"
personality: "A unique AI personality description"
systemPrompt: "You are CustomAI, with specific behavioral guidelines..."

# Core personality traits (qualitative descriptors)
traits:
  - "trait1"
  - "trait2"

# Emotional trait spectrum (-100 to +100)
emotionalTraits:
  happiness: 50
  energy: 30
  confidence: 80
  calmness: 60
  optimism: 70
  socialness: 40
  creativity: 90
  patience: 75
  empathy: 85
  curiosity: 65

# Communication preferences
language: "en"
conversationStyle: "casual"
responseLength: "medium"
emotionalTone: "warm"
```

### Using Personalities

```typescript
import { KwamiSoul } from "./core/soul/Soul";

// Load from preset
const soul = new KwamiSoul();
soul.loadPresetPersonality("friendly");

// Load from custom YAML file
await soul.loadPersonality("/path/to/custom-personality.yaml");

// Access emotional traits
const happiness = soul.getEmotionalTrait("happiness"); // Returns number -100 to +100
const allTraits = soul.getEmotionalTraits(); // Returns full traits object
```

## AI Provider System

Kwami's mind is now organized around **providers**. Each provider owns all vendor-specific logic (API clients, transport, feature quirks), while `Mind.ts` stays small and generic. The first implementation lives in `11labs/ElevenLabsProvider.ts`, but the same pattern works for OpenAI, Vapi, Retell, Bland, Synthflow, etc.

## Layout

- `Mind.ts` – orchestrator that stores config, pronunciation dictionary, and delegates every capability (TTS, conversations, agents, analytics) to the active provider.
- `providers/types.ts` – shared interfaces (`MindProvider`, `MindConversationCallbacks`, etc.) that every provider must implement.
- `providers/factory.ts` – translates `MindConfig.provider` into a concrete provider instance.
- `providers/11labs/ElevenLabsProvider.ts` – full ElevenLabs implementation (TTS, ConvAI WebSocket, agents API, conversation management).
- `providers/openai/OpenAIProvider.ts` – experimental OpenAI integration (TTS via `/v1/audio/speech`, realtime features pending).

```
src/core/mind/
├─ Mind.ts
├─ README.md
├─ providers/
│  ├─ factory.ts
│  └─ types.ts
└─ 11labs/
   └─ ElevenLabsProvider.ts
```

## Runtime Flow

1. `KwamiMind` is constructed with `KwamiAudio` + `MindConfig`.
2. `createMindProvider` instantiates the provider requested via `config.provider` (defaults to `elevenlabs`).
3. Public methods such as `speak`, `startConversation`, `createAgent`, etc. simply preprocess generic data (e.g., pronunciations, system prompts) and delegate to the provider.
4. Providers own their SDK clients, WebSocket handling, and clean-up routines. They expose a consistent API via `MindProvider`.
5. Changing providers is as simple as calling `mind.setProvider('openai')` (once an OpenAI provider exists) and updating the config.

## Adding a New Provider

1. **Create a folder** (e.g., `src/core/mind/openai/`) and implement a class that fulfills `MindProvider`.
2. **Use the factory** – register the new provider inside `providers/factory.ts`.
3. **Honor the interface** – handle initialization, cleanup, conversations, and all agent/conversation APIs (no-op methods are acceptable initially, but log informative errors).
4. **Map config** – translate the generic `MindConfig` fields to provider-specific options. Extend `MindConfig` if extra metadata is needed.
5. **Testing** – ensure `KwamiMind` can switch providers at runtime without restarting the app. Providers should release resources in `dispose()`.

## Future Integrations

- **OpenAI Realtime** – mirror the ElevenLabs structure: WebRTC/WebSocket handling in `openai/OpenAIProvider.ts`, delegate from `Mind.ts`, document provider-specific config.
- **Vapi / Retell / Bland / Synthflow** – follow the same steps; each provider fully encapsulates its authentication, streaming transports, and agent lifecycle APIs.
- **Hybrid Providers** – for stacks that combine LLM + telephony (e.g., Vapi), the provider can internally mix SDKs as long as the `MindProvider` contract is satisfied.

By isolating vendor code, Kwami can ship new voice partners quickly while keeping the mind’s public API stable.
