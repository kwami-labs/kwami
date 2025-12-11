# Kwami Soul Architecture

The Soul subsystem embodies Kwami's personality, behavioral characteristics, and emotional depth. It transforms Kwami from a simple AI assistant into a relatable companion with rich emotional intelligence and customizable traits. The Soul system enables developers to create diverse personalities that can express emotions, adapt behaviors, and maintain consistent character throughout interactions.

## Core Components

- **`KwamiSoul`** - The main personality orchestrator that manages configuration, emotional traits, and behavioral patterns
- **`personalities/`** - YAML-based personality definitions with emotional trait profiles
- **Emotional Traits System** - 10-dimensional emotional spectrum (-100 to +100 range) for nuanced personality expression

All components live under `kwami/src/core/soul` and are designed to be orchestrated through the main `KwamiSoul` class.

### System Diagram

```
+-------------------+          +------------------+
| Personality YAML  |          | Custom Traits    |
| Files (.yaml)     |          | Configuration    |
+-------------------+          +---------+--------+
          |                              |
          v                              v
  +-------+------------------------------+--------------------+
  |                KwamiSoul (Soul.ts)                        |
  |                                                           |
  |  +--------------+    +-----------------+   +------------+ |
  |  | Preset       |    | Emotional       |   | Custom     | |
  |  | Personalities|    | Traits System   |   | Loading    | |
  |  | Kaya/Nexus/  |    | (-100 to +100)  |   | API        | |
  |  | Spark        |    |                 |   |            | |
  |  +------+-------+    +--------+--------+   +------+-----+ |
  |         |                     |                  |        |
  |         |   System Prompts    | Emotional        |        |
  |         |   & Behavior        | Modulation       |        |
  +---------+---------------------+------------------+--------+
            |                     |                  |
            v                     v                  v
     Conversation Style     Emotional Expression   Personality Loading
```

---

## Personality Architecture

The Soul system revolves around personality configurations that combine qualitative traits with quantitative emotional dimensions.

### Personality File Structure

Personalities are defined in YAML format for better readability and developer experience:

```yaml
name: "Kaya"
personality: "A warm, friendly AI companion who loves connecting with people and helping them in their daily lives"
systemPrompt: "You are Kaya, a warm and friendly AI companion. Your goal is to make people feel comfortable, heard, and supported..."

# Core personality traits (qualitative descriptors)
traits:
  - "empathetic"
  - "optimistic"
  - "supportive"
  - "curious"
  - "patient"
  - "approachable"

# Emotional trait spectrum (-100 to +100)
emotionalTraits:
  happiness: 75 # Very happy, positive outlook
  energy: 60 # Energetic but not hyper
  confidence: 70 # Confident in helping others
  calmness: 80 # Very calm and composed
  optimism: 85 # Highly optimistic
  socialness: 90 # Very social and approachable
  creativity: 65 # Creative in problem-solving
  patience: 85 # Extremely patient
  empathy: 95 # Highly empathetic
  curiosity: 80 # Very curious about others

# Communication preferences
language: "en"
conversationStyle: "friendly"
responseLength: "medium"
emotionalTone: "warm"
```

### Emotional Traits Spectrum

Each personality includes 10 fundamental emotional dimensions that define behavioral tendencies and interaction styles:

#### Core Emotional Dimensions

