# Kwami Mind Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        KWAMI PLAYGROUND                          │
│                                                                   │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐            │
│  │    Soul    │    │    Mind    │    │    Body    │            │
│  │ Personality│◄───┤Conversational├──►│   Visual   │            │
│  │   Config   │    │   AI Agents │    │   Config   │            │
│  └────────────┘    └──────┬─────┘    └────────────┘            │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Provider Tabs │
                    │                │
                    │ 🎙️ 🧠 🤖 🔮 │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌───────────────┐
        │  ElevenLabs   │        │ Coming Soon   │
        │   (Active)    │        │ • OpenAI      │
        │               │        │ • Anthropic   │
        │ ✅ Functional │        │ • Google      │
        └───────┬───────┘        └───────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   Agent Management    │
    │                       │
    │ 1. Authentication     │
    │ 2. Create Agent       │
    │ 3. List Agents        │
    │ 4. Active Agent       │
    │ 5. Test Agent         │
    │ 6. Cost Calculator    │
    │ 7. Share Agent        │
    └───────────────────────┘
```

## Mind Provider Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         KwamiMind Class                          │
│                      (Provider Orchestrator)                     │
│                                                                   │
│  Properties:                                                      │
│  - provider: MindProvider                                        │
│  - audio: KwamiAudio                                             │
│  - config: MindConfig                                            │
│                                                                   │
│  Methods:                                                         │
│  - initialize()                                                  │
│  - createAgent(), listAgents(), etc.                            │
│  - startConversation(), stopConversation()                      │
│  - setProvider(type)  ◄── Switch providers dynamically          │
│                                                                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ delegates to
                               ▼
                    ┌─────────────────┐
                    │  Provider       │
                    │  Factory        │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
    ┌──────────────┐  ┌──────────┐  ┌──────────┐
    │ ElevenLabs   │  │  OpenAI  │  │Anthropic │
    │  Provider    │  │ Provider │  │ Provider │
    │              │  │          │  │          │
    │ implements   │  │implements│  │implements│
    │MindProvider  │  │   ...    │  │   ...    │
    └──────────────┘  └──────────┘  └──────────┘
```

## MindProvider Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                      MindProvider Interface                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Lifecycle:                                                       │
│  ├─ initialize(): Promise<void>                                 │
│  ├─ isReady(): boolean                                          │
│  ├─ dispose(): void                                             │
│  └─ updateConfig(config: MindConfig): void                      │
│                                                                   │
│  Agent Management:                                                │
│  ├─ createAgent(config): Promise<AgentResponse>                │
│  ├─ getAgent(id): Promise<AgentResponse>                       │
│  ├─ listAgents(options): Promise<ListAgentsResponse>           │
│  ├─ updateAgent(id, config): Promise<AgentResponse>            │
│  ├─ deleteAgent(id): Promise<void>                             │
│  └─ duplicateAgent(id, options): Promise<AgentResponse>        │
│                                                                   │
│  Conversations:                                                   │
│  ├─ startConversation(prompt, callbacks): Promise<void>         │
│  ├─ stopConversation(): Promise<void>                          │
│  ├─ isConversationActive(): boolean                            │
│  ├─ sendConversationMessage(text): void                        │
│  └─ listen(): Promise<MediaStream>                             │
│                                                                   │
│  Testing & Analytics:                                             │
│  ├─ simulateConversation(id, req): Promise<Response>           │
│  ├─ calculateLLMUsage(id, req): Promise<LLMUsageResponse>      │
│  ├─ getAgentLink(id): Promise<AgentLinkResponse>               │
│  └─ testMicrophone(): Promise<boolean>                         │
│                                                                   │
│  Audio:                                                           │
│  ├─ speak(text, options): Promise<void>                        │
│  ├─ getAvailableVoices(): Promise<any[]>                       │
│  ├─ generateSpeechBlob(text): Promise<Blob>                    │
│  └─ previewVoice(text): Promise<void>                          │
│                                                                   │
│  History:                                                         │
│  ├─ listConversations(options): Promise<Response>              │
│  ├─ getConversation(id): Promise<ConversationResponse>         │
│  ├─ deleteConversation(id): Promise<void>                      │
│  └─ getConversationAudio(id): Promise<Blob>                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## ElevenLabs Provider Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                   ElevenLabsProvider Class                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Dependencies:                                                    │
│  ├─ ElevenLabsClient (from @elevenlabs/elevenlabs-js)          │
│  ├─ KwamiAudio                                                  │
│  └─ WebSocket (for conversations)                              │
│                                                                   │
│  Internal State:                                                  │
│  ├─ client: ElevenLabsClient                                    │
│  ├─ config: MindConfig                                          │
│  ├─ conversationWebSocket: WebSocket | null                     │
│  ├─ audioContext: AudioContext | null                           │
│  ├─ conversationActive: boolean                                 │
│  └─ conversationCallbacks: MindConversationCallbacks           │
│                                                                   │
│  Key Methods:                                                     │
│  ├─ createAgent() ────────────────────► POST /v1/agents        │
│  ├─ listAgents() ─────────────────────► GET /v1/agents         │
│  ├─ startConversation() ──┐                                     │
│  │   └─ getSignedUrl() ───┼──────────► GET /v1/.../signed_url │
│  │   └─ new WebSocket() ──┘                                     │
│  │   └─ getUserMedia()                                          │
│  │   └─ setupAudioProcessing()                                  │
│  └─ stopConversation() ────► cleanup WebSocket + audio         │
│                                                                   │
│  WebSocket Flow:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Get signed URL from API                             │   │
│  │  2. Connect WebSocket                                    │   │
│  │  3. Setup audio processing (PCM16, 16kHz)              │   │
│  │  4. Stream user audio → WebSocket                       │   │
│  │  5. Receive agent audio ← WebSocket                     │   │
│  │  6. Play through KwamiAudio                             │   │
│  │  7. Handle events (turn_start, turn_end, etc.)         │   │
│  │  8. Close on stopConversation()                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## UI Component Hierarchy

