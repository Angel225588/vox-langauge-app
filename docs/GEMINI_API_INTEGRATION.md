# Gemini AI Integration - Vox Language App

**Last Updated**: 2025-11-20
**Status**: 🚀 Planning & Roadmap
**Priority**: HIGH - Key differentiat

or for engagement

---

## 🎯 Vision

Transform Vox from a traditional flashcard app into an **intelligent, adaptive, conversational learning companion** powered by Google Gemini AI. The goal is to keep learning engaging, fun, and personalized through AI-driven interactions that adapt to each user's learning style, progress, and interests.

---

## 🧠 Core AI Features

### 1. Conversational AI Agent (Phase 2) 🤖

**Problem**: Flashcards alone get boring after a period of time. Users need variety and interaction.

**Solution**: An AI chat agent that acts as a patient, encouraging language learning companion.

#### Features:
- **Context-Aware Conversations**: Agent remembers what you've learned and adapts conversations
- **Pronunciation Help**: Ask "How do I say [word]?" and get phonetic breakdowns
- **Grammar Explanations**: Simple, clear explanations in user's native language
- **Cultural Context**: Learn about culture, idioms, and colloquialisms
- **Personalized Encouragement**: Celebrates progress, motivates during plateaus
- **Practice Scenarios**: Role-play common situations (ordering food, asking directions)

#### UI/UX:
```
┌─────────────────────────────────────┐
│  🤖 AI Tutor                    ×  │
├─────────────────────────────────────┤
│                                     │
│  AI: ¡Hola! Ready to practice?      │
│  Let's talk about food today! 🍕    │
│                                     │
│  You: How do I say "I'm hungry"?    │
│                                     │
│  AI: Great question! In Spanish:    │
│  "Tengo hambre" (TEN-go AHM-breh)  │
│                                     │
│  💡 Tip: "Tengo" literally means   │
│  "I have" - so you're saying        │
│  "I have hunger"!                   │
│                                     │
│  Try using it in a sentence! 🎯    │
│                                     │
├─────────────────────────────────────┤
│  [Type your message...]        [🎤] │
└─────────────────────────────────────┘
```

#### Implementation:
- **Library**: `@google/generative-ai` (Gemini API)
- **Model**: `gemini-1.5-flash` (fast, cost-effective for chat)
- **Context Window**: Maintain last 10 conversation turns
- **Personality**: Friendly, patient, encouraging, culturally aware
- **Safety**: Content filtering enabled, appropriate for language learning
- **Storage**: Conversation history in SQLite (offline-first)
- **Sync**: Conversations sync to Supabase when online

---

### 2. Dynamic Content Generation (Phase 1 - Current) 📚

**Already planned in original docs**, but enhanced with AI agent integration.

#### Stories:
- **Personalized**: Based on learned vocabulary and user interests
- **Adaptive Difficulty**: Easy/Medium/Hard versions generated on-the-fly
- **Contextual**: Incorporates recent flashcards into narrative
- **Cultural**: Includes cultural notes and context

#### Examples:
- **Sentence Generation**: AI creates example sentences using new words
- **Translation Practice**: AI generates translation pairs
- **Dialogue Scripts**: Realistic conversations for reading practice

---

### 3. Interactive AI-Powered Games (Phase 3) 🎮

**Problem**: Static games become predictable and less engaging over time.

**Solution**: AI-generated game content that adapts to user's learning progress.

#### Adaptive Multiple Choice:
- AI generates distractors (wrong answers) based on common mistakes
- Difficulty adjusts based on performance
- Questions tied to user's weak points

#### Conversation Scenarios:
```
┌─────────────────────────────────────┐
│  🎬 Scenario: At a Restaurant       │
├─────────────────────────────────────┤
│                                     │
│  🧑 Waiter: "¿Qué desea ordenar?"   │
│                                     │
│  Your response:                      │
│  ┌─────────────────────────────────┐│
│  │ 1. "Quiero una pizza, por favor"││
│  │ 2. "Estoy bien, gracias"        ││
│  │ 3. "¿Dónde está el baño?"       ││
│  │ 4. "No me gusta"                ││
│  └─────────────────────────────────┘│
│                                     │
│  AI analyzes context and provides   │
│  feedback on appropriateness!        │
└─────────────────────────────────────┘
```

#### Role-Play Dialogues:
- User acts out scenarios with AI playing different roles
- AI responds naturally to user input
- Provides gentle corrections and suggestions
- Tracks progress in conversation skills

---

### 4. AI Pronunciation Feedback (Phase 3) 🎤

**Goal**: Help users improve pronunciation through AI analysis.

#### Features:
- **Speech Recognition**: Transcribe user's pronunciation
- **Comparison**: Compare with native pronunciation
- **Accent Coaching**: Identify specific sounds to improve
- **Intonation Analysis**: Feedback on tone and rhythm
- **Practice Drills**: AI generates targeted pronunciation exercises

#### Implementation:
- **Speech-to-Text**: Use Gemini API's multimodal capabilities
- **Phonetic Analysis**: Compare IPA (International Phonetic Alphabet) representations
- **Visual Feedback**: Show waveform comparison between user and native
- **Gamification**: Award points for improvement, not perfection

