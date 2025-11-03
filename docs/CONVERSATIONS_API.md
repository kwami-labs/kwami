# Kwami Mind - Conversations API Documentation

## Overview

The Conversations API provides comprehensive management and analytics for agent conversations. Track, analyze, and manage all conversations with your AI agents, including transcripts, audio recordings, and performance metrics.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Core Features](#core-features)
3. [API Methods](#api-methods)
4. [Types & Interfaces](#types--interfaces)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## Installation & Setup

```typescript
import { Kwami } from '@kwami/core';

const kwami = new Kwami({
  mind: {
    apiKey: 'your-elevenlabs-api-key'
  }
});

await kwami.initialize();
```

## Core Features

### 📊 Conversation Analytics
- Track conversation duration, token usage, and costs
- Analyze sentiment and extract key topics
- Generate summaries and action items

### 🎙️ Audio Management
- Download full conversation recordings
- Support for user and agent audio tracks
- Audio available for phone and voice conversations

### 🔍 Advanced Search & Filtering
- Filter by agent, status, or time period
- Pagination for large datasets
- Sort by creation date, duration, or other metrics

### 💬 Feedback System
- Collect user feedback (like/dislike)
- Add comments and tags for analysis
- Improve agent performance through feedback

### 🔐 Secure Access
- WebRTC token generation for real-time communication
- Signed URLs for secure client-side access
- No API key exposure in client applications

## API Methods

### List Conversations

```typescript
async listConversations(options?: ListConversationsOptions): Promise<ListConversationsResponse>
```

Retrieve a list of all conversations with filtering and pagination support.

**Parameters:**
- `options` (optional):
  - `agent_id`: Filter by specific agent
  - `status`: Filter by conversation status ('initiated', 'in-progress', 'processing', 'done', 'failed')
  - `page_size`: Number of results per page
  - `page_token`: Token for pagination
  - `sort_by`: Sort field ('created_at', 'updated_at', 'duration')
  - `sort_order`: Sort order ('asc', 'desc')

**Example:**
```typescript
const conversations = await kwami.mind.listConversations({
  agent_id: 'agent_abc123',
  status: 'done',
  page_size: 20,
  sort_by: 'created_at',
  sort_order: 'desc'
});

console.log(`Found ${conversations.conversations.length} conversations`);

// Process each conversation
conversations.conversations.forEach(conv => {
  console.log(`ID: ${conv.conversation_id}`);
  console.log(`Duration: ${conv.metadata.call_duration_secs}s`);
  console.log(`Cost: $${conv.metadata.cost_usd}`);
});

// Handle pagination
if (conversations.has_more) {
  const nextPage = await kwami.mind.listConversations({
    page_token: conversations.next_page_token
  });
}
```

### Get Conversation Details

```typescript
async getConversation(conversationId: string): Promise<ConversationResponse>
```

Retrieve detailed information about a specific conversation.

**Example:**
```typescript
const conversation = await kwami.mind.getConversation('conv_abc123');

// Access conversation metadata
console.log('Status:', conversation.status);
console.log('Agent:', conversation.agent_id);
console.log('Duration:', conversation.metadata.call_duration_secs, 'seconds');
console.log('Total tokens:', conversation.metadata.total_tokens);
console.log('Cost:', conversation.metadata.cost_usd, 'USD');

// Print transcript
conversation.transcript.forEach((entry, index) => {
  const timestamp = entry.time_in_call_secs;
  console.log(`[${timestamp}s] ${entry.role}: ${entry.message}`);
});

// Check for analysis results
if (conversation.analysis) {
  console.log('Sentiment:', conversation.analysis.sentiment);
  console.log('Topics:', conversation.analysis.topics);
  console.log('Summary:', conversation.analysis.summary);
}
```

### Delete Conversation

```typescript
async deleteConversation(conversationId: string): Promise<void>
```

Permanently delete a conversation and all associated data.

⚠️ **Warning**: This action cannot be undone.

**Example:**
```typescript
try {
  await kwami.mind.deleteConversation('conv_abc123');
  console.log('Conversation deleted successfully');
} catch (error) {
  console.error('Failed to delete conversation:', error);
}
```

### Get Conversation Audio

```typescript
async getConversationAudio(conversationId: string): Promise<Blob>
```

Download the audio recording of a conversation.

**Example:**
```typescript
// Download audio
const audioBlob = await kwami.mind.getConversationAudio('conv_abc123');

// Option 1: Create download link
const url = URL.createObjectURL(audioBlob);
const a = document.createElement('a');
a.href = url;
a.download = `conversation_${conversationId}.mp3`;
a.click();
URL.revokeObjectURL(url);

// Option 2: Play audio
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();

// Option 3: Convert to base64 for storage
const reader = new FileReader();
reader.onloadend = () => {
  const base64 = reader.result;
  localStorage.setItem(`audio_${conversationId}`, base64);
};
reader.readAsDataURL(audioBlob);
```

### Send Conversation Feedback

```typescript
async sendConversationFeedback(
  conversationId: string, 
  feedback: ConversationFeedbackRequest
): Promise<void>
```

Submit user feedback for a conversation.

**Example:**
```typescript
// Simple feedback
await kwami.mind.sendConversationFeedback('conv_abc123', {
  feedback: 'like'
});

// Detailed feedback
await kwami.mind.sendConversationFeedback('conv_abc123', {
  feedback: 'dislike',
  comment: 'The agent misunderstood my question about pricing',
  tags: ['misunderstanding', 'pricing', 'needs-improvement']
});
```

### Get WebRTC Token

```typescript
async getConversationToken(
  agentId: string, 
  participantName?: string
): Promise<ConversationTokenResponse>
```

Generate a WebRTC token for real-time communication.

**Example:**
```typescript
const tokenData = await kwami.mind.getConversationToken(
  'agent_abc123',
  'John Doe'
);

// Use token for WebRTC connection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});

// Configure with token
const config = {
  token: tokenData.token,
  expires_at: tokenData.expires_at
};

console.log('Token expires at:', new Date(tokenData.expires_at * 1000));
```

### Get Signed URL

```typescript
async getConversationSignedUrl(
  agentId: string,
  options?: ConversationSignedUrlOptions
): Promise<ConversationSignedUrlResponse>
```

Generate a signed URL for secure conversation initiation without exposing API keys.

**Example:**
```typescript
// Get signed URL with conversation ID
const urlData = await kwami.mind.getConversationSignedUrl(
  'agent_abc123',
  { include_conversation_id: true }
);

// Use signed URL to establish WebSocket connection
const ws = new WebSocket(urlData.signed_url);

ws.onopen = () => {
  console.log('Connected to agent');
  console.log('Conversation ID:', urlData.conversation_id);
};

ws.onmessage = (event) => {
  console.log('Agent message:', event.data);
};

// Send user message
ws.send(JSON.stringify({
  type: 'user_message',
  content: 'Hello, agent!'
}));
```

## Types & Interfaces

### ConversationResponse

```typescript
interface ConversationResponse {
  agent_id: string;
  conversation_id: string;
  status: 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';
  transcript: ConversationTranscript[];
  metadata: ConversationMetadata;
  has_audio: boolean;
  has_user_audio: boolean;
  has_response_audio: boolean;
  user_id?: string | null;
  analysis?: ConversationAnalysis | null;
}
```

### ConversationTranscript

```typescript
interface ConversationTranscript {
  role: 'user' | 'agent';
  time_in_call_secs: number;
  message: string;
}
```

### ConversationMetadata

```typescript
interface ConversationMetadata {
  start_time_unix_secs: number;
  call_duration_secs: number;
  end_time_unix_secs?: number;
  total_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  cost_usd?: number;
}
```

### ConversationAnalysis

```typescript
interface ConversationAnalysis {
  sentiment?: 'positive' | 'neutral' | 'negative';
  topics?: string[];
  summary?: string;
  action_items?: string[];
  key_points?: string[];
}
```

## Usage Examples

### Complete Conversation Analytics Dashboard

```typescript
class ConversationAnalytics {
  private kwami: Kwami;
  
  constructor(kwami: Kwami) {
    this.kwami = kwami;
  }
  
  async generateReport(agentId: string, days: number = 7) {
    const conversations = await this.kwami.mind.listConversations({
      agent_id: agentId,
      status: 'done',
      page_size: 100
    });
    
    const now = Date.now() / 1000;
    const cutoff = now - (days * 24 * 60 * 60);
    
    const recentConvs = conversations.conversations.filter(
      conv => conv.metadata.start_time_unix_secs >= cutoff
    );
    
    const report = {
      total_conversations: recentConvs.length,
      total_duration: 0,
      total_cost: 0,
      total_tokens: 0,
      average_duration: 0,
      sentiment_breakdown: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      topics: new Map<string, number>()
    };
    
    for (const conv of recentConvs) {
      report.total_duration += conv.metadata.call_duration_secs || 0;
      report.total_cost += conv.metadata.cost_usd || 0;
      report.total_tokens += conv.metadata.total_tokens || 0;
      
      if (conv.analysis?.sentiment) {
        report.sentiment_breakdown[conv.analysis.sentiment]++;
      }
      
      if (conv.analysis?.topics) {
        conv.analysis.topics.forEach(topic => {
          report.topics.set(topic, (report.topics.get(topic) || 0) + 1);
        });
      }
    }
    
    report.average_duration = report.total_duration / report.total_conversations;
    
    return report;
  }
  
  async exportTranscripts(agentId: string, format: 'json' | 'csv' = 'json') {
    const conversations = await this.kwami.mind.listConversations({
      agent_id: agentId,
      status: 'done'
    });
    
    if (format === 'json') {
      return JSON.stringify(conversations, null, 2);
    }
    
    // CSV export
    let csv = 'Conversation ID,Timestamp,Role,Message\n';
    
    for (const conv of conversations.conversations) {
      for (const entry of conv.transcript) {
        const row = [
          conv.conversation_id,
          entry.time_in_call_secs,
          entry.role,
          `"${entry.message.replace(/"/g, '""')}"`
        ].join(',');
        csv += row + '\n';
      }
    }
    
    return csv;
  }
}
```

### Conversation Feedback Collector

```typescript
class FeedbackCollector {
  private kwami: Kwami;
  
