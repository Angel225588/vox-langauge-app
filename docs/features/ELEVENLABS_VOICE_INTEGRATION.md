# ElevenLabs Voice Integration - Implementation Guide

**Created**: December 27, 2025
**Status**: Implementation Ready
**Priority**: P1 (Critical Differentiator)
**Scope**: Live Voice Conversations Only (vocabulary cards use expo-edge-speech)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Installation](#4-installation)
5. [Configuration](#5-configuration)
6. [Implementation](#6-implementation)
7. [Voice & Accent System](#7-voice--accent-system)
8. [Speed & Emotion Control](#8-speed--emotion-control)
9. [Error Handling](#9-error-handling)
10. [Testing](#10-testing)
11. [Cost Management](#11-cost-management)
12. [Migration from Gemini Live](#12-migration-from-gemini-live)

---

## 1. Overview

### Purpose
Replace Gemini Live API with ElevenLabs Conversational AI for voice conversations to achieve:
- Best-in-class voice quality
- Multiple regional accents (France/Quebec, Spain/Mexico, Brazil/Portugal)
- Emotion control for immersive scenarios
- Official React Native/Expo SDK support

### Scope
| Feature | Solution | Reason |
|---------|----------|--------|
| Live Voice Calls | ElevenLabs | Best quality, accents, emotions |
| Vocabulary Cards | expo-edge-speech | FREE, good quality, sufficient |
| Offline Fallback | Sherpa-ONNX (future) | Works without internet |

### Key Benefits
- 63.75% user preference over competitors (Podonos blind test)
- 3,000+ voices with native speakers for each language
- Sub-200ms latency with Flash v2.5 model
- Native Gemini 2.0 Flash integration for LLM backend

---

## 2. Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VOX VOICE CALL FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Device (React Native)                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  VoiceCallScreen                                         │    │
│  │  ├─ useElevenLabsConversation hook                       │    │
│  │  ├─ Push-to-talk button                                  │    │
│  │  ├─ Real-time transcription                              │    │
│  │  └─ Audio playback                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  @elevenlabs/react-native SDK                            │    │
│  │  ├─ WebRTC connection (via LiveKit)                      │    │
│  │  ├─ Audio streaming                                      │    │
│  │  └─ Event handling                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ElevenLabs Cloud                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ Speech-to-  │ → │ Gemini 2.0   │ → │ Text-to-Speech  │    │
│  │ Text (STT)  │    │ Flash (LLM)  │    │ (TTS)           │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│                                                                  │
│  Features:                                                       │
│  • Natural turn-taking                                          │
│  • Automatic language detection                                  │
│  • Emotion control                                              │
│  • 32 languages, 50+ accents                                    │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
lib/
├── voice/
│   ├── elevenLabs.ts          # ElevenLabs client configuration
│   ├── elevenLabsTypes.ts     # TypeScript types
│   ├── voiceConfig.ts         # Voice/accent configuration
│   ├── geminiLive.ts          # (Existing - keep as fallback)
│   └── types.ts               # (Existing)
│
hooks/
├── useElevenLabsConversation.ts  # Main conversation hook
├── useVoiceConversation.ts       # (Existing - update to use ElevenLabs)
│
components/cards/
├── VoiceCallScreen.tsx           # (Existing - update)
├── PostCallFeedbackScreen.tsx    # (Existing - update)
│
app/
├── voice-conversation.tsx        # (Existing - update accent selector)
```

---

## 3. Prerequisites

### ElevenLabs Account Setup

1. **Create Account**: https://elevenlabs.io/
2. **Choose Plan**: Pro ($82.50/mo recommended for launch)
3. **Create Conversational AI Agent**:
   - Go to: Conversational AI → Create Agent
   - Select voice for each language
   - Configure system prompt for language learning
   - Enable Gemini 2.0 Flash as LLM

### Required API Keys

| Key | Purpose | Location |
|-----|---------|----------|
| `EXPO_PUBLIC_ELEVENLABS_API_KEY` | SDK authentication | .env |
| `EXPO_PUBLIC_ELEVENLABS_AGENT_ID` | Agent identifier | .env |

### Expo Development Build

ElevenLabs SDK requires native modules - **Expo Go will NOT work**.

```bash
# Create development build
npx expo prebuild
npx expo run:ios  # or run:android
```

---

## 4. Installation

### Step 1: Install SDK and Dependencies

```bash
# Main SDK
npm install @elevenlabs/react-native

# Peer dependencies (WebRTC via LiveKit)
npm install @livekit/react-native @livekit/react-native-webrtc livekit-client
```

### Step 2: Configure app.json

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Vox needs microphone access for voice conversations with AI tutors.",
        "NSSpeechRecognitionUsageDescription": "Vox uses speech recognition for language practice."
      }
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    },
    "plugins": [
      "@livekit/react-native-webrtc"
    ]
  }
}
```

### Step 3: Add Environment Variables

```bash
# .env
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
```

### Step 4: Create Development Build

```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

---

## 5. Configuration

### ElevenLabs Dashboard Configuration

#### Agent Settings

| Setting | Value | Notes |
|---------|-------|-------|
| **LLM** | Gemini 2.0 Flash | Best balance of speed/quality |
| **Voice** | Per-language native | See Voice Selection below |
| **Speed** | 0.9 (default) | Slightly slower for learning |
| **Language Detection** | Enabled | Auto-detect user's language |

#### System Prompt Template

```
You are a friendly, patient language tutor helping users practice {TARGET_LANGUAGE}.

Your role:
- Speak naturally in {TARGET_LANGUAGE} with a {ACCENT} accent
- Keep responses concise (1-2 sentences for beginners, 2-3 for intermediate+)
- Gently correct grammar/pronunciation errors when appropriate
- Adapt difficulty to the user's level: {PROFICIENCY_LEVEL}
- Stay in character for the scenario: {SCENARIO_TYPE}

Current scenario: {SCENARIO_DESCRIPTION}

Guidelines:
- Be encouraging and supportive
- If the user struggles, simplify your language
- Mix in common phrases they're learning
- Never break character or switch to English unless asked
```

#### Event Callbacks (Enable in Advanced Tab)

- [x] onConnect
- [x] onDisconnect
- [x] onMessage
- [x] onError
- [x] onStatusChange

---

## 6. Implementation

### 6.1 ElevenLabs Types

```typescript
// lib/voice/elevenLabsTypes.ts

export type ElevenLabsConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting';

export type DisconnectReason = 'user' | 'agent' | 'error';

export interface ElevenLabsMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ElevenLabsAgentConfig {
  agentId: string;
  overrides?: {
    voice?: string;
    speed?: number;
    systemPrompt?: string;
  };
}

export interface ConversationCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: DisconnectReason) => void;
  onMessage?: (message: ElevenLabsMessage) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ElevenLabsConnectionStatus) => void;
}

export interface ConversationSession {
  id: string;
  startTime: number;
  endTime?: number;
  messages: ElevenLabsMessage[];
  scenario: string;
  accent: string;
  pointsEarned: number;
}
```

### 6.2 Voice Configuration

```typescript
// lib/voice/voiceConfig.ts

export interface VoiceConfig {
  id: string;
  name: string;
  language: string;
  accent: string;
  flag: string;
  elevenLabsVoiceId: string;
  description: string;
  proficiencyRange: ('beginner' | 'intermediate' | 'advanced')[];
}

// ElevenLabs voice IDs - replace with actual IDs from your dashboard
export const ELEVENLABS_VOICES: VoiceConfig[] = [
  // French Voices
  {
    id: 'fr-FR-female',
    name: 'Marie',
    language: 'fr',
    accent: 'France',
    flag: '🇫🇷',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Native French speaker from Paris',
    proficiencyRange: ['beginner', 'intermediate', 'advanced'],
  },
  {
    id: 'fr-CA-female',
    name: 'Sophie',
    language: 'fr',
    accent: 'Quebec',
    flag: '🇨🇦',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Native Québécois speaker',
    proficiencyRange: ['intermediate', 'advanced'],
  },

  // Spanish Voices
  {
    id: 'es-ES-male',
    name: 'Carlos',
    language: 'es',
    accent: 'Spain',
    flag: '🇪🇸',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Native Castilian Spanish speaker',
    proficiencyRange: ['beginner', 'intermediate', 'advanced'],
  },
  {
    id: 'es-MX-female',
    name: 'Lucia',
    language: 'es',
    accent: 'Mexico',
    flag: '🇲🇽',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Native Mexican Spanish speaker',
    proficiencyRange: ['beginner', 'intermediate', 'advanced'],
  },

  // Portuguese Voices
  {
    id: 'pt-BR-female',
    name: 'Ana',
    language: 'pt',
    accent: 'Brazil',
    flag: '🇧🇷',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Native Brazilian Portuguese speaker',
    proficiencyRange: ['beginner', 'intermediate', 'advanced'],
  },
  {
    id: 'pt-PT-male',
    name: 'Miguel',
    language: 'pt',
    accent: 'Portugal',
    flag: '🇵🇹',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Native European Portuguese speaker',
    proficiencyRange: ['intermediate', 'advanced'],
  },

  // English Voices (for ESL learners)
  {
    id: 'en-US-female',
    name: 'Sarah',
    language: 'en',
    accent: 'American',
    flag: '🇺🇸',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Neutral American English speaker',
    proficiencyRange: ['beginner', 'intermediate', 'advanced'],
  },
  {
    id: 'en-GB-male',
    name: 'James',
    language: 'en',
    accent: 'British',
    flag: '🇬🇧',
    elevenLabsVoiceId: 'REPLACE_WITH_ACTUAL_ID',
    description: 'Standard British English speaker',
    proficiencyRange: ['intermediate', 'advanced'],
  },
];

export const getVoicesForLanguage = (language: string): VoiceConfig[] => {
  return ELEVENLABS_VOICES.filter(v => v.language === language);
};

export const getVoiceById = (id: string): VoiceConfig | undefined => {
  return ELEVENLABS_VOICES.find(v => v.id === id);
};

export const getDefaultVoiceForLanguage = (language: string): VoiceConfig | undefined => {
  const voices = getVoicesForLanguage(language);
  return voices[0];
};
```

### 6.3 Main Conversation Hook

```typescript
// hooks/useElevenLabsConversation.ts

import { useCallback, useState, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react-native';
import {
  ElevenLabsConnectionStatus,
  ElevenLabsMessage,
  ConversationSession,
  DisconnectReason
} from '@/lib/voice/elevenLabsTypes';
import { VoiceConfig, getVoiceById } from '@/lib/voice/voiceConfig';

interface UseElevenLabsConversationProps {
  agentId?: string;
  voice?: VoiceConfig;
  scenario?: string;
  userProficiency?: 'beginner' | 'intermediate' | 'advanced';
  onSessionEnd?: (session: ConversationSession) => void;
}

interface UseElevenLabsConversationReturn {
  // State
  status: ElevenLabsConnectionStatus;
  messages: ElevenLabsMessage[];
  isConnected: boolean;
  isSpeaking: boolean;
  error: Error | null;
  sessionDuration: number;

  // Actions
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;

  // Session data
  currentSession: ConversationSession | null;
}

export function useElevenLabsConversation({
  agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID,
  voice,
  scenario = 'casual_conversation',
  userProficiency = 'intermediate',
  onSessionEnd,
}: UseElevenLabsConversationProps = {}): UseElevenLabsConversationReturn {

  const [messages, setMessages] = useState<ElevenLabsMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);

  const sessionStartRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate speed based on proficiency
  const getSpeedForProficiency = useCallback((level: string): number => {
    switch (level) {
      case 'beginner': return 0.8;
      case 'intermediate': return 0.95;
      case 'advanced': return 1.1;
      default: return 0.9;
    }
  }, []);

  // Build dynamic system prompt
  const buildSystemPrompt = useCallback((): string => {
    const voiceName = voice?.name || 'AI Tutor';
    const accentDesc = voice?.accent || 'native';
    const language = voice?.language || 'the target language';

    return `You are ${voiceName}, a friendly language tutor with a ${accentDesc} accent.

Current scenario: ${scenario}
User proficiency: ${userProficiency}

Guidelines:
- Speak naturally in ${language}
- Keep responses concise (1-2 sentences for beginners)
- Gently correct errors when appropriate
- Be encouraging and patient
- Stay in character for the scenario`;
  }, [voice, scenario, userProficiency]);

  // ElevenLabs SDK hook
  const conversation = useConversation({
    agentId: agentId!,
    overrides: voice ? {
      voice: voice.elevenLabsVoiceId,
      speed: getSpeedForProficiency(userProficiency),
      systemPrompt: buildSystemPrompt(),
    } : undefined,
  });

  const { status, startSession: sdkStartSession, endSession: sdkEndSession } = conversation;

  // Set up event listeners
  useEffect(() => {
    conversation.onConnect?.(() => {
      console.log('[ElevenLabs] Connected');
      sessionStartRef.current = Date.now();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (sessionStartRef.current) {
          setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
        }
      }, 1000);

      // Initialize session
      setCurrentSession({
        id: `session_${Date.now()}`,
        startTime: Date.now(),
        messages: [],
        scenario,
        accent: voice?.accent || 'default',
        pointsEarned: 0,
      });
    });

    conversation.onDisconnect?.((reason: DisconnectReason) => {
      console.log('[ElevenLabs] Disconnected:', reason);

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Finalize session
      if (currentSession) {
        const finalSession: ConversationSession = {
          ...currentSession,
          endTime: Date.now(),
          messages,
          pointsEarned: calculatePoints(messages, sessionDuration),
        };
        onSessionEnd?.(finalSession);
      }

      sessionStartRef.current = null;
    });

    conversation.onMessage?.((message) => {
      const newMessage: ElevenLabsMessage = {
        role: message.role as 'user' | 'assistant',
        content: message.content,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);

      // Track speaking state
      if (message.role === 'assistant') {
        setIsSpeaking(true);
        // Estimate speaking duration based on content length
        const speakingDuration = Math.max(1000, message.content.length * 50);
        setTimeout(() => setIsSpeaking(false), speakingDuration);
      }
    });

    conversation.onError?.((err: Error) => {
      console.error('[ElevenLabs] Error:', err);
      setError(err);
    });

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [conversation, voice, scenario, messages, sessionDuration, currentSession, onSessionEnd]);

  // Calculate points based on conversation metrics
  const calculatePoints = useCallback((msgs: ElevenLabsMessage[], duration: number): number => {
    const userMessages = msgs.filter(m => m.role === 'user');
    const turns = userMessages.length;
    const avgWordsPerTurn = userMessages.reduce((acc, m) =>
      acc + m.content.split(' ').length, 0) / Math.max(turns, 1);

    let points = 0;

    // Base points per turn
    points += turns * 10;

    // Bonus for 5+ turns
    if (turns >= 5) points += 25;

    // Bonus for 5+ words per turn average
    if (avgWordsPerTurn >= 5) points += 15;

    // Bonus for 2+ minutes conversation
    if (duration >= 120) points += 20;

    // Bonus for 5+ minutes conversation
    if (duration >= 300) points += 30;

    return points;
  }, []);

  // Start session
  const startSession = useCallback(async () => {
    try {
      setError(null);
      setMessages([]);
      setSessionDuration(0);
      await sdkStartSession();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [sdkStartSession]);

  // End session
  const endSession = useCallback(async () => {
    try {
      await sdkEndSession();
    } catch (err) {
      console.error('[ElevenLabs] Error ending session:', err);
    }
  }, [sdkEndSession]);

  return {
    status,
    messages,
    isConnected: status === 'connected',
    isSpeaking,
    error,
    sessionDuration,
    startSession,
    endSession,
    currentSession,
  };
}
```

---

## 7. Voice & Accent System

### Accent Selection by Language

| Language | Primary Accent | Secondary Accents |
|----------|---------------|-------------------|
| French | France (Paris) | Quebec (Montreal) |
| Spanish | Mexico (LATAM) | Spain (Castilian), Argentina |
| Portuguese | Brazil (São Paulo) | Portugal (Lisbon) |
| English | American (Neutral) | British (RP), Australian |

### Voice Selection UI

Update the existing accent selector in `app/voice-conversation.tsx`:

```typescript
// Updated accent selector with ElevenLabs voices
const AccentSelector = ({ language, onSelect, selectedVoice }) => {
  const voices = getVoicesForLanguage(language);

  return (
    <View>
      <Text>Choose your tutor's accent:</Text>
      {voices.map(voice => (
        <TouchableOpacity
          key={voice.id}
          onPress={() => onSelect(voice)}
          style={selectedVoice?.id === voice.id ? styles.selected : styles.option}
        >
          <Text>{voice.flag} {voice.name}</Text>
          <Text style={styles.description}>{voice.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

---

## 8. Speed & Emotion Control

### Speed by Proficiency Level

```typescript
const SPEED_CONFIG = {
  beginner: 0.8,      // 20% slower - clear pronunciation
  elementary: 0.85,   // 15% slower
  intermediate: 0.95, // 5% slower - near natural
  advanced: 1.0,      // Natural speed
  native: 1.1,        // 10% faster - challenge mode
};
```

### Emotion by Scenario

```typescript
const SCENARIO_EMOTIONS = {
  cafe_ordering: {
    emotion: 'friendly',
    instructions: 'Speak warmly like a welcoming barista',
  },
  job_interview: {
    emotion: 'professional',
    instructions: 'Speak formally and clearly',
  },
  emergency: {
    emotion: 'urgent',
    instructions: 'Speak with appropriate urgency',
  },
  casual_chat: {
    emotion: 'relaxed',
    instructions: 'Speak naturally like talking to a friend',
  },
  storytelling: {
    emotion: 'expressive',
    instructions: 'Use full emotional range for the story',
  },
};
```

---

## 9. Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `connection_failed` | Network issue | Retry with exponential backoff |
| `agent_not_found` | Invalid agent ID | Check ELEVENLABS_AGENT_ID |
| `rate_limited` | Too many requests | Implement request queue |
| `credits_exhausted` | Plan limit reached | Upgrade plan or fallback to Gemini |

### Fallback Strategy

```typescript
const startConversation = async () => {
  try {
    // Try ElevenLabs first
    await elevenLabsConversation.startSession();
  } catch (error) {
    console.warn('ElevenLabs failed, falling back to Gemini Live');
    // Fallback to existing Gemini Live implementation
    await geminiLiveConversation.connect();
  }
};
```

---

## 10. Testing

### Test Checklist

#### Connection Tests
- [ ] Successful connection with valid credentials
- [ ] Graceful handling of invalid API key
- [ ] Reconnection after network interruption
- [ ] Proper cleanup on component unmount

#### Audio Tests
- [ ] Clear audio input from microphone
- [ ] Clear audio output to speaker
- [ ] No echo or feedback
- [ ] Works with headphones
- [ ] Works with speaker

#### Voice Quality Tests
- [ ] French (France) accent clarity
- [ ] French (Quebec) accent distinction
- [ ] Spanish (Spain) vs Mexico difference
- [ ] Portuguese (Brazil) vs Portugal difference
- [ ] Speed control at 0.8x, 1.0x, 1.1x

#### Platform Tests
- [ ] iOS physical device
- [ ] Android physical device
- [ ] Various screen sizes
- [ ] Background/foreground transitions

---

## 11. Cost Management

### Usage Tracking

```typescript
// Track conversation minutes for cost monitoring
const trackUsage = (session: ConversationSession) => {
  const minutes = Math.ceil(
    ((session.endTime || Date.now()) - session.startTime) / 60000
  );

  // Log to analytics
  analytics.track('voice_conversation', {
    duration_minutes: minutes,
    scenario: session.scenario,
    accent: session.accent,
    messages_count: session.messages.length,
  });
};
```

### Monthly Limits

| Plan | Monthly Minutes | Alerts At |
|------|-----------------|-----------|
| Pro | ~500 min | 400 min (80%) |
| Scale | ~2,000 min | 1,600 min (80%) |

---

## 12. Migration from Gemini Live

### Migration Steps

1. **Keep Gemini Live as fallback** - don't remove existing code
2. **Add feature flag** for gradual rollout
3. **A/B test** voice quality preference
4. **Monitor costs** during transition

### Feature Flag Implementation

```typescript
const useVoiceProvider = () => {
  const { isElevenLabsEnabled } = useFeatureFlags();

  if (isElevenLabsEnabled) {
    return useElevenLabsConversation;
  }
  return useVoiceConversation; // Existing Gemini Live hook
};
```

---

## Appendix: Quick Reference

### Environment Variables

```bash
EXPO_PUBLIC_ELEVENLABS_API_KEY=sk_xxxxx
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxx
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/voice/elevenLabsTypes.ts` | TypeScript types |
| `lib/voice/voiceConfig.ts` | Voice/accent configuration |
| `hooks/useElevenLabsConversation.ts` | Main conversation hook |
| `app/voice-conversation.tsx` | Entry screen (update) |
| `components/cards/VoiceCallScreen.tsx` | Call UI (update) |

### Useful Links

- [ElevenLabs Dashboard](https://elevenlabs.io/app)
- [API Documentation](https://elevenlabs.io/docs/api-reference)
- [React Native SDK](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- [Voice Library](https://elevenlabs.io/voice-library)

---

**Document Version**: 1.0
**Last Updated**: December 27, 2025
**Author**: Claude Code PM