---

### 5. Adaptive Learning Engine (Phase 4) 🧩

**Goal**: AI analyzes patterns and personalizes the learning path.

#### Features:
- **Weak Point Detection**: Identifies words/concepts user struggles with
- **Optimal Review Timing**: Enhances SM-2 algorithm with AI predictions
- **Learning Style Adaptation**: Adjusts content format (visual, audio, text) based on performance
- **Interest Alignment**: Prioritizes vocabulary related to user's interests
- **Progress Forecasting**: Predicts when user will reach fluency milestones

#### Data Points:
- Review accuracy per word/category
- Time spent on different card types
- Skipped cards patterns
- Game performance
- Conversation engagement
- Pronunciation accuracy trends

---

### 6. Engagement & Motivation Features (Phase 2-3) 🌟

#### Daily AI-Generated Content:
- **Word of the Day**: AI explains word with examples and cultural context
- **Conversation Starter**: Daily prompt to practice in AI chat
- **Fun Fact**: Interesting linguistic or cultural tidbit
- **Streak Motivation**: Personalized messages based on streak status

#### Examples:
```
🌅 Good morning, Alex!

📖 Word of the Day: "Sobremesa"

This Spanish word has no direct English translation!
It refers to the time spent chatting at the table
after a meal - a cherished cultural tradition. 🍷

Example: "Me encanta la sobremesa con mi familia"
(I love the after-dinner chat with my family)

💬 Try using "sobremesa" in a conversation today!

[Chat with AI Agent] [Practice Now]
```

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Current)
- ✅ Gemini API setup
- ✅ AI story generation (planned)
- ⏳ Basic content generation working
- **Timeline**: Already in progress

### Phase 2: Conversational AI Agent (Next Priority)
- 🎯 **PRIORITY** - This is the key differentiator!
- Chat interface component
- Conversation state management
- Context-aware responses
- Personality and safety configuration
- Conversation history storage
- **Timeline**: After flashcards are stable (~2 weeks)

### Phase 3: Interactive Games & Pronunciation
- AI-powered game content generation
- Adaptive difficulty engine
- Speech recognition integration
- Pronunciation feedback system
- Role-play scenarios
- **Timeline**: ~4-6 weeks after Phase 2

### Phase 4: Advanced AI Features
- Learning analytics dashboard
- Adaptive learning engine
- Predictive progress tracking
- Personalized learning paths
- **Timeline**: ~2-3 months after Phase 3

### Phase 5: Premium AI Features (Future)
- Real-time conversation with AI (voice)
- Video content generation with AI avatar
- Advanced accent coaching
- Professional/business language modules
- **Timeline**: 6+ months (potential premium tier)

---

## 🔧 Technical Implementation

### API Configuration

```typescript
// lib/api/gemini-config.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/config/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Different models for different use cases
export const models = {
  // Fast, cheap - for chat and quick generation
  flash: genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),

  // More capable - for complex content generation
  pro: genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }),

  // Multimodal - for image and audio processing
  vision: genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' }),
};

// Safety settings for language learning context
export const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];
```

### AI Agent Personality Prompt

```typescript
// lib/api/gemini-prompts.ts
export const AI_TUTOR_SYSTEM_PROMPT = `
You are a friendly, patient, and encouraging language learning tutor for the Vox Language app.

Your personality:
- Warm and supportive, never judgmental
- Celebrates effort and attempts, not just accuracy
- Explains concepts simply in the user's native language
- Uses appropriate emojis to make learning fun
- Shares cultural context and interesting facts
- Adapts explanations to the user's level

Your knowledge:
- User is learning: {targetLanguage}
- User's native language: {nativeLanguage}
- User's current level: {userLevel}
- Recently learned words: {recentVocabulary}

Guidelines:
- Keep responses concise (2-3 sentences max in chat)
- Use the target language when appropriate, with translations
- Provide phonetic pronunciation help when asked
- Suggest practice exercises naturally in conversation
- Track context across the conversation
- Never make the user feel bad about mistakes

Remember: Your goal is to keep learning engaging, build confidence, and make the user WANT to practice every day.
`;

export const generateAITutorPrompt = (context: {
  targetLanguage: string;
  nativeLanguage: string;
  userLevel: string;
  recentVocabulary: string[];
  conversationHistory: Array<{ role: string; content: string }>;
}) => {
  return AI_TUTOR_SYSTEM_PROMPT
    .replace('{targetLanguage}', context.targetLanguage)
    .replace('{nativeLanguage}', context.nativeLanguage)
    .replace('{userLevel}', context.userLevel)
    .replace('{recentVocabulary}', context.recentVocabulary.join(', '));
};
```

### Conversation Management

