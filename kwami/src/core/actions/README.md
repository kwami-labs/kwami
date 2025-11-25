# Kwami Action System

The Action system is the connection between **Mind** (AI capabilities) and **Body** (visual representation) through the **Soul** (personality layer).

## Architecture

```
┌─────────────────────────────────────────────┐
│              KWAMI INSTANCE                 │
│                                             │
│  ┌──────────┐   ┌──────────┐  ┌──────────┐ │
│  │   BODY   │   │   MIND   │  │   SOUL   │ │
│  │ (Visual) │   │   (AI)   │  │(Personal)│ │
│  └────┬─────┘   └────┬─────┘  └────┬─────┘ │
│       │              │             │        │
│       └──────────────┴─────────────┘        │
│                      │                      │
│            ┌─────────▼─────────┐            │
│            │  ACTION MANAGER   │            │
│            │   (in Soul)       │            │
│            └───────────────────┘            │
└─────────────────────────────────────────────┘
```

## Features

- **Configurable Actions**: Define actions in JSON or YAML
- **MCP Compatible**: Model Context Protocol support for AI agents
- **Context Menu**: Right-click on blob to see available actions
- **Multiple Triggers**: Context menu, keyboard, voice, API, AI-initiated
- **Extensible**: Easy to add new action types
- **Type-Safe**: Full TypeScript support

## Usage

### Registering a Custom Action

```typescript
import { Kwami } from "@kwami/core";

const kwami = new Kwami(canvas);

// Register a custom action
kwami.soul.actions.registerAction({
  id: "my-custom-action",
  name: "My Custom Action",
  description: "Does something cool",
  category: "body",
  version: "1.0.0",
  triggers: ["context-menu", "api"],
  handler: async (context, params) => {
    // Your action logic here
    kwami.body.blob.setOpacity(0.5);

    return {
      success: true,
      actionId: "my-custom-action",
      executionTime: 0,
    };
  },
  ui: {
    showInContextMenu: true,
    menuLabel: "✨ My Action",
  },
  bodyAction: {
    type: "appearance",
    target: "blob",
  },
});
```

### Loading Actions from Configuration

```typescript
// Load from JSON file
await kwami.soul.actions.loadActionsFromURL("/actions/my-actions.json");

// Load from YAML file
await kwami.soul.actions.loadActionsFromURL("/actions/my-actions.yaml");

// Load from string
const actionsJSON = `[
  {
    "id": "test-action",
    "name": "Test Action",
    "category": "body",
    "handler": "body.randomizeBlob"
  }
]`;
kwami.soul.actions.loadActionsFromJSON(actionsJSON);
```

### Executing Actions

```typescript
// Execute by ID
const result = await kwami.soul.actions.executeAction("change-blob-opacity", {
  params: { opacity: 0.7 },
});

// Execute with custom context
await kwami.soul.actions.executeAction("my-action", {
  context: {
    trigger: "api",
    user: { id: "user123" },
  },
  params: { value: 42 },
});
```

### Discovering Actions

```typescript
// Get all actions
const allActions = kwami.soul.actions.getAllActions();

// Get actions by category
const bodyActions = kwami.soul.actions.getAllActions({
  category: "body",
});

// Get context menu actions
const menuActions = kwami.soul.actions.getContextMenuActions();

// Search actions
const searchResults = kwami.soul.actions.getAllActions({
  search: "transparency",
});
```

## Action Configuration Format

### JSON Example

```json
{
  "id": "my-action",
  "name": "My Action",
  "description": "Description of the action",
  "category": "body",
  "version": "1.0.0",
  "enabled": true,
  "triggers": ["context-menu", "api"],
  "parameters": [
    {
      "name": "value",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 1
    }
  ],
  "handler": "body.setOpacity",
  "ui": {
    "showInContextMenu": true,
    "menuLabel": "🎨 My Action",
    "menuOrder": 10,
    "menuGroup": "appearance"
  }
}
```

### YAML Example

```yaml
id: my-action
name: My Action
description: Description of the action
category: body
version: 1.0.0
enabled: true

triggers:
  - context-menu
  - api

parameters:
  - name: value
    type: number
    required: true
    min: 0
    max: 1

handler: body.setOpacity

ui:
  showInContextMenu: true
  menuLabel: 🎨 My Action
  menuOrder: 10
  menuGroup: appearance
```

## Action Categories

- **body**: Visual and interaction changes (blob, background, camera)
- **mind**: AI behavior modifications (TTS, STT, conversations)
- **soul**: Personality changes (traits, moods)
- **integration**: External services (Instagram, WhatsApp, etc.)
- **system**: System-level operations (export, import, reset)

## Built-in Actions

The following actions are available by default:

### Body Actions

1. **Change Blob Transparency** - Adjust opacity
2. **Toggle Wireframe** - Show/hide wireframe mode
3. **Toggle Follow Click** - Make blob follow mouse clicks
4. **Randomize Blob** - Random colors and shapes
5. **Randomize Background** - Random gradient
6. **Clear Background** - Make background transparent
7. **Change Blob Size** - Adjust scale

### Mind Actions

8. **Text to Speech** - Convert text to speech using browser's native Speech Synthesis API

## Future Complex Actions

The system is designed to support complex integrations:

- **Social Media**: Post to Instagram, Twitter, etc.
- **Messaging**: Send WhatsApp messages in your style
- **Content Creation**: Generate images, videos, text
- **Smart Home**: Control devices
- **Calendar**: Schedule events
- **Email**: Send emails

