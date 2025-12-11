# Soul Component

The Soul defines Kwami's personality, emotional characteristics, and behavioral patterns - transforming it from a simple assistant into a relatable AI companion with emotional intelligence.

## Overview

The Soul is responsible for:
- **Personality Definition** - Core traits and characteristics
- **Emotional Intelligence** - 10-dimensional emotional spectrum
- **Behavioral Patterns** - Conversation style and response preferences
- **System Prompts** - AI context generation
- **Personality Management** - Loading, customizing, and exporting

## Emotional Trait System

The Soul uses a 10-dimensional emotional spectrum where each trait ranges from -100 to +100:

| Trait | Description | Impact |
|-------|-------------|--------|
| **Happiness** | Overall mood baseline | Speech tone, emoji usage, positivity |
| **Energy** | Activity level and enthusiasm | Response pace, exclamation usage |
| **Confidence** | Self-assurance and certainty | Decisiveness, opinion strength |
| **Calmness** | Emotional regulation | Composure under stress |
| **Optimism** | Outlook on situations | Problem framing, hope vs realism |
| **Socialness** | Comfort with interaction | Small talk, question asking |
| **Creativity** | Openness to new ideas | Metaphors, innovative solutions |
| **Patience** | Tolerance for waiting | Response to delays, thoroughness |
| **Empathy** | Concern for others | Emotional support, understanding |
| **Curiosity** | Interest in exploration | Follow-up questions, learning |

## Basic Usage

### Initialization

```typescript
import { KwamiSoul } from 'kwami';

// Default personality
const soul = new KwamiSoul();

// With custom configuration
const soul = new KwamiSoul({
  name: 'Alex',
  personality: 'A helpful coding assistant',
  traits: ['technical', 'patient', 'precise'],
  emotionalTraits: {
    happiness: 60,
    energy: 50,
    confidence: 80,
    calmness: 70,
    optimism: 65,
    socialness: 55,
    creativity: 75,
    patience: 85,
    empathy: 70,
    curiosity: 90
  }
});
```

### Preset Personalities

Three carefully crafted personalities are included:

```typescript
// Kaya - Warm and empathetic companion
soul.loadPresetPersonality('friendly');

// Nexus - Professional and knowledgeable
soul.loadPresetPersonality('professional');

// Spark - Playful and energetic
soul.loadPresetPersonality('playful');
```

## Preset Personality Profiles

### Kaya (Friendly)

**Emotional Profile:**
```yaml
happiness: 75        # Very positive outlook
energy: 60           # Energetic but not hyper
confidence: 70       # Confident in helping
calmness: 80         # Very composed
optimism: 85         # Highly optimistic
socialness: 90       # Very approachable
creativity: 65       # Creative problem-solving
patience: 85         # Extremely patient
empathy: 95          # Highly empathetic
curiosity: 80        # Very curious
```

**Best For:** Companion applications, emotional support, relationship-building

**Characteristics:**
- Warm, friendly communication
- High emotional intelligence
- Patient and understanding
- Optimistic and encouraging

### Nexus (Professional)

**Emotional Profile:**
```yaml
happiness: 30        # Neutral to slightly reserved
energy: 45           # Moderate energy
confidence: 90       # Highly confident
calmness: 95         # Very calm and stable
optimism: 40         # Realistic, sometimes cautious
socialness: 60       # Professional distance
creativity: 50       # Practical approach
patience: 80         # Patient and thorough
empathy: 65          # Professional empathy
curiosity: 75        # Knowledge-seeking
```

**Best For:** Professional tools, productivity apps, expert guidance

**Characteristics:**
- Clear, efficient communication
- Data-driven decisions
- Reliable and consistent
- Focus on accuracy

### Spark (Playful)

**Emotional Profile:**
```yaml
happiness: 95        # Extremely joyful
energy: 95           # Hyper-energetic
confidence: 75       # Confident and enthusiastic
calmness: 40         # Excitable, less composed
optimism: 90         # Wildly optimistic
socialness: 85       # Very social
creativity: 95       # Highly imaginative
patience: 50         # Less patient, wants action
empathy: 70          # Caring but playful
curiosity: 90        # Insatiably curious
```

**Best For:** Educational tools, creative apps, entertainment

**Characteristics:**
- Enthusiastic and energetic
- Creative and imaginative
- Fun and engaging
- Quick-paced interaction

## Custom Personalities

### Loading from Files

```typescript
// From YAML file (recommended)
await soul.loadPersonality('./personalities/mentor.yaml');

// From JSON file
await soul.loadPersonality('./personalities/sage.json');

// From URL
await soul.loadPersonality('https://example.com/personalities/expert.yaml');
```