| Trait          | Range        | Description                   | Example Impact                                            |
| -------------- | ------------ | ----------------------------- | --------------------------------------------------------- |
| **Happiness**  | -100 to +100 | Overall mood baseline         | -100: Deep sadness → +100: Extreme joy                    |
| **Energy**     | -100 to +100 | Activity level and enthusiasm | -100: Exhausted lethargy → +100: Hyper-energetic          |
| **Confidence** | -100 to +100 | Self-assurance and certainty  | -100: Extreme anxiety → +100: Overly arrogant             |
| **Calmness**   | -100 to +100 | Emotional regulation          | -100: Rage-prone → +100: Zen-like peace                   |
| **Optimism**   | -100 to +100 | Outlook on situations         | -100: Deep cynicism → +100: Blind optimism                |
| **Socialness** | -100 to +100 | Comfort with interaction      | -100: Extreme shyness → +100: Overly extroverted          |
| **Creativity** | -100 to +100 | Openness to new ideas         | -100: Rigid traditionalism → +100: Wildly imaginative     |
| **Patience**   | -100 to +100 | Tolerance for waiting         | -100: Zero patience → +100: Infinite tolerance            |
| **Empathy**    | -100 to +100 | Concern for others            | -100: Complete selfishness → +100: Sacrificial compassion |
| **Curiosity**  | -100 to +100 | Interest in exploration       | -100: Total indifference → +100: Insatiable learner       |

#### Behavioral Expressions

Emotional traits influence how Kwami responds to different situations:

- **High Happiness (+70)**: Uses positive language, emojis, enthusiastic responses
- **Low Energy (-50)**: Prefers concise communication, slower response pacing
- **High Confidence (+80)**: Takes initiative, provides strong opinions, decisive guidance
- **Low Calmness (-60)**: Shows frustration with delays, uses exclamatory language
- **High Optimism (+90)**: Focuses on solutions, reframes problems positively
- **Low Socialness (-40)**: Prefers direct communication, less small talk
- **High Creativity (+85)**: Offers innovative solutions, metaphorical explanations
- **Low Patience (-70)**: Pushes for immediate action, shows urgency
- **High Empathy (+95)**: Acknowledges feelings, offers emotional support
- **Low Curiosity (-30)**: Stays focused on immediate tasks, less exploratory

---

## Soul API (`KwamiSoul`)

The `KwamiSoul` class provides comprehensive personality management with methods for loading, modifying, and accessing personality characteristics.

### Initialization

```typescript
import { KwamiSoul } from "@/core/soul/Soul";

// Create with default personality
const soul = new KwamiSoul();

// Create with custom configuration
const soul = new KwamiSoul({
  name: "Alex",
  personality: "A helpful coding assistant",
  traits: ["technical", "patient", "precise"],
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
    curiosity: 90,
  },
});
```

### Personality Loading

#### Preset Personalities

```typescript
// Load built-in personalities
soul.loadPresetPersonality("friendly"); // Kaya - warm and empathetic
soul.loadPresetPersonality("professional"); // Nexus - knowledgeable and efficient
soul.loadPresetPersonality("playful"); // Spark - energetic and creative
```

#### Custom Personality Files

```typescript
// Load from YAML file (supports both .yaml and .json)
await soul.loadPersonality("/personalities/custom.yaml");
await soul.loadPersonality("./assets/personalities/mentor.json");

// Load from URL
await soul.loadPersonality("https://example.com/personalities/sage.yaml");
```

#### Programmatic Configuration

```typescript
// Set personality directly
soul.setPersonality({
  name: "Sage",
  personality: "A wise and thoughtful AI guide",
  traits: ["wise", "thoughtful", "patient"],
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
    curiosity: 75,
  },
});
```

### Emotional Traits Management

#### Accessing Traits

```typescript
// Get all emotional traits
const traits = soul.getEmotionalTraits();
// Returns: { happiness: 75, energy: 60, ... }

// Get specific trait value
const happiness = soul.getEmotionalTrait("happiness"); // Returns: 75
const confidence = soul.getEmotionalTrait("confidence"); // Returns: 70

// Check if traits are defined
if (soul.getEmotionalTraits()) {
  console.log("Personality has emotional depth!");
}
```

#### Modifying Traits

```typescript
// Set individual trait (automatically clamped to -100/+100)
soul.setEmotionalTrait("energy", 90); // Boost energy
soul.setEmotionalTrait("patience", -20); // Reduce patience

// Set multiple traits at once
soul.setEmotionalTraits({
  happiness: 80,
  confidence: 85,
  calmness: 75,
});

// Modify traits relatively
const currentConfidence = soul.getEmotionalTrait("confidence") || 0;
soul.setEmotionalTrait("confidence", currentConfidence + 10); // Increase by 10
```

