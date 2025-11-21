# Gemini AI Implementation Guide
## Vox Language Learning App - Technical Reference

**Version:** 1.0
**Last Updated:** November 21, 2025
**Dependencies:** @google/generative-ai, expo-file-system, react-native-mmkv

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [API Initialization](#api-initialization)
5. [Feature Implementations](#feature-implementations)
6. [Prompt Engineering](#prompt-engineering)
7. [Offline Strategy](#offline-strategy)
8. [Security Best Practices](#security-best-practices)
9. [Cost Optimization](#cost-optimization)
10. [Testing & Debugging](#testing--debugging)

---

## Overview

This guide provides comprehensive technical instructions for implementing Gemini AI features in the Vox Language Learning App. Gemini powers:

- **Conversational AI Tutor**: Chat-based learning companion
- **Pronunciation Feedback**: Audio analysis and improvement suggestions
- **Story Generation**: Context-aware reading exercises from images
- **Grammar Assistance**: Real-time explanations and corrections
- **Adaptive Content**: Personalized flashcard and lesson generation

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App (Client)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Layer   │  │ Gemini Hook  │  │  MMKV Cache  │     │
│  │ (Components) │──│ useGeminiAI  │──│   Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend Proxy (Firebase Functions)                │
├─────────────────────────────────────────────────────────────┤
│  - API Key Management (Encrypted)                            │
│  - Request Validation & Rate Limiting                        │
│  - Response Caching (Redis)                                  │
│  - Error Handling & Retry Logic                              │
└────────────────────────────┬────────────────────────────────┘
                             │ Authenticated API Calls
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Gemini API (generativelanguage.googleapis.com) │
│  - gemini-2.0-flash-exp (fast, low-cost)                    │
│  - gemini-pro (advanced reasoning)                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → UI Component (e.g., ChatScreen)
2. **Component** → useGeminiAI Hook
3. **Hook** → Check MMKV Cache (if applicable)
4. **Hook** → Backend Proxy (Firebase Function)
5. **Proxy** → Validate Request → Call Gemini API
6. **Gemini** → Generate Response
7. **Proxy** → Cache Response → Return to Client
8. **Hook** → Store in MMKV → Update UI

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai --legacy-peer-deps
npm install react-native-mmkv --legacy-peer-deps
```

### 2. Environment Variables

Add to `.env`:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here_for_development_only
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_BACKEND_URL=https://your-firebase-function-url.com/gemini

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_PRONUNCIATION=true
ENABLE_IMAGE_STORIES=true
```

**⚠️ CRITICAL:** Never commit `.env` with real API keys. Use backend proxy in production.

### 3. TypeScript Types

Create `/lib/types/gemini.ts`:

```typescript
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

export interface GeminiConfig {
  model: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  text: string;
  tokenCount?: number;
  finishReason?: string;
  cached?: boolean;
}

export interface PronunciationFeedback {
  accuracy: number; // 0-100
  strengths: string[];
  improvements: string[];
  targetPhonemes: string[];
  transcription: string;
}

export interface StoryGenerationRequest {
  imageUri: string;
  targetLanguage: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  topics?: string[];
}

export interface StoryGenerationResponse {
  title: string;
  story: string;
  vocabulary: Array<{ word: string; translation: string; context: string }>;
  comprehensionQuestions: Array<{ question: string; answer: string }>;
}
```

---

## API Initialization

### Create Gemini Service

File: `/lib/api/gemini.ts`

```typescript
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '@/lib/config/env';
import type { GeminiConfig, GeminiMessage, GeminiResponse } from '@/lib/types/gemini';

class GeminiService {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private conversationHistory: GeminiMessage[] = [];

  constructor() {
    this.client = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.client.getGenerativeModel({ model: GEMINI_MODEL });
  }

  /**
   * Initialize a chat session with context
   */
  async startChat(systemPrompt: string): Promise<void> {
    this.conversationHistory = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
    ];
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(
    userMessage: string,
    config?: Partial<GeminiConfig>
  ): Promise<GeminiResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      // Generate response
      const chat = this.model.startChat({
        history: this.conversationHistory.slice(0, -1), // Exclude last message
        generationConfig: {
          temperature: config?.temperature ?? 0.7,
          topK: config?.topK ?? 40,
          topP: config?.topP ?? 0.95,
          maxOutputTokens: config?.maxOutputTokens ?? 1024,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      // Add model response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text }],
      });

      return {
        text,
        tokenCount: response.usageMetadata?.totalTokenCount,
        finishReason: response.candidates?.[0]?.finishReason,
        cached: false,
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Generate content from text and image
   */
  async generateFromMultimodal(
    prompt: string,
    imageData: string, // Base64 encoded
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiResponse> {
    try {
      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: imageData,
          },
        },
      ]);

      const response = result.response;
      const text = response.text();

      return {
        text,
        tokenCount: response.usageMetadata?.totalTokenCount,
        finishReason: response.candidates?.[0]?.finishReason,
        cached: false,
      };
    } catch (error) {
      console.error('Gemini Multimodal Error:', error);
      throw new Error(`Failed to process multimodal input: ${error.message}`);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   */
  getHistory(): GeminiMessage[] {
    return [...this.conversationHistory];
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
```

---

## Feature Implementations

### 1. Conversational AI Tutor

#### Hook: `useConversationalAI`

File: `/hooks/useConversationalAI.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import { geminiService } from '@/lib/api/gemini';
import type { GeminiResponse } from '@/lib/types/gemini';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function useConversationalAI(userId: string, targetLanguage: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached messages on mount
  useEffect(() => {
    const cacheKey = `chat_history_${userId}_${targetLanguage}`;
    const cached = storage.getString(cacheKey);
    if (cached) {
      setMessages(JSON.parse(cached));
    }
  }, [userId, targetLanguage]);

  // Initialize chat with system prompt
  useEffect(() => {
    const systemPrompt = `You are Voxy, a friendly and encouraging ${targetLanguage} language tutor.
Your role is to:
- Help learners practice ${targetLanguage} through natural conversation
- Correct mistakes gently and explain grammar when needed
- Adapt your language complexity to the learner's level
- Celebrate progress and provide positive reinforcement
- Use emojis occasionally to make learning fun
- Ask follow-up questions to keep conversations engaging

Always respond in ${targetLanguage}, but provide English translations for complex words in parentheses.`;

    geminiService.startChat(systemPrompt);
  }, [targetLanguage]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      setIsLoading(true);
      setError(null);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);

      try {
        const response: GeminiResponse = await geminiService.sendMessage(userMessage, {
          temperature: 0.8, // More creative for conversation
          maxOutputTokens: 512,
        });

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(),
        };

        const newMessages = [...messages, userMsg, assistantMsg];
        setMessages(newMessages);

        // Cache messages
        const cacheKey = `chat_history_${userId}_${targetLanguage}`;
        storage.set(cacheKey, JSON.stringify(newMessages));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userId, targetLanguage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    geminiService.clearHistory();
    const cacheKey = `chat_history_${userId}_${targetLanguage}`;
    storage.delete(cacheKey);
  }, [userId, targetLanguage]);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
  };
}
```

#### UI Component: `ChatScreen`

File: `/app/(tabs)/chat.tsx`

```typescript
import React, { useState, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversationalAI } from '@/hooks/useConversationalAI';
import { Button, Input, Card, YStack, XStack, Text } from '@/components/ui/tamagui';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const { messages, sendMessage, clearChat, isLoading } = useConversationalAI('user123', 'Spanish');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
    flatListRef.current?.scrollToEnd();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1} padding="$4" gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={24} fontWeight="bold">
              Chat with Voxy 🤖
            </Text>
            <Button variant="ghost" size="sm" onPress={clearChat}>
              Clear
            </Button>
          </XStack>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card
                variant="flat"
                padding="sm"
                marginBottom="$3"
                alignSelf={item.role === 'user' ? 'flex-end' : 'flex-start'}
                maxWidth="80%"
                backgroundColor={item.role === 'user' ? '$primary' : '$backgroundSecondary'}
              >
                <Text color={item.role === 'user' ? '$textInverse' : '$color'}>
                  {item.content}
                </Text>
              </Card>
            )}
          />

          <XStack gap="$2" alignItems="center">
            <Input
              flex={1}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              onSubmitEditing={handleSend}
            />
            <Button onPress={handleSend} disabled={isLoading || !inputText.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </XStack>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

### 2. Pronunciation Feedback

#### Implementation

File: `/lib/api/pronunciation.ts`

```typescript
import { geminiService } from './gemini';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import type { PronunciationFeedback } from '@/lib/types/gemini';

export async function analyzePronunciation(
  audioUri: string,
  targetText: string,
  targetLanguage: string
): Promise<PronunciationFeedback> {
  try {
    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const prompt = `Analyze this ${targetLanguage} pronunciation recording. The target text is: "${targetText}"

Provide detailed feedback in JSON format:
{
  "accuracy": <number 0-100>,
  "strengths": [<list of what they did well>],
  "improvements": [<specific areas to improve>],
  "targetPhonemes": [<challenging sounds they should practice>],
  "transcription": "<what you heard them say>"
}`;

    const response = await geminiService.generateFromMultimodal(
      prompt,
      audioBase64,
      'audio/mpeg' // or appropriate MIME type
    );

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Pronunciation analysis error:', error);
    throw error;
  }
}
```

---

## Prompt Engineering

### System Prompts

#### Tutor Personality

```typescript
const TUTOR_SYSTEM_PROMPT = `You are Voxy, an enthusiastic language tutor with these traits:
- Patient and encouraging, never judgmental
- Uses the Socratic method to guide learners
- Celebrates small wins with emojis (but not excessively)
- Adjusts complexity based on user's responses
- Provides grammar explanations when mistakes occur
- Asks clarifying questions to ensure understanding
- Uses real-world examples and cultural context

Conversation Guidelines:
1. Start with simple greetings and gradually increase complexity
2. If user makes a mistake, gently correct: "Great try! In [language], we say [correction]. For example..."
3. After 3-4 exchanges, introduce new vocabulary naturally
4. Every 5 messages, ask if they want to practice something specific
5. Keep responses concise (2-3 sentences max)`;
```

#### Story Generation

```typescript
const STORY_GENERATION_PROMPT = (level: string, topics: string[]) => `
Generate a ${level}-level story based on the provided image for language learners.

Requirements:
- Length: ${level === 'beginner' ? '100-150' : level === 'intermediate' ? '200-300' : '400-500'} words
- Vocabulary: Appropriate for ${level} level
- Include these topics if relevant: ${topics.join(', ')}
- Use simple grammar structures for beginners, more complex for advanced
- Create 3 comprehension questions with answers

Format your response as JSON:
{
  "title": "Story title",
  "story": "Full story text...",
  "vocabulary": [
    { "word": "palabra", "translation": "word", "context": "Used in sentence..." }
  ],
  "comprehensionQuestions": [
    { "question": "What happened?", "answer": "The answer..." }
  ]
}`;
```

---

## Offline Strategy

### Caching with MMKV

```typescript
import { MMKV } from 'react-native-mmkv';

const cache = new MMKV();

// Cache Gemini responses
export function cacheResponse(key: string, response: any, ttl: number = 86400000) {
  cache.set(
    key,
    JSON.stringify({
      data: response,
      timestamp: Date.now(),
      ttl,
    })
  );
}

// Retrieve cached response
export function getCachedResponse<T>(key: string): T | null {
  const cached = cache.getString(key);
  if (!cached) return null;

  const { data, timestamp, ttl } = JSON.parse(cached);

  // Check if expired
  if (Date.now() - timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return data as T;
}

// Queue offline requests
interface QueuedRequest {
  id: string;
  endpoint: string;
  payload: any;
  timestamp: number;
}

export function queueRequest(endpoint: string, payload: any) {
  const queue: QueuedRequest[] = JSON.parse(cache.getString('request_queue') || '[]');
  queue.push({
    id: Date.now().toString(),
    endpoint,
    payload,
    timestamp: Date.now(),
  });
  cache.set('request_queue', JSON.stringify(queue));
}

export function getQueuedRequests(): QueuedRequest[] {
  return JSON.parse(cache.getString('request_queue') || '[]');
}

export function clearQueue() {
  cache.delete('request_queue');
}
```

---

## Security Best Practices

### ⚠️ NEVER Expose API Keys Client-Side

**❌ BAD:**
```typescript
const API_KEY = 'AIzaSyD...'; // Hardcoded in app
const client = new GoogleGenerativeAI(API_KEY);
```

**✅ GOOD: Use Backend Proxy**

Firebase Function Example:

```typescript
// functions/src/gemini.ts
import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = functions.config().gemini.api_key;
const client = new GoogleGenerativeAI(GEMINI_API_KEY);

export const geminiProxy = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Rate limiting (implement with Firestore)
  const userId = context.auth.uid;
  // ... check rate limits ...

  // Validate input
  if (!data.prompt || typeof data.prompt !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid prompt');
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(data.prompt);
    const response = result.response;

    return {
      text: response.text(),
      tokenCount: response.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate content');
  }
});
```

---

## Cost Optimization

### Gemini API Pricing (as of Nov 2025)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|------------------------|-------------------------|
| gemini-2.0-flash-exp | $0.10 | $0.30 |
| gemini-pro | $0.50 | $1.50 |

### Optimization Strategies

1. **Use Flash Model for Most Tasks** (~5x cheaper)
2. **Implement Response Caching** (save 80%+ on repeated queries)
3. **Batch Requests** when possible
4. **Set `maxOutputTokens`** limits (default 1024 → 512 for chat)
5. **Pre-generate Content** during setup (lessons, flashcards)

### Cost Estimate

Average user (1 hour/day, 30 days):
- Chat messages: 50 msgs/day × 100 tokens avg = 150,000 tokens/month
- Pronunciation checks: 10/day × 500 tokens = 150,000 tokens/month
- Story generation: 5/week × 2000 tokens = 40,000 tokens/month

**Total:** ~340,000 tokens/month ≈ **$0.05/user/month**

---

## Testing & Debugging

### Test Mode Configuration

```typescript
// lib/config/gemini.ts
export const GEMINI_TEST_MODE = __DEV__;

if (GEMINI_TEST_MODE) {
  console.log('🧪 Gemini running in TEST MODE');
  // Use mock responses
}

// Mock responses for testing
export const MOCK_RESPONSES = {
  chat: {
    greeting: '¡Hola! 👋 How can I help you practice Spanish today?',
    feedback: 'Great job! Your pronunciation is improving. Try to emphasize the "rr" sound more.',
  },
  pronunciation: {
    accuracy: 85,
    strengths: ['Clear consonants', 'Good rhythm'],
    improvements: ['Work on rolling "r" sound'],
    targetPhonemes: ['r', 'rr'],
    transcription: 'pero',
  },
};
```

### Debugging Tools

```typescript
// Enable verbose logging
export function enableGeminiDebugMode() {
  global.GEMINI_DEBUG = true;
}

// Log all API calls
function logAPICall(endpoint: string, payload: any, response: any) {
  if (global.GEMINI_DEBUG) {
    console.group(`[Gemini API] ${endpoint}`);
    console.log('Payload:', payload);
    console.log('Response:', response);
    console.log('Tokens:', response.tokenCount);
    console.groupEnd();
  }
}
```

---

## Next Steps

1. ✅ Install dependencies (`@google/generative-ai`, `react-native-mmkv`)
2. ✅ Create `lib/api/gemini.ts` service
3. ✅ Build `useConversationalAI` hook
4. ✅ Implement ChatScreen UI
5. ⏳ Set up Firebase backend proxy (CRITICAL for production)
6. ⏳ Add pronunciation feedback feature
7. ⏳ Implement image-based story generation
8. ⏳ Add analytics to track token usage and costs

---

**Questions or Issues?** Check `/docs/TROUBLESHOOTING.md` or ask in team chat.
