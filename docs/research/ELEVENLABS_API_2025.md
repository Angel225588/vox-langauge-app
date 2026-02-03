# ElevenLabs API Research - 2025
## Comprehensive Guide for Vox Language App Voice Conversation Feature

**Research Date:** December 24, 2025
**Purpose:** Evaluate ElevenLabs API for real-time voice conversations in language learning

---

## Table of Contents
1. [Conversational AI API](#1-conversational-ai-api)
2. [Text-to-Speech API](#2-text-to-speech-api)
3. [Voice Control Features](#3-voice-control-features)
4. [Available Voices & Accents](#4-available-voices--accents)
5. [React Native / Expo Integration](#5-react-native--expo-integration)
6. [Pricing Tiers](#6-pricing-tiers)
7. [WebSocket Streaming](#7-websocket-streaming)
8. [Recommendations for Vox Language App](#8-recommendations-for-vox-language-app)

---

## 1. Conversational AI API

### Overview
ElevenLabs Conversational AI enables deployment of customized, conversational voice agents with lifelike speech. The platform provides access to **5,000+ voices in 70+ languages** with secure APIs and SDKs.

### Conversational AI 2.0 (Released May 2025)

#### Key Features

**Natural Turn-Taking**
- Advanced model analyzes conversational cues in real-time ("um", "ah", pauses)
- AI understands when to interrupt or wait for user to finish
- Results in fluid, natural dialogue
- Sub-second turnaround across speech, reasoning, and voice synthesis

**Multilingual Support**
- Automatic language detection integrated directly into the agent
- AI identifies language being spoken and responds appropriately
- Seamless multilingual discussions within the same interaction
- Supports **32 languages**

**Integrated RAG (Retrieval-Augmented Generation)**
- Built directly into voice agent architecture
- Enables retrieval from specific knowledge base
- Minimum latency and maximum privacy
- Perfect for custom learning content

**Multimodality**
- Agents communicate over text, voice, or both simultaneously
- Define agent once, use across multiple channels
- Single agent definition for multiple interaction modes

### Performance Metrics
- **Real-time responses** during high-concurrency traffic
- **Flash model API**: 128 kbps audio with ~75ms latency
- **Scribe v2 Realtime STT**: ~150ms latency for transcription
- Sub-second turnaround for full conversation loop

### LLM Integration
Compatible with major LLMs:
- GPT-4 (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Proprietary models

**Critical for Vox:** Can integrate with existing Gemini implementation for lesson generation.

### Recent Updates (December 2025)
- WhatsApp integration with dual-mode (text/voice)
- Voice call support for making/receiving calls
- Enhanced customer service capabilities

---

## 2. Text-to-Speech API

### Overview
Turns text into lifelike audio with nuanced intonation, pacing, and emotional awareness across **32 languages** and multiple voice styles.

### Supported Languages (32 Total)

#### European Languages
- **English** (USA, UK, Australia, Canada)
- **French** (France, Canada)
- **Spanish** (Spain, Mexico)
- **Portuguese** (Brazil, Portugal)
- German, Italian, Dutch
- Polish, Russian, Ukrainian
- Swedish, Norwegian, Danish, Finnish
- Greek, Czech, Slovak, Croatian, Bulgarian, Romanian
- Hungarian, Turkish

#### Asian & Middle Eastern Languages
- Chinese, Japanese, Korean
- Hindi, Tamil
- Indonesian, Filipino, Malay
- Vietnamese
- Classic Arabic (Saudi Arabia, UAE)

**Perfect for Vox:** Covers all target languages with regional accent variants.

### Available Models

#### Eleven v3 (Latest & Most Advanced)
- Most advanced speech synthesis model
- Natural, life-like speech with high emotional range
- Contextual understanding across multiple languages
- Best for quality-critical applications

#### Eleven Multilingual v2
- Emotionally-aware speech synthesis
- High emotional range with contextual understanding
- Supports all 32 languages
- Great balance of quality and capability

#### Eleven Flash v2.5 (Fastest)
- **~75ms latency** - ultra-low for real-time applications
- Designed specifically for interactive applications
- Supports 32 languages (all v2 languages + Hungarian, Norwegian, Vietnamese)
- Balances speed and quality
- **Recommended for Vox:** Real-time conversation feature

### API Features

**Language Specification**
- Manual language specification via `language_code` parameter
- Accepts ISO 639-1 language codes
- Useful for short or ambiguous prompts
- Ensures correct normalization rules

**Voice Characteristics**
- Multiple voice styles for diverse applications
- Fast synthesis with ultra-low latency
- Scalability for high-demand applications
- Natural prosody and emotional expression

---

## 3. Voice Control Features

### Speed Control

#### Global Speed Settings
- Range: **0.7 to 1.2**
- Values < 1.0 = slower speech
- Values > 1.0 = faster speech
- Available in: TTS, Studio, Conversational AI, and API
- **Note:** Extreme values may affect quality

#### Use Cases for Speed Control
- **Slower (0.7-0.9):** Educational content, beginners
- **Normal (1.0):** Standard conversation
- **Faster (1.1-1.2):** Advanced learners, quick reviews

### Word-Level Pace Control
- Control pace down to individual words
- Fine-grained expressiveness control
- Available across all ElevenLabs products
- Perfect for emphasizing key vocabulary

### Audio Tags for Precision Control (v3 Model)

#### Pause & Break Tags
- `[pause]` - Brief silence
- `[breathes]` - Natural breathing sound
- `[continues after a beat]` - Longer pause

#### Speed Cues
- `[rushed]` - Faster delivery
- `[slows down]` - Decrease pace
- `[deliberate]` - Careful, measured speech
- `[rapid-fire]` - Very fast delivery

#### Hesitation & Rhythm
- `[stammers]` - Natural speech hesitation
- `[drawn out]` - Extended pronunciation
- `[repeats]` - Word repetition
- `[timidly]` - Uncertain delivery

**For Vox Language Learning:**
- Users could say "speak slowly" or "say that again slowly"
- Agent can be programmed to adjust speed parameter
- Audio tags can be embedded in responses for natural pacing
- Perfect for scaffolding difficulty levels

### Natural Pacing Tips
- Use descriptive text for AI to infer emotions
- Punctuation controls speech pace
- Submit sample files with natural pauses for voice cloning
- "Write it like a book" technique for existing voices

---

## 4. Available Voices & Accents

### Voice Library Scale
- **40+ pre-made/default voices** in different accents
- **10,000+ community-created voices**
- **32 languages**
- **50+ accents**

### Accent Support by Language

#### English
- **American English**
  - General American
  - Southern US accent
  - New York accent
  - Available via voice library + audio tags

- **British English**
  - Received Pronunciation (RP)
  - Scottish accent
  - Available via voice library + audio tags

#### French
- **France** (Metropolitan French)
- **Canada** (Québécois)
- Audio tag: `[French accent]` for other voices

#### Spanish
- **Spain** (Castilian)
- **Mexico** (Latin American)
- Audio tag: `[Spanish accent]`

#### Portuguese
- **Brazil** (Brazilian Portuguese)
- **Portugal** (European Portuguese)
- Native speakers available in voice library

#### Additional Accents via Audio Tags (v3)
- Continental accents: German, Italian, Russian
- Regional dialects: Southern US, New York, Scottish
- Character voices: pirate, robotic tone

### Voice Selection Best Practices

#### For Authentic Accents
1. **Use native voices** from Voice Library for target language
2. **Clone voices** speaking the language with correct accent
3. **Avoid cross-language generation** (e.g., English voice speaking French = French with English accent)
4. **Filter by labels**: language, accent, gender, age, use case, tone, style

#### Voice Design
- Create custom voices by specifying:
  - Age
  - Gender
  - Accent
  - Tone
  - Emotional range (with v3 model)
- Prompt-based voice generation

#### Voice Changer
- Preserves accents and natural speech cadences
- Upload audio with target accent → output retains that accent
- Great for creating consistent character voices

**For Vox Language App:**
- Use **native French (France)** voices for France French lessons
- Use **native French (Canada)** voices for Quebec French lessons
- Use **native Spanish (Spain)** voices for Castilian Spanish
- Use **native Spanish (Mexico)** voices for Latin American Spanish
- Use **native Portuguese (Brazil)** for Brazilian Portuguese
- Use **native Portuguese (Portugal)** for European Portuguese
- Tag voices by proficiency level (beginner-friendly, advanced)

---

## 5. React Native / Expo Integration

### Official React Native SDK

#### Package Information
- **Package:** `@elevenlabs/react-native`
- **NPM:** https://www.npmjs.com/package/@elevenlabs/react-native
- **Designed for Expo framework**
- **WebRTC-based** using LiveKit
- **Requires development builds** (cannot use Expo Go)

#### Installation

```bash
# Install main SDK
npm install @elevenlabs/react-native

# Install peer dependencies
npm install @livekit/react-native @livekit/react-native-webrtc livekit-client
```

### Key Features

**Real-Time Communication**
- WebRTC-based audio streaming
- Low-latency agent interactions
- Bi-directional audio

**Event-Driven Architecture**
- Comprehensive event system
- Agent session lifecycle management
- React hooks integration

**Client Tools**
- Support for custom client-side tools
- Custom functions integration
- Extensible architecture

**Flexible Authentication**
- Public agent configurations
- Private agent configurations
- API key management

**Audio Controls**
- Fine-grained control over input/output devices
- Audio device selection
- Volume control

### Required Permissions

#### iOS (Info.plist)
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone for voice agent interactions.</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### useConversation Hook

The primary React hook for managing conversations:

```typescript
const {
  status,        // "disconnected" | "connecting" | "connected" | "disconnecting"
  startSession,  // Function to start conversation
  endSession,    // Function to end conversation
  sendMessage,   // Function to send text messages
  // Event callbacks
  onConnect,     // () => void
  onDisconnect,  // (reason: "user" | "agent" | "error") => void
  onStatusChange,// (status) => void
  onError,       // (error) => void
  onMessage,     // (message) => void - from user or AI
} = useConversation({ agentId: 'your-agent-id' });
```

### Event Callbacks

**Connection Events**
- `onConnect`: Successfully connected to conversation
- `onDisconnect`: Disconnected (includes reason)
- `onStatusChange`: Connection status changes
- `onError`: Error occurred

**Message Events**
- `onMessage`: Message received from user or AI
- Real-time message streaming
- Text and audio messages

**Important Note:** Not all client events are enabled by default. Enable events in ElevenLabs dashboard under agent settings → Advanced tab.

### Platform Support

**Supported:**
- iOS (via Expo development build)
- Android (via Expo development build)

**Not Supported:**
- React Native Web (use `@elevenlabs/react` instead)
- Expo Go (requires custom native modules)
- Bare React Native (requires Swift/Kotlin bridge)

### Bare React Native Projects

For bare React Native (custom native dependencies):
- Official SDK won't work out of the box
- Need to bridge ElevenLabs Swift SDK directly
- Full control of audio pipeline
- Custom Swift/Kotlin implementation required

**Recommendation for Vox:** Use Expo managed workflow for faster development and official SDK support.

### Example Implementation

```typescript
import { useConversation } from '@elevenlabs/react-native';

function VoiceConversationScreen() {
  const {
    status,
    startSession,
    endSession,
    onConnect,
    onDisconnect,
    onMessage,
  } = useConversation({
    agentId: 'your-agent-id',
  });

  // Event handlers
  onConnect(() => {
    console.log('Connected to AI agent');
  });

  onDisconnect((reason) => {
    console.log('Disconnected:', reason);
  });

  onMessage((message) => {
    console.log('Message:', message);
    // Update UI with message
  });

  return (
    <View>
      <Button
        title={status === 'connected' ? 'End Call' : 'Start Call'}
        onPress={status === 'connected' ? endSession : startSession}
      />
      <Text>Status: {status}</Text>
    </View>
  );
}
```

---

## 6. Pricing Tiers

### Overview
ElevenLabs uses a **hybrid pricing model** combining predictable subscriptions with character-based allocation.

### Pricing Tiers (2025)

| Plan | Monthly Price | Annual Price (Save 2 Months) | Character Credits | Best For |
|------|--------------|------------------------------|-------------------|----------|
| **Free** | $0 | - | 20,000 credits (~20 min audio) | Non-commercial testing |
| **Starter** | $4.17 | $50/year | ~100,000 credits | Personal projects |
| **Creator** | $11.00 | $132/year | ~300,000 credits | Small apps |
| **Pro** | $82.50 | $990/year | ~1,000,000 credits | Production apps |
| **Scale** | Custom | Custom | Custom | Enterprise |
| **Business** | Custom | Custom | Custom | Large organizations |

### Credit System (2025)

#### Base Credit Costs
- **V1 English/Multilingual & V2 Multilingual:** 1 credit per character
- **V2 Flash/Turbo:** 0.5-1 credit per character (plan-dependent)
- **V2.5 Flash/Turbo:** 0.5-1 credit per character (plan-dependent)

#### Audio Quality
- **128 kbps, 44.1kHz** quality standard
- High-quality streaming audio

### Free Tier Limitations
- ⚠️ **Requires attribution** (credit to ElevenLabs)
- ⚠️ **No commercial licensing**
- 20 minutes of audio generation per month
- Access to pre-made voices
- Community support only

### Additional Costs to Consider

**Voice Licensing**
- Premium voice usage may incur additional fees
- Check voice library for licensing terms

**Preview Generation**
- May consume credits
- Test generations count toward quota

**HIPAA Compliance**
- **$1,000/month add-on**
- Required for healthcare applications
- Not needed for language learning

**Overage Charges**
- Charges apply when exceeding plan credits
- Variable rates by plan tier
- Monitor usage to avoid surprises

### Savings Options

**Annual Billing**
- Save 2 months free on all plans
- Commit to full year

**First Month Discount**
- 50% off first month of Creator Plan
- One-time promotional offer

### Pricing Evolution (2025)

**January 2025:**
- Introduced model-specific credit buckets
- Separate pools for Multilingual v2 and Conversational v1
- Unique overage rates per model
- More complex tracking

**August 2025:**
- Simplified to unified credit system
- Single credit pool regardless of model
- Transparent tier structure
- Clear model access per plan

### Cost Estimation for Vox Language App

#### Assumptions
- Average conversation: 5 minutes
- Flash v2.5 model: ~0.75 credits per character
- Average speaking rate: 150 words/minute
- Average word length: 5 characters

#### Per-Conversation Cost
- 5 min × 150 words/min = 750 words
- 750 words × 5 chars = 3,750 characters
- 3,750 chars × 0.75 credits = ~2,813 credits

#### Monthly Usage Examples

| User Base | Conversations/User/Month | Total Conversations | Credits Needed | Recommended Plan | Monthly Cost |
|-----------|-------------------------|---------------------|----------------|------------------|--------------|
| 100 users | 10 | 1,000 | 2,813,000 | Pro + overage | ~$100-150 |
| 500 users | 10 | 5,000 | 14,065,000 | Scale | Custom |
| 1,000 users | 10 | 10,000 | 28,130,000 | Scale | Custom |

**Important:** These are estimates. Actual costs depend on:
- Conversation length
- Model selection (Flash vs. standard)
- User engagement levels
- Overage rates

---

## 7. WebSocket Streaming

### Overview
WebSocket streaming enables real-time, bidirectional audio communication over a single, long-lived connection. Essential for interactive voice applications.

### Text-to-Speech WebSocket API

#### Endpoint
```
wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id={model}
```

#### Key Features

**Chunk Scheduling**
- Control when audio generation triggers
- `chunk_length_schedule` parameter: array of integers
- Example: `[120, 160, 250, 290]`
  - Generates audio after 120 chars, then 160, then 250, then 290
- Optimizes latency vs. quality tradeoff

**Buffer Control**
- `flush: true` to force generate buffered text
- Clear buffer at end of document
- Per-message basis control
- Prevents incomplete audio at conversation end

**Connection Management**
- Auto-closes after **20 seconds of inactivity**
- Keep-alive: send single space character `" "`
- Must include actual space (empty string closes connection)
- Maintain persistent connection for conversations

#### Performance Metrics
- **Flash v2.5 model:** ~75ms latency
- **Real-time audio generation**
- **Progressive audio return** (audio chunks as generated)
- **Reduced time-to-first-byte**

### Speech-to-Text WebSocket (Realtime Transcription)

#### Endpoint
```
wss://api.elevenlabs.io/v1/speech-to-text/realtime
```

#### Key Features

**Ultra-Low Latency**
- Partial transcriptions in milliseconds
- Committed transcripts when speech segments complete
- ~150ms latency with ScribeRealtime v2 model

**Streaming Support**
- Send audio in chunks
- Receive transcripts in real-time
- Bidirectional streaming

**Audio Format Support**
- PCM 8kHz to 48kHz
- μ-law encoding
- Multiple sample rates

**Voice Activity Detection (VAD)**
- Automatic speech segmentation
- Detects when user starts/stops speaking
- Natural conversation flow

### Conversational AI Agents WebSocket

#### Overview
Real-time, interactive voice conversations with AI agents via WebSocket connection.

#### Features
- Send audio input in real-time
- Receive audio responses in real-time
- Full-duplex communication
- Natural turn-taking
- Automatic language detection

#### Use Case for Vox
- Perfect for live conversation practice
- Real-time feedback on pronunciation
- Interactive dialogue scenarios
- Adaptive difficulty based on user responses

### Multi-Context WebSocket

#### Overview
Build voice agents with dynamic and responsive interactions across multiple contexts.

#### Features
- **Up to 5 concurrent contexts** per connection
- Optimized for voice applications
- Complex orchestration capabilities
- Advanced developer feature

#### Use Cases
- Multiple conversation threads
- Context switching (e.g., vocabulary → conversation → grammar)
- Parallel agent interactions
- Advanced conversation management

**Note:** Recommended for advanced developers due to complexity.

### Implementation Best Practices

**For Language Learning:**

1. **Use Speech-to-Text WebSocket** for user input
   - Transcribe user speech in real-time
   - Detect pronunciation errors
   - Provide immediate feedback

2. **Use Text-to-Speech WebSocket** for AI responses
   - Stream AI voice in real-time
   - Control pacing with chunk scheduling
   - Implement buffer control for natural endings

3. **Combine with Conversational AI**
   - Full conversation management
   - Natural turn-taking
   - Language detection
   - Context awareness

4. **Implement Keep-Alive**
   - Send space character every 15 seconds
   - Prevent connection drops
   - Maintain stable conversation

5. **Monitor Connection Health**
   - Handle reconnection logic
   - Graceful degradation
   - User feedback on connection status

---

## 8. Recommendations for Vox Language App

### Architecture Recommendation

#### Option A: Conversational AI Agent (Recommended)
**Best for:** Full-featured, production-ready voice conversations

**Pros:**
- All-in-one solution (STT + TTS + turn-taking + language detection)
- Natural conversation flow built-in
- Automatic language detection
- RAG integration for custom content
- Sub-second latency
- React Native SDK available

**Cons:**
- Less control over individual components
- Conversational AI credits separate from TTS
- Potentially higher cost

**Implementation:**
```typescript
import { useConversation } from '@elevenlabs/react-native';

// Simple setup, full conversation features
const conversation = useConversation({
  agentId: 'vox-french-tutor',
  agentConfig: {
    speed: 0.9, // Slightly slower for learning
    voice: 'french-native-voice',
  }
});
```

#### Option B: Custom WebSocket Integration
**Best for:** Maximum control and customization

**Pros:**
- Full control over conversation flow
- Integrate with existing Gemini AI
- Custom speech analysis
- Flexible architecture
- Direct API usage

**Cons:**
- More development time
- Handle turn-taking logic manually
- Manage STT + TTS separately
- More complex to maintain

**Implementation:**
```typescript
// Custom implementation with WebSocket
const sttSocket = new WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/realtime');
const ttsSocket = new WebSocket('wss://api.elevenlabs.io/v1/text-to-speech/{voice}/stream-input');

// Manual coordination of speech recognition and synthesis
// Integration with existing Gemini API for dialogue
```

### Voice Selection Strategy

#### By Language & Proficiency Level

**French**
- **Beginners:** Slow-paced French (France) voice, female, clear pronunciation
- **Intermediate:** Normal-paced French (France) voice, neutral
- **Advanced:** Natural-paced French (France) voice, regional accents
- **Quebec Option:** French (Canada) voices for Canadian French learners

**Spanish**
- **Beginners:** Slow-paced Spanish (Spain) voice, clear enunciation
- **Intermediate:** Normal-paced Spanish (Mexico) voice
- **Advanced:** Multiple accent options (Spain, Mexico, Argentina)

**Portuguese**
- **Beginners:** Slow-paced Portuguese (Brazil) voice
- **Intermediate:** Normal-paced Portuguese (Brazil) or (Portugal) voice
- **Advanced:** Regional variations (São Paulo, Lisbon)

**English**
- **ESL Beginners:** Slow-paced American English, neutral accent
- **Intermediate:** Normal-paced British or American English
- **Advanced:** Regional accents (Southern US, NYC, Scottish)

### Speed Control Implementation

```typescript
// Dynamic speed adjustment based on user level
const getSpeedForLevel = (proficiencyLevel: string) => {
  switch (proficiencyLevel) {
    case 'beginner':
      return 0.8;  // 20% slower
    case 'intermediate':
      return 1.0;  // Normal speed
    case 'advanced':
      return 1.1;  // 10% faster
    default:
      return 0.9;  // Slightly slower by default
  }
};

// User can control speed mid-conversation
const handleUserCommand = (transcript: string) => {
  if (transcript.includes('speak slowly') || transcript.includes('more slowly')) {
    setSpeed((current) => Math.max(0.7, current - 0.1));
  } else if (transcript.includes('speak faster')) {
    setSpeed((current) => Math.min(1.2, current + 0.1));
  } else if (transcript.includes('say that again')) {
    repeatLastPhrase();
  }
};
```

### Cost Optimization Strategies

1. **Use Flash v2.5 Model**
   - ~75ms latency (acceptable for conversations)
   - Lower credit cost (0.5-0.75 per character vs 1.0)
   - High quality for language learning

2. **Implement Session Limits**
   - Cap conversation length (e.g., 5-10 minutes per session)
   - Daily usage limits per user
   - Premium tier for unlimited conversations

3. **Cache Common Phrases**
   - Pre-generate common greetings, instructions
   - Store locally to avoid API calls
   - Reduce credit consumption by 20-30%

4. **Smart Credit Pooling**
   - Monitor usage per user
   - Implement fair-use policy
   - Alert users approaching limits

5. **Tiered Feature Access**
   - Free tier: 5 conversations/month (text-based AI)
   - Basic tier: 20 conversations/month (voice AI)
   - Premium tier: Unlimited conversations

### Technical Integration Checklist

- [ ] Install `@elevenlabs/react-native` SDK
- [ ] Configure Expo development build
- [ ] Set up iOS microphone permissions
- [ ] Set up Android audio permissions
- [ ] Create ElevenLabs agent in dashboard
- [ ] Configure agent settings (voice, speed, language)
- [ ] Enable event callbacks in agent settings
- [ ] Implement `useConversation` hook
- [ ] Build connection status UI
- [ ] Handle connection errors gracefully
- [ ] Implement keep-alive logic
- [ ] Add user controls (start/stop, speed adjustment)
- [ ] Integrate with existing user proficiency data
- [ ] Build conversation history tracking
- [ ] Implement usage analytics
- [ ] Set up credit monitoring
- [ ] Create user feedback collection
- [ ] Test across iOS and Android devices
- [ ] Performance testing (latency, connection stability)
- [ ] Implement caching for common phrases

### Feature Roadmap

#### Phase 1: MVP (Weeks 1-2)
- Basic conversation with single voice
- Start/stop controls
- Simple UI
- One language (French)
- Fixed speed (0.9x)

#### Phase 2: Enhanced (Weeks 3-4)
- Multiple voices per language
- Speed control UI
- Conversation history
- Basic analytics
- Add Spanish and Portuguese

#### Phase 3: Advanced (Weeks 5-8)
- Multi-context conversations
- Dynamic difficulty adjustment
- Voice command recognition ("speak slowly")
- Pronunciation feedback
- Custom vocabulary integration
- RAG integration with lesson content

#### Phase 4: Premium Features (Weeks 9+)
- Multiple accent options
- Regional dialect selection
- Advanced speech analysis
- Personalized voice tutors
- Achievement system for conversations
- Social conversation features

### Key Success Metrics

**User Engagement**
- Average conversation length
- Conversations per user per week
- Retention rate after first conversation
- NPS for voice feature

**Technical Performance**
- Connection success rate (>95% target)
- Average latency (<500ms target)
- Audio quality ratings
- Error rate (<5% target)

**Learning Outcomes**
- Speaking time vs. listening time ratio
- Vocabulary usage in conversations
- Pronunciation improvement over time
- User confidence ratings

**Business Metrics**
- Cost per conversation
- Credit utilization rate
- Upgrade rate from free to paid
- Monthly Active Users in voice feature

---

## Sources

### Conversational AI
- [Conversational AI Agent Platform](https://elevenlabs.io/conversational-ai)
- [ElevenLabs API Documentation](https://elevenlabs.io/developers)
- [Conversational AI 2.0 Announcement](https://elevenlabs.io/blog/conversational-ai-2-0)
- [Introduction - Conversational AI](https://elevenlabs.io/docs/conversational-ai/overview)
- [Agents Platform Overview](https://elevenlabs.io/docs/agents-platform/overview)
- [Scribe v2 Realtime Speech to Text](https://elevenlabs.io/realtime-speech-to-text)

### Text-to-Speech
- [Text to Speech Documentation](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)
- [Free Text To Speech Online](https://elevenlabs.io/text-to-speech)
- [Models Documentation](https://elevenlabs.io/docs/models)
- [Text to Speech Product Guide](https://elevenlabs.io/docs/creative-platform/playground/text-to-speech)
- [Create Speech API Reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- [How to Select Language and Accent](https://help.elevenlabs.io/hc/en-us/articles/19581255545873-How-do-I-select-the-language-and-accent)

### Voice Control & Speed
- [Can I Change the Pace of Voice?](https://help.elevenlabs.io/hc/en-us/articles/13416271012497-Can-I-change-the-pace-of-the-voice)
- [Speed Control Documentation](https://elevenlabs.io/docs/conversational-ai/customization/voice/speed-control)
- [Voice Speed Controls Announcement](https://x.com/elevenlabsio/status/1897737611088650623)
- [Slow Paced AI Voices Library](https://elevenlabs.io/voice-library/slow-paced)
- [Eleven v3 Audio Tags: Precision Delivery Control](https://elevenlabs.io/blog/eleven-v3-audio-tags-precision-delivery-control-for-ai-speech)

### Voices & Accents
- [Eleven v3 Audio Tags: Accent Emulation](https://elevenlabs.io/blog/eleven-v3-audio-tags-emulating-accents-with-precision)
- [Voices Documentation](https://elevenlabs.io/docs/capabilities/voices)
- [Voice Library Documentation](https://elevenlabs.io/docs/product-guides/voices/voice-library)
- [Default Voice Accents](https://help.elevenlabs.io/hc/en-us/articles/13313483616401-What-default-voice-accents-do-you-have)
- [Eleven Multilingual v1](https://elevenlabs.io/blog/eleven-multilingual-v1)

### Pricing
- [ElevenLabs API Pricing](https://elevenlabs.io/pricing/api)
- [ElevenLabs Pricing Plans](https://elevenlabs.io/pricing)
- [Complete Guide to ElevenLabs Pricing](https://flexprice.io/blog/elevenlabs-pricing-breakdown)
- [ElevenLabs Pricing Breakdown 2025](https://www.eesel.ai/blog/elevenlabs-pricing)

### React Native / Expo
- [React Native SDK Documentation](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- [@elevenlabs/react-native on NPM](https://www.npmjs.com/package/@elevenlabs/react-native)
- [Cross-platform Voice Agents with Expo](https://elevenlabs.io/docs/agents-platform/guides/integrations/expo-react-native)
- [ElevenLabs Packages GitHub](https://github.com/elevenlabs/packages)
- [React Native Expo Example](https://github.com/elevenlabs/packages/tree/main/examples/react-native-expo)
- [ElevenLabs React Native SDK Announcement](https://x.com/ElevenLabsDevs/status/1953096060252869053)

### WebSocket Streaming
- [Generate Audio in Real-time](https://elevenlabs.io/docs/websockets)
- [Realtime Speech to Text](https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming)
- [Streaming API Reference](https://elevenlabs.io/docs/api-reference/streaming)
- [WebSocket Documentation](https://elevenlabs.io/docs/agents-platform/libraries/web-sockets)
- [Websockets API Reference](https://elevenlabs.io/docs/api-reference/websockets)
- [Multi-Context Websocket](https://elevenlabs.io/docs/cookbooks/multi-context-web-socket)
- [Latency Optimization](https://elevenlabs.io/docs/best-practices/latency-optimization)

---

## Final Recommendation

**For Vox Language App, I recommend:**

1. **Start with Conversational AI Agent approach (Option A)**
   - Faster time to market
   - Official React Native SDK support
   - Built-in natural conversation features
   - Easy integration with Expo

2. **Use Flash v2.5 model**
   - Best balance of latency, quality, and cost
   - ~75ms latency is excellent for real-time
   - Lower credit cost

3. **Implement dynamic speed control**
   - Auto-adjust based on user proficiency level
   - Allow user voice commands ("speak slowly")
   - Use audio tags for emphasis on key vocabulary

4. **Select native voices for each language/region**
   - French (France) for Metropolitan French
   - French (Canada) for Québécois
   - Spanish (Spain) for Castilian
   - Spanish (Mexico) for Latin American
   - Portuguese (Brazil) and (Portugal) variants

5. **Start with Pro plan ($82.50/month)**
   - 1M credits = ~350 conversations @ 5 min each
   - Sufficient for initial launch and testing
   - Scale up as user base grows

6. **Build in three phases**
   - Phase 1: MVP with basic conversation (1-2 weeks)
   - Phase 2: Enhanced with multi-language and controls (2-3 weeks)
   - Phase 3: Advanced with pronunciation feedback (4-8 weeks)

**Estimated Development Time:** 6-8 weeks to production-ready feature
**Estimated Monthly Cost:** $100-500 (depending on usage)
**Expected User Benefit:** High - natural conversation is highly engaging for language learners

---

**Document Version:** 1.0
**Last Updated:** December 24, 2025
**Next Review:** After Phase 1 MVP testing