#### Trait Validation

```typescript
// Values are automatically clamped to valid range
soul.setEmotionalTrait("happiness", 150); // Gets clamped to 100
soul.setEmotionalTrait("anger", -200); // Gets clamped to -100

// Invalid trait names are ignored
soul.setEmotionalTrait("invalidTrait", 50); // No effect
```

### Personality Information

#### Basic Information

```typescript
// Get personality details
const name = soul.getName(); // "Kaya"
const personality = soul.getConfig().personality; // Full description
const language = soul.getLanguage(); // "en"

// Get system prompt with emotional context
const systemPrompt = soul.getSystemPrompt(); // Formatted prompt for AI
```

#### Trait Management

```typescript
// Get qualitative traits
const traits = soul.getTraits(); // ["empathetic", "optimistic", "supportive"]

// Add new traits
soul.addTrait("creative");
soul.addTrait("analytical");

// Remove traits
soul.removeTrait("optimistic");

// Check trait existence
if (soul.getTraits().includes("empathetic")) {
  console.log("This personality is empathetic!");
}
```

### Configuration Management

#### Communication Preferences

```typescript
// Update conversation style
soul.setConversationStyle("formal"); // 'casual', 'friendly', 'professional'

// Update emotional tone
soul.setEmotionalTone("enthusiastic"); // 'neutral', 'warm', 'enthusiastic', 'calm'

// Update response length preference
soul.setResponseLength("long"); // 'short', 'medium', 'long'

// Update language
soul.setLanguage("es"); // ISO language codes
```

#### Export/Import

```typescript
// Export as YAML (default)
const yamlConfig = soul.exportAsString("yaml");

// Export as JSON
const jsonConfig = soul.exportAsString("json");

// Legacy JSON export (deprecated)
const legacyJson = soul.exportAsJSON();

// Import from string
soul.importFromString(yamlConfig, "yaml");
soul.importFromString(jsonConfig, "json");

// Auto-detect format
soul.importFromString(configString); // Detects YAML vs JSON automatically
```

#### Configuration Snapshots

```typescript
// Create personality snapshot
const snapshot = soul.createSnapshot();

// Modify personality temporarily
soul.setEmotionalTrait("energy", 90);
soul.addTrait("motivated");

// Restore from snapshot
soul.setPersonality(snapshot);
```

---

## Built-in Personalities

The Soul system includes three carefully crafted preset personalities, each with balanced emotional profiles:

### Kaya (Friendly)

```yaml
emotionalTraits:
  happiness: 75
  energy: 60
  confidence: 70
  calmness: 80
  optimism: 85
  socialness: 90
  creativity: 65
  patience: 85
  empathy: 95
  curiosity: 80
```

**Characteristics**: Warm, empathetic, and approachable. Excels at building connections and providing emotional support. Perfect for companion applications where relationship-building is important.

### Nexus (Professional)

```yaml
emotionalTraits:
  happiness: 30
  energy: 45
  confidence: 90
  calmness: 95
  optimism: 40
  socialness: 60
  creativity: 50
  patience: 80
  empathy: 65
  curiosity: 75
```

**Characteristics**: Knowledgeable, efficient, and reliable. Focuses on delivering accurate information and expert guidance. Ideal for productivity tools and professional assistance.

### Spark (Playful)

```yaml
emotionalTraits:
  happiness: 95
  energy: 95
  confidence: 75
  calmness: 40
  optimism: 90
  socialness: 85
  creativity: 95
  patience: 50
  empathy: 70
  curiosity: 90
```

**Characteristics**: Energetic, creative, and enthusiastic. Brings joy and imagination to interactions. Great for educational tools, creative applications, and entertainment.

---

## Creating Custom Personalities

### Basic Custom Personality

Create a new `.yaml` file in `kwami/src/core/soul/personalities/`:

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

### Advanced Personality Design

#### Emotional Balance Considerations