```
Mind Sidebar
│
├── Provider Tabs (Grid: 4 columns)
│   ├── [🎙️ ElevenLabs] ◄── Active
│   ├── [🧠 OpenAI] (disabled)
│   ├── [🤖 Anthropic] (disabled)
│   └── [🔮 Google] (disabled)
│
└── Provider Content Container
    │
    ├── #provider-elevenlabs (visible)
    │   │
    │   ├── 🔑 API Authentication
    │   │   ├── API Key Input (password)
    │   │   ├── Initialize Button
    │   │   └── Status Indicator
    │   │
    │   ├── ✨ Create New Agent (disabled initially)
    │   │   ├── Agent Name
    │   │   ├── System Prompt
    │   │   ├── First Message
    │   │   ├── LLM Configuration
    │   │   │   ├── Model Select
    │   │   │   ├── Temperature Slider
    │   │   │   └── Max Tokens Input
    │   │   └── Voice Configuration
    │   │       ├── Voice Selection
    │   │       ├── TTS Model
    │   │       ├── Stability Slider
    │   │       └── Similarity Boost Slider
    │   │
    │   ├── 📋 My Agents (disabled initially)
    │   │   ├── Refresh Button
    │   │   └── Agent Cards List
    │   │       └── [Agent Card]
    │   │           ├── Name
    │   │           ├── Actions (Duplicate, Delete)
    │   │           └── Prompt Preview
    │   │
    │   ├── 🎯 Active Agent (disabled initially)
    │   │   ├── Selected Agent Info
    │   │   └── Start/Stop Conversation Buttons
    │   │
    │   ├── 🧪 Test Agent (disabled initially)
    │   │   ├── Test Message Input
    │   │   ├── Test Button
    │   │   └── Test Results Display
    │   │
    │   ├── 💰 Cost Calculator (disabled initially)
    │   │   ├── Conversation Turns Input
    │   │   ├── Message Length Input
    │   │   ├── Calculate Button
    │   │   └── Cost Results Display
    │   │
    │   └── 🔗 Share Agent (disabled initially)
    │       ├── Get Link Button
    │       └── Link Display + Copy Button
    │
    ├── #provider-openai (hidden)
    │   └── "Coming Soon" Message
    │
    ├── #provider-anthropic (hidden)
    │   └── "Coming Soon" Message
    │
    └── #provider-google (hidden)
        └── "Coming Soon" Message
```

## Conversation Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    ElevenLabs Conversation Flow                   │
└──────────────────────────────────────────────────────────────────┘

User clicks "Start Conversation"
        │
        ▼
┌──────────────────────┐
│ Check Agent ID       │ ──── ❌ Error: No agent selected
└──────┬───────────────┘
       │ ✅ Agent ID exists
       ▼
┌──────────────────────┐
│ Request Microphone   │ ──── ❌ Error: Permission denied
└──────┬───────────────┘
       │ ✅ Access granted
       ▼
┌──────────────────────┐
│ Get Signed URL       │ ──── ❌ Error: Invalid API key / Agent not found
│ from ElevenLabs API  │
└──────┬───────────────┘
       │ ✅ URL received
       ▼
┌──────────────────────┐
│ Create WebSocket     │
│ Connection           │
└──────┬───────────────┘
       │ ✅ Connected
       ▼
┌──────────────────────┐
│ Setup Audio Context  │
│ • AudioContext       │
│ • MediaStreamSource  │
│ • ScriptProcessor    │
└──────┬───────────────┘
       │ ✅ Audio pipeline ready
       ▼
┌──────────────────────┐
│ Wait for Init Event  │ ◄──── conversation_initiation_metadata
└──────┬───────────────┘
       │ ✅ Conversation initialized
       ▼
