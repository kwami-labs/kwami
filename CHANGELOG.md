# Changelog

All notable changes to the @kwami/core library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.3] - 2025-11-03

### ✨ Added

#### 📊 ElevenLabs Conversations API
- **Complete conversation management system** - Track, analyze, and manage all agent conversations
- **8 new Mind class methods** for conversation operations:
  - `listConversations(options?)` - List all conversations with advanced filtering and pagination
  - `getConversation(conversationId)` - Retrieve detailed conversation info including transcript and metadata
  - `deleteConversation(conversationId)` - Permanently delete conversations
  - `getConversationAudio(conversationId)` - Download full audio recordings
  - `sendConversationFeedback(conversationId, feedback)` - Submit user ratings and comments
  - `getConversationToken(agentId, participantName?)` - Generate WebRTC tokens for real-time communication
  - `getConversationSignedUrl(agentId, options?)` - Create signed URLs for secure client-side access

#### 🎙️ Conversation Features
- **Audio Management** - Download and archive conversation recordings
- **Analytics & Insights** - Track duration, costs, token usage, and performance metrics
- **Transcript Access** - Full conversation transcripts with timestamps
- **Feedback System** - Collect user feedback to improve agents
- **Sentiment Analysis** - Analyze conversation sentiment and extract topics
- **Secure Access** - WebRTC tokens and signed URLs for client integrations

#### 📦 TypeScript Type Definitions
- **New conversation-related interfaces** in `src/types/index.ts`:
  - `ConversationResponse` - Complete conversation details
  - `ConversationTranscript` - Individual message entries with timestamps
  - `ConversationMetadata` - Duration, tokens, costs, and timing info
  - `ConversationAnalysis` - Sentiment, topics, summaries, and action items
  - `ListConversationsOptions` & `ListConversationsResponse` - Advanced filtering and pagination
  - `ConversationFeedbackRequest` - User feedback structure
  - `ConversationTokenResponse` - WebRTC token information
  - `ConversationSignedUrlOptions` & `ConversationSignedUrlResponse` - Secure URL generation

### 📚 Documentation

#### New Documentation Files
- **`docs/CONVERSATIONS_API.md`** - Comprehensive 655-line guide covering:
  - Complete API reference for all conversation methods
  - Detailed usage examples for each endpoint
  - Analytics dashboard implementation
  - Feedback collection patterns
  - Audio archive management
  - Best practices for pagination and caching
  - Security considerations
  - Error handling strategies

### 🔧 Technical Details

#### Implementation
- **Direct API integration** using fetch with proper headers and error handling
- **Comprehensive metadata tracking** including costs, tokens, and duration
- **Pagination support** for handling large conversation datasets
- **Advanced filtering** by agent, status, date range, and more
- **Blob handling** for audio downloads and streaming
- **Type-safe** implementation with full TypeScript coverage

#### Architecture
- **No breaking changes** - All additions are new methods
- **Consistent with existing patterns** - Follows Mind class conventions
- **Efficient resource usage** - Pagination and caching strategies included
- **Secure by design** - No API key exposure in client code

### 💡 Use Cases

The Conversations API enables:
- **Conversation Analytics** - Generate reports on agent performance and usage
- **Quality Assurance** - Review transcripts and collect feedback
- **Compliance & Archival** - Download and store conversation records
- **Customer Insights** - Analyze sentiment and extract key topics
- **Cost Management** - Track token usage and conversation costs
- **Debugging** - Access full conversation details for troubleshooting

## [2.2.2] - 2025-11-03

### ✨ Added

- Blob surface media support (image/video) applied directly to blob skin via Body API:
  - `setBlobSurfaceImage(url)` / `setBlobSurfaceVideo(url, opts)` / `clearBlobSurfaceMedia()`
  - Works independently of background overlay and compatible with glass mode

#### 🤖 ElevenLabs Agents Management API
- **Complete agent lifecycle management** - Full CRUD operations for conversational AI agents
- **10 new Mind class methods** for agent management:
  - `createAgent(config)` - Create new agents with full configuration
  - `getAgent(agentId)` - Retrieve agent details and configuration
  - `listAgents(options?)` - List all agents with pagination support
  - `updateAgent(agentId, config)` - Update existing agent configurations
  - `deleteAgent(agentId)` - Permanently delete agents
  - `duplicateAgent(agentId, options?)` - Clone agents with optional modifications
  - `getAgentLink(agentId)` - Get shareable public links for agents
  - `simulateConversation(agentId, request)` - Test agents with simulated conversations
  - `simulateConversationStream(agentId, request, onChunk)` - Test with streaming responses
  - `calculateLLMUsage(agentId, request?)` - Estimate token usage and costs

