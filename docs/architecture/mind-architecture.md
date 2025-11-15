# Kwami Mind Architecture

Kwami's mind is now organized around **providers**. Each provider owns all vendor-specific logic (API clients, transport, feature quirks), while `Mind.ts` stays small and generic. The first complete provider is `providers/11labs/ElevenLabsProvider.ts`. An `providers/openai/OpenAIProvider.ts` exists but is currently work-in-progress (realtime features pending). The same pattern works for Vapi, Retell, Bland, Synthflow, Deepgram, Cartesia, PlayHT, etc.

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
└─ providers/
   ├─ factory.ts
   ├─ types.ts
   ├─ 11labs/
   │  └─ ElevenLabsProvider.ts
   └─ openai/
      └─ OpenAIProvider.ts
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

- **OpenAI Realtime** (WIP) – mirror the ElevenLabs structure: WebRTC/WebSocket handling in `openai/OpenAIProvider.ts`, delegate from `Mind.ts`, document provider-specific config.
- **Vapi / Retell / Bland / Synthflow** – follow the same steps; each provider fully encapsulates its authentication, streaming transports, and agent lifecycle APIs.
- **Hybrid Providers** – for stacks that combine LLM + telephony (e.g., Vapi), the provider can internally mix SDKs as long as the `MindProvider` contract is satisfied.

By isolating vendor code, Kwami can ship new voice partners quickly while keeping the mind’s public API stable.

## Voice/Realtime Providers Landscape

The table below summarizes popular realtime voice providers. Latency and pricing are rough, environment-dependent figures to help with early planning only. Always verify current prices and SLAs.

| Provider                           | Key Strengths                                                                                        | Latency & Realism                       | API Maturity & Features                                                                       | Best For                                                   | Pricing Model (approx.)               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------- |
| ElevenLabs Conversational AI       | Largest voice library (5,000+), multilingual auto‑detection, RAG/tool calling, telephony integration | Sub‑500ms end‑to‑end, highly expressive | Full WebSocket API, SDKs (Python/JS/Swift), knowledge base upload, custom LLM support         | Ultra‑realistic branded voices, creative/enterprise agents | Per‑minute + subscription tiers       |
| OpenAI Realtime API (GPT‑4o voice) | Integrated speech‑to‑speech (no separate STT/TTS), strong emotional understanding, function calling  | ~200–400ms, very natural turn‑taking    | Simple WebSocket API, built‑in voice activity detection. Status in Kwami: WIP (not finished). | Fast prototyping, emotional nuance                         | ~$100/1M input tokens (~$0.06/min in) |
| Retell AI                          | Full‑stack phone/web agents, interruption handling, tool calling, monitoring dashboard               | Sub‑500ms, human‑like                   | Robust API + SDKs, easy telephony (Twilio‑like)                                               | Call center automation, sales/support bots                 | Per‑minute (~$0.20–0.40/min)          |
| Vapi                               | Bring‑your‑own‑model (OpenAI + any TTS/STT), fast deployment, analytics                              | <500ms (depends on models)              | Developer‑first API, supports 20+ TTS providers                                               | Custom stacks, rapid iteration                             | Per‑minute + base fee                 |
| Bland AI                           | Phone‑first agents, natural interruptions, personality customization                                 | Sub‑second                              | Simple API for inbound/outbound calls                                                         | Outbound sales/cold calling                                | Per‑minute (~$0.15–0.30/min)          |
| Synthflow                          | No‑code + API hybrid, integrates ElevenLabs/OpenAI voices, drag‑and‑drop flows                       | ~500ms                                  | API + visual builder, telephony built‑in                                                      | Non‑developers building production agents                  | Per‑minute + plans                    |
| Deepgram Voice Agent               | Ultra‑low latency STT + agent framework, strong in noisy environments                                | <300ms STT                              | API‑focused, pairs well with any LLM/TTS                                                      | High‑accuracy transcription in real‑world audio            | Usage‑based                           |
| Cartesia                           | Sonic models optimized for speed/expressiveness, real‑time streaming                                 | 40–100ms model latency                  | Clean API, great for custom low‑latency agents                                                | Ultra‑fast interactive experiences                         | Token/minute                          |
| PlayHT Conversational              | 800+ voices, strong multilingual, low‑latency streaming mode                                         | Sub‑500ms                               | API + agent builder, good emotional range                                                     | Multilingual customer support                              | Per‑character + plans                 |

### Other notable mature options

- **Telnyx Voice AI** — Full infrastructure control (own media servers), ideal for regulated/enterprise deployments.
- **Resemble AI** — Speech‑to‑speech real‑time conversion + on‑prem options for compliance‑heavy use cases.
- **Hume AI** — Leading in emotional/prosodic intelligence (voice tone detection/adaptation).
