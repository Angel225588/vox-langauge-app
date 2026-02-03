# Voice Conversation System - Implementation Plan

> **Status**: Ready for Review
> **Created**: December 16, 2025
> **Target**: Phase 1 MVP Implementation

---

## Implementation Overview

This document details the step-by-step implementation plan for Phase 1 (Gemini Live API MVP) of the Voice Conversation System.

---

## Phase 1: Gemini Live API MVP

### Sprint 1: Core Infrastructure (Days 1-4)

#### Task 1.1: Audio Recording System
**Priority**: P0 | **Estimate**: 1 day

**Files to create:**
- `lib/voice/audioRecorder.ts`
- `lib/voice/types.ts`

**Implementation:**
```typescript
// lib/voice/audioRecorder.ts
// - Expo Audio recording wrapper
// - PCM 16-bit, 16kHz, mono format (Gemini requirement)
// - Start/stop/pause controls
// - Audio level monitoring for UI feedback
// - Permission handling
```

**Acceptance Criteria:**
- [ ] Can record audio in correct format for Gemini
- [ ] Handles permissions gracefully
- [ ] Provides audio level callback for visualization
- [ ] Works on iOS and Android

---

#### Task 1.2: Audio Playback System
**Priority**: P0 | **Estimate**: 0.5 days

**Files to create:**
- `lib/voice/audioPlayer.ts`

**Implementation:**
```typescript
// lib/voice/audioPlayer.ts
// - Expo Audio playback wrapper
// - Stream audio chunks as they arrive
// - Queue management for sequential playback
// - Volume and playback rate controls
```

**Acceptance Criteria:**
- [ ] Can play audio chunks as they stream in
- [ ] Smooth playback without gaps
- [ ] Works on iOS and Android

---

#### Task 1.3: Gemini Live API Client
**Priority**: P0 | **Estimate**: 2 days

**Files to create:**
- `lib/voice/geminiLive.ts`
- `lib/voice/geminiLiveTypes.ts`

**Implementation:**
```typescript
// lib/voice/geminiLive.ts
export class GeminiLiveClient {
  private ws: WebSocket;
  private config: GeminiLiveConfig;

  // Connection management
  async connect(): Promise<void>;
  disconnect(): void;
  reconnect(): Promise<void>;

  // Setup message with voice config
  private sendSetup(): void;

  // Audio streaming
  sendAudio(audioData: ArrayBuffer): void;
  sendAudioEnd(): void;

  // Event handlers
  onAudioResponse(callback: (audio: ArrayBuffer) => void): void;
  onTranscript(callback: (text: string, isFinal: boolean) => void): void;
  onTurnComplete(callback: () => void): void;
  onError(callback: (error: Error) => void): void;
  onDisconnect(callback: () => void): void;

  // Metrics
  getLatencyMs(): number;
}
```

**WebSocket Protocol:**
```typescript
// Connection URL
const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

// Setup message
{
  setup: {
    model: 'models/gemini-2.0-flash-live',
    generation_config: {
      response_modalities: ['AUDIO'],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: 'Puck' // Options: Puck, Charon, Kore, Fenrir, Aoede
          }
        }
      }
    },
    system_instruction: {
      parts: [{ text: systemPrompt }]
    }
  }
}

// Send audio (base64 encoded PCM)
{
  realtime_input: {
    media_chunks: [{
      mime_type: 'audio/pcm',
      data: base64AudioData
    }]
  }
}

// Receive audio response
{
  server_content: {
    model_turn: {
      parts: [{
        inline_data: {
          mime_type: 'audio/pcm',
          data: base64AudioData
        }
      }]
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Establishes WebSocket connection to Gemini Live API
- [ ] Sends setup message with voice configuration
- [ ] Streams audio to API
- [ ] Receives and processes audio responses
- [ ] Handles disconnection and reconnection
- [ ] Error handling with meaningful messages

---

#### Task 1.4: Conversation Manager
**Priority**: P0 | **Estimate**: 1 day

**Files to create:**
- `lib/voice/conversationManager.ts`

**Implementation:**
```typescript
// lib/voice/conversationManager.ts
export class ConversationManager {
  private geminiClient: GeminiLiveClient;
  private audioRecorder: AudioRecorder;
  private audioPlayer: AudioPlayer;

  // State
  private state: 'idle' | 'listening' | 'processing' | 'speaking';
  private messages: ConversationMessage[];

  // Lifecycle
  async startConversation(config: ConversationConfig): Promise<void>;
  async endConversation(): Promise<ConversationResult>;

  // User interaction
  startListening(): void;
  stopListening(): void;