  async collectFeedback(conversationId: string) {
    // Show feedback UI
    const feedback = await this.showFeedbackDialog();
    
    if (feedback) {
      await this.kwami.mind.sendConversationFeedback(
        conversationId,
        {
          feedback: feedback.rating,
          comment: feedback.comment,
          tags: this.extractTags(feedback.comment)
        }
      );
    }
  }
  
  private extractTags(comment: string): string[] {
    const tags = [];
    
    // Extract sentiment
    if (comment.includes('confus') || comment.includes('unclear')) {
      tags.push('confusion');
    }
    if (comment.includes('help') || comment.includes('useful')) {
      tags.push('helpful');
    }
    if (comment.includes('slow') || comment.includes('delay')) {
      tags.push('performance');
    }
    
    return tags;
  }
  
  private async showFeedbackDialog(): Promise<any> {
    // Implementation for feedback UI dialog
    // Return user's feedback or null if cancelled
  }
}
```

### Audio Archive Manager

```typescript
class AudioArchive {
  private kwami: Kwami;
  
  async archiveConversation(conversationId: string) {
    try {
      // Get conversation details
      const conv = await this.kwami.mind.getConversation(conversationId);
      
      // Check if audio is available
      if (!conv.has_audio) {
        console.log('No audio available for this conversation');
        return;
      }
      
      // Download audio
      const audioBlob = await this.kwami.mind.getConversationAudio(conversationId);
      
      // Create archive entry
      const archive = {
        conversation_id: conversationId,
        agent_id: conv.agent_id,
        date: new Date(conv.metadata.start_time_unix_secs * 1000),
        duration: conv.metadata.call_duration_secs,
        audio_size: audioBlob.size,
        transcript: conv.transcript,
        analysis: conv.analysis
      };
      
      // Save to IndexedDB or cloud storage
      await this.saveToStorage(conversationId, audioBlob, archive);
      
      console.log('Conversation archived successfully');
      
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  }
  
  private async saveToStorage(id: string, blob: Blob, metadata: any) {
    // Implementation for storage (IndexedDB, S3, etc.)
  }
}
```

## Best Practices

### 1. Pagination for Large Datasets

Always use pagination when retrieving conversations to avoid performance issues:

```typescript
async function* getAllConversations(agentId: string) {
  let pageToken = undefined;
  
  do {
    const result = await kwami.mind.listConversations({
      agent_id: agentId,
      page_size: 50,
      page_token: pageToken
    });
    
    yield* result.conversations;
    
    pageToken = result.has_more ? result.next_page_token : undefined;
  } while (pageToken);
}

// Usage
for await (const conversation of getAllConversations('agent_abc123')) {
  console.log('Processing:', conversation.conversation_id);
}
```

### 2. Error Handling

Always implement proper error handling for API calls:

```typescript
async function safeGetConversation(conversationId: string) {
  try {
    return await kwami.mind.getConversation(conversationId);
  } catch (error) {
    if (error.message.includes('404')) {
      console.log('Conversation not found');
      return null;
    } else if (error.message.includes('401')) {
      console.log('Authentication failed');
      throw new Error('Please check your API key');
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

### 3. Caching Strategies

Implement caching to reduce API calls:

```typescript
class ConversationCache {
  private cache = new Map<string, ConversationResponse>();
  private ttl = 5 * 60 * 1000; // 5 minutes
  
  async get(conversationId: string): Promise<ConversationResponse> {
    const cached = this.cache.get(conversationId);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const conversation = await kwami.mind.getConversation(conversationId);
    
    this.cache.set(conversationId, {
      data: conversation,
      timestamp: Date.now()
    });
    
    return conversation;
  }
  
  invalidate(conversationId: string) {
    this.cache.delete(conversationId);
  }
}
```

### 4. Batch Processing

Process conversations in batches for better performance:

```typescript
async function batchProcessConversations(conversationIds: string[]) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < conversationIds.length; i += batchSize) {
    const batch = conversationIds.slice(i, i + batchSize);
    
    const promises = batch.map(id => 
      kwami.mind.getConversation(id).catch(err => ({
        id,
        error: err.message
      }))
    );
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Add delay to avoid rate limiting
    if (i + batchSize < conversationIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
```

### 5. Security Considerations

- Never expose API keys in client-side code
- Use signed URLs for client-side integrations
- Validate user permissions before allowing conversation access
- Implement rate limiting for API calls
- Sanitize feedback input before submission

## Conclusion

The Conversations API provides powerful tools for managing and analyzing agent conversations. By following these patterns and best practices, you can build robust conversation management systems that scale with your application needs.

For more information, visit the [ElevenLabs Documentation](https://elevenlabs.io/docs/agents-platform/api-reference/conversations).