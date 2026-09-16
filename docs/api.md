# API

The published surface is [`src/index.ts`](../src/index.ts) plus types in
[`src/types`](../src/types). After `pnpm build`, consumers resolve `kwami` → `dist/index.js`
and `dist/index.d.ts`.

This page is a map, not a generated reference. Types in the package are the contract.

## Entry

```ts
import { Kwami } from 'kwami';

Kwami.getVersion(); // compile-time `__KWAMI_VERSION__`
Kwami.getInstances(); // Map clone of live instances
Kwami.getInstance(id); // one instance, or undefined
```

```ts
const k = new Kwami(canvas: HTMLCanvasElement, config?: KwamiConfig);
```

| Member                              | Role                                              |
| ----------------------------------- | ------------------------------------------------- |
| `id`                                | CSPRNG instance id                                |
| `avatar` / `agent` / `soul`         | Subsystem instances                               |
| `memory` / `tools` / `skills`       | Subsystem instances                               |
| `connect(userId?, callbacks?)`      | Join LiveKit, dispatch config                     |
| `disconnect()`                      | Leave the room                                    |
| `isConnected()`                     | Adapter connection flag                           |
| `sendMessage(text)`                 | Text into the pipeline                            |
| `interrupt()`                       | Stop the current agent turn                       |
| `on(callbacks)`                     | Merge `KwamiCallbacks`                            |
| `getState()` / `setState()`         | `idle` \| `listening` \| `thinking` \| `speaking` |
| `getFullConfig()`                   | Dispatch snapshot                                 |
| `updateVoice` / `updateSoul`        | Patch + sync if connected                         |
| `registerTool` / `unregisterTool`   | Local registry + sync                             |
| `executeSkill` / `executeTool`      | Invoke by name                                    |
| `getMemoryContext` / `searchMemory` | Stub on the client today                          |
| `dispose()`                         | Full teardown; throws `AggregateError` on partial |

## Config

`KwamiConfig` is the constructor bag:

```ts
{
  avatar?: AvatarConfig;
  agent?: AgentConfig;
  soul?: SoulConfig;
  memory?: MemoryConfig;
  tools?: ToolsConfig;
  skills?: SkillsConfig;
}
```

`KwamiCallbacks`: `onStateChange`, `onAgentResponse`, `onUserTranscript`, `onError`.

### Avatar

`AvatarConfig.renderer`: `'blob-xyz' | 'black-hole' | 'particles-face' | 'eye-iris'`.

Nested blocks: `blob`, `blackHole`, `particlesFace`, `eyeIris`, `scene`, `interaction`,
`audio`. Skin names and randomizers are exported from the package (`BLOB_SKINS`,
`randomizeBlobState`, preset catalogues).

### Agent / LiveKit

```ts
agent?: {
  adapter?: 'livekit' | 'custom';
  livekit?: LiveKitConfig;
}
```

Important `LiveKitConfig` fields: `url`, `token`, `tokenEndpoint`, `roomName`, `userId`,
`authToken`, **`agentIdentity` / `agentIdentityPrefix`**, `voice` (`VoicePipelineConfig`).

Voice types (VAD, STT, LLM, TTS, realtime, metrics) and builders (`buildSTTDescriptor`,
`getVoicePipelinePreset`, catalogues) are re-exported from the package root.

### Soul

`SoulConfig`: name, personality, systemPrompt, traits, language, conversationStyle,
responseLength, emotionalTone, emotionalTraits.

Helpers: `soulPresets`, `getSoulPresetById`, `getSoulPresetsByCategory`, `toSoulConfig`.

### Tools and skills

`ToolDefinition` includes JSON-Schema `parameters` and an optional `handler`. Handlers are
stripped before the payload crosses the data channel.

`SkillDefinition` is a named in-process function plus metadata.

## Other exports

| Export                                                  | Notes                                                 |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `Avatar`, `Scene`, `StarField`, `BlobXyz`, `KwamiAudio` | Use via `kwami.avatar` unless you mount them yourself |
| `Agent`, `LiveKitAdapter`, `VoiceSession`               | Same — prefer `kwami.agent`                           |
| `Soul`, `Memory`, `ToolRegistry`, `SkillManager`        | Standalone constructible                              |
| `logger`                                                | Shared logger; secret-field masking                   |
| api-client fns                                          | `getMemoryGraph`, facts, ingest, graph ops, …         |

## Stability

- **Additive** optional fields and new named exports are `feat` (minor).
- **Rename, remove, or change meaning** of an export or a required field is `BREAKING CHANGE`.
- `three` stays a peer. Do not depend on a version outside the declared range.
- `Memory` client methods are stable as signatures; behaviour is a backend concern and may
  stay no-op on the client.

Generated `.d.ts` is what TypeScript consumers see. CI checks that `dist/index.d.ts` exists
and resolves (`pnpm check:dts` / the build job).