  // Events
  onStateChange(callback: (state: ConversationState) => void): void;
  onMessage(callback: (message: ConversationMessage) => void): void;
  onError(callback: (error: Error) => void): void;
}
```

**Acceptance Criteria:**
- [ ] Coordinates audio recording, Gemini client, and playback
- [ ] Manages conversation state machine
- [ ] Stores conversation history
- [ ] Provides clean API for UI components

---

### Sprint 2: React Hooks & UI (Days 5-8)

#### Task 2.1: Voice Conversation Hook
**Priority**: P0 | **Estimate**: 1 day

**Files to create:**
- `hooks/useVoiceConversation.ts`

**Implementation:**
```typescript
// hooks/useVoiceConversation.ts
export function useVoiceConversation(options: UseVoiceConversationOptions) {
  const [state, setState] = useState<ConversationState>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  const conversationManager = useRef<ConversationManager>();

  // Initialize
  useEffect(() => {
    conversationManager.current = new ConversationManager();
    // Setup event listeners
    return () => conversationManager.current?.cleanup();
  }, []);

  // Actions
  const startConversation = useCallback(async () => {
    await conversationManager.current?.startConversation({
      scenario: options.scenario,
      language: options.language,
      systemPrompt: options.systemPrompt,
    });
  }, [options]);

  const endConversation = useCallback(async () => {
    return conversationManager.current?.endConversation();
  }, []);

  const startListening = useCallback(() => {
    conversationManager.current?.startListening();
  }, []);

  const stopListening = useCallback(() => {
    conversationManager.current?.stopListening();
  }, []);

  return {
    // State
    state,
    messages,
    isConnected,
    latencyMs,
    isListening: state === 'listening',
    isSpeaking: state === 'speaking',
    isProcessing: state === 'processing',

    // Actions
    startConversation,
    endConversation,
    startListening,
    stopListening,
  };
}
```

**Acceptance Criteria:**
- [ ] Exposes clean API for UI components
- [ ] Manages all voice conversation state
- [ ] Handles cleanup on unmount
- [ ] Provides latency metrics

---

#### Task 2.2: Voice Button Component
**Priority**: P0 | **Estimate**: 0.5 days

**Files to create:**
- `components/voice/VoiceButton.tsx`

**Implementation:**
```typescript
// components/voice/VoiceButton.tsx
// - Large circular button for push-to-talk
// - Visual states: idle, listening, processing, disabled
// - Pulse animation when listening
// - Haptic feedback on press
// - Accessibility labels
```

**Design:**
- Size: 80x80 touch target
- Colors: Primary gradient when active, muted when idle
- Animation: Pulse effect during listening
- Icon: Microphone icon with state changes

**Acceptance Criteria:**
- [ ] Clear visual feedback for all states
- [ ] Smooth animations
- [ ] Haptic feedback
- [ ] Accessible

---

#### Task 2.3: Conversation Bubble Component
**Priority**: P1 | **Estimate**: 0.5 days

**Files to create:**
- `components/voice/ConversationBubble.tsx`

**Implementation:**
```typescript
// components/voice/ConversationBubble.tsx
// - Message bubble with sender indicator (user/AI)
// - Shows transcript text
// - Typing/speaking indicator animation
// - Timestamp
```

**Acceptance Criteria:**
- [ ] Distinguishes user vs AI messages
- [ ] Shows speaking indicator during AI response
- [ ] Smooth scroll to latest message

---

#### Task 2.4: Voice Waveform Component
**Priority**: P2 | **Estimate**: 0.5 days

**Files to create:**
- `components/voice/VoiceWaveform.tsx`

**Implementation:**
```typescript
// components/voice/VoiceWaveform.tsx
// - Audio visualization during recording/playback
// - Animated bars based on audio level
// - Uses Skia or Reanimated for performance
```

**Acceptance Criteria:**
- [ ] Visualizes audio levels in real-time
- [ ] 60fps animation
- [ ] Minimal battery impact

---

#### Task 2.5: Main Voice Conversation Screen
**Priority**: P0 | **Estimate**: 1.5 days

**Files to create:**
- `components/voice/VoiceConversation.tsx`
- `app/voice-practice/[scenarioId].tsx`

**Implementation:**
```typescript
// components/voice/VoiceConversation.tsx
export function VoiceConversation({
  scenario,
  character,
  onComplete,
}: VoiceConversationProps) {
  const {
    state,
    messages,
    isConnected,
    startConversation,
    endConversation,
    startListening,
    stopListening,
  } = useVoiceConversation({
    scenario,
    language: scenario.language,
    systemPrompt: generatePrompt(scenario, character),
  });

  return (
    <View style={styles.container}>
      {/* Character avatar */}
      <CharacterAvatar
        character={character}
        isSpeaking={state === 'speaking'}
      />

      {/* Conversation transcript */}
      <ConversationTranscript messages={messages} />

      {/* Waveform visualization */}
      <VoiceWaveform isActive={state !== 'idle'} />

      {/* Push to talk button */}
      <VoiceButton
        state={state}
        onPressIn={startListening}
        onPressOut={stopListening}
      />

      {/* End conversation button */}
      <Button onPress={endConversation}>
        End Conversation
      </Button>
    </View>
  );
}
```

**Acceptance Criteria:**
- [ ] Full conversation flow works end-to-end
- [ ] Clean UI with character, transcript, controls
- [ ] Handles connection errors gracefully
- [ ] Shows latency/connection status

---

### Sprint 3: Scenarios & Polish (Days 9-13)

#### Task 3.1: Scenario System
**Priority**: P0 | **Estimate**: 1 day

**Files to create:**
- `lib/voice/scenarios/types.ts`
- `lib/voice/scenarios/scenarioPrompts.ts`
- `lib/voice/scenarios/defaultScenarios.ts`

**Implementation:**
```typescript
// lib/voice/scenarios/types.ts
interface VoiceScenario {
  id: string;
  title: string;
  description: string;
  language: 'en' | 'es';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'travel' | 'food' | 'shopping' | 'social';

