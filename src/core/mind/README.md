# Kwami Mind Architecture

Kwami's mind is now organized around **providers**. Each provider owns all vendor-specific logic (API clients, transport, feature quirks), while `Mind.ts` stays small and generic. The first implementation lives in `11labs/ElevenLabsProvider.ts`, but the same pattern works for OpenAI, Vapi, Retell, Bland, Synthflow, etc.

## Layout

- `Mind.ts` – orchestrator that stores config, pronunciation dictionary, and delegates every capability (TTS, conversations, agents, analytics) to the active provider.
- `providers/types.ts` – shared interfaces (`MindProvider`, `MindConversationCallbacks`, etc.) that every provider must implement.
- `providers/factory.ts` – translates `MindConfig.provider` into a concrete provider instance.
- `11labs/ElevenLabsProvider.ts` – full ElevenLabs implementation (TTS, ConvAI WebSocket, agents API, conversation management).

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

