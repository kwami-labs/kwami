# ElevenLabs Agent URL Formats Guide

## Known URL Formats

ElevenLabs has used different URL formats for accessing conversational AI agents. The correct format may depend on:
- Your account type
- When your agent was created
- Your agent's deployment method
- ElevenLabs platform updates

## Common Formats

### 1. Direct Agent URL
```
https://elevenlabs.io/agent/{AGENT_ID}
```
Example: `https://elevenlabs.io/agent/abc123xyz`

### 2. Share URL (Legacy)
```
https://elevenlabs.io/app/conversational-ai/share/{AGENT_ID}
```
Example: `https://elevenlabs.io/app/conversational-ai/share/abc123xyz`

### 3. Dashboard URL
```
https://elevenlabs.io/app/conversational-ai
```
Access your dashboard to find and test agents directly.

### 4. Embedded Widget URL
```
https://convai.elevenlabs.io/{AGENT_ID}
```
Some agents may use this subdomain format.

### 5. Public Share URL
```
https://share.elevenlabs.io/{AGENT_ID}
```
For publicly shared agents.

## How to Find Your Agent's Correct URL

1. **Log in to ElevenLabs Dashboard**
   - Go to https://elevenlabs.io
   - Navigate to Conversational AI section
   - Find your agent

2. **Look for Share/Deploy Options**
   - Click on your agent
   - Look for "Share", "Deploy", or "Get Link" button
   - Copy the provided URL

3. **Check Agent Settings**
   - Some agents have specific deployment settings
   - Public vs Private agents may have different URL formats

## Troubleshooting

### "Page Not Found" Error
If you're getting a 404 error:

1. **Verify Agent ID**: Make sure you have the correct agent ID
2. **Check Agent Status**: Ensure your agent is active and deployed
3. **Try Different Formats**: Test each URL format listed above
4. **Check Permissions**: Ensure your agent is set to public if sharing

### Agent Not Responding
If the page loads but the agent doesn't respond:

1. **Microphone Access**: Grant microphone permissions
2. **Browser Compatibility**: Use Chrome, Edge, or Firefox (latest versions)
3. **Agent Configuration**: Check your agent's settings in the dashboard
4. **API Limits**: Check if you've exceeded your monthly limits

## Getting Your Agent ID

Your Agent ID can be found in several places:

1. **Dashboard List View**: Usually displayed under the agent name
2. **Agent Settings**: In the configuration or settings page
3. **Deploy/Share Modal**: When you click to share your agent
4. **API Response**: If using the API, it's in the agent object

## Manual URL Entry

If none of the automatic URLs work, you can:

1. Copy the exact URL from your ElevenLabs dashboard
2. Enter it manually in the application
3. Save it for future use

## Important Notes

- URLs are case-sensitive
- Agent IDs usually contain letters and numbers
- Private agents may require authentication
- Free tier agents have usage limits
- URL formats may change with platform updates

## Need Help?

If you still can't access your agent:

1. Check ElevenLabs documentation: https://docs.elevenlabs.io
2. Contact ElevenLabs support
3. Verify your subscription status
4. Try creating a new test agent