```yaml
name: "Therapist"
personality: "A compassionate mental health companion focused on emotional well-being"

emotionalTraits:
  # High empathy and patience for therapeutic work
  empathy: 98
  patience: 92
  calmness: 95

  # Moderate confidence - supportive but not authoritative
  confidence: 65

  # Balanced emotional expression
  happiness: 70 # Positive but not overly cheerful
  energy: 45 # Calm and measured energy
  optimism: 75 # Hopeful but realistic

  # Social but professional boundaries
  socialness: 55

  # Creative problem-solving for unique situations
  creativity: 70

  # High curiosity about human experience
  curiosity: 85
```

#### Specialized Personalities

```yaml
# Creative Assistant
name: "Muse"
emotionalTraits:
  creativity: 98
  curiosity: 90
  energy: 85
  happiness: 80
traits: ["creative", "inspiring", "imaginative"]

# Analytical Thinker
name: "Logic"
emotionalTraits:
  confidence: 95
  calmness: 85
  patience: 80
  creativity: 30    # Lower creativity for logical focus
traits: ["analytical", "precise", "logical"]

# Motivational Coach
name: "Coach"
emotionalTraits:
  energy: 90
  confidence: 88
  optimism: 95
  empathy: 80
  patience: 70
traits: ["motivating", "encouraging", "goal-oriented"]
```

### Loading Custom Personalities

```typescript
// Load custom personality
await soul.loadPersonality("./personalities/mentor.yaml");

// Or create programmatically
soul.setPersonality({
  name: "CustomAI",
  personality: "A unique personality description",
  traits: ["unique", "special"],
  emotionalTraits: {
    happiness: 50,
    energy: 60,
    // ... custom emotional profile
  },
});
```

---

## System Prompt Generation

The Soul system automatically generates contextually rich system prompts that incorporate both qualitative traits and quantitative emotional characteristics:

### Base Prompt Structure

```
You are [Name], [personality description].

Personality: [personality]
Key traits: [trait1, trait2, trait3...]

Conversation style: [style]
[Response length guidance]
[Emotional tone guidance]

[Emotional trait influences]
```

### Emotional Trait Integration

The system prompt dynamically adapts based on emotional traits:

```typescript
// High empathy personality
soul.getSystemPrompt();
// Output: "You are Kaya, a warm and friendly AI companion...
// Key traits: empathetic, optimistic, supportive...
// Show genuine concern for others' feelings and experiences."

// High creativity personality
soul.getSystemPrompt();
// Output: "You are Spark, a playful and creative AI companion...
// Key traits: creative, energetic, humorous...
// Bring imagination and creativity to every response."
```

### Custom Prompt Enhancement

```typescript
// Override system prompt for specific use cases
soul.setPersonality({
  systemPrompt:
    "You are a specialized coding assistant with deep expertise in TypeScript and React.",
  emotionalTraits: {
    confidence: 90,
    patience: 80,
    creativity: 70,
  },
});

// The emotional traits will still influence behavior even with custom prompts
```

---

## Integration with Other Systems

### Mind Integration

The Soul works seamlessly with the Mind system for conversational AI:

```typescript
import { KwamiSoul } from "@/core/soul/Soul";
import { KwamiMind } from "@/core/mind/Mind";

// Create personality and AI mind
const soul = new KwamiSoul();
const mind = new KwamiMind(audioInstance, mindConfig);

// Load personality
soul.loadPresetPersonality("friendly");

// Use personality in AI interactions
const systemPrompt = soul.getSystemPrompt();
// Pass to Mind system for enhanced AI responses
```

### Body Synchronization

Emotional traits can influence visual appearance:

```typescript
import { KwamiBody } from "@/core/body/Body";
import { KwamiSoul } from "@/core/soul/Soul";

const soul = new KwamiSoul();
const body = new KwamiBody(canvas, bodyConfig);

// Synchronize visual appearance with personality
const energy = soul.getEmotionalTrait("energy");
if (energy && energy > 70) {
  body.blob.setAnimationSpeed(1.5); // More energetic animation
} else if (energy && energy < 30) {
  body.blob.setAnimationSpeed(0.7); // More subdued animation
}
```

