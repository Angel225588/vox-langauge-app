# Voice Conversation System - Technical Specification

> **Status**: Approved for Implementation
> **Decision Date**: December 16, 2025
> **Document Owner**: Engineering Team
> **Related Research**: [Voice AI Options Research 2025](../research/VOICE_AI_OPTIONS_2025.md)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Business Requirements](#business-requirements)
3. [Technical Decision](#technical-decision)
4. [Three-Phase Implementation Strategy](#three-phase-implementation-strategy)
5. [Phase 1: Gemini Live API (MVP)](#phase-1-gemini-live-api-mvp)
6. [Phase 2: ElevenLabs Integration (Production)](#phase-2-elevenlabs-integration-production)
7. [Phase 3: Scale Optimization](#phase-3-scale-optimization)
8. [Architecture Overview](#architecture-overview)
9. [Risk Assessment](#risk-assessment)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

### Decision
Implement a **three-phase voice conversation system** for Vox Language App:

| Phase | Solution | Timeline | Cost | Purpose |
|-------|----------|----------|------|---------|
| **Phase 1** | Gemini Live API | MVP | Free tier | Validate product-market fit |
| **Phase 2** | ElevenLabs + Gemini Flash | Production | $99-1,320/mo | Premium character experiences |
| **Phase 3** | Self-hosted Chatterbox | Scale | Infrastructure | Cost optimization at volume |

### Why This Approach
1. **De-risk**: Start free, prove value before investment
2. **Quality**: Graduate to best-in-class voices for production
3. **Economics**: Self-host only when scale justifies complexity

---

## Business Requirements

### User Stories

**Story 1: Character Conversations**
> As a language learner, I want to have voice conversations with different characters in stories so that I can practice speaking in realistic scenarios.

**Story 2: Scenario Roleplay**
> As a user, I want to roleplay real-life scenarios (ordering food, asking directions, job interviews) with AI characters that sound natural and respond appropriately.

**Story 3: Multi-Character Dialogues**
> As a learner, I want to hear dialogues between multiple characters with distinct voices so I can understand conversational patterns.

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Real-time voice conversation with <1s latency | P0 |
| FR-2 | Multiple distinct character voices | P0 |
| FR-3 | Support for Spanish and English | P0 |
| FR-4 | Natural-sounding (not robotic) voices | P0 |
| FR-5 | Emotion/tone variation in responses | P1 |
| FR-6 | Voice cloning for custom characters | P2 |
| FR-7 | Offline conversation capability | P3 |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Voice-to-voice latency | <800ms (P1), <500ms (P2) |
| NFR-2 | Concurrent users | 100 (P1), 10,000 (P2) |
| NFR-3 | Availability | 99% (P1), 99.9% (P2) |
| NFR-4 | Mobile battery impact | <10% per 30min session |

---

## Technical Decision

### Decision Record

**Date**: December 16, 2025

**Context**:
We need voice AI for conversational language learning features. Options evaluated include Gemini Live API, ElevenLabs, OpenAI Realtime, and various open-source solutions (Chatterbox, Fish Speech, XTTS, Kokoro).

**Decision**:
Implement in three phases, starting with Gemini Live API (already integrated), graduating to ElevenLabs for production quality, with self-hosted Chatterbox as future scale optimization.

**Rationale**:
1. **Gemini Live API** - Already have Gemini integration, free tier available, fastest path to MVP
2. **ElevenLabs** - Best voice quality (63.75% user preference), official Expo SDK, native Gemini Flash support
3. **Chatterbox** - MIT licensed, 23 languages, emotion control, cost-effective at scale

**Alternatives Rejected**:
- **OpenAI Realtime**: Too expensive ($0.30/min vs $0.08/min for ElevenLabs)
- **Pure Open Source from Start**: High infrastructure costs, 1-2 FTE engineering overhead, break-even only at >250k conversations/month
- **XTTS-v2**: Coqui shut down, community-maintained, poor Spanish quality reported

---

## Three-Phase Implementation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VOICE CONVERSATION SYSTEM                             │
│                         Implementation Roadmap                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: MVP                    PHASE 2: PRODUCTION       PHASE 3: SCALE   │
│  ────────────────                ──────────────────        ──────────────   │
│                                                                              │
│  ┌─────────────────┐            ┌─────────────────┐      ┌──────────────┐   │
│  │  Gemini Live    │            │   ElevenLabs    │      │  Chatterbox  │   │
│  │     API         │────────────│  + Gemini Flash │──────│  Self-Hosted │   │
│  │                 │            │                 │      │              │   │
│  │  - Free tier    │            │  - Best voices  │      │  - MIT free  │   │
│  │  - Validate PMF │            │  - Expo SDK     │      │  - Full ctrl │   │
│  │  - Basic chars  │            │  - Emotion ctrl │      │  - Scale opt │   │
│  └─────────────────┘            └─────────────────┘      └──────────────┘   │
│                                                                              │
│  Entry Criteria:                Entry Criteria:          Entry Criteria:     │
│  - None (start here)            - PMF validated          - >100k conv/mo    │
│                                 - Revenue/funding        - Engineering cap  │
│                                                                              │
│  Exit Criteria:                 Exit Criteria:           Ongoing:           │
│  - 1000+ beta users             - Scale ceiling          - Monitor costs    │
│  - >70% satisfaction            - >100k conv/mo          - Optimize infra   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Gemini Live API (MVP)

### Objective
Validate voice conversation feature with minimal investment using existing Gemini integration.

### Scope

**In Scope:**
- Real-time voice conversations with single AI character
- Basic conversation scenarios (greetings, introductions, simple dialogues)
- English and Spanish support
- Integration with existing lesson flow

**Out of Scope:**
- Multiple distinct character voices
- Voice cloning
- Emotion control
- Offline mode

### Technical Implementation

#### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PHASE 1 ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     WebSocket      ┌──────────────────────┐   │
│  │              │ ◄─────────────────►│                      │   │
│  │   Expo App   │                    │   Gemini Live API    │   │
│  │              │     Audio Stream   │   (2.5 Flash Native) │   │
│  │  - Recording │ ──────────────────►│                      │   │
│  │  - Playback  │                    │   - STT              │   │
│  │  - UI        │ ◄──────────────────│   - LLM              │   │
│  │              │     Audio Response │   - TTS              │   │
│  └──────────────┘                    └──────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Supabase Backend                     │   │
│  │  - Conversation history                                   │   │
│  │  - User progress tracking                                 │   │
│  │  - Analytics events                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### File Structure

```
lib/
├── voice/
│   ├── index.ts                    # Public API exports
│   ├── geminiLive.ts               # Gemini Live API client
│   ├── audioRecorder.ts            # Expo audio recording wrapper
│   ├── audioPlayer.ts              # Expo audio playback wrapper
│   ├── conversationManager.ts      # Conversation state management
│   └── types.ts                    # TypeScript interfaces
│
├── ai/
│   └── prompts/
│       └── voiceConversation.ts    # System prompts for voice scenarios
│
components/
├── voice/
│   ├── VoiceConversation.tsx       # Main conversation component
│   ├── VoiceButton.tsx             # Push-to-talk / tap-to-speak
│   ├── ConversationBubble.tsx      # Message display
│   ├── VoiceWaveform.tsx           # Audio visualization
│   └── VoiceSettings.tsx           # Speed, language settings
│
app/
├── voice-practice/
│   ├── [scenarioId].tsx            # Voice scenario screen
│   └── index.tsx                   # Scenario selection
│
hooks/
├── useVoiceConversation.ts         # Voice conversation hook
├── useAudioRecording.ts            # Recording state management
└── useAudioPlayback.ts             # Playback state management
```

#### Key Components

**1. Gemini Live Client (`lib/voice/geminiLive.ts`)**

```typescript
interface GeminiLiveConfig {
  apiKey: string;
  model: 'gemini-2.0-flash-live';
  language: 'en' | 'es';
  systemPrompt: string;
}

interface GeminiLiveSession {
  connect(): Promise<void>;
  disconnect(): void;
  sendAudio(audioData: ArrayBuffer): void;
  onAudioResponse(callback: (audio: ArrayBuffer) => void): void;
  onTranscript(callback: (text: string, isFinal: boolean) => void): void;
  onError(callback: (error: Error) => void): void;
}

class GeminiLiveClient implements GeminiLiveSession {
  // WebSocket connection to Gemini Live API
  // Handles audio streaming in both directions
  // Manages session state and reconnection
}
```

**2. Voice Conversation Hook (`hooks/useVoiceConversation.ts`)**

```typescript
interface UseVoiceConversationOptions {
  scenarioId: string;
  language: 'en' | 'es';
  onMessage?: (message: ConversationMessage) => void;
  onError?: (error: Error) => void;
}

interface UseVoiceConversationReturn {
  // State
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  messages: ConversationMessage[];

  // Actions
  startConversation: () => Promise<void>;
  endConversation: () => void;
  startListening: () => void;
  stopListening: () => void;

  // Metrics
  latencyMs: number;
  sessionDuration: number;
}

function useVoiceConversation(options: UseVoiceConversationOptions): UseVoiceConversationReturn;
```

**3. Voice Conversation Component**

```typescript
interface VoiceConversationProps {
  scenario: VoiceScenario;
  character: Character;
  onComplete: (result: ConversationResult) => void;
}

// Renders the full voice conversation UI:
// - Character avatar with speaking animation
// - Conversation transcript
// - Push-to-talk button
// - Waveform visualization
// - Settings (speed, volume)
```

#### API Integration

**Gemini Live API WebSocket Connection:**

```typescript
// WebSocket URL format
const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

// Initial setup message
const setupMessage = {
  setup: {
    model: 'models/gemini-2.0-flash-live',
    generation_config: {
      response_modalities: ['AUDIO'],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: 'Puck' // or 'Charon', 'Kore', 'Fenrir', 'Aoede'
          }
        }
      }
    },
    system_instruction: {
      parts: [{ text: systemPrompt }]
    }
  }
};

// Audio format: PCM 16-bit, 16kHz, mono
```

#### Scenarios for MVP

| Scenario | Description | Character | Difficulty |
|----------|-------------|-----------|------------|
| greeting | Basic introductions | Maria (friendly local) | Beginner |
| cafe | Ordering coffee | Carlos (barista) | Beginner |
| directions | Asking for directions | Ana (helpful stranger) | Intermediate |
| shopping | Buying at market | Pedro (vendor) | Intermediate |

#### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Voice-to-voice latency | <1500ms | P95 latency |
| Conversation completion | >60% | Sessions completed vs started |
| User satisfaction | >3.5/5 | In-app rating |
| Daily active voice users | >100 | Analytics |
| Session duration | >3 min avg | Time tracking |

#### Estimated Effort

| Task | Estimate |
|------|----------|
| Gemini Live client implementation | 2-3 days |
| Audio recording/playback | 1-2 days |
| UI components | 2-3 days |
| Scenario content creation | 1-2 days |
| Testing & polish | 2-3 days |
| **Total** | **8-13 days** |

---

## Phase 2: ElevenLabs Integration (Production)

### Objective
Upgrade to premium voice quality with distinct character voices and emotion control.

### Entry Criteria
- Phase 1 completed and validated
- >1,000 beta users tried voice feature
- >70% satisfaction rating
- Budget approved for $99-1,320/month

### Scope

**In Scope:**
- Multiple distinct character voices
- Voice cloning for custom characters
- Emotion control in responses
- Improved latency (<500ms)
- Expanded scenario library

**Out of Scope:**
- Offline mode
- Self-hosted infrastructure

### Technical Implementation

#### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PHASE 2 ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │              │                                                           │
│  │   Expo App   │                                                           │
│  │              │                                                           │
│  │  @11labs/    │                                                           │
│  │  react-native│                                                           │
│  │              │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         │ WebRTC                                                             │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    ElevenLabs Conversational AI                       │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │   │
│  │  │    STT      │───►│   LLM       │───►│         TTS             │   │   │
│  │  │  (Whisper)  │    │(Gemini 2.0) │    │  (ElevenLabs voices)    │   │   │
│  │  └─────────────┘    └─────────────┘    │  - Character voices     │   │   │
│  │                                         │  - Emotion control      │   │   │
│  │                                         │  - Voice cloning        │   │   │
│  │                                         └─────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Supabase Backend                               │   │
│  │  - Character voice configurations                                     │   │
│  │  - Custom cloned voices storage                                       │   │
│  │  - Conversation analytics                                             │   │
│  │  - Usage tracking for billing                                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Additional File Structure

```
lib/
├── voice/
│   ├── elevenlabs/
│   │   ├── client.ts               # ElevenLabs Conversational AI client
│   │   ├── voices.ts               # Voice configuration and management
│   │   ├── cloning.ts              # Voice cloning utilities
│   │   └── types.ts                # ElevenLabs-specific types
│   │
│   ├── characters/
│   │   ├── CharacterVoiceManager.ts # Map characters to voices
│   │   ├── voicePresets.ts          # Default voice configurations
│   │   └── emotionMapping.ts        # Emotion to voice style mapping
│   │
│   └── providers/
│       ├── VoiceProvider.tsx        # Provider abstraction
│       ├── GeminiProvider.ts        # Phase 1 implementation
│       └── ElevenLabsProvider.ts    # Phase 2 implementation

components/
├── voice/
│   ├── CharacterAvatar.tsx          # Animated character with lip sync
│   ├── EmotionIndicator.tsx         # Visual emotion feedback
│   └── VoiceCloneSetup.tsx          # UI for voice cloning
```

#### Voice Provider Abstraction

```typescript
// Allows switching between Gemini Live and ElevenLabs
interface VoiceProvider {
  name: 'gemini' | 'elevenlabs';

  // Connection
  connect(config: VoiceConfig): Promise<void>;
  disconnect(): void;

  // Audio
  sendAudio(audio: ArrayBuffer): void;
  onAudioReceived(callback: (audio: ArrayBuffer) => void): void;

  // Character voices (Phase 2)
  setCharacterVoice?(characterId: string, voiceId: string): void;
  setEmotion?(emotion: EmotionType): void;

  // Metrics
  getLatencyMs(): number;
}

// Factory to switch providers based on feature flags
function createVoiceProvider(type: 'gemini' | 'elevenlabs'): VoiceProvider;
```

#### Character Voice System

```typescript
interface CharacterVoice {
  characterId: string;
  name: string;
  description: string;

  // ElevenLabs configuration
  voiceId: string;                    // ElevenLabs voice ID
  stability: number;                  // 0-1, voice consistency
  similarityBoost: number;            // 0-1, voice clarity
  style: number;                      // 0-1, expressiveness

  // Emotion presets
  emotionPresets: {
    neutral: VoiceSettings;
    happy: VoiceSettings;
    concerned: VoiceSettings;
    encouraging: VoiceSettings;
  };

  // Optional: Custom cloned voice
  isCloned: boolean;
  clonedFromAudioUrl?: string;
}

// Predefined characters for Vox
const VOX_CHARACTERS: CharacterVoice[] = [
  {
    characterId: 'maria',
    name: 'Maria',
    description: 'Friendly local who loves helping tourists',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Example
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.6,
    // ...
  },
  // More characters...
];
```

#### ElevenLabs Integration

```typescript
// Installation
// npm install @11labs/react-native

import { useConversation } from '@11labs/react-native';

function VoiceConversationScreen({ character, scenario }) {
  const conversation = useConversation({
    agentId: process.env.ELEVENLABS_AGENT_ID,

    // Use Gemini Flash as the LLM
    llm: {
      provider: 'gemini',
      model: 'gemini-2.0-flash',
    },

    // Character-specific voice
    voice: {
      voiceId: character.voiceId,
      stability: character.stability,
      similarityBoost: character.similarityBoost,
    },

    // System prompt for scenario
    systemPrompt: generateScenarioPrompt(scenario, character),

    // Callbacks
    onMessage: (message) => {
      // Track conversation
    },
    onError: (error) => {
      // Handle errors, potentially fallback to Gemini
    },
  });

  return (
    <VoiceConversationUI
      conversation={conversation}
      character={character}
    />
  );
}
```

#### Expanded Scenarios

| Category | Scenarios | Characters |
|----------|-----------|------------|
| **Travel** | Airport, Hotel, Transportation | Agent Maria, Receptionist Carlos |
| **Food** | Restaurant, Cafe, Market | Waiter Pedro, Chef Ana |
| **Shopping** | Clothes, Electronics, Pharmacy | Sales Clerk Sofia, Pharmacist Luis |
| **Social** | Party, Meeting, Dating | Friend Miguel, Date Isabel |
| **Professional** | Interview, Meeting, Presentation | HR Manager Elena, Boss Roberto |
| **Emergency** | Doctor, Police, Lost | Doctor Javier, Officer Carmen |

#### Success Criteria

| Metric | Target | Improvement from P1 |
|--------|--------|---------------------|
| Voice-to-voice latency | <500ms | 3x faster |
| User satisfaction | >4.2/5 | +0.7 points |
| Session duration | >5 min avg | +66% |
| Conversion to paid | >5% | New metric |
| Character preference expressed | >60% | New metric |

#### Estimated Effort

| Task | Estimate |
|------|----------|
| ElevenLabs SDK integration | 2-3 days |
| Voice provider abstraction | 1-2 days |
| Character voice system | 2-3 days |
| Expanded scenarios | 3-5 days |
| Voice cloning feature | 2-3 days |
| Testing & optimization | 3-4 days |
| **Total** | **13-20 days** |

---

## Phase 3: Scale Optimization

### Objective
Reduce per-conversation costs at scale while maintaining quality.

### Entry Criteria
- >100,000 conversations/month
- ElevenLabs costs exceeding $8,000/month
- Engineering capacity for infrastructure management
- 1-2 FTE available for DevOps

### Scope

**In Scope:**
- Self-hosted Chatterbox TTS
- Pipecat orchestration framework
- Hybrid architecture (self-hosted TTS + cloud LLM)
- Cost optimization

**Out of Scope:**
- Self-hosted LLM (keep using Gemini)
- Self-hosted STT initially

### Technical Implementation

#### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PHASE 3 ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │   Expo App   │                                                           │
│  │              │◄──────────────────────────────────────────────────────┐   │
│  │  WebSocket/  │                                                       │   │
│  │  WebRTC      │                                                       │   │
│  └──────┬───────┘                                                       │   │
│         │                                                               │   │
│         ▼                                                               │   │
│  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │                    Pipecat Orchestration                          │   │   │
│  │                    (Self-hosted on Cloud Run / K8s)               │   │   │
│  │                                                                    │   │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │   │   │
│  │  │    STT      │───►│   LLM       │───►│        TTS          │───┼───┘   │
│  │  │  (Whisper   │    │(Gemini API) │    │   (Chatterbox)      │   │       │
│  │  │   or Cloud) │    │             │    │   Self-hosted       │   │       │
│  │  └─────────────┘    └─────────────┘    │   GPU: T4/A10       │   │       │
│  │                                         │   - 23 languages    │   │       │
│  │                                         │   - Emotion control │   │       │
│  │                                         │   - Voice cloning   │   │       │
│  │                                         └─────────────────────┘   │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Infrastructure (GCP / AWS)                         │   │
│  │  - Cloud Run / GKE for Pipecat                                        │   │
│  │  - GPU instances for Chatterbox (T4 minimum, A10 recommended)         │   │
│  │  - Redis for session management                                       │   │
│  │  - Cloud Storage for voice models and cloned voices                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Infrastructure Requirements

| Component | Specification | Monthly Cost |
|-----------|--------------|--------------|
| GPU Instance (Chatterbox) | T4 or A10, 16GB+ RAM | $275-800 |
| Pipecat Hosting | Cloud Run / GKE | $100-300 |
| Redis | Managed Redis | $50-100 |
| Storage | Voice models, clips | $20-50 |
| Bandwidth | Audio streaming | $100-200 |
| **Total Infrastructure** | | **$545-1,450/mo** |

**Break-even vs ElevenLabs:**
- At 100k conversations/mo: ~$8,000 (ElevenLabs) vs ~$1,500 (self-hosted)
- Savings: ~$6,500/month at scale

#### Pipecat Pipeline

```python
# pipecat_pipeline.py
from pipecat.pipeline import Pipeline
from pipecat.services.whisper import WhisperSTT
from pipecat.services.gemini import GeminiLLM
from pipecat.transports.websocket import WebSocketTransport

# Custom Chatterbox TTS service
from services.chatterbox_tts import ChatterboxTTS

async def create_voice_pipeline(
    character_voice: str,
    scenario_prompt: str,
    language: str = 'en'
) -> Pipeline:

    # STT: Whisper (can be cloud or self-hosted)
    stt = WhisperSTT(
        model='whisper-1',  # or self-hosted
        language=language
    )

    # LLM: Gemini Flash (keep using cloud API)
    llm = GeminiLLM(
        model='gemini-2.0-flash',
        system_prompt=scenario_prompt,
        temperature=0.7
    )

    # TTS: Self-hosted Chatterbox
    tts = ChatterboxTTS(
        voice_id=character_voice,
        emotion_control=True,
        language=language
    )

    # Build pipeline
    pipeline = Pipeline([
        stt,
        llm,
        tts
    ])

    return pipeline
```

#### Migration Strategy

1. **Parallel Running**: Run ElevenLabs and self-hosted side-by-side
2. **A/B Testing**: Route 10% traffic to self-hosted, compare quality metrics
3. **Gradual Rollout**: Increase self-hosted percentage as confidence grows
4. **Fallback**: Keep ElevenLabs as fallback for self-hosted failures

#### Success Criteria

| Metric | Target |
|--------|--------|
| Cost per conversation | <$0.02 (vs $0.08 ElevenLabs) |
| Quality parity | >95% user can't distinguish |
| Latency | <600ms (within 20% of ElevenLabs) |
| Availability | >99.5% |
| Infrastructure cost | <$2,000/month |

---

## Architecture Overview

### System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VOX LANGUAGE APP                                   │
│                      Voice Conversation System                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                            ┌─────────────────┐                              │
│                            │   Mobile App    │                              │
│                            │  (Expo/React    │                              │
│                            │    Native)      │                              │
│                            └────────┬────────┘                              │
│                                     │                                        │
│           ┌─────────────────────────┼─────────────────────────┐             │
│           │                         │                         │             │
│           ▼                         ▼                         ▼             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Phase 1       │    │    Phase 2      │    │    Phase 3      │         │
│  │  Gemini Live    │    │  ElevenLabs +   │    │   Self-hosted   │         │
│  │     API         │    │  Gemini Flash   │    │   Chatterbox    │         │
│  │                 │    │                 │    │   + Pipecat     │         │
│  │  [MVP]          │    │  [Production]   │    │  [Scale]        │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                              │
│                            ┌─────────────────┐                              │
│                            │    Supabase     │                              │
│                            │  - Auth         │                              │
│                            │  - Database     │                              │
│                            │  - Analytics    │                              │
│                            └─────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User speaks → [Audio captured] → [STT] → Text → [LLM] → Response text → [TTS] → [Audio played] → User hears

Latency breakdown (target):
- Audio capture: 50ms
- STT: 200ms
- LLM: 150ms
- TTS: 100ms
- Audio playback: 50ms
- Network overhead: 50ms
─────────────────────────
Total: ~600ms
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini Live API rate limits | Medium | High | Implement queuing, fallback to standard API |
| ElevenLabs cost overrun | Medium | Medium | Set hard budget caps, usage alerts |
| Voice quality not meeting expectations | Low | High | A/B test with users, gather feedback early |
| React Native audio issues | Medium | Medium | Extensive device testing, fallback modes |
| Self-hosting complexity | High | Medium | Only pursue at scale, hire DevOps expertise |
| Language pronunciation issues (Spanish) | Medium | High | Test extensively, consider native speaker QA |

---

## Success Metrics

### Overall Feature Success

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| MAU using voice | 500 | 5,000 | 50,000 |
| Avg session duration | 3 min | 5 min | 7 min |
| User satisfaction | 3.5/5 | 4.2/5 | 4.2/5 |
| Conversation completion | 60% | 75% | 80% |
| Cost per conversation | Free tier | $0.08 | $0.02 |

### Technical Health

| Metric | Target |
|--------|--------|
| P95 latency | <800ms |
| Error rate | <1% |
| Availability | >99% |
| Crash-free sessions | >99.5% |

---

## Appendix

### A. Environment Variables

```bash
# Phase 1: Gemini Live
GEMINI_API_KEY=xxx
GEMINI_LIVE_MODEL=gemini-2.0-flash-live

# Phase 2: ElevenLabs
ELEVENLABS_API_KEY=xxx
ELEVENLABS_AGENT_ID=xxx

# Phase 3: Self-hosted
CHATTERBOX_ENDPOINT=https://tts.vox-app.com
PIPECAT_ENDPOINT=wss://voice.vox-app.com
```

### B. Related Documents

- [Voice AI Options Research 2025](../research/VOICE_AI_OPTIONS_2025.md)
- [Gemini API Integration Guide](./GEMINI_API_SETUP.md)
- [Design System](../../constants/designSystem.ts)

---

*Document created: December 16, 2025*
*Last updated: December 16, 2025*
*Next review: After Phase 1 completion*