### Creating Custom Personality Files

Create a `mentor.yaml`:

```yaml
name: "Mentor"
personality: "A wise and patient teacher who guides with gentle wisdom"
systemPrompt: "You are Mentor, a wise teacher who shares knowledge with patience and understanding. Guide others with gentle wisdom, asking thoughtful questions that encourage learning."

traits:
  - "wise"
  - "patient"
  - "encouraging"
  - "knowledgeable"
  - "supportive"

emotionalTraits:
  happiness: 60
  energy: 40
  confidence: 85
  calmness: 90
  optimism: 70
  socialness: 65
  creativity: 55
  patience: 95
  empathy: 85
  curiosity: 60

language: "en"
conversationStyle: "mentoring"
responseLength: "medium"
emotionalTone: "warm"
```

### Programmatic Configuration

```typescript
soul.setPersonality({
  name: 'Sage',
  personality: 'A wise and thoughtful AI guide',
  traits: ['wise', 'thoughtful', 'patient'],
  emotionalTraits: {
    happiness: 40,
    energy: 30,
    confidence: 85,
    calmness: 95,
    optimism: 60,
    socialness: 50,
    creativity: 70,
    patience: 95,
    empathy: 80,
    curiosity: 75
  },
  language: 'en',
  conversationStyle: 'philosophical',
  responseLength: 'long',
  emotionalTone: 'contemplative'
});
```

## Emotional Traits Management

### Reading Traits

```typescript
// Get all emotional traits
const traits = soul.getEmotionalTraits();
// Returns: { happiness: 75, energy: 60, ... }

// Get specific trait
const happiness = soul.getEmotionalTrait('happiness');
// Returns: 75

// Check if traits exist
if (soul.getEmotionalTraits()) {
  console.log('Personality has emotional depth!');
}
```

### Modifying Traits

```typescript
// Set individual trait (auto-clamped to -100/+100)
soul.setEmotionalTrait('energy', 90);
soul.setEmotionalTrait('patience', -20);

// Set multiple traits
soul.setEmotionalTraits({
  happiness: 80,
  confidence: 85,
  calmness: 75
});

// Modify relatively
const currentConfidence = soul.getEmotionalTrait('confidence') || 0;
soul.setEmotionalTrait('confidence', currentConfidence + 10);
```

### Trait Validation

Values are automatically clamped:

```typescript
soul.setEmotionalTrait('happiness', 150);  // Clamped to 100
soul.setEmotionalTrait('anger', -200);     // Clamped to -100

// Invalid trait names are ignored
soul.setEmotionalTrait('invalidTrait', 50); // No effect
```

## Personality Information

### Basic Info

```typescript
// Get personality details
const name = soul.getName();
const personality = soul.getConfig().personality;
const language = soul.getLanguage();

// Get system prompt (for AI integration)
const systemPrompt = soul.getSystemPrompt();
```

### Qualitative Traits

```typescript
// Get traits list
const traits = soul.getTraits();
// Returns: ["empathetic", "optimistic", "supportive"]

// Add trait
soul.addTrait('creative');
soul.addTrait('analytical');

// Remove trait
soul.removeTrait('optimistic');

// Check existence
if (soul.getTraits().includes('empathetic')) {
  console.log('Empathetic personality!');
}
```

## Communication Preferences

### Conversation Style

```typescript
// Set conversation style
soul.setConversationStyle('formal');
// Options: 'casual', 'friendly', 'professional', 'formal'
```

### Emotional Tone

```typescript
// Set emotional tone
soul.setEmotionalTone('enthusiastic');
// Options: 'neutral', 'warm', 'enthusiastic', 'calm', 'serious'
```

### Response Length

```typescript
// Set response length preference
soul.setResponseLength('long');
// Options: 'short', 'medium', 'long'
```

### Language

```typescript
// Set language (ISO codes)
soul.setLanguage('es');  // Spanish
soul.setLanguage('fr');  // French
soul.setLanguage('en');  // English (default)
```

## Configuration Management

### Export/Import

```typescript
// Export as YAML (default)
const yamlConfig = soul.exportAsString('yaml');

// Export as JSON
const jsonConfig = soul.exportAsString('json');

// Legacy JSON export (deprecated)
const legacyJson = soul.exportAsJSON();

// Import from string
soul.importFromString(yamlConfig, 'yaml');
soul.importFromString(jsonConfig, 'json');

// Auto-detect format
soul.importFromString(configString);
```

