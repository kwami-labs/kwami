# ElevenLabs Iframe Connection Fix

## Problem
When starting a conversation, users were seeing an error: "ElevenLabs refused to connect" under the agent ID input.

## Root Cause
ElevenLabs sets security headers (X-Frame-Options or Content Security Policy) that prevent their conversation interface from being embedded in iframes on external domains. This is a security best practice that prevents clickjacking attacks.

## Solution Implemented

### 1. Removed Iframe Embedding Attempt
The code previously tried to embed the ElevenLabs conversation in an iframe, which would always fail due to security restrictions. We've removed this approach entirely.

### 2. Direct to Popup Window
The application now directly opens a popup window for the conversation, which works reliably:
- When you click "Start Conversation", a popup window opens with the ElevenLabs interface
- The popup allows full microphone access and conversation functionality
- The main app monitors the popup status and updates accordingly

### 3. Improved Error Handling
- Clear messages when popups are blocked
- Direct link fallback if popup fails
- Better status indicators in the UI

## How It Works Now

1. **Start Conversation**: Click the button or double-click Kwami
2. **Popup Opens**: A new window opens with the ElevenLabs conversation interface
3. **Allow Microphone**: Grant microphone permission in the popup window
4. **Talk Naturally**: Have a conversation with your AI agent
5. **Stop Conversation**: Close the popup or click stop

## If Popups Are Blocked

If your browser blocks the popup:
1. Allow popups for this site in your browser settings
2. Or use the direct link provided in the status message
3. Copy the link and open it in a new tab

## Technical Details

### Files Modified
- `/src/core/Mind.ts`: Removed iframe embedding logic, improved popup handling
- `/playground/index.html`: Replaced iframe container with status container
- `/playground/main.js`: Updated UI to show status messages instead of iframe

### Security Considerations
- Iframe embedding is blocked by ElevenLabs for security (prevents clickjacking)
- Popup windows are the recommended approach for third-party voice interfaces
- Direct links provide a fallback for strict popup blockers

## Future Improvements

When ElevenLabs releases their WebSocket API or embeddable widget:
- Native integration without popups
- Better user experience with embedded conversations
- Real-time voice streaming directly in the app

For now, the popup window approach provides full functionality while respecting security boundaries.
