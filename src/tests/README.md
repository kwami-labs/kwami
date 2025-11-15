# Kwami Test Suite

A comprehensive test suite for the Kwami 3D Interactive AI Companion Library built with **Vitest** - the modern, fast, and powerful testing framework.

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Watch mode (automatically re-run tests on file changes)
npm run test:watch

# Run tests with UI (interactive test dashboard)
npm run test:ui

# Generate coverage report
npm run test:coverage

# Coverage report with UI
npm run test:coverage:ui
```

## 📁 Test Structure

```
tests/
├── setup.ts                      # Global test setup and mocks
├── utils/
│   ├── test-helpers.ts          # Shared test utilities
│   ├── randoms.test.ts          # Tests for random utilities
│   └── recorder.test.ts         # Tests for speech synthesis recorder
├── core/
│   ├── Kwami.test.ts            # Main Kwami class tests
│   ├── soul/
│   │   └── Soul.test.ts         # Personality system tests
│   ├── mind/
│   │   └── Mind.test.ts         # AI mind & providers tests
│   └── body/
│       └── Audio.test.ts        # Audio management tests
└── README.md                     # This file
```

## 🧪 Test Coverage

The test suite covers all major components:

### ✅ Utils Module
- **Random Utilities** - UUID generation, random numbers, colors, booleans, DNA strings
- **Speech Synthesis Recorder** - Audio recording, blob conversion, stream handling

### ✅ Soul Module (Personality System)
- **Configuration Management** - Default configs, custom configs, snapshots
- **Personality Traits** - Adding, removing, getting traits
- **Emotional Traits** - Setting, getting, clamping values (-100 to +100)
- **System Prompts** - Generation with traits, style, tone
- **Import/Export** - JSON and YAML format support
- **Preset Personalities** - Loading built-in personality templates
- **Language Support** - Multi-language configuration

### ✅ Mind Module (AI Capabilities)
- **Provider Management** - ElevenLabs, OpenAI provider support
- **Speech Synthesis (TTS)** - Text-to-speech with pronunciation support
- **Speech Recognition (STT)** - Speech-to-text configuration
- **Conversations** - Starting, stopping, managing conversations
- **Voice Management** - Voice settings, presets, models
- **Audio Generation** - Blob generation, streaming
- **Pronunciation Dictionary** - Custom word pronunciations
- **Advanced TTS Options** - Output formats, latency optimization
- **Agent Management** - Create, update, delete, duplicate agents
- **Conversation Analytics** - List, get, analyze conversations

### ✅ Body Module (Visual & Audio)
- **Audio Management** - Play, pause, stop, volume control
- **Frequency Analysis** - Real-time audio frequency data
- **Stream Audio** - Connect/disconnect audio streams
- **Playback Control** - Seek, playback rate, loop mode
- **Event Handling** - Audio event listeners
- **Resource Disposal** - Proper cleanup

### ✅ Main Kwami Class (Integration)
- **Initialization** - Canvas setup, component initialization
- **State Management** - idle, listening, thinking, speaking states
- **Core Actions** - listen(), think(), speak()
- **Conversation Flow** - Start/stop conversations with callbacks
- **Blob Interaction** - Enable/disable double-click interactions
- **Component Coordination** - Body, Mind, Soul integration
- **Resource Disposal** - Complete cleanup

## 🛠️ Technologies

- **Vitest** - Modern, fast testing framework with native ESM support
- **@vitest/ui** - Beautiful web-based test dashboard
- **@vitest/coverage-v8** - Fast, accurate code coverage
- **happy-dom** - Lightweight DOM environment for tests
- **TypeScript** - Full type safety in tests

## 📊 Coverage Reports

After running `npm run test:coverage`, you'll find:

- **Terminal Report** - Summary in your terminal
- **HTML Report** - Open `coverage/index.html` in your browser
- **LCOV Report** - For CI/CD integration (`coverage/lcov.info`)
- **JSON Report** - Machine-readable format (`coverage/coverage-final.json`)

## 🎯 Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YourModule } from '../src/your-module';

describe('YourModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    const instance = new YourModule();
    expect(instance.method()).toBe(expected);
  });
});
```

### Using Test Helpers

```typescript
import { createMockCanvas, createMockElevenLabsProvider } from './utils/test-helpers';

const canvas = createMockCanvas();
const provider = createMockElevenLabsProvider();
```

### Mocking

```typescript
// Mock a module
vi.mock('../src/module', () => ({
  ClassName: vi.fn(() => ({
    method: vi.fn(),
  })),
}));

// Mock a function
const mockFn = vi.fn(() => 'result');

// Spy on existing method
const spy = vi.spyOn(object, 'method');
```

## 🔧 Configuration

Test configuration is in `vitest.config.ts`:

- **Globals**: Enabled for describe, it, expect, etc.
- **Environment**: happy-dom for lightweight DOM simulation
- **Coverage**: V8 provider with comprehensive reporting
- **Aliases**: @core, @utils, @types for clean imports

## 🚨 Troubleshohooting

### Tests not found
Make sure test files end with `.test.ts` or `.spec.ts`

### Import errors
Check that aliases in `vitest.config.ts` match your project structure

### Module mocking issues
Clear mocks in `beforeEach()` hooks to prevent test interference

### Coverage not accurate
Exclude test files and mocks in coverage configuration

## 📝 Best Practices

1. **Descriptive Test Names** - Use clear, specific test descriptions
2. **Arrange-Act-Assert** - Structure tests clearly
3. **Mock External Dependencies** - Isolate units under test
4. **Test Edge Cases** - Include boundary conditions and error cases
5. **Keep Tests Fast** - Mock heavy operations (network, file I/O)
6. **Clean Up** - Use `beforeEach`/`afterEach` for test isolation
7. **Use Test Helpers** - Share common setup code
8. **Type Safety** - Leverage TypeScript in tests

## 🎓 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Coverage Configuration](https://vitest.dev/guide/coverage.html)

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure >80% code coverage
3. Test both happy and error paths
4. Update this README if needed

---

**Happy Testing! 🧪✨**