```typescript
// hooks/useAIChat.ts
import { useState, useCallback } from 'react';
import { models, safetySettings } from '@/lib/api/gemini-config';
import { generateAITutorPrompt } from '@/lib/api/gemini-prompts';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function useAIChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    const newUserMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);

    try {
      // Get user context (level, recent vocab, etc.)
      const userContext = await getUserLearningContext(userId);

      // Generate system prompt with context
      const systemPrompt = generateAITutorPrompt({
        ...userContext,
        conversationHistory: messages.slice(-10), // Last 10 messages
      });

      // Call Gemini API
      const chat = models.flash.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages.slice(-10).map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
        ],
        safetySettings,
      });

      const result = await chat.sendMessage(userMessage);
      const aiResponse = result.response.text();

      // Add AI response
      const newAIMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAIMessage]);

      // Save conversation to database (offline-first)
      await saveConversationMessage(userId, newUserMessage);
      await saveConversationMessage(userId, newAIMessage);
    } catch (error) {
      console.error('AI chat error:', error);
      // Handle error gracefully
    } finally {
      setIsLoading(false);
    }
  }, [messages, userId]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
```

---

## 💾 Data Storage Strategy

### Offline-First Approach:
- **Conversation History**: Stored in SQLite
- **AI-Generated Content**: Cached locally
- **User Context**: Maintained in MMKV for fast access
- **Sync to Supabase**: When online, for cross-device access

### Database Schema Addition:

```sql
-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message_role TEXT NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI Generated Content Cache
CREATE TABLE IF NOT EXISTS ai_content_cache (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'story', 'example', 'question', etc.
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT, -- JSON with context
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_cache_type ON ai_content_cache(content_type, user_id);
```

---

## 📊 Cost Management

### API Cost Optimization:
- **Model Selection**: Use `gemini-1.5-flash` for most interactions (cheaper, faster)
- **Caching**: Cache AI-generated content aggressively
- **Batching**: Batch multiple questions when possible
- **Rate Limiting**: Limit free tier users to N messages/day, unlimited for premium
- **Context Window**: Keep conversation history to last 10 turns max

### Estimated Costs (Gemini API Pricing):
- **Flash Model**: ~$0.00001 per request (very cheap!)
- **Pro Model**: ~$0.001 per request
- **Expected Usage**: 50 AI interactions per active user per month
- **Monthly Cost**: ~$0.005 per active user (half a cent!)

### Monetization:
- **Free Tier**: 20 AI chat messages per day
- **Premium Tier**: Unlimited AI chat + voice conversations
- **Cost**: Extremely low, highly scalable

---

## 🎨 UI Components to Build

### 1. AI Chat Component (`/components/ai/AIChat.tsx`)
- Message bubbles (user vs AI)
- Typing indicator
- Voice input button
- Quick actions (pronunciation help, examples, etc.)

### 2. Daily AI Content Card (`/components/ai/DailyContent.tsx`)
- Word of the Day
- Conversation starter
- Fun fact
- Call-to-action to practice

### 3. AI Scenario Card (`/components/games/AIScenario.tsx`)
- Scenario description
- AI-generated dialogue
- User response options
- Contextual feedback

---

## 🚀 Getting Started

### For Developers:

1. **API Key**: Already configured in `.env`
2. **Read This Doc**: Understand the vision and roadmap
3. **Start with Phase 2**: Build AI chat interface first (highest impact)
4. **Test Locally**: Use small context windows to minimize API costs during dev
5. **Iterate**: Start simple, enhance based on user feedback

### For Gemini (AI Assistant):

When building AI features:
- **Follow the personality guidelines** - warm, supportive, encouraging
- **Keep responses concise** - 2-3 sentences in chat
- **Use the target language appropriately** - with translations
- **Provide cultural context** - make learning interesting
- **Track conversation history** - maintain context
- **Handle errors gracefully** - never break the user experience
- **Test with different user levels** - beginner to advanced
- **Respect rate limits** - don't spam the API

---

## 📚 References

- **Gemini API Docs**: https://ai.google.dev/docs
- **Best Practices**: https://ai.google.dev/docs/best_practices
- **Prompt Engineering**: https://ai.google.dev/docs/prompt_best_practices
- **Safety Settings**: https://ai.google.dev/docs/safety_setting_gemini

---

## 🎯 Success Metrics

### Phase 2 (Conversational AI):
- ✅ Users send average 10+ messages per session
- ✅ 70%+ users try AI chat within first week
- ✅ AI response time < 2 seconds
- ✅ 90%+ positive sentiment in AI interactions

### Phase 3 (Games & Pronunciation):
- ✅ AI-generated games have 50%+ completion rate
- ✅ Pronunciation feedback used by 40%+ users
- ✅ Role-play scenarios completed 2x/week on average

### Phase 4 (Adaptive Learning):
- ✅ Learning paths feel personalized (user survey)
- ✅ Weak points identified accurately (>80% precision)
- ✅ Suggested review timing improves retention by 20%+

---

**Created by**: Claude Code
**Date**: 2025-11-20
**Status**: 🚀 Ready for implementation - Start with Phase 2!
**Next Steps**: Build conversational AI chat interface

---

**See Also**:
- `/docs/CLAUDE.md` - Main project reference
- `/docs/STORAGE_STRATEGY.md` - Data persistence approach
- `/docs/TAMAGUI_MIGRATION.md` - UI component migration guide