┌──────────────────────────────────────────────┐
│         Active Conversation Loop             │
│                                              │
│  User Speaks                                 │
│       │                                      │
│       ▼                                      │
│  ┌─────────────────┐                        │
│  │ Capture PCM16   │                        │
│  │ 16kHz Audio     │                        │
│  └────────┬────────┘                        │
│           │                                  │
│           ▼                                  │
│  ┌─────────────────┐                        │
│  │ Send via        │                        │
│  │ WebSocket       │                        │
│  └────────┬────────┘                        │
│           │                                  │
│           ▼                                  │
│  ┌─────────────────┐                        │
│  │ ElevenLabs      │                        │
│  │ Processes       │                        │
│  └────────┬────────┘                        │
│           │                                  │
│           ├──► user_transcript event        │
│           │    (onUserTranscript callback)  │
│           │                                  │
│           ├──► turn_start event             │
│           │    (onTurnStart callback)       │
│           │    [Kwami state → speaking]     │
│           │                                  │
│           ├──► agent audio (PCM16)          │
│           │    [Play through KwamiAudio]    │
│           │    [Kwami blob animates]        │
│           │                                  │
│           ├──► agent_response event         │
│           │    (onAgentResponse callback)   │
│           │    [Show text in UI]            │
│           │                                  │
│           └──► turn_end event               │
│                (onTurnEnd callback)         │
│                [Kwami state → listening]    │
│                                              │
│       ▲                                      │
│       │                                      │
│       └──────── Loop continues ──────────┐  │
│                                           │  │
└───────────────────────────────────────────┼──┘
                                            │
                                            │
User clicks "Stop Conversation"            │
        │                                   │
        ▼                                   │
┌──────────────────────┐                   │
│ Stop Conversation    │ ──────────────────┘
│ • Close WebSocket    │
│ • Stop audio streams │
│ • Cleanup resources  │
│ • Update UI state    │
└──────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         Data Flow Overview                        │
└──────────────────────────────────────────────────────────────────┘

Playground UI
    │
    │ User actions (clicks, inputs)
    ▼
agent-management-functions.js
    │
    │ window.kwami.mind.* calls
    ▼
KwamiMind (Mind.ts)
    │
    │ Delegates to active provider
    ▼
ElevenLabsProvider
    │
    ├──► ElevenLabs REST API
    │    • GET/POST/DELETE /v1/agents
    │    • GET /v1/.../signed_url
    │    • Responses → Update UI
    │
    └──► ElevenLabs WebSocket
         • Binary audio (PCM16) ←→
         • JSON events (user_transcript, turn_start, etc.)
         • Audio → KwamiAudio → Speakers
         • Events → Callbacks → UI Updates
```

## State Management

```
┌────────────────────────────────────┐
│      Kwami State Transitions       │
└────────────────────────────────────┘

  ┌─────┐
  │IDLE │ ◄──┐
  └──┬──┘    │
     │       │
     │ startConversation()
     │       │
     ▼       │
┌──────────┐ │
│LISTENING │ │
└────┬─────┘ │
     │       │
     │ turn_start event
     │       │
     ▼       │
┌──────────┐ │
│SPEAKING  │ │
└────┬─────┘ │
     │       │
     │ turn_end event
     │       │
     └───────┘ (loops)
     
     stopConversation()
          │
          ▼
       ┌─────┐
       │IDLE │
       └─────┘
```

## File Structure

```
kwami/
├── playground/
│   ├── index.html                         ◄── Refactored Mind UI
│   ├── styles.css                         ◄── Added provider tab styles
│   ├── agent-management-functions.js      ◄── Added switchProvider()
│   └── main.js                            (unchanged)
│
├── src/core/mind/
│   ├── Mind.ts                            (unchanged - already perfect!)
│   ├── README.md                          ◄── NEW: Complete documentation
│   └── providers/
│       ├── types.ts                       (unchanged)
│       ├── factory.ts                     (unchanged)
│       ├── elevenlabs/
│       │   └── ElevenLabsProvider.ts      (unchanged - fully functional!)
│       └── openai/
│           └── OpenAIProvider.ts          (stub - to be implemented)
│
└── docs/
    ├── mind-refactoring.md                ◄── NEW: Refactoring overview
    ├── mind-playground-quickstart.md      ◄── NEW: Quick start guide
    ├── mind-architecture-diagram.md       ◄── NEW: This file!
    └── CHANGELOG-MIND-REFACTOR.md         ◄── NEW: Complete changelog
```

---

## Summary

The Mind architecture is now:
- ✅ **Provider-Based** - Easy to add new AI providers
- ✅ **Clean UI** - Focused on conversational agents only
- ✅ **Well-Documented** - Comprehensive docs and examples
- ✅ **Scalable** - Ready for OpenAI, Anthropic, Google, and beyond
- ✅ **Type-Safe** - MindProvider interface enforces contracts
- ✅ **Maintainable** - Clear separation of concerns

**Welcome to the future of multi-provider conversational AI! 🎙️🤖✨**