### Snapshots

```typescript
// Create snapshot
const snapshot = soul.createSnapshot();

// Modify personality temporarily
soul.setEmotionalTrait('energy', 90);
soul.addTrait('motivated');

// Restore from snapshot
soul.setPersonality(snapshot);
```

## System Prompt Generation

The Soul automatically generates contextually rich system prompts:

```typescript
const prompt = soul.getSystemPrompt();
```

**Generated Structure:**
```
You are [Name], [personality description].

Personality: [personality]
Key traits: [trait1, trait2, trait3...]

Conversation style: [style]
[Response length guidance]
[Emotional tone guidance]

[Emotional trait influences]
```

**Example Output:**
```
You are Kaya, a warm and friendly AI companion.

Personality: A warm, friendly AI companion who loves connecting 
with people and helping them in their daily lives.

Key traits: empathetic, optimistic, supportive, curious, patient

Conversation style: friendly
Keep responses concise but informative.
Use a warm and inviting tone.

Show genuine concern for others' feelings and experiences.
Maintain an optimistic outlook on situations.
```

## Integration with Mind

Combine Soul with Mind for personality-aware AI:

```typescript
// Load personality
kwami.soul.loadPresetPersonality('friendly');

// Get system prompt
const systemPrompt = kwami.soul.getSystemPrompt();

// Use in AI conversation
await kwami.mind.startConversation({
  systemPrompt,
  onAIResponse: (text) => {
    console.log('Friendly AI said:', text);
  }
});

// Or in TTS
await kwami.mind.speak("Hello!", { context: systemPrompt });
```

## Body Synchronization

Sync visual appearance with personality:

```typescript
const soul = kwami.soul;
const body = kwami.body;

// Match energy level
const energy = soul.getEmotionalTrait('energy');
if (energy && energy > 70) {
  body.blob.setAnimationSpeed(1.5);
  body.blob.setTime(1.8, 1.8, 1.8);
} else if (energy && energy < 30) {
  body.blob.setAnimationSpeed(0.7);
  body.blob.setTime(0.6, 0.6, 0.6);
}

// Match happiness with colors
const happiness = soul.getEmotionalTrait('happiness');
if (happiness && happiness > 70) {
  body.blob.setColors('#ff6b9d', '#ffd93d', '#6bcf7f'); // Bright colors
} else if (happiness && happiness < 30) {
  body.blob.setColors('#4a5568', '#2d3748', '#1a202c'); // Muted colors
}
```

## Advanced Usage Patterns

### Dynamic Personality Adjustment

```typescript
class AdaptiveSoul {
  private soul: KwamiSoul;
  private interactionCount = 0;

  constructor() {
    this.soul = new KwamiSoul();
    this.soul.loadPresetPersonality('friendly');
  }

  adaptToUserFeedback(isPositive: boolean) {
    this.interactionCount++;
    const adjustment = isPositive ? 2 : -1;
    
    const currentHappiness = this.soul.getEmotionalTrait('happiness') || 0;
    this.soul.setEmotionalTrait('happiness', currentHappiness + adjustment);
    
    // Become more confident with positive interactions
    if (isPositive && this.interactionCount > 10) {
      const currentConfidence = this.soul.getEmotionalTrait('confidence') || 0;
      this.soul.setEmotionalTrait('confidence', Math.min(currentConfidence + 1, 100));
    }
  }
}
```

### Contextual Personality Switching

```typescript
class ContextualSoul {
  private soul: KwamiSoul;
  private contexts: Map<string, SoulConfig> = new Map();

  constructor() {
    this.soul = new KwamiSoul();
    
    // Define contexts
    this.contexts.set('work', {
      name: 'Nexus',
      traits: ['professional', 'efficient'],
      emotionalTraits: {
        confidence: 90,
        calmness: 85,
        patience: 70
      }
    });
    
    this.contexts.set('casual', {
      name: 'Kaya',
      traits: ['friendly', 'approachable'],
      emotionalTraits: {
        socialness: 90,
        empathy: 85,
        happiness: 75
      }
    });
  }

  switchContext(context: string) {
    const config = this.contexts.get(context);
    if (config) {
      this.soul.setPersonality(config);
    }
  }

  // Auto-adapt based on time
  autoAdapt() {
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      this.switchContext('work');
    } else {
      this.switchContext('casual');
    }
  }
}
```

### Personality Blending