  // Character for this scenario
  characterId: string;

  // Conversation setup
  context: string;           // Situation description
  userRole: string;          // Who the user is playing
  aiRole: string;            // Who the AI is playing
  objectives: string[];      // What user should accomplish
  suggestedPhrases: string[]; // Hints for user

  // Prompt generation
  systemPromptTemplate: string;
}

// lib/voice/scenarios/defaultScenarios.ts
export const DEFAULT_SCENARIOS: VoiceScenario[] = [
  {
    id: 'greeting-basic',
    title: 'Meeting Someone New',
    description: 'Practice introducing yourself',
    language: 'es',
    difficulty: 'beginner',
    category: 'social',
    characterId: 'maria',
    context: 'You meet Maria at a coffee shop...',
    userRole: 'Tourist visiting the city',
    aiRole: 'Friendly local named Maria',
    objectives: [
      'Introduce yourself',
      'Ask Maria about the city',
      'Exchange contact information'
    ],
    suggestedPhrases: [
      'Hola, me llamo...',
      '¿Cómo estás?',
      'Mucho gusto'
    ],
    systemPromptTemplate: `You are Maria, a friendly local...`
  },
  // More scenarios...
];
```

**Acceptance Criteria:**
- [ ] 4+ scenarios for MVP (greeting, cafe, directions, shopping)
- [ ] Clear objectives for each scenario
- [ ] Spanish and English versions
- [ ] Beginner-friendly prompts

---

#### Task 3.2: Character System
**Priority**: P1 | **Estimate**: 0.5 days

**Files to create:**
- `lib/voice/characters/types.ts`
- `lib/voice/characters/defaultCharacters.ts`

**Implementation:**
```typescript
// lib/voice/characters/types.ts
interface Character {
  id: string;
  name: string;
  personality: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  avatarUrl: string;
  language: 'en' | 'es';
}

// lib/voice/characters/defaultCharacters.ts
export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'maria',
    name: 'Maria',
    personality: 'Friendly, patient, helpful',
    voiceName: 'Kore',  // Female voice
    avatarUrl: '/characters/maria.png',
    language: 'es'
  },
  {
    id: 'carlos',
    name: 'Carlos',
    personality: 'Professional, efficient, friendly',
    voiceName: 'Puck',  // Male voice
    avatarUrl: '/characters/carlos.png',
    language: 'es'
  },
  // More characters...
];
```

**Acceptance Criteria:**
- [ ] 4+ characters for MVP
- [ ] Mapped to Gemini voice presets
- [ ] Character avatars created

---

#### Task 3.3: Scenario Selection Screen
**Priority**: P0 | **Estimate**: 1 day

**Files to create:**
- `app/voice-practice/index.tsx`

**Implementation:**
```typescript
// app/voice-practice/index.tsx
// - Grid/list of available scenarios
// - Filter by difficulty/category
// - Shows scenario preview card
// - Character avatar for each scenario
// - Progress indicator (completed/not)
```

**Acceptance Criteria:**
- [ ] Shows all available scenarios
- [ ] Can filter by difficulty
- [ ] Clear visual design
- [ ] Navigates to conversation screen

---

#### Task 3.4: Conversation Results Screen
**Priority**: P1 | **Estimate**: 1 day

**Files to create:**
- `components/voice/ConversationResults.tsx`

**Implementation:**
```typescript
// components/voice/ConversationResults.tsx
// - Summary of conversation
// - Objectives completed/not completed
// - Duration and message count
// - Vocabulary used (highlighted new words)
// - Option to replay, review transcript, or try again
```

**Acceptance Criteria:**
- [ ] Shows conversation summary
- [ ] Highlights achievements
- [ ] Clear call-to-action

---

#### Task 3.5: Error Handling & Edge Cases
**Priority**: P0 | **Estimate**: 1 day

**Implementation:**
- Connection error handling (show retry UI)
- Microphone permission denied (guide user to settings)
- Network interruption (graceful degradation)
- API rate limiting (queue/retry logic)
- Session timeout handling
- Background/foreground handling

**Acceptance Criteria:**
- [ ] All error states have user-friendly messages
- [ ] Retry mechanisms work correctly
- [ ] No crashes on edge cases

---

#### Task 3.6: Analytics & Tracking
**Priority**: P1 | **Estimate**: 0.5 days

**Files to modify:**
- `lib/analytics/events.ts` (add voice events)

**Events to track:**
```typescript
// Voice conversation events
'voice_conversation_started': {
  scenarioId: string;
  characterId: string;
  language: string;
}

