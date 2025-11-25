# Kwami Action System - Architecture

## Design Philosophy

The Action System embodies professional software architecture principles:

1. **Separation of Concerns**: Actions are separate from Skills (which handle animations)
2. **Single Responsibility**: Each action has one clear purpose
3. **Open/Closed Principle**: Open for extension, closed for modification
4. **Interface Segregation**: Clear, focused interfaces
5. **Dependency Inversion**: Depends on abstractions, not implementations

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Context Menu UI (ContextMenu.ts)            │   │
│  │  • Glassmorphic design                              │   │
│  │  • Smart positioning                                │   │
│  │  • Grouped actions                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     INTEGRATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      Body Integration (Body.ts)                     │   │
│  │  • Right-click handler                              │   │
│  │  • Action execution bridge                          │   │
│  │  • Kwami instance reference                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        ActionManager (ActionManager.ts)             │   │
│  │  • Action registry                                  │   │
│  │  • Execution engine                                 │   │
│  │  • Validation                                       │   │
│  │  • History tracking                                 │   │
│  │  • Statistics                                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Type Definitions (types.ts)               │   │
│  │  • Action definitions                               │   │
│  │  • Execution context                                │   │
│  │  • Results & errors                                 │   │
│  │  • MCP integration                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONFIGURATION LAYER                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Action Definitions (JSON/YAML)              │   │
│  │  • Built-in actions                                 │   │
│  │  • User-defined actions                             │   │
│  │  • Example templates                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Diagram

```
┌────────────────────────────────────────────────────────┐
│                  Kwami (Main Class)                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│  │   body   │   │   mind   │   │   soul   │          │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘          │
│       │              │              │                 │
│       │              │         ┌────▼────────┐        │
│       │              │         │   actions   │        │
│       │              │         │ (ActionMgr) │        │
│       │              │         └─────────────┘        │
│       │              │              │                 │
│  ┌────▼──────────────▼──────────────▼───────────┐    │
│  │         Action Execution Flow                 │    │
│  │  1. Trigger (right-click/API/etc)             │    │
│  │  2. Validate parameters                       │    │
│  │  3. Check permissions                         │    │
│  │  4. Execute handler                           │    │
│  │  5. Update statistics                         │    │
│  │  6. Return result                             │    │
│  └───────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

## Data Flow

### Action Registration

```
User/System
    │
    ▼
registerAction(definition)
    │
    ▼
Validate definition
    │
    ▼
Create registry entry
    │
    ▼
Store in Map<id, entry>
    │
    ▼
Log registration
```

### Action Execution

```
Trigger (Context Menu / API / Event)
    │
    ▼
executeAction(id, options)
    │
    ▼
Lookup action in registry
    │
    ▼
Check if enabled
    │
    ▼
Validate parameters
    │
    ▼
Check confirmation (if required)
    │
    ▼
Resolve handler function
    │
    ▼
Build execution context
    │
    ▼
Execute handler (with timeout)
    │
    ├──► Success
    │    │
    │    ▼
    │    Update statistics
    │    │
    │    ▼
    │    Add to history
    │    │
    │    ▼
    │    Return result
    │
    └──► Error
         │
         ▼
         Log error
         │
         ▼
         Add to history
         │
         ▼
         Return error result
```

## Type Hierarchy

```
ActionDefinition (base)
    ├─ BodyActionDefinition
    │  └─ bodyAction: { type, target }
    │
    ├─ MindActionDefinition
    │  └─ mindAction: { type, provider }
    │
    ├─ SoulActionDefinition
    │  └─ soulAction: { type }
    │
    ├─ IntegrationActionDefinition
    │  └─ integration: { service, type, auth }
    │
    └─ SystemActionDefinition
       └─ systemAction: { type }

ActionHandler
    ├─ Built-in handlers (string reference)
    │  └─ Resolved from ActionManager
    │
    └─ Custom handlers (function)
       └─ User-provided implementation

ActionContext
    ├─ timestamp
    ├─ trigger
    ├─ user
    ├─ environment
    ├─ session
    └─ params

ActionResult
    ├─ success
    ├─ actionId
    ├─ executionTime
    ├─ data (optional)
    └─ error (optional)
