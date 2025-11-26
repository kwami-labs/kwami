# Kwami Skills System

A powerful system for programming Kwami's behavior through YAML/JSON files or programmatic API.

## Overview

The Skills system allows you to define and execute complex behaviors for Kwami, including:

- Visual changes (position, scale, colors, animations)
- Personality adjustments (soul traits)
- Speech and interaction
- Sequential and parallel action execution

## Quick Start

### Using Predefined Skills

```typescript
import { Kwami } from "@kwami/core";

const kwami = new Kwami(canvas);

// Execute a skill
await kwami.mind.skills.executeSkill("minimize-top-right");
```

### Loading Skills from JSON

```typescript
// Load from URL
await kwami.mind.skills.loadSkillFromUrl("/skills/my-skill.json");

// Load from string
const skillJson = '{"id": "test", "name": "Test", ...}';
kwami.mind.skills.loadSkillFromString(skillJson, "json");
```

### Creating Skills Programmatically

```typescript
import type { SkillDefinition } from "@kwami/core";

const mySkill: SkillDefinition = {
  id: "my-custom-skill",
  name: "My Custom Skill",
  description: "Does something cool",
  version: "1.5.9",
  actions: [
    {
      type: "body.scale",
      preset: "mini",
      duration: 800,
      easing: "ease-in-out",
    },
    {
      type: "body.position",
      preset: "top-right",
      duration: 800,
      easing: "ease-in-out",
    },
  ],
};

kwami.mind.skills.registerSkill(mySkill);
await kwami.mind.skills.executeSkill("my-custom-skill");
```

## Available Actions

### Body Actions

- `body.position` - Move Kwami to a specific position
- `body.scale` - Change Kwami's size
- `body.colors` - Change blob colors
- `body.spikes` - Adjust noise frequency
- `body.time` - Change animation speed
- `body.rotation` - Set auto-rotation
- `body.camera` - Move camera
- `body.skin` - Change blob material
- `body.background` - Change background

### Soul Actions

- `soul.trait` - Modify personality traits

### Mind Actions

- `mind.speak` - Make Kwami speak

### Control Flow

- `wait` - Pause execution
- `sequence` - Execute multiple actions (sequential or parallel)

## Example Skills

See `templates/` directory for complete examples:

- `minimize-top-right.json` - Minimize and move to corner
- `rainbow-transition.json` - Rainbow color animation
- `energetic-mode.json` - High-energy mode with auto-reverse
- `calm-meditation.json` - Relaxing meditation mode
- `focus-session.json` - Pomodoro focus helper
- `party-mode.json` - Celebration mode

## Skill API

### SkillManager Methods

```typescript
// Register a skill
registerSkill(definition: SkillDefinition): void

// Execute a skill
executeSkill(id: string, params?: Record<string, any>): Promise<SkillExecutionResult>

// Load from string
loadSkillFromString(content: string, format: 'yaml' | 'json'): void

// Load from URL
loadSkillFromUrl(url: string): Promise<void>

// Get skill
getSkill(id: string): SkillDefinition | undefined

// Get all skills
getAllSkills(): SkillDefinition[]

// Unregister skill
unregisterSkill(id: string): boolean

// Clear all skills
clearSkills(): void

// Get statistics
getStats(): { totalSkills, activeSkills, skillsBySource }
```

## Advanced Features

### Auto-Reverse

Skills can automatically reverse to original state:

```json
{
  "autoReverse": true,
  "reverseDelay": 5000
}
```

### Parallel Execution

Execute multiple actions simultaneously:

```json
{
  "type": "sequence",
  "parallel": true,
  "actions": [...]
}
```

### Easing Functions

Smooth animations with easing:

- `linear`
- `ease-in`
- `ease-out`
- `ease-in-out`
- `bounce`