#### 📦 TypeScript Type Definitions
- **New agent-related interfaces** in `src/types/index.ts`:
  - `AgentConfig` - Agent configuration structure
  - `AgentResponse` - Agent API response format
  - `CreateAgentRequest` & `UpdateAgentRequest` - Agent creation/update payloads
  - `ListAgentsOptions` & `ListAgentsResponse` - Pagination support
  - `DuplicateAgentRequest` - Agent duplication options
  - `ConversationMessage` - Message format for simulations
  - `SimulateConversationRequest` & `SimulateConversationResponse` - Testing interfaces
  - `LLMUsageRequest` & `LLMUsageResponse` - Cost calculation types
  - `AgentLinkResponse` - Shareable link information
- **Full type safety** for all agent management operations

### 📚 Documentation

#### New Documentation Files
- **`docs/AGENTS_API.md`** - Comprehensive 1000+ line guide covering:
  - Complete API reference with method signatures
  - Real-world code examples for all operations
  - Common workflows (creation, testing, deployment)
  - Error handling patterns and best practices
  - Troubleshooting guide
  - Integration with existing conversation features

#### Updated Documentation
- **`docs/ELEVENLABS_INTEGRATION.md`** - Added Agent Management API section
  - Quick start example for creating agents
  - When to use agent management vs direct conversations
  - Links to comprehensive documentation
- **`README.md`** - Updated with Agents API references
  - Added to documentation guides list
  - Added to roadmap as completed feature

### 🐛 Fixed

- Glass transparency now works as a true blob window without altering the gradient
- Enabling glass sets blob opacity to 0.8 only if it was 1.0; restores on disable
- Random Gradient button fixed to use Body API (linear/radial), compatible with glass
- Background DOM overlays removed in favor of Three.js planes for proper stencil blending
- Blob texture image/video not visible at opacity 1.0 — shader now renders surface texture regardless of alpha

### 🔧 Technical Details

#### Integration
- **Seamless SDK integration** with `@elevenlabs/elevenlabs-js` v2.20.1
- **Consistent error handling** across all agent operations
- **Comprehensive JSDoc comments** with examples for all methods
- **Validation** before API calls to prevent errors
- **Debug logging** with emoji indicators for better DX

#### Architecture
- **No breaking changes** - All additions are new methods
- **Backward compatible** with existing Mind functionality
- **Type-safe** - Full TypeScript support throughout

### 💡 Use Cases

The Agents API enables:
- **A/B testing** different agent personalities and configurations
- **Cost estimation** before deploying agents to production
- **Automated testing** of agent responses and behaviors
- **Agent templates** that can be duplicated and customized
- **Programmatic management** of multiple agent variants
- **Integration testing** with simulated conversations

## [2.2.1] - 2025-11-02

### 🔧 Changed

#### Automated Version Management
- **Single source of truth for versioning** - `package.json` is now the only place to update version
- **Automated version sync** - Created `scripts/sync-version.js` to automatically sync version from package.json to Kwami.ts
- **Integrated into build process** - `prebuild` script now runs version sync automatically
- **Developer experience improvement** - No more manual version updates in multiple files
- **Reduced human error** - Prevents version mismatch between package.json and Kwami.getVersion()

### 📚 Documentation
- Updated contribution workflow to reflect automated version management
- Version updates now only require changing package.json

## [2.2.0] - 2025-11-02

### ✨ Added

#### 🔧 Background Image Controls
- Enhanced background management with image support
- Debug documentation for background image implementation
- Improved asset handling for playground backgrounds

#### 🎨 Playground Enhancements
- Updated HTML structure for better organization
- Enhanced CSS styling with improved responsive design
- Refined JavaScript event handlers and controls
- Better integration of body controls with state management

### 🔄 Changed

#### Type System Improvements
- Enhanced TypeScript type definitions in `src/types/index.ts`
- Better type safety for Body class configurations
- Improved type inference for background configurations

#### Core Improvements
- Refined Body.ts implementation with better type handling
- Enhanced background state management
- Improved playground control synchronization

### 📚 Documentation
- Added BACKGROUND_IMAGE_DEBUG.md for troubleshooting
- Enhanced inline code documentation
- Updated playground UI documentation

## [2.1.0] - 2025-10-31

### ✨ Added

#### 🎨 Playground Version Display
- Added version number display at bottom center of playground
- Styled in soft gray (rgba(160, 160, 160, 0.6)) for subtle visibility
- Monospace font with letter spacing for technical aesthetic
- Non-intrusive positioning with pointer-events disabled

#### 🔧 Enhanced Mind Class - WebSocket Conversational AI
- **WebSocket-based real-time conversations** with ElevenLabs Conversational API
- **startConversation()** - Initialize WebSocket conversation with callbacks
- **stopConversation()** - Gracefully end conversation and cleanup resources
- **isConversationActive()** - Check conversation status
- **Enhanced error handling** with detailed status messages and UI feedback
- **Connection status indicators** for WebSocket lifecycle (connecting, connected, error, closed)
- **Audio streaming support** for real-time voice synthesis
- **Microphone integration** for speech-to-text input
- **Event callbacks system** for transcript, turn, and error events
- **Automatic state management** synchronized with Kwami body animations

#### 📚 Comprehensive Documentation
- **ELEVENLABS_AGENT_URL_FORMATS.md** - Guide to ElevenLabs agent URL formats and iframe integration
- **ELEVENLABS_CONVERSATION_API.md** - Complete WebSocket API reference and implementation guide
- **ELEVENLABS_IFRAME_FIX.md** - Solutions for iframe integration issues
- **GRADIENT_ENHANCEMENTS.md** - Documentation for gradient angle and color stop controls
- **WEBSOCKET_CONVERSATION_GUIDE.md** - Step-by-step guide for implementing WebSocket conversations

#### 🎛️ Body Class Enhancements
- **setState()** method for programmatic state management (idle, listening, thinking, speaking)
- **getState()** method to query current animation state
- **State synchronization** with Mind class for seamless AI interactions
- **Enhanced type safety** with proper state enum types
- **Improved audio-reactive animations** with state-aware modulation

### 🔄 Changed

#### Mind Class Refactoring
- **Complete overhaul** of conversation handling from demo mode to production-ready WebSocket implementation
- **Improved initialization flow** with better validation and error messages
- **Enhanced callback system** supporting multiple event types (transcript, turn, status, error)
- **Better resource cleanup** preventing memory leaks in long conversations
- **Simplified API** for starting/stopping conversations

#### Playground UI Improvements
- **Conversation controls** now properly reflect WebSocket connection status
- **Real-time status updates** during conversation lifecycle
- **Better error messages** with actionable troubleshooting steps
- **Gradient controls enhancement** with angle slider and color stop adjustments
- **State indicator improvements** for clearer visual feedback

### 🐛 Bug Fixes

#### Recent Fixes (Oct 30-31, 2025)
- **Fixed shininess behavior** in blob shaders - proper specular highlight rendering
- **Fixed image paths** for playground assets - corrected paths for production builds
- **Fixed state indicator** initialization error - proper DOM element handling
- **Fixed background images** - absolute paths for dev and production compatibility
- **Fixed Vite bundling** - proper configuration for background image assets
- **Removed unused assets** - cleaned up textures/index.ts file

#### Core Functionality
- **Fixed WebSocket connection** handling with proper error recovery
- **Fixed audio streaming** synchronization with conversation state
- **Fixed state transitions** when switching between conversation modes
- **Fixed memory leaks** in conversation cleanup
- **Fixed microphone permissions** handling with better user feedback

### 🔧 Technical Improvements

#### Architecture
- **Refactored playground functionality** into core library classes for better reusability
- **Enhanced type definitions** for conversation callbacks and state management
- **Improved separation of concerns** between Mind, Body, and Soul classes
- **Better error propagation** from WebSocket to UI layer

#### Performance
- **Optimized WebSocket message handling** for lower latency
- **Improved animation frame scheduling** during conversations
- **Reduced bundle size** by removing unused texture imports
- **Better asset loading** with Vite configuration optimization

#### Developer Experience
- **5 new documentation files** with comprehensive guides
- **Improved TypeScript types** for better IDE support
- **Enhanced error messages** with debugging information
- **Better code organization** in Mind and Body classes

### 📦 Dependencies
- No new dependencies added
- Optimized existing ElevenLabs SDK usage for WebSocket API
- Improved Three.js integration for state-aware animations

### 🚀 Deployment & Branch Strategy