```

## State Management

```
ActionManager State:
┌─────────────────────────────────────┐
│  registry: Map<id, RegistryEntry>   │
│  ├─ definition                      │
│  ├─ source                          │
│  ├─ loadedAt                        │
│  ├─ executionCount                  │
│  ├─ lastExecuted                    │
│  └─ averageExecutionTime            │
├─────────────────────────────────────┤
│  executionHistory: Array            │
│  ├─ actionId                        │
│  ├─ timestamp                       │
│  └─ result                          │
├─────────────────────────────────────┤
│  maxHistorySize: 100                │
└─────────────────────────────────────┘
```

## Extension Points

### 1. Custom Action Categories

Extend `ActionCategory` type:

```typescript
export type ActionCategory = 
  | 'body'
  | 'mind'
  | 'soul'
  | 'integration'
  | 'system'
  | 'custom-category'; // Add your category
```

### 2. Custom Handlers

Add to `getBuiltInHandler()`:

```typescript
private getBuiltInHandler(name: string): ActionHandler | undefined {
  const handlers: Record<string, ActionHandler> = {
    'my.custom.handler': async (context, params) => {
      // Implementation
    },
  };
  return handlers[name];
}
```

### 3. Custom Triggers

Extend `ActionTrigger` type:

```typescript
export type ActionTrigger = 
  | 'context-menu'
  | 'keyboard'
  | 'voice-command'
  | 'api'
  | 'ai-decision'
  | 'time-based'
  | 'event'
  | 'manual'
  | 'custom-trigger'; // Add your trigger
```

### 4. Custom Validation

Override validation in `validateParameters()`:

```typescript
private validateParameters(
  parameterDefs: any[],
  params: Record<string, any>
): string | null {
  // Add custom validation logic
}
```

## Security Considerations

### 1. Permission System

```typescript
export interface ActionPermission {
  level: 'public' | 'user' | 'admin' | 'system';
  scopes?: string[];
  requiresConsent?: boolean;
}
```

### 2. Confirmation Dialogs

```typescript
confirmation: {
  required: true,
  message: 'Are you sure?'
}
```

### 3. Timeout Protection

```typescript
timeout: 30000, // 30 seconds max
```

### 4. Retry Policy

```typescript
retryPolicy: {
  maxAttempts: 3,
  delayMs: 1000
}
```

## Performance Optimizations

### 1. Registry as Map

- O(1) lookup time
- Efficient for large action collections

### 2. Lazy Loading

- Actions loaded on-demand from URLs
- Not all actions need to be in memory

### 3. History Limit

- Max 100 entries by default
- Prevents memory growth

### 4. Handler Caching

- Built-in handlers cached
- No repeated lookups

## Testing Strategy

### 1. Unit Tests

- ActionManager methods
- Handler execution
- Validation logic
- Error handling

### 2. Integration Tests

- Full action execution flow
- Context menu interaction
- Configuration loading

### 3. E2E Tests

- User workflows
- Right-click → select → execute
- Error recovery

## Future Enhancements

### 1. Action Marketplace

- Share actions with community
- Version management
- Dependency resolution

### 2. Visual Action Builder

- Drag-and-drop interface
- No-code action creation
- Preview before save

### 3. Action Analytics

- Usage tracking
- Performance metrics
- User preferences

### 4. AI Action Generation

- Generate actions from natural language
- Auto-suggest relevant actions
- Learn from user behavior

### 5. Action Chaining

- Execute multiple actions in sequence
- Conditional execution
- Loop support

### 6. Remote Actions

- Execute actions on remote Kwami instances
- Distributed action execution
- Real-time sync

## Comparison with Skills System

| Feature | Actions | Skills |
|---------|---------|--------|
| Purpose | Single operations | Complex sequences |
| Configuration | JSON/YAML | JSON/YAML |
| Execution | Immediate | Animated over time |
| Target | State changes | Visual animations |
| Complexity | Simple | Complex |
| Context Menu | Yes | No |
| MCP Compatible | Yes | Planned |

Both systems complement each other:
- Use **Actions** for state changes and integrations
- Use **Skills** for animated behaviors and sequences

## Conclusion

The Kwami Action System is a professionally architected solution that:

✅ Follows SOLID principles  
✅ Is highly extensible  
✅ Provides excellent DX (Developer Experience)  
✅ Is production-ready  
✅ Supports future growth  
✅ Integrates seamlessly with Kwami  

The system provides a solid foundation for building complex, intelligent behaviors while maintaining simplicity and elegance.