See `examples/` directory for future action templates.

## Text to Speech Action

The Text to Speech action uses the browser's native [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) to convert text to speech without requiring any external services or API keys.

### Features

- **No API keys required**: Uses the browser's built-in Speech Synthesis API
- **Visual blob animation**: The blob animates as if speaking during text-to-speech playback
- **Adjustable parameters**: Control rate (speed) and pitch
- **Multiple voices**: Support for different languages and voices
- **Interactive mode**: Prompts user for text if not provided
- **State management**: Automatically transitions Kwami to 'speaking' state
- **Error handling**: Graceful fallback if API is not supported

### Usage

#### From Action Manager

```typescript
// Basic usage with default settings
await kwami.soul.actions.executeAction("text-to-speech", {
  params: {
    text: "Hello world",
    rate: 1,
    pitch: 1,
  },
});

// Fast speech
await kwami.soul.actions.executeAction("text-to-speech", {
  params: {
    text: "This is fast speech",
    rate: 2,
    pitch: 1,
  },
});

// Slow speech with low pitch
await kwami.soul.actions.executeAction("text-to-speech", {
  params: {
    text: "This is slow speech",
    rate: 0.5,
    pitch: 0.5,
  },
});

// With specific voice
await kwami.soul.actions.executeAction("text-to-speech", {
  params: {
    text: "Hello in a different voice",
    rate: 1,
    pitch: 1,
    voice: "Google US English", // or language code like 'en-US'
  },
});

// Interactive mode (prompts user)
await kwami.soul.actions.executeAction("text-to-speech");
```

#### Direct API Usage

```typescript
const utter = new SpeechSynthesisUtterance("Hello world");
utter.rate = 1;
utter.pitch = 1;
speechSynthesis.speak(utter);
```

### Parameters

- **text** (string, optional): Text to be spoken. If not provided, user will be prompted.
- **rate** (number, optional): Speech speed from 0.1 to 10. Default is 1.
- **pitch** (number, optional): Voice pitch from 0 to 2. Default is 1.
- **voice** (string, optional): Voice name or language code (e.g., "en-US").

### Examples

See `examples/text-to-speech.yaml` for pre-configured examples and `examples/test-text-to-speech.ts` for programmatic usage examples.

### How It Works

When the text-to-speech action is executed:

1. **State Transition**: Kwami automatically transitions to the 'speaking' state
2. **Audio Generation**: Browser's Speech Synthesis API generates the voice
3. **Visual Animation**: Natural speech-like frequency data is generated and injected into the audio analyzer
   - **Syllable rhythm**: Alternates between vowel and consonant phases (~3.5 syllables/second)
   - **Vowel formants**: During vowels, emphasizes three resonant frequencies (700Hz, 1220Hz, 2600Hz)
   - **Consonant noise**: During consonants, adds high-frequency noise bursts
   - **Natural variations**: Slow amplitude modulations and formant shifts for realism
   - **Rate adjustment**: Animation speed adapts to the speech rate parameter
   - The blob's vertices animate naturally in response to this data
4. **Cleanup**: When speech ends, the simulation stops and Kwami returns to 'idle' state

**Note**: Due to browser limitations, the Speech Synthesis API doesn't provide direct access to the audio stream. To animate the blob, we generate realistic frequency data that simulates human speech patterns with proper timing. This creates a natural, synchronized visual effect as if the blob is speaking. **No audible artificial sounds are produced** - only the browser's TTS voice is heard.

### Browser Compatibility

The Speech Synthesis API is supported in:

- Chrome 33+
- Edge 14+
- Firefox 49+
- Safari 7+
- Opera 21+

## Context Menu

Right-click on the Kwami blob to access the context menu with available actions.

To enable/disable the context menu:

```typescript
// Enable
kwami.body.enableContextMenu();

// Disable
kwami.body.disableContextMenu();
```

## MCP (Model Context Protocol)

Actions can be exposed to AI agents through MCP:

```yaml
id: my-action
mcp:
  name: my_action
  description: Description for AI agents
  inputSchema:
    type: object
    properties:
      param1:
        type: string
        description: Parameter description
    required: [param1]
```

## API Reference

### ActionManager

- `registerAction(definition, source)` - Register an action
- `unregisterAction(actionId)` - Remove an action
- `getAction(actionId)` - Get action definition
- `getAllActions(filter?)` - Get all actions with optional filter
- `getContextMenuActions()` - Get actions for context menu
- `executeAction(actionId, options)` - Execute an action
- `loadActionsFromJSON(json, source)` - Load from JSON string
- `loadActionsFromYAML(yaml, source)` - Load from YAML string
- `loadActionsFromURL(url, source)` - Load from URL
- `exportAsJSON(filter?)` - Export as JSON
- `exportAsYAML(filter?)` - Export as YAML
- `getExecutionHistory(limit?)` - Get execution history
- `getStatistics()` - Get statistics

## Examples

See the `examples/` directory for complete action examples:

- `basic-actions.json` - Basic built-in actions
- `instagram-post.yaml` - Future Instagram integration
- `whatsapp-reply.yaml` - Future WhatsApp integration

## Contributing

To add new built-in action handlers:

1. Add the handler to `ActionManager.getBuiltInHandler()`
2. Create the action definition
3. Register in `loadBuiltInActions()`

For external actions, create configuration files and load them via URL or string.