**Live Deployment**
- Kwami Playground is now live at [kwami.io](https://kwami.io)
- Deployed from the protected `main` branch
- Automatic deployment on release tags

**Git Workflow**
- Introduced professional branching strategy:
  - 🔒 **main** - Production branch (protected)
    - Deployed to kwami.io
    - Requires PR review
    - Tagged with versions (v2.0.0, v2.1.0, etc.)
  - 🔧 **dev** - Development integration branch
    - Main branch for feature development
    - All feature PRs target `dev`, NOT `main`
    - Merged to `main` for releases
  - 🌿 **feature/** - Feature branches
    - Created from `dev`
    - PR to `dev` for review

**Release Process**
- Features are developed on branches and PRed to `dev`
- When ready for release:
  1. `dev` is merged to `main` in a release PR
  2. Version is bumped (package.json, tags)
  3. CHANGELOG is finalized
  4. Released to kwami.io
  5. `main` merged back to `dev`

**For contributors**: All PRs should target `dev`, not `main`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### ✨ Added

#### 🌈 Enhanced Playground UI - Dual Sidebar Layout & Background Controls

**New Dual Sidebar Architecture:**
- **Left Sidebar** (350px): Configuration & Environment
  - ℹ️ **About Section** - Kwami description and features overview
  - 🗣️ **Voice Settings** - ElevenLabs API key and voice ID configuration
  - 🎭 **Personality Selection** - Choose from Kaya, Nexus, or Spark personalities
  - 🌈 **Background Gradient Controls** - Complete gradient system:
    - **Color Pickers**: 3 color inputs for tricolor gradient
    - **Angle Control**: 0-360° rotation slider
    - **Color Stops**: 3 position sliders (0-100%) for gradient distribution
    - **Actions**: Randomize & Reset buttons
    - **Real-time Updates**: Smooth 0.8s CSS transitions

- **Right Sidebar** (350px): Interaction & Appearance
  - 💬 **Speech Synthesis** - Text input and speak button
  - 🎨 **Body Controls** - Complete blob customization

**🎨 Comprehensive Body Parameter Controls:**
- **Spikes (Noise Frequency)**
  - X, Y, Z sliders (0-20, step: 0.1)
  - Real-time value displays
  - Default: 0.2 on all axes

- **Time (Animation Speed)**
  - X, Y, Z sliders (0-5, step: 0.1)
  - Controls animation responsiveness
  - Default: 1.0 on all axes

- **Rotation Speed**
  - X, Y, Z sliders (0-0.01, step: 0.001)
  - Creates spinning effects
  - Default: 0 (no rotation)

- **Colors (3Colors - Poles variant)**
  - 3 color pickers for X, Y, Z colors
  - Defaults: #ff0066, #00ff66, #6600ff
  - Real-time blob color updates

- **Appearance Settings**
  - 📐 **Scale** (0.1-3.0, step: 0.1) - Blob size control
    - Preserved during animation as multiplier
    - Works seamlessly with breathing effect
  - 🔍 **Resolution** (120-220, step: 1) - Mesh detail level
  - ✨ **Shininess** (0-100000, step: 100) - Specular highlights
  - 📋 **Wireframe** - Toggle wireframe mode
  - 🎭 **Skin Type** - Select between 3Colors variants: Poles, Donut, Vintage

- **Action Buttons**
  - 🎲 **Randomize Blob** - Generate random appearance
  - 🔄 **Reset to Defaults** - Restore initial values

**CSS Enhancements:**
- `.parameter-group` - Organized control sections with background styling
- `.parameter-group-title` - Section headers with color coding
- `.slider-control` - Flex layout for label and value display
- `.value-display` - Monospace font for numerical precision
- Custom range slider styling with hover effects
- `.color-control` - Flexible color picker layout
- Smooth transitions (0.8s) for all animations

**JavaScript Features:**
- `DEFAULT_VALUES` - Centralized default configuration
- `updateAllControlsFromBlob()` - Bidirectional UI-blob sync
- `initializeBodyControls()` - Event listener setup
- `randomizeBlob()` - Enhanced with UI sync
- `resetToDefaults()` - Full state restoration
- `updateValueDisplay()` - Real-time value formatting
- Event listeners for all controls with immediate visual feedback

### ✨ Added

#### 🎙️ Natural Voice Conversations - WebSocket Conversational AI (Beta)

**Status**: Implementation ready, pending ElevenLabs Conversational AI beta access

- **WebSocket-based conversation structure** prepared for ElevenLabs Conversational AI
- **Demo mode available** with simulated conversation flow using TTS
- **Microphone access and audio capture** with proper permissions handling
- **Visual state synchronization** - blob animation reflects conversation state
- **Conversation callbacks** for handling transcripts, turns, and errors
- **Resource cleanup** and proper error handling
- **Clear user feedback** about beta requirements and current limitations
- **Future-ready implementation** awaiting WebSocket API availability

**New KwamiMind Methods:**

- `startConversation(systemPrompt?, callbacks?)` - Start WebSocket conversation
- `stopConversation()` - Clean up conversation resources
- `isConversationActive()` - Check conversation status
- `sendConversationMessage(text)` - Send text during voice conversation
- Private methods for WebSocket handling and audio streaming

**New Kwami Methods:**

- Enhanced `startConversation(callbacks?)` with state management
- `isConversationActive()` - Check if conversation is active
- `sendConversationMessage(text)` - Hybrid mode text messaging

**Audio Class Updates:**

- Added `parentKwami` reference for state management during conversations

**Playground Updates:**

- Enhanced conversation UI with live transcript display
- Real-time status updates during conversation
- Visual feedback for agent/user turns
- Improved error handling and user feedback

#### Complete Mind Menu - ElevenLabs AI Audio Agent Configuration

- **Comprehensive ElevenLabs Integration** - Full SDK and API configuration interface:

  - 🔑 **Authentication** - Secure API key management
  - 🎙️ **Voice Configuration** - 20+ pre-configured professional voices plus custom voice support
  - 🎚️ **Voice Fine-tuning** - Complete control over stability, similarity boost, style, and speaker boost
  - ⚙️ **Advanced TTS Options** - 7 output formats (MP3/PCM), latency optimization, timeout control
  - 💬 **Conversational AI** - Agent ID setup, first message, max duration, interruption settings
  - 🎤 **Speech-to-Text** - 4 STT models, punctuation, diarization, microphone testing
  - 📖 **Pronunciation** - Custom dictionary with IPA phonemes support
  - 🎬 **Test & Preview** - Real-time voice testing and generation status
  - 📊 **Usage Tracking** - API usage monitoring and limits display
  - ⚡ **Quick Actions** - 4 voice presets (Natural, Expressive, Stable, Clear)
  - 💾 **Config Management** - Export/import complete Mind configuration as JSON

- **Voice Selection Features**:

  - 20+ ElevenLabs professional voices with descriptions
  - Custom voice ID input for user-created voices
  - "Load My Voices" button to fetch all voices from account
  - Dynamic voice list population
  - 5 model options: Multilingual v2, Turbo v2, Turbo v2.5, Monolingual v1, Multilingual v1
  - 15+ language selections with multilingual support

- **Voice Settings (Fine-tuning)**:

  - Stability slider (0.0-1.0) - Controls expressiveness vs consistency
  - Similarity Boost slider (0.0-1.0) - Enhances voice clarity
  - Style slider (0.0-1.0) - Adds expressiveness and emotion
  - Speaker Boost toggle - Enhanced clarity option
  - Real-time value displays with descriptive tooltips
  - Apply settings button with instant feedback

- **Advanced TTS Options**:

  - 7 output formats with detailed descriptions:
    - MP3: 44.1kHz @ 64kbps, 128kbps, 192kbps
    - PCM: 16kHz, 22.05kHz, 24kHz, 44.1kHz
  - Optimize streaming latency toggle for real-time applications
  - Next text timeout slider (100ms-5000ms) for pacing control
  - Format recommendations based on use case

- **Conversational AI Settings**:

  - Agent ID input for conversational agents
  - First message configuration for greetings
  - Max duration setting (10-3600 seconds)
  - Allow interruption toggle for natural conversations
  - Start/Stop conversation buttons with state management
  - Automatic integration with Soul personality system

- **Speech-to-Text Configuration**:

  - 4 STT model options: Base, Small, Medium, Large
  - Automatic punctuation toggle
  - Speaker diarization for multi-person conversations
  - Microphone test functionality with real-time status
  - Permission handling and error feedback

- **Pronunciation & Phonetics**:

  - Multi-line pronunciation dictionary editor
  - Format: `word:pronunciation` (one per line)
  - IPA phonemes support toggle
  - Example format in placeholder text
  - Apply button with rule count feedback

- **Test & Preview System**:

  - Large textarea for test content
  - Speak Text button (full experience with blob animation)
  - Preview Voice button (quick voice test)
  - Generation status indicator with real-time updates
  - Sample text suggestions for different use cases

- **Usage Information Display**:

  - Check API usage button
  - Display: Characters Used, Limit, Remaining
  - Plan information and limits
  - Visual usage tracking

- **Voice Presets** - 4 pre-configured settings:

  - 🌿 **Natural** (Stability: 0.5, Similarity: 0.75, Style: 0.0) - General content
  - 🎭 **Expressive** (Stability: 0.3, Similarity: 0.8, Style: 0.4) - Storytelling
  - 🎯 **Stable** (Stability: 0.8, Similarity: 0.7, Style: 0.0) - Technical docs
  - 💎 **Clear** (Stability: 0.7, Similarity: 0.9, Style: 0.0) - Instructions

- **Configuration Management**:

  - Export all settings to JSON file
  - Import configuration from JSON file
  - Complete settings preservation including:
    - Voice ID and model
    - All voice fine-tuning parameters
    - Advanced TTS options
    - Conversational AI settings
    - STT configuration
    - Pronunciation dictionary
  - File validation and error handling

- **JavaScript Functions (26+ new functions)**:

  - `initializeMind()` - Full initialization with validation
  - `applyVoiceSettings()` - Apply fine-tuned voice parameters
  - `loadAvailableVoices()` - Fetch voices from ElevenLabs API
  - `selectUserVoice()` - Apply selected custom voice
  - `applyVoicePreset(preset)` - Apply preset configurations
  - `previewVoice()` - Quick voice testing
  - `startConversation()` - Initialize voice conversation
  - `stopConversation()` - End conversation gracefully
  - `testMicrophone()` - Validate microphone access
  - `applyPronunciation()` - Parse and store pronunciation rules
  - `checkUsage()` - Query API usage
  - `exportMindConfig()` - Export configuration to JSON
  - `importMindConfig()` - Import configuration from JSON
  - `initializeMindControls()` - Event listener setup
  - Plus numerous event handlers and utilities

- **UI Components**:

  - 10 comprehensive configuration sections
  - 15+ input fields with validation
  - 4 range sliders with live value updates
  - 6 dropdown selectors with descriptions
  - 6 checkboxes for feature toggles
  - 15+ action buttons with state management
  - 3 large textareas for content entry
  - Collapsible sections for organization
  - Status displays with color coding

- **Documentation**:
  - **MIND_MENU_GUIDE.md** - Comprehensive 1000+ line user guide with:
    - Detailed explanations of every option
    - Best practices and recommendations
    - Troubleshooting guide with common issues
    - Complete API reference
    - Use case examples and tips
    - Resource links and additional information
  - **MIND_MENU_IMPLEMENTATION.md** - Technical implementation summary with:
    - Implementation details for all 10 sections
    - Code metrics and statistics
    - Coverage matrix for ElevenLabs features
    - Configuration options catalog (50+)
    - Testing checklist and status
    - Future enhancement ideas
  - **MIND_MENU_QUICK_REFERENCE.md** - Quick reference card with:
    - Quick start guide
    - Popular voices table
    - Voice settings guide
    - Common tasks
    - Troubleshooting tips
    - Keyboard shortcuts

#### Interactive Animations & State Management

- **Click Interaction** - Natural liquid-like touch effects when clicking the blob:
  - Inward push simulation with smooth falloff
  - Ripple wave effects for realistic fluid dynamics
  - Configurable touch strength, duration, and max touch points
  - Natural ease-in and ease-out transitions
  - Multiple simultaneous touch points support
- **Thinking Animation** - Chaotic contemplative movement when processing:
  - Multi-layer noise for organic, fluid motion
  - Pulsing effect with smooth intensity transitions
  - Configurable thinking duration (default 10 seconds)
  - Automatic fade-in and fade-out transitions
- **Listening State** - Microphone-responsive animation with audio-reactive movements:
  - Double-click blob to start/stop listening
  - Inward spikes responsive to audio input
  - Opposite animation style from speaking state
- **Smooth State Transitions** - Fluid blending between animation states:
  - Seamless transitions between neutral, listening, thinking, and speaking
  - Configurable transition speed
  - Natural interpolation prevents abrupt visual changes
  - State-aware animation blending
- **State Indicators** - Visual feedback in UI for current blob state
- **Test Thinking Button** - Trigger thinking animation manually for testing

#### Playground UI Enhancement

- **Complete Mind Menu Integration** - Full ElevenLabs configuration interface seamlessly integrated into rotating sidebar system
- **Rotating Sidebar System** - Innovative 3-section, 2-sidebar interface for accessing Mind, Body, and Soul configurations
- **Swap Buttons** - Easily toggle between configuration sections without UI clutter
- **Soul Configuration UI** - Dedicated interface for personality customization:
  - Name and personality description
  - System prompt editor
  - Response length and emotional tone settings
  - Preset personality quick-access buttons
- **Template-based Architecture** - Efficient HTML template system for dynamic content management
- **Smooth Transitions** - Fade-in animations when switching between sections
- **State Preservation** - Kwami state persists correctly across sidebar swaps
- **Camera Position Controls** - X, Y, Z sliders for orbiting around the blob
- **Background Opacity** - Transparency control for canvas backgrounds
- **Background Image Support** - Load custom background images from assets (15+ included)
- **Enhanced Body Controls** - Updated scale ranges (3-8) and spike parameters (0-20)
- **Real-time Camera Tracking** - UI reflects both manual slider changes and OrbitControls interactions
- **Animation Configuration Controls** - Fine-tune all animation parameters:
  - Touch Strength (0-1)
  - Touch Duration (500-3000ms)
  - Max Touch Points (1-10)
  - Transition Speed (0.5-5)
  - Thinking Duration (5-30 seconds)
- **Audio Player UI** - Integrated audio player with full controls:
  - File upload support for custom audio tracks
  - Play/pause button with state indication
  - Volume slider with visual feedback (🔊/🔉/🔇)
  - Time display (current / total duration)
  - Audio metadata display (filename)
- **Audio Effects Configuration** - Comprehensive audio reactivity controls:
  - Frequency → Spike modulation (Bass, Mid, High)
  - Frequency → Time modulation (Mid, High, Ultra)
  - FFT size selector (512/1024/2048/4096)
  - Smoothing time constant slider
  - Audio reactivity toggle
  - Separate spike and time effect toggles
- **Unified Messages Area** - All status, error, and info messages below blob:
  - Modern glassmorphism design
  - Auto-dismiss functionality (5s status, 8s errors)
  - Color-coded message types (blue info, red error, green success, orange warning)
  - Smooth fade-in/slide-up animations
  - Non-intrusive positioning
- **GLB Export** - Download the blob as a 3D GLB file with animation and materials
- **Dynamic Lighting Controls** - Adjust light intensity in real-time
- **Donut Skin** - New donut-like appearance option
- **Test Buttons** - Quick testing for listening and thinking modes

#### Core Library Features

- **Blob Interaction API**:
  - `enableBlobInteraction()` - Enable click/touch interaction
  - `disableBlobInteraction()` - Disable interaction
  - `startListening()` - Start microphone listening with visual feedback
  - `stopListening()` - Stop listening mode
  - `isListening()` - Check listening state
  - `startThinking()` - Trigger thinking animation
  - `stopThinking()` - End thinking animation
  - `isThinking()` - Check thinking state
- **Background Management API**:
  - `setBackground(config)` - Set gradient, solid color, or transparent background
  - `setBackgroundColor(color)` - Quick solid color setter
  - `setBackgroundGradient(color1, color2)` - Quick gradient setter
  - `setBackgroundTransparent()` - Quick transparent setter
  - `getBackgroundType()` - Get current background type
- **Audio Effects API**:
  - `blob.audioEffects` - Configurable audio reactivity parameters
  - `bassSpike`, `midSpike`, `highSpike` - Frequency to spike modulation
  - `midTime`, `highTime`, `ultraTime` - Frequency to time modulation
  - `enabled` - Master toggle for audio reactivity
  - `timeEnabled` - Separate toggle for time modulation
- **Audio Management API**:
  - `loadAudio(arrayBuffer)` - Load audio from uploaded files
  - `getAudioElement()` - Access HTML audio element
  - `getAnalyser()` - Access Web Audio API analyser node
- **Scene Access** - `getScene()` method for direct Three.js scene manipulation
- **Dynamic Lighting** - `setLightIntensity()` method for runtime light control

#### Documentation

- **Mind Menu Documentation** - 3 comprehensive guides (3000+ lines total):
  - Complete user guide with every configuration option explained
  - Technical implementation summary with code metrics
  - Quick reference card for common tasks
- Updated **playground README** with comprehensive rotating sidebar documentation
- Added **Playground Architecture** section to main ARCHITECTURE.md
- Enhanced main **README** with playground features showcase
- Updated tips section with new UI interaction guidance
- Documented all new interactive features and animation systems

### 🔄 Changed

#### Playground Layout

- **Before**: Static dual-sidebar layout (Left: AI Agent, Right: Body)
- **After**: Dynamic rotating system (Mind, Body, Soul across two sidebars)
- Reorganized controls to align with Kwami's core concepts (Mind/Body/Soul)
- Improved visual hierarchy with section-specific icons and colors
- Renamed "Export Scene" button to "Download GLB" for clarity
- **Messages relocated** from sidebars to below blob for better UX
- **Audio player** integrated at top of canvas for easy access
- Reorganized body template into logical sections:
  - 🫧 Blob Configuration
  - 🎵 Audio Effects
  - 👆 Interaction
  - ⚡ Actions

#### Animation System

- **Before**: Single animation state with speaking-only audio reactivity
- **After**: Multiple animation states with smooth transitions:
  - Neutral (idle breathing)
  - Listening (inward audio-reactive spikes)
  - Thinking (chaotic fluid movements)
  - Speaking (outward audio-reactive spikes)
  - Interactive (click/touch response)
- Improved animation easing curves for more natural motion
- Reduced breathing intensity for subtler idle state
- Enhanced noise layering for more organic movements

#### Blob Configuration

- Default shininess reduced to 50 for more matte appearance
- Click interaction enabled by default in playground
- Lights disabled in shader materials for consistent appearance
- Improved color management across all skin types

### 🐛 Bug Fixes

- Fixed GLTFExporter module resolution by switching to esm.sh CDN
- Fixed blob collapse issue from multiple rapid clicks by clamping total displacement
- Fixed spiky artifacts in click animation by ensuring inward-only displacement
- Fixed abrupt state transitions by implementing smooth blending system
- Fixed thinking animation being too spiky by reducing noise frequencies
- Fixed click animation recovery being too slow by adjusting duration and easing
- Fixed color updates not applying to all skins
- Fixed audio effects controls not updating blob properties (wiring issue)
- Fixed animation geometry collapse from audio by removing overall scale changes
- Fixed breathing effect causing blob size changes
- Improved material disposal and memory management

### 🔧 Technical Improvements

#### Animation Engine

- Multi-layer Perlin noise for natural fluid dynamics
- Configurable easing functions (quadratic, cubic, smoothstep)
- Touch point management with decay and influence radius
- State transition blending with configurable speed
- Clamped displacement to prevent visual artifacts
- Optimized animation loop with proper state tracking

#### Code Quality

- Exposed animation configuration parameters as public properties
- Improved type safety for animation states
- Better encapsulation of interaction logic
- Enhanced raycasting for click detection
- Proper cleanup of event listeners and resources

#### Audio System

- Configurable audio reactivity with separate spike and time modulation
- ArrayBuffer support for uploaded audio files
- Exposed analyser node for advanced control
- FFT size and smoothing configurable at runtime
- Audio effects apply immediately without reinitialization

#### UI/UX

- Unified message system with auto-dismiss
- Glassmorphism design language throughout
- Smooth animations for all state changes
- Non-blocking pointer-events for overlays
- Color-coded feedback for different message types

## [2.0.0] - 2025-10-20

### 🎉 Major Refactoring

This version represents a complete architectural refactoring of the @kwami library, transforming it into a professional, reusable, and maintainable library.

### ✨ Added

#### Core Architecture

- **New modular architecture** with clear separation of concerns
- **KwamiAudio class** - Dedicated audio management with frequency analysis
- **KwamiBody class** - Manages 3D scene, renderer, and blob
- **Blob class** - Self-contained blob implementation with animation
- **Comprehensive TypeScript types** - Full type safety across the library
- **Proper exports structure** - Clean API with multiple export paths

#### Features

- **Automatic resize handling** using ResizeObserver
- **Animation loop management** with proper cleanup
- **Resource disposal methods** for memory management
- **Multiple skin support** (3Colors collection: Poles, Donut, Vintage)
- **Configurable scene setup** with sensible defaults
- **Audio playlist management** (next/previous track support)
- **Volume control** for audio playback
- **GLTF export functionality** for blob models
- **DNA generation** for unique blob identifiers
- **Random blob generation** with configurable parameters

#### Developer Experience

- Professional README with examples and documentation
- Comprehensive inline code documentation
- Clear folder structure for better maintainability
- Modular design for tree-shaking and smaller bundles

### 🔄 Changed

#### File Organization

- **Before**: Nested structure with `core/body/lib/Blob/`
- **After**: Flat, intuitive structure with `src/core/`, `src/blob/`, `src/scene/`

#### Skin Management

- **Before**: Deep nesting in `lib/Blob/skins/Tricolor/`
- **After**: Clean structure in `src/blob/skins/tricolor/`
- Renamed shader files: `shader.glsl` → `fragment.glsl` for clarity

#### Audio System

- **Before**: Basic audio playback tied to body
- **After**: Dedicated `KwamiAudio` class with full feature set
- Added proper Web Audio API initialization
- Improved error handling for audio playback

#### Blob Implementation

- **Before**: Monolithic class with mixed concerns
- **After**: Modular design with separate geometry, animation, and skins
- Better state management
- Cleaner API for customization

### 🗑️ Removed

- **Metamask folder** - Removed as we focus on single body (blob) implementation
- **Unused state files** - Consolidated state management
- **Redundant event handlers** - Simplified event system
- **Old body selection system** - Now focused on single, customizable blob

### 🔧 Technical Improvements

#### Performance

- Optimized animation loop with proper frame management
- Better geometry disposal to prevent memory leaks
- Efficient material management with Map-based skin storage

#### Code Quality

- Consistent naming conventions (PascalCase for classes)
- Proper encapsulation with private/public members
- Better error handling throughout
- Removed console.log statements (replaced with proper error handling)

#### Type Safety

- Created comprehensive type definitions
- All public APIs are fully typed
- Better IntelliSense support for developers

### 📦 Package Updates

- Updated package.json with proper library metadata
- Added module exports configuration
- Specified peer dependencies
- Added development scripts

### 🐛 Bug Fixes

- Fixed audio context suspension issues
- Resolved resize event memory leaks
- Fixed material disposal on skin change
- Corrected animation frame cleanup

### 📝 Documentation

- Created comprehensive README.md with:
  - Quick start guide
  - API documentation
  - Configuration examples
  - Usage examples
  - Architecture overview
- Added inline JSDoc comments throughout codebase
- Created this CHANGELOG

### 🔄 Migration Guide from 1.x to 2.0

#### Import Changes

```typescript
// Before
import Kwami from "./kwami/core/body";

// After
import { Kwami } from "@kwami/core";
```

#### Instantiation Changes

```typescript
// Before
const kwami = new Kwami(canvas);
kwami.body = new KwamiBody(canvas);

// After
const kwami = new Kwami(canvas, {
  body: {
    audioFiles: [...],
    initialSkin: 'tricolor'
  }
});
```

#### API Changes

```typescript
// Before
kwami.body.audio.playAudio();
kwami.body.blob.vector("x", 0.5);

// After
await kwami.body.audio.play();
kwami.body.blob.setSpikes(0.5, 0.5, 0.5);
```

### 🎯 Breaking Changes

1. **Constructor signature changed** - Now requires configuration object
2. **Audio methods renamed** - `playAudio()` → `play()`, `pauseAudio()` → `pause()`
3. **Blob methods renamed** - `vector()` → `setSpikes()`, `color()` → `setColor()`
4. **Skin configuration** - Moved from options to dedicated skin files
5. **Scene setup** - Now handled internally, with configuration options
6. **No more multi-body support** - Focused on single blob implementation

### 🚀 Future Plans

- AI Mind integration (LLM configuration)
- AI Soul implementation (personality system)
- STT/TTS integration
- Additional built-in skins
- Animation presets
- WebXR support
- Framework wrappers (React, Vue, Svelte)

---

## [1.0.0] - Previous Version

Initial release with basic functionality:

- Basic blob visualization
- Audio playback
- Multiple body types (Blob, Metamask)
- Basic skin support
- Scene rendering

---

**Note**: Version 2.0.0 is a complete rewrite focused on making @kwami a professional, reusable library. While there are breaking changes, the new architecture provides a much better foundation for future development and third-party integration.
