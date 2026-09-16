# Getting started

Embed the `kwami` library in a web app. You need a canvas, a LiveKit token source, and — for
voice — a backend agent. This page is the consumer path; contributors start at
[CONTRIBUTING](../CONTRIBUTING.md).

## Install

```bash
pnpm add kwami three
```

`three` is a peer dependency (`>= 0.183.2`). `@types/three` is optional.

Channels:

```bash
pnpm add kwami          # stable — npm tag latest (main)
pnpm add kwami@rc       # release candidate (stg)
pnpm add kwami@dev      # prerelease (dev)
```

Node `>= 22.14` is required to **build** this repo. Consuming the published ESM bundle needs a
modern bundler (Vite, webpack, etc.) and a browser with WebGL2.

## Minimal avatar

The library will render without a voice backend. Useful for layout and skins.

```ts
import { Kwami } from 'kwami';

const canvas = document.querySelector('canvas')!;
const kwami = new Kwami(canvas, {
  avatar: { renderer: 'blob-xyz' },
  soul: { name: 'Luna', personality: 'friendly and concise' },
});

// Always pair construct with dispose (SPA unmount, route change).
// await kwami.dispose();
```

Presets:

```ts
import { Kwami, getSoulPresetById, toSoulConfig } from 'kwami';

const preset = getSoulPresetById('professional');
const kwami = new Kwami(canvas, {
  soul: preset ? toSoulConfig(preset) : undefined,
});
```

## Connect a voice session

The agent runs **on your backend**. The browser fetches a token, joins the room, and publishes
the microphone.

```ts
const kwami = new Kwami(canvas, {
  soul: { name: 'Luna', personality: 'helpful' },
  agent: {
    livekit: {
      tokenEndpoint: '/api/livekit/token',
      agentIdentity: 'kwami-agent',
    },
  },
});

await kwami.connect('user-123', {
  onStateChange: (state) => console.log(state),
  onUserTranscript: (text) => console.log('user', text),
  onAgentResponse: (text) => console.log('agent', text),
  onError: (err) => console.error(err),
});
```

Your token endpoint must:

1. Authenticate the browser user.
2. Return whatever the adapter expects (LiveKit URL + JWT, and typically a room name).
3. Reserve `agentIdentity` for the worker, not the visitor.

Do **not** put OpenAI / Deepgram / ElevenLabs keys in `agent.voice`. See
[security](./security.md).

## Tools

Schemas go to the agent; handlers run in the page when the **pinned** agent sends `tool_call`.

```ts
kwami.registerTool({
  name: 'get_time',
  description: 'Current local time',
  parameters: { type: 'object', properties: {} },
  handler: async () => new Date().toISOString(),
});
```

## Live reconfiguration

```ts
kwami.updateSoul({ emotionalTone: 'enthusiastic' });
kwami.updateVoice({ tts: { voice: 'nova' } });
```

If the room is connected, these sync to the running agent without a reconnect.

## Cleanup

```ts
await kwami.disconnect();
await kwami.dispose();
```

`dispose()` tears down WebGL, audio, tools, and the process registry. Skipping it leaks the
room and the GPU context for the life of the tab.

## Next

| Topic             | Document                           |
| ----------------- | ---------------------------------- |
| Public surface    | [API](./api.md)                    |
| Module map        | [Architecture](./architecture.md)  |
| Production harden | [Security](./security.md)          |
| Change the lib    | [CONTRIBUTING](../CONTRIBUTING.md) |