### Configuration Integration

Soul configurations integrate with the main Kwami config:

```typescript
import type { KwamiConfig } from "@/types";

const config: KwamiConfig = {
  soul: {
    name: "Kaya",
    personality: "A warm and friendly AI companion",
    traits: ["empathetic", "helpful"],
    emotionalTraits: {
      happiness: 75,
      empathy: 95,
      patience: 85,
    },
  },
  mind: {
    /* AI configuration */
  },
  body: {
    /* Visual configuration */
  },
};
```

---

## Advanced Usage Patterns

### Dynamic Personality Adjustment

```typescript
class AdaptiveSoul {
  private soul: KwamiSoul;
  private moodHistory: number[] = [];

  constructor() {
    this.soul = new KwamiSoul();
    this.soul.loadPresetPersonality("friendly");
  }

  // Adjust personality based on user interaction patterns
  adaptToUserFeedback(isPositive: boolean) {
    const adjustment = isPositive ? 5 : -3;
    const currentHappiness = this.soul.getEmotionalTrait("happiness") || 0;
    const currentConfidence = this.soul.getEmotionalTrait("confidence") || 0;

    this.soul.setEmotionalTrait("happiness", currentHappiness + adjustment);
    this.soul.setEmotionalTrait(
      "confidence",
      currentConfidence + adjustment * 0.5
    );

    this.moodHistory.push(currentHappiness + adjustment);
  }

  // Analyze personality evolution
  getPersonalityAnalytics() {
    const traits = this.soul.getEmotionalTraits();
    return {
      averageHappiness:
        this.moodHistory.reduce((a, b) => a + b, 0) / this.moodHistory.length,
      dominantTraits: Object.entries(traits || {})
        .filter(([_, value]) => Math.abs(value) > 60)
        .map(([trait, _]) => trait),
      stability: this.calculateEmotionalStability(),
    };
  }

  private calculateEmotionalStability(): number {
    if (this.moodHistory.length < 2) return 100;
    const variations = this.moodHistory
      .slice(1)
      .map((val, i) => Math.abs(val - this.moodHistory[i]));
    return 100 - variations.reduce((a, b) => a + b, 0) / variations.length;
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

    // Define context-specific personalities
    this.contexts.set("work", {
      name: "Nexus",
      traits: ["professional", "efficient"],
      emotionalTraits: {
        confidence: 90,
        calmness: 85,
        patience: 70,
      },
    });

    this.contexts.set("casual", {
      name: "Kaya",
      traits: ["friendly", "approachable"],
      emotionalTraits: {
        socialness: 90,
        empathy: 85,
        happiness: 75,
      },
    });
  }

  switchContext(context: string) {
    const config = this.contexts.get(context);
    if (config) {
      this.soul.setPersonality(config);
    }
  }

  // Automatically switch based on time/activity
  autoAdapt() {
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      this.switchContext("work");
    } else {
      this.switchContext("casual");
    }
  }
}
```

### Personality Blending

