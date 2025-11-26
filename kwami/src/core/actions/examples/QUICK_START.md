# Quick Start Guide - Kwami Actions

## Installation

Actions are built into Kwami core. No additional installation needed!

```bash
npm install @kwami/core
```

## Basic Usage

### 1. Initialize Kwami

```typescript
import { Kwami } from '@kwami/core';

const canvas = document.querySelector('#kwami-canvas');
const kwami = new Kwami(canvas);

// Actions are automatically available!
// Right-click on the blob to see the context menu
```

### 2. Execute Actions Programmatically

```typescript
// Change blob transparency
await kwami.soul.actions.executeAction('change-blob-opacity', {
  params: { opacity: 0.5 }
});

// Randomize blob
await kwami.soul.actions.executeAction('randomize-blob');

// Randomize background
await kwami.soul.actions.executeAction('randomize-background');
```

### 3. Create a Simple Custom Action

```typescript
kwami.soul.actions.registerAction({
  id: 'my-first-action',
  name: 'My First Action',
  description: 'A simple action that changes the blob',
  category: 'body',
  version: '1.5.9',
  triggers: ['context-menu', 'api'],
  
  // The action logic
  handler: async (context, params) => {
    // Do something with Kwami
    kwami.body.blob.setOpacity(0.8);
    kwami.body.blob.setColors('#ff6b6b', '#4ecdc4', '#45b7d1');
    
    return {
      success: true,
      actionId: 'my-first-action',
      executionTime: 0,
    };
  },
  
  // Show in context menu
  ui: {
    showInContextMenu: true,
    menuLabel: '✨ My First Action',
    menuGroup: 'custom',
  },
  
  bodyAction: {
    type: 'appearance',
    target: 'blob',
  },
});

// Now right-click to see your action!
```

### 4. Load Actions from a File

Create `my-actions.json`:

```json
[
  {
    "id": "sunset-mood",
    "name": "Sunset Mood",
    "description": "Set a sunset color palette",
    "category": "body",
    "version": "1.5.9",
    "triggers": ["context-menu"],
    "handler": "body.setSunsetColors",
    "ui": {
      "showInContextMenu": true,
      "menuLabel": "🌅 Sunset Mood",
      "menuGroup": "moods"
    }
  }
]
```

Then load it:

```typescript
await kwami.soul.actions.loadActionsFromURL('/my-actions.json');
```

### 5. Action with Parameters

```typescript
kwami.soul.actions.registerAction({
  id: 'custom-opacity',
  name: 'Set Custom Opacity',
  category: 'body',
  version: '1.5.9',
  triggers: ['api'], // Only via API, not in context menu
  
  // Define parameters
  parameters: [
    {
      name: 'opacity',
      type: 'number',
      label: 'Opacity',
      description: 'Blob opacity from 0 to 1',
      required: true,
      min: 0,
      max: 1,
      default: 1,
    },
  ],
  
  handler: async (context, params) => {
    kwami.body.blob.setOpacity(params.opacity);
    return {
      success: true,
      actionId: 'custom-opacity',
      executionTime: 0,
      data: { opacity: params.opacity },
    };
  },
  
  bodyAction: {
    type: 'appearance',
    target: 'blob',
  },
});

// Execute with parameters
await kwami.soul.actions.executeAction('custom-opacity', {
  params: { opacity: 0.3 }
});
```

## Complete Example

```typescript
import { Kwami } from '@kwami/core';

// Initialize
const canvas = document.querySelector('#kwami-canvas');
const kwami = new Kwami(canvas);

// Register multiple custom actions
const customActions = [
  {
    id: 'happy-mode',
    name: 'Happy Mode',
    category: 'body',
    handler: async () => {
      kwami.body.blob.setColors('#FFD93D', '#6BCB77', '#4D96FF');
      kwami.body.blob.setScale(5);
      return { success: true, actionId: 'happy-mode', executionTime: 0 };
    },
    triggers: ['context-menu'],
    ui: {
      showInContextMenu: true,
      menuLabel: '😊 Happy Mode',
      menuGroup: 'moods',
    },
    bodyAction: { type: 'appearance', target: 'blob' },
  },
  {
    id: 'focus-mode',
    name: 'Focus Mode',
    category: 'body',
    handler: async () => {
      kwami.body.blob.setOpacity(0.3);
      kwami.body.blob.setScale(2);
      kwami.body.blob.setColors('#2C3E50', '#34495E', '#7F8C8D');
      return { success: true, actionId: 'focus-mode', executionTime: 0 };
    },
    triggers: ['context-menu'],
    ui: {
      showInContextMenu: true,
      menuLabel: '🎯 Focus Mode',
      menuGroup: 'moods',
    },
    bodyAction: { type: 'appearance', target: 'blob' },
  },
];

// Register all actions
customActions.forEach(action => {
  kwami.soul.actions.registerAction(action);
});

// Query available actions
console.log('Available actions:', kwami.soul.actions.getAllActions());

// Execute an action
await kwami.soul.actions.executeAction('happy-mode');

// Get statistics
console.log('Stats:', kwami.soul.actions.getStatistics());
```

## Context Menu

Right-click on the Kwami blob to see all available actions!

The context menu will show:
- Built-in actions (transparency, randomize, etc.)
- Your custom actions
- Grouped by category
- With icons and labels

## Next Steps

1. **Explore Examples**: Check out the example files in this directory
2. **Read Documentation**: See `ACTION_SYSTEM_IMPLEMENTATION.md`
3. **Create Your Own**: Design custom actions for your use case
4. **Share**: Export your actions and share with others

## Tips

- Use descriptive action IDs (e.g., 'change-blob-opacity', not 'action1')
- Group related actions using `menuGroup`
- Set `menuOrder` to control the order in context menu
- Add keyboard shortcuts for frequently used actions
- Use confirmation for destructive actions
- Test actions with error scenarios

## Common Patterns

### Toggle Action

```typescript
let isEnabled = false;

kwami.soul.actions.registerAction({
  id: 'toggle-feature',
  name: 'Toggle Feature',
  handler: async () => {
    isEnabled = !isEnabled;
    // Do something based on state
    return { 
      success: true, 
      actionId: 'toggle-feature',
      executionTime: 0,
      data: { enabled: isEnabled }
    };
  },
  // ... rest of config
});
```

### Confirmation Dialog

```typescript
kwami.soul.actions.registerAction({
  id: 'reset-kwami',
  name: 'Reset Kwami',
  confirmation: {
    required: true,
    message: 'Are you sure you want to reset?'
  },
  handler: async () => {
    // Will only run if user confirms
    kwami.body.resetBlobToDefaults();
    return { success: true, actionId: 'reset-kwami', executionTime: 0 };
  },
  // ... rest of config
});
```

### Async Operations

```typescript
kwami.soul.actions.registerAction({
  id: 'load-data',
  name: 'Load External Data',
  timeout: 10000, // 10 second timeout
  handler: async () => {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    
    // Use the data
    kwami.body.blob.setColors(data.color1, data.color2, data.color3);
    
    return { 
      success: true, 
      actionId: 'load-data',
      executionTime: 0,
      data
    };
  },
  // ... rest of config
});
```

Happy coding! 🎨✨