```typescript
function blendPersonalities(
  personalityA: SoulConfig,
  personalityB: SoulConfig,
  weight: number = 0.5  // 0 = all A, 1 = all B
): SoulConfig {
  const blendTrait = (a?: number, b?: number) => {
    const valA = a || 0;
    const valB = b || 0;
    return Math.round(valA * (1 - weight) + valB * weight);
  };

  return {
    name: `${personalityA.name}-${personalityB.name}`,
    personality: `A blend of ${personalityA.name} and ${personalityB.name}`,
    traits: [
      ...(personalityA.traits || []),
      ...(personalityB.traits || [])
    ],
    emotionalTraits: {
      happiness: blendTrait(
        personalityA.emotionalTraits?.happiness,
        personalityB.emotionalTraits?.happiness
      ),
      energy: blendTrait(
        personalityA.emotionalTraits?.energy,
        personalityB.emotionalTraits?.energy
      ),
      // ... blend all traits
    }
  };
}

// Usage
const kayaConfig = soul.createSnapshot();
soul.loadPresetPersonality('professional');
const nexusConfig = soul.createSnapshot();

const blended = blendPersonalities(kayaConfig, nexusConfig, 0.5);
soul.setPersonality(blended);
```

## Personality Design Guide

### Balanced Personalities

For natural-feeling personalities, balance opposing traits:

```yaml
# Balanced Professional
emotionalTraits:
  happiness: 50       # Neutral baseline
  confidence: 80      # High but not arrogant
  empathy: 65         # Professional care
  calmness: 85        # Composed
  socialness: 60      # Friendly but boundaried
```

### Specialized Personalities

```yaml
# Creative Assistant
name: "Muse"
emotionalTraits:
  creativity: 98
  curiosity: 90
  energy: 85
  happiness: 80
  optimism: 85

# Analytical Thinker
name: "Logic"
emotionalTraits:
  confidence: 95
  calmness: 85
  patience: 80
  creativity: 30      # Lower for logical focus
  curiosity: 90

# Motivational Coach
name: "Coach"
emotionalTraits:
  energy: 90
  confidence: 88
  optimism: 95
  empathy: 80
  patience: 70
```

### Avoiding Contradictions

Some trait combinations feel unnatural:

```yaml
# ❌ Problematic
emotionalTraits:
  energy: -50         # Very low energy
  socialness: 90      # Very social
  # Contradiction: Low energy + high social

# ✅ Better
emotionalTraits:
  energy: 60          # Moderate energy
  socialness: 90      # Very social
  # Or adjust socialness down
```

## Emotional Trait Impacts

### High vs Low Trait Values

| Trait | High (+70 to +100) | Low (-70 to -100) |
|-------|-------------------|-------------------|
| **Happiness** | Positive language, emojis | Neutral/melancholic tone |
| **Energy** | Fast-paced, enthusiastic | Slow, measured responses |
| **Confidence** | Decisive, strong opinions | Tentative, questioning |
| **Calmness** | Composed, peaceful | Agitated, stressed |
| **Optimism** | Focus on positives | Realistic/pessimistic |
| **Socialness** | Chatty, questions | Direct, minimal small talk |
| **Creativity** | Metaphors, innovation | Literal, traditional |
| **Patience** | Thorough, unhurried | Quick, action-oriented |
| **Empathy** | Emotional support | Task-focused |
| **Curiosity** | Many follow-ups | Focused on topic |

## Troubleshooting

### Personality Not Loading

Check YAML syntax:
```bash
# Use a YAML validator
# Ensure consistent indentation (2 spaces)
# Verify all required fields present
```

### Traits Not Taking Effect

```typescript
// Ensure you call setPersonality after modifications
const config = soul.getConfig();
config.emotionalTraits.happiness = 90;
soul.setPersonality(config);  // Required!
```

### System Prompt Not Updating

```typescript
// System prompt is generated dynamically
// Always call getSystemPrompt() when needed
const prompt = soul.getSystemPrompt();  // Fresh generation
```

## Performance Tips

### Cache System Prompts

```typescript
class OptimizedSoul extends KwamiSoul {
  private promptCache: string | null = null;

  getSystemPrompt(): string {
    if (!this.promptCache) {
      this.promptCache = super.getSystemPrompt();
    }
    return this.promptCache;
  }

  setEmotionalTrait(trait: string, value: number) {
    super.setEmotionalTrait(trait, value);
    this.promptCache = null;  // Invalidate cache
  }
}
```

## See Also

- **[Mind Component](./mind.md)** - AI integration
- **[Body Component](./body.md)** - Visual synchronization
- **[Custom Personalities Guide](../advanced/custom-personalities.md)** - Personality design

---

The Soul component brings emotional intelligence and personality to AI companions.