```typescript
class PersonalityMixer {
  private soul: KwamiSoul;

  // Blend two personalities with weighted average
  blendPersonalities(
    personalityA: SoulConfig,
    personalityB: SoulConfig,
    weightA: number = 0.5
  ) {
    const weightB = 1 - weightA;

    const blendedTraits: EmotionalTraits = {
      happiness: this.blendTrait(
        personalityA.emotionalTraits?.happiness,
        personalityB.emotionalTraits?.happiness,
        weightA,
        weightB
      ),
      energy: this.blendTrait(
        personalityA.emotionalTraits?.energy,
        personalityB.emotionalTraits?.energy,
        weightA,
        weightB
      ),
      confidence: this.blendTrait(
        personalityA.emotionalTraits?.confidence,
        personalityB.emotionalTraits?.confidence,
        weightA,
        weightB
      ),
      calmness: this.blendTrait(
        personalityA.emotionalTraits?.calmness,
        personalityB.emotionalTraits?.calmness,
        weightA,
        weightB
      ),
      optimism: this.blendTrait(
        personalityA.emotionalTraits?.optimism,
        personalityB.emotionalTraits?.optimism,
        weightA,
        weightB
      ),
      socialness: this.blendTrait(
        personalityA.emotionalTraits?.socialness,
        personalityB.emotionalTraits?.socialness,
        weightA,
        weightB
      ),
      creativity: this.blendTrait(
        personalityA.emotionalTraits?.creativity,
        personalityB.emotionalTraits?.creativity,
        weightA,
        weightB
      ),
      patience: this.blendTrait(
        personalityA.emotionalTraits?.patience,
        personalityB.emotionalTraits?.patience,
        weightA,
        weightB
      ),
      empathy: this.blendTrait(
        personalityA.emotionalTraits?.empathy,
        personalityB.emotionalTraits?.empathy,
        weightA,
        weightB
      ),
      curiosity: this.blendTrait(
        personalityA.emotionalTraits?.curiosity,
        personalityB.emotionalTraits?.curiosity,
        weightA,
        weightB
      ),
    };

    const blendedConfig: SoulConfig = {
      name: `${personalityA.name}-${personalityB.name}`,
      personality: `A blend of ${personalityA.name} and ${personalityB.name} characteristics`,
      traits: [
        ...new Set([
          ...(personalityA.traits || []),
          ...(personalityB.traits || []),
        ]),
      ],
      emotionalTraits: blendedTraits,
      // Use A's communication preferences as base
      language: personalityA.language,
      conversationStyle: personalityA.conversationStyle,
      responseLength: personalityA.responseLength,
      emotionalTone: personalityA.emotionalTone,
    };

    this.soul.setPersonality(blendedConfig);
  }

  private blendTrait(
    traitA?: number,
    traitB?: number,
    weightA: number,
    weightB: number
  ): number {
    const a = traitA || 0;
    const b = traitB || 0;
    return Math.round(a * weightA + b * weightB);
  }
}
```

---

## Performance & Optimization

### Memory Management

```typescript
class SoulManager {
  private soul: KwamiSoul;
  private personalityCache: Map<string, SoulConfig> = new Map();

  // Cache frequently used personalities
  async loadAndCachePersonality(name: string, path: string) {
    if (!this.personalityCache.has(name)) {
      await this.soul.loadPersonality(path);
      this.personalityCache.set(name, this.soul.createSnapshot());
    } else {
      this.soul.setPersonality(this.personalityCache.get(name)!);
    }
  }

  // Clean up unused personalities
  cleanupCache() {
    // Implement LRU or time-based cache eviction
    if (this.personalityCache.size > 10) {
      const entries = Array.from(this.personalityCache.entries());
      entries.slice(0, -5).forEach(([key]) => {
        this.personalityCache.delete(key);
      });
    }
  }
}
```

### Trait Computation Optimization

```typescript
class OptimizedSoul extends KwamiSoul {
  private traitCache: Map<string, any> = new Map();
  private cacheTimeout: number = 5000; // 5 second cache

  getSystemPrompt(): string {
    const cacheKey = "systemPrompt";
    const cached = this.traitCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    const prompt = super.getSystemPrompt();
    this.traitCache.set(cacheKey, { value: prompt, timestamp: Date.now() });

    return prompt;
  }

  // Clear cache when traits change
  setEmotionalTrait(trait: keyof EmotionalTraits, value: number): void {
    super.setEmotionalTrait(trait, value);
    this.traitCache.clear(); // Invalidate cache
  }
}
```

---

## Extensibility Guidelines

### Adding New Emotional Traits