'voice_conversation_completed': {
  scenarioId: string;
  duration: number;
  messageCount: number;
  objectivesCompleted: number;
}

'voice_conversation_error': {
  errorType: string;
  scenarioId: string;
}

'voice_latency_recorded': {
  latencyMs: number;
  scenarioId: string;
}
```

**Acceptance Criteria:**
- [ ] All key events tracked
- [ ] Latency metrics captured
- [ ] Error tracking in place

---

#### Task 3.7: Integration Testing
**Priority**: P0 | **Estimate**: 1 day

**Files to create:**
- `__tests__/voice/geminiLive.test.ts`
- `__tests__/voice/conversationManager.test.ts`
- `__tests__/voice/VoiceConversation.test.tsx`

**Test scenarios:**
- [ ] WebSocket connection flow
- [ ] Audio streaming round-trip
- [ ] Error handling
- [ ] State management
- [ ] UI component rendering

**Acceptance Criteria:**
- [ ] Core logic has unit tests
- [ ] Integration tests for full flow
- [ ] >70% code coverage for voice module

---

#### Task 3.8: App.json Configuration
**Priority**: P0 | **Estimate**: 0.5 days

**Files to modify:**
- `app.json`

**Changes:**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSSpeechRecognitionUsageDescription": "Vox uses speech recognition to help you practice speaking",
        "NSMicrophoneUsageDescription": "Vox needs microphone access for voice conversations"
      }
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Permissions configured correctly
- [ ] Builds successfully on iOS and Android

---

## Task Summary

| Sprint | Task | Priority | Estimate | Dependencies |
|--------|------|----------|----------|--------------|
| 1 | Audio Recording System | P0 | 1d | - |
| 1 | Audio Playback System | P0 | 0.5d | - |
| 1 | Gemini Live API Client | P0 | 2d | - |
| 1 | Conversation Manager | P0 | 1d | 1.1, 1.2, 1.3 |
| 2 | Voice Conversation Hook | P0 | 1d | 1.4 |
| 2 | Voice Button Component | P0 | 0.5d | - |
| 2 | Conversation Bubble | P1 | 0.5d | - |
| 2 | Voice Waveform | P2 | 0.5d | - |
| 2 | Voice Conversation Screen | P0 | 1.5d | 2.1, 2.2, 2.3 |
| 3 | Scenario System | P0 | 1d | - |
| 3 | Character System | P1 | 0.5d | - |
| 3 | Scenario Selection Screen | P0 | 1d | 3.1, 3.2 |
| 3 | Conversation Results | P1 | 1d | 2.5 |
| 3 | Error Handling | P0 | 1d | All above |
| 3 | Analytics | P1 | 0.5d | 2.5 |
| 3 | Integration Testing | P0 | 1d | All above |
| 3 | App.json Config | P0 | 0.5d | - |

**Total Estimated Effort**: 14.5 days

---

## Definition of Done

### Feature Complete
- [ ] User can start voice conversation with AI character
- [ ] Real-time audio streaming works bidirectionally
- [ ] 4+ scenarios available in Spanish and English
- [ ] Conversation transcript displayed
- [ ] Results shown after conversation ends

### Quality
- [ ] Voice-to-voice latency <1500ms (P95)
- [ ] No crashes in voice flow
- [ ] Works on iOS and Android
- [ ] Handles network interruptions gracefully

### Testing
- [ ] Unit tests for core logic
- [ ] Manual testing on physical devices
- [ ] Tested on iOS 15+ and Android 13+

### Documentation
- [ ] Code documented with JSDoc
- [ ] README updated with voice feature
- [ ] Analytics events documented

---

## Next Steps After Phase 1

1. **Gather user feedback** on voice quality and conversation flow
2. **Measure key metrics**: latency, completion rate, satisfaction
3. **Identify top issues** from error tracking
4. **Plan Phase 2** (ElevenLabs) based on learnings

---

*Document created: December 16, 2025*
*Ready for implementation*