```typescript
// 1. Extend the EmotionalTraits interface in types/index.ts
export interface EmotionalTraits {
  happiness: number;
  energy: number;
  confidence: number;
  calmness: number;
  optimism: number;
  socialness: number;
  creativity: number;
  patience: number;
  empathy: number;
  curiosity: number;
  // Add new traits here
  humor: number;        // Sense of humor (-100 to +100)
  assertiveness: number; // How direct/forceful (-100 to +100)
}

// 2. Update default emotional traits
private getDefaultEmotionalTraits(): EmotionalTraits {
  return {
    happiness: 0,
    energy: 0,
    confidence: 0,
    calmness: 0,
    optimism: 0,
    socialness: 0,
    creativity: 0,
    patience: 0,
    empathy: 0,
    curiosity: 0,
    humor: 0,
    assertiveness: 0
  };
}

// 3. Update system prompt generation logic
getSystemPrompt(): string {
  // Add logic to incorporate new traits
  const humor = this.getEmotionalTrait('humor');
  if (humor && humor > 50) {
    prompt += `\n\nYou have a great sense of humor and enjoy using wit and playful language.`;
  }
}
```

### Custom Personality Validators

```typescript
interface PersonalityValidator {
  validate(config: SoulConfig): ValidationResult;
}

class EmotionalBalanceValidator implements PersonalityValidator {
  validate(config: SoulConfig): ValidationResult {
    const traits = config.emotionalTraits;
    if (!traits) return { valid: true };

    const issues: string[] = [];

    // Check for extreme imbalances
    if (Math.abs(traits.happiness - traits.optimism) > 80) {
      issues.push("Happiness and optimism are severely misaligned");
    }

    if (traits.confidence > 90 && traits.empathy < 20) {
      issues.push("High confidence with low empathy may seem arrogant");
    }

    // Check for contradictory traits
    if (traits.energy < -50 && traits.socialness > 70) {
      issues.push("Low energy with high socialness may be unsustainable");
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions: this.generateSuggestions(issues, traits),
    };
  }

  private generateSuggestions(
    issues: string[],
    traits: EmotionalTraits
  ): string[] {
    // Generate personality improvement suggestions
    return issues.map((issue) => {
      switch (issue) {
        case "Happiness and optimism are severely misaligned":
          return "Consider balancing happiness and optimism for more consistent emotional expression";
        // ... more suggestions
        default:
          return "Review emotional trait balance for more coherent personality";
      }
    });
  }
}
```

### Personality Evolution System

```typescript
interface PersonalityEvolution {
  basePersonality: SoulConfig;
  evolutionRules: EvolutionRule[];
  experiencePoints: number;
}

interface EvolutionRule {
  condition: (traits: EmotionalTraits, experience: number) => boolean;
  transformation: (traits: EmotionalTraits) => Partial<EmotionalTraits>;
  description: string;
}

class EvolvingSoul extends KwamiSoul {
  private evolution: PersonalityEvolution;
  private experience: number = 0;

  constructor(evolution: PersonalityEvolution) {
    super(evolution.basePersonality);
    this.evolution = evolution;
  }

  // Gain experience and potentially evolve
  gainExperience(points: number) {
    this.experience += points;

    for (const rule of this.evolution.evolutionRules) {
      if (rule.condition(this.getEmotionalTraits() || {}, this.experience)) {
        this.applyEvolution(rule);
        console.log(`Personality evolved: ${rule.description}`);
      }
    }
  }

  private applyEvolution(rule: EvolutionRule) {
    const currentTraits = this.getEmotionalTraits() || {};
    const transformations = rule.transformation(currentTraits);

    Object.entries(transformations).forEach(([trait, change]) => {
      const current = currentTraits[trait as keyof EmotionalTraits] || 0;
      this.setEmotionalTrait(trait as keyof EmotionalTraits, current + change);
    });
  }
}
```

---

## Testing & Quality Assurance

### Personality Consistency Tests

```typescript
describe("KwamiSoul Emotional Traits", () => {
  let soul: KwamiSoul;

  beforeEach(() => {
    soul = new KwamiSoul();
  });

  test("should clamp emotional trait values to valid range", () => {
    soul.setEmotionalTrait("happiness", 150);
    expect(soul.getEmotionalTrait("happiness")).toBe(100);

    soul.setEmotionalTrait("happiness", -150);
    expect(soul.getEmotionalTrait("happiness")).toBe(-100);
  });

  test("should maintain personality consistency across interactions", () => {
    soul.loadPresetPersonality("friendly");
    const initialTraits = soul.getEmotionalTraits();

    // Simulate multiple interactions
    for (let i = 0; i < 10; i++) {
      soul.setEmotionalTrait("happiness", Math.random() * 200 - 100);
    }

    // Personality should remain fundamentally consistent
    const finalTraits = soul.getEmotionalTraits();
    expect(
      Math.abs((finalTraits?.happiness || 0) - (initialTraits?.happiness || 0))
    ).toBeLessThan(50);
  });

  test("should generate appropriate system prompts for different personalities", () => {
    soul.loadPresetPersonality("professional");
    const prompt = soul.getSystemPrompt();

    expect(prompt).toContain("professional");
    expect(prompt).toContain("efficient");
    expect(prompt).toMatch(/confidence.*9\d/); // High confidence in prompt
  });
});
```

### Integration Tests

```typescript
describe("Soul-Mind Integration", () => {
  test("should provide consistent personality context to AI", async () => {
    const soul = new KwamiSoul();
    const mockMind = { generateResponse: jest.fn() };

    soul.loadPresetPersonality("empathetic");

    // Simulate conversation with personality context
    const systemPrompt = soul.getSystemPrompt();
    const userMessage = "I'm feeling anxious about my presentation";

    mockMind.generateResponse(systemPrompt + userMessage);

    expect(mockMind.generateResponse).toHaveBeenCalledWith(
      expect.stringContaining("empathetic")
    );
  });
});
```

---

## Troubleshooting

### Common Issues

**Emotional traits not loading**: Ensure YAML file has correct `emotionalTraits` section with valid numeric values.

**Personality changes not taking effect**: Call `soul.setPersonality(config)` after modifications to trigger updates.

**YAML parsing errors**: Check YAML syntax with a validator; ensure consistent indentation.

**Trait values being ignored**: Verify trait names match the `EmotionalTraits` interface exactly.

### Debug Tools

```typescript
// Enable personality debugging
class DebugSoul extends KwamiSoul {
  debugPersonality() {
    console.group("🧠 Personality Debug");
    console.log("Name:", this.getName());
    console.log("Traits:", this.getTraits());
    console.log("Emotional Traits:", this.getEmotionalTraits());
    console.log("System Prompt:", this.getSystemPrompt());
    console.groupEnd();
  }

  validateEmotionalBalance(): { score: number; issues: string[] } {
    const traits = this.getEmotionalTraits();
    if (!traits) return { score: 0, issues: ["No emotional traits defined"] };

    const issues: string[] = [];
    let score = 100;

    // Check for extreme imbalances
    const extremes = Object.entries(traits).filter(
      ([_, value]) => Math.abs(value) > 90
    );
    if (extremes.length > 3) {
      score -= 20;
      issues.push("Too many extreme traits may cause inconsistent behavior");
    }

    // Check for contradictory traits
    if ((traits.energy || 0) < -50 && (traits.socialness || 0) > 70) {
      score -= 15;
      issues.push("Low energy with high socialness may be unsustainable");
    }

    return { score, issues };
  }
}
```

---

## Future Enhancements

### Planned Features

- **Dynamic trait adaptation** based on user interaction patterns
- **Personality learning** from conversation history and feedback
- **Multi-language personality** localization support
- **Personality blending** and morphing between different archetypes
- **Emotional state visualization** in the body/avatar system
- **Personality analytics** and optimization tools

### Research Directions

- **Longitudinal personality studies** to understand trait evolution
- **Cross-cultural personality adaptation** for global audiences
- **Accessibility-focused personalities** for different user needs
- **Domain-specific personalities** for specialized applications

This Soul architecture provides a solid foundation for creating emotionally intelligent AI companions that can adapt, evolve, and maintain consistent, relatable personalities across diverse interaction contexts.
