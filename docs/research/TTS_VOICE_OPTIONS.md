# TTS Voice Options Research

**Research Date**: December 14, 2025
**Project**: Vox Language App
**Researcher**: Technical Research Specialist

---

## Executive Summary

This research document evaluates Text-to-Speech (TTS) alternatives to address the robotic voice quality issues in the current `expo-speech` implementation. After analyzing 10+ TTS solutions across cloud-based AI services, open-source options, and offline capabilities, the recommended approach is a **hybrid implementation using expo-edge-speech for primary TTS with OpenAI TTS as a premium option**.

---

## Current State: expo-speech Limitations

### What is expo-speech?
`expo-speech` is Expo's built-in Text-to-Speech SDK that uses the same native TTS engine as `react-native-tts`, providing access to device-native voices on iOS and Android.

### Key Limitations

1. **Robotic Voice Quality**: Uses standard device voices that lack natural prosody, emotion, and human-like inflection
2. **Platform Dependency**: Voice quality varies significantly between iOS and Android devices
3. **Limited Voice Options**: Restricted to whatever voices are installed on the user's device
4. **No Emotional Expression**: Cannot convey tone, emphasis, or emotional context in language learning scenarios
5. **Inconsistent Quality**: Older devices may have lower-quality TTS engines
6. **iOS Silent Mode Issue**: On iOS physical devices, expo-speech won't produce sound if the device is in silent mode

### Why This Matters for Language Learning

Language learning apps require:
- Natural pronunciation for accurate language modeling
- Emotional context for conversational practice
- Consistent quality across all user devices
- Engaging audio that doesn't sound robotic or monotone
- Multiple voice options for speaker variety

---

## Options Comparison

### Quick Reference Table

| Solution | Voice Quality | Cost (per 1M chars) | Offline Support | Expo/RN Compatible | Free Tier | Setup Complexity |
|----------|--------------|---------------------|-----------------|-------------------|-----------|------------------|
| **expo-speech** | ⭐⭐ Native | $0 | ✅ Yes | ✅ Native | Unlimited | ⭐ Easy |
| **expo-edge-speech** | ⭐⭐⭐⭐ AI | $0 | ❌ No | ✅ Yes | Unlimited | ⭐⭐ Moderate |
| **OpenAI TTS** | ⭐⭐⭐⭐⭐ AI | $15-30 | ❌ No | ✅ API | None | ⭐⭐ Moderate |
| **ElevenLabs** | ⭐⭐⭐⭐⭐ AI | $180+ | ❌ No | ✅ API | 10K chars/mo | ⭐⭐⭐ Complex |
| **Google Cloud TTS** | ⭐⭐⭐⭐ AI | Varies | ❌ No | ✅ API | 1M WaveNet/mo | ⭐⭐ Moderate |
| **Azure Speech** | ⭐⭐⭐⭐ AI | $16 | ❌ No | ✅ API | 500K chars/mo | ⭐⭐⭐ Complex |
| **Amazon Polly** | ⭐⭐⭐⭐ AI | Varies | ❌ No | ✅ API | Limited | ⭐⭐ Moderate |
| **Sherpa-ONNX** | ⭐⭐⭐ Neural | $0 | ✅ Yes | ✅ Yes | Unlimited | ⭐⭐⭐⭐ Complex |
| **Coqui TTS** | ⭐⭐⭐ Neural | $0 | ✅ Yes | ⚠️ Server only | Unlimited | ⭐⭐⭐⭐ Complex |
| **Piper TTS** | ⭐⭐⭐ Neural | $0 | ✅ Yes | ⚠️ Limited | Unlimited | ⭐⭐⭐⭐ Complex |

---

## Detailed Analysis

### 1. expo-edge-speech (RECOMMENDED PRIMARY)

**Type**: Cloud-based (Microsoft Edge TTS)
**Quality**: ⭐⭐⭐⭐ Excellent
**Pricing**: FREE (no API key required)

#### Pros
- **400+ natural AI voices** with multilingual support
- **Drop-in replacement** for expo-speech API (full compatibility)
- **Zero cost** - completely free with no API key needed
- **Superior quality** compared to device-native voices
- **Easy integration** - minimal code changes required
- **Cross-platform consistency** - same voices on iOS and Android
- **Active development** - regularly maintained package

#### Cons
- Requires internet connection
- No offline capability
- Depends on Microsoft's Edge TTS service availability
- No voice cloning or custom voices

#### React Native Integration
```bash
npm install expo-edge-speech
```

```typescript
import * as EdgeSpeech from 'expo-edge-speech';

// Drop-in replacement for expo-speech
EdgeSpeech.speak('Hello, world!', {
  language: 'en-US',
  voice: 'en-US-JennyNeural', // Microsoft Neural voice
  pitch: 1.0,
  rate: 1.0
});
```

#### Best For
- Primary TTS solution for Vox Language App
- All users who have internet connectivity
- Budget-conscious implementation
- Quick deployment with immediate quality improvement

---

### 2. OpenAI TTS (RECOMMENDED PREMIUM)

**Type**: Cloud-based AI
**Quality**: ⭐⭐⭐⭐⭐ Outstanding
**Pricing**: $15/1M characters (standard), $30/1M (HD), $12/1M tokens (GPT-4o-mini-tts)

#### Models Available
1. **tts-1** (Standard): $15 per 1M characters - Good quality, fast
2. **tts-1-hd**: $30 per 1M characters - Highest fidelity, professional audio
3. **GPT-4o-mini-tts**: ~$0.015/minute of audio - Latest model, best quality/price ratio

#### Pros
- **Outstanding voice quality** - Most natural-sounding AI voices
- **6 distinct voices**: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **Low latency**: ~0.5 seconds for real-time playback
- **Streaming support** for instant playback
- **Multiple languages** supported
- **Simple API** with excellent documentation
- **Cost-effective** compared to ElevenLabs ($15-30 vs $180)
- **Multiple output formats**: MP3, Opus, AAC, FLAC, WAV, PCM

#### Cons
- No free tier (pay per character)
- Requires internet connection
- Requires API key management
- No voice cloning
- 4,096 character limit per request

#### React Native Integration
```typescript
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

async function speakWithOpenAI(text: string, voice: string = 'nova') {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: voice,
      input: text,
    }),
  });

  const audioBlob = await response.blob();
  // Play with expo-av
  const { sound } = await Audio.Sound.createAsync({ uri: audioBlob });
  await sound.playAsync();
}
```

#### Cost Estimation for Vox
Assuming average lesson has 500 characters of TTS:
- **tts-1**: 2,000 lessons = $7.50
- **tts-1-hd**: 2,000 lessons = $15.00
- **GPT-4o-mini-tts**: ~100 minutes = $1.50

#### Best For
- Premium features (Pro subscription users)
- High-quality voice lessons
- Professional content
- Users who value best-in-class voice quality

---

### 3. ElevenLabs

**Type**: Cloud-based AI
**Quality**: ⭐⭐⭐⭐⭐ Outstanding
**Pricing**: $4.17-1,320/month subscription

#### Pricing Tiers (2025)
- **Free**: 10,000 chars/month (~12-15 mins audio)
- **Starter**: $4.17/month
- **Creator**: $11/month
- **Pro**: $82.50/month
- **Scale**: $330/month (2M credits + 3 seats)
- **Business**: $1,320/month (11M credits + 5 seats)

#### Character Cost
- V1 models: 1 character = 1 credit
- V2 Flash/Turbo: 0.5-1 credit per character (depends on plan)
- Effective cost: ~$180+ per 1M characters

#### Pros
- **Exceptional voice quality** with emotional expressiveness
- **Voice cloning** with just 6 seconds of audio
- **Emotion and style transfer**
- **Cross-language voice cloning**
- **Conversational AI** integration
- **Custom voices** for brand consistency

#### Cons
- **Most expensive option** (~6-12x more than OpenAI)
- Complex pricing structure (multiple model tiers)
- Requires subscription (not pure pay-as-you-go)
- Small free tier
- Overkill for standard TTS needs

#### React Native Integration
Similar to OpenAI - API calls with expo-av for playback.

#### Best For
- Apps requiring voice cloning
- Enterprise clients needing custom branded voices
- When emotional expressiveness is critical
- Premium features with large budgets

**Recommendation for Vox**: Too expensive for standard use case. OpenAI TTS provides 90% of the quality at 10-20% of the cost.

---

### 4. Google Cloud Text-to-Speech

**Type**: Cloud-based AI
**Quality**: ⭐⭐⭐⭐ Excellent (WaveNet)
**Pricing**: Free tier + pay-per-character

#### Pricing (2025)
- **Free Tier**:
  - WaveNet voices: 1M characters/month
  - Standard voices: 4M characters/month
- **Paid**:
  - Pricing per 1M characters (varies by voice type)
  - New customers get $300 in credits

#### Pros
- **Generous free tier** - 1M WaveNet chars/month
- **380+ voices** across 75+ languages
- **High-quality WaveNet** neural voices
- **SSML support** for fine-tuned control
- **Well-documented** with extensive SDKs
- **Reliable** Google Cloud infrastructure

#### Cons
- Requires Google Cloud account setup
- Must enable billing (even for free tier)
- More complex setup than OpenAI
- React Native integration requires custom implementation
- Billing complexity with character counting (includes SSML tags)

#### React Native Integration
```typescript
// Requires REST API calls
const response = await fetch(
  `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: 'Hello world' },
      voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
      audioConfig: { audioEncoding: 'MP3' }
    })
  }
);
```

#### Best For
- Apps already using Google Cloud services
- Multi-language support (75+ languages)
- Projects needing generous free tier
- Teams comfortable with GCP ecosystem

**Recommendation for Vox**: Good option but expo-edge-speech provides similar quality for free without GCP setup complexity.

---

### 5. Azure Cognitive Services Speech

**Type**: Cloud-based AI
**Quality**: ⭐⭐⭐⭐ Excellent
**Pricing**: $16/1M chars (Neural), Free tier: 500K/month

#### Pricing (2025)
- **Free Tier (F0)**: 500K characters/month
- **Neural TTS**: $16 per 1M characters
- **Custom Neural**:
  - Training: $52/compute hour
  - Synthesis: $24 per 1M characters
  - Hosting: $4.04/model/hour
- **Long Audio**: $100 per 1M characters

#### Pros
- **140+ languages, 400+ voices**
- **Custom Neural Voice** - train bespoke voices
- **On-premises deployment** via containers (offline capability)
- **Enterprise-grade security** and compliance
- **Bilingual and regional variants**
- **Good free tier** (500K chars/month)

#### Cons
- **Complex pricing** structure
- **Steep learning curve** - Azure ecosystem
- **Higher cost** than OpenAI for standard TTS ($16 vs $15)
- **Overkill features** for most use cases
- Limited React Native documentation

#### React Native Integration
Uses Speech SDK or REST API - similar to Google Cloud TTS.

#### Best For
- Enterprise applications with compliance requirements
- On-premises/offline deployment needs
- Custom voice creation
- Organizations already in Azure ecosystem

**Recommendation for Vox**: Too complex and expensive for current needs. Consider only if offline capability becomes critical.

---

### 6. Amazon Polly

**Type**: Cloud-based AI
**Quality**: ⭐⭐⭐⭐ Excellent
**Pricing**: Pay-per-character (varies by voice type)

#### Pros
- **High-quality neural voices**
- **Good AWS integration** if using AWS services
- **SSML support**
- **Multiple languages**
- **Reliable** AWS infrastructure

#### Cons
- Limited free tier
- Requires AWS account setup
- React Native integration complexity
- Less competitive pricing than OpenAI
- Fewer voices than competitors

#### Best For
- Apps already using AWS infrastructure
- Teams familiar with AWS ecosystem

**Recommendation for Vox**: OpenAI or expo-edge-speech provide better value with simpler integration.

---

### 7. Sherpa-ONNX (OFFLINE OPTION)

**Type**: Offline neural TTS
**Quality**: ⭐⭐⭐ Good
**Pricing**: FREE (open source)

#### Overview
Sherpa-ONNX is a self-contained, offline-first toolkit that provides high-quality neural TTS without internet connection. Uses ONNX Runtime to run models locally on device.

#### Pros
- **100% offline** - works without network
- **100+ pre-trained models** for 40+ languages
- **FREE and open source**
- **GDPR/HIPAA friendly** - no data leaves device
- **Cross-platform**: iOS, Android, embedded systems
- **Active development** - v1.12.19 (Dec 2025)
- **React Native package available**: `react-native-sherpa-onnx-offline-tts`
- **Supports Piper/VITS ONNX models**

#### Cons
- **Complex setup** - requires model download and configuration
- **Larger app size** - models must be bundled (or downloaded on first run)
- **Good but not excellent quality** - neural but not as natural as cloud AI
- **Limited voices** compared to cloud services
- **Technical complexity** - ONNX models, config files, paths

#### React Native Integration
```bash
npm install react-native-sherpa-onnx-offline-tts
```

```typescript
// Download and unzip model (e.g., vits-piper-en_US-ryan-medium.zip)
const config = {
  model: '/path/to/model.onnx',
  tokens: '/path/to/tokens.txt',
  data: '/path/to/espeak-ng-data'
};

await SherpaONNX.initialize(config);
await SherpaONNX.speak('Hello world');
```

#### Available Models
- **Piper voices**: Multiple English speakers (ryan, lessac, libritts)
- **MeloTTS**: Chinese and English support
- **100+ models** available on GitHub releases and Hugging Face

#### Best For
- Offline-first applications
- Privacy-sensitive use cases
- Apps for users with limited connectivity
- Reducing API costs for high-volume usage

**Recommendation for Vox**: Excellent fallback for offline mode. Consider implementing as secondary option when network unavailable.

---

### 8. Coqui TTS

**Type**: Open-source neural TTS
**Quality**: ⭐⭐⭐ Good
**Pricing**: FREE (open source)

#### Overview
Coqui TTS (formerly Mozilla TTS) is an open-source deep learning toolkit for TTS. Company shut down in Dec 2023, but project continues as open source.

#### Pros
- **FREE and open source**
- **XTTS v2**: 17 languages, <200ms latency
- **Voice cloning** with 6-second audio clip
- **Emotion and style transfer**
- **Cross-language voice cloning**
- **Python-based** - extensive customization

#### Cons
- **Company defunct** - community-maintained only
- **Python-only** - requires backend server for React Native
- **Complex setup** - Docker containers or Python server
- **No native React Native module**
- **Requires technical expertise**

#### React Native Integration
Must run as backend server and make API calls from React Native app.

```bash
# Run Coqui TTS server
docker run -p 5002:5002 ghcr.io/coqui-ai/tts

# Make API calls from React Native
fetch('http://localhost:5002/api/tts?text=Hello')
```

#### Best For
- Self-hosted solutions
- Voice cloning projects
- Developers comfortable with Python/Docker
- Research and experimentation

**Recommendation for Vox**: Too complex for mobile app. Better options available (Sherpa-ONNX for offline, expo-edge-speech for cloud).

---

### 9. Piper TTS

**Type**: Open-source neural TTS
**Quality**: ⭐⭐⭐ Good
**Pricing**: FREE (open source)

#### Overview
Fast, local neural TTS system. Original repo archived Oct 2025, development moved to OHF-Voice/piper1-gpl.

#### Pros
- **Lightweight and fast**
- **Multiple voice models** available
- **Offline capability**
- **FREE and open source**

#### Cons
- **Original project archived** (Oct 2025)
- **Limited React Native support**
- **Can be used via Sherpa-ONNX** instead
- **Setup complexity**

#### React Native Integration
Best integrated through Sherpa-ONNX which has native Piper model support.

#### Best For
- Integration via Sherpa-ONNX
- Linux/desktop applications
- Self-hosted solutions

**Recommendation for Vox**: Use Sherpa-ONNX instead, which includes Piper model support with better React Native integration.

---

### 10. Edge TTS (Alternative Free Option)

**Type**: Cloud-based (Microsoft Edge service)
**Quality**: ⭐⭐⭐⭐ Excellent
**Pricing**: FREE (no API key)

#### Overview
Access Microsoft Edge's online TTS service without API key. This is what powers `expo-edge-speech`.

#### npm Packages
- `@andresaya/edge-tts` - Node.js/browser package
- `expo-edge-speech` - Expo/React Native wrapper (RECOMMENDED)

#### Pros
- **FREE** with no API key required
- **High-quality neural voices**
- **400+ voices**
- **Simple integration**

#### Cons
- Requires internet
- Depends on Microsoft service

**Recommendation for Vox**: Use `expo-edge-speech` package (see section 1).

---

## Cost Analysis

### Per-Character Pricing Comparison

| Service | Cost per 1M Characters | Free Tier |
|---------|------------------------|-----------|
| expo-edge-speech | $0 | Unlimited |
| OpenAI TTS (standard) | $15 | None |
| OpenAI TTS (HD) | $30 | None |
| Google Cloud (WaveNet) | Varies | 1M/month |
| Google Cloud (Standard) | Varies | 4M/month |
| Azure Neural | $16 | 500K/month |
| ElevenLabs | $180+ | 10K/month |
| Sherpa-ONNX | $0 | Unlimited |

### Estimated Monthly Costs for Vox

**Assumptions**:
- Average user completes 3 lessons/day
- Each lesson has 500 characters of TTS
- 10,000 active users

**Monthly TTS Characters**: 10,000 users × 3 lessons × 30 days × 500 chars = 450M characters

| Solution | Monthly Cost | Notes |
|----------|-------------|-------|
| expo-edge-speech | $0 | FREE |
| OpenAI TTS (standard) | $6,750 | 450M × $15/1M |
| OpenAI TTS (HD) | $13,500 | 450M × $30/1M |
| Google Cloud WaveNet | ~$5,000-7,000 | After free tier |
| Azure Neural | $7,200 | 450M × $16/1M |
| ElevenLabs | $81,000+ | 450M × $180/1M |
| Sherpa-ONNX | $0 | One-time setup only |

**Reality Check**: For 10K active users, cloud TTS becomes expensive. Hybrid approach is essential.

---

## React Native Compatibility Matrix

| Solution | Expo Managed | Expo Bare | Pure RN | Implementation Method | Complexity |
|----------|-------------|-----------|---------|----------------------|------------|
| expo-speech | ✅ Yes | ✅ Yes | ✅ Yes | Native SDK | ⭐ Easy |
| expo-edge-speech | ✅ Yes | ✅ Yes | ✅ Yes | npm package | ⭐⭐ Moderate |
| OpenAI TTS | ✅ Yes | ✅ Yes | ✅ Yes | API + expo-av | ⭐⭐ Moderate |
| ElevenLabs | ✅ Yes | ✅ Yes | ✅ Yes | API + expo-av | ⭐⭐ Moderate |
| Google Cloud TTS | ✅ Yes | ✅ Yes | ✅ Yes | REST API + expo-av | ⭐⭐⭐ Complex |
| Azure Speech | ✅ Yes | ✅ Yes | ✅ Yes | SDK/API + expo-av | ⭐⭐⭐ Complex |
| Amazon Polly | ✅ Yes | ✅ Yes | ✅ Yes | AWS SDK + expo-av | ⭐⭐⭐ Complex |
| Sherpa-ONNX | ✅ Yes | ✅ Yes | ✅ Yes | Native module | ⭐⭐⭐⭐ Very Complex |
| Coqui TTS | ⚠️ Server | ⚠️ Server | ⚠️ Server | Backend API | ⭐⭐⭐⭐ Very Complex |
| Piper TTS | ⚠️ Via Sherpa | ⚠️ Via Sherpa | ⚠️ Via Sherpa | Via Sherpa-ONNX | ⭐⭐⭐⭐ Very Complex |

**Expo Compatibility**: ✅ = Native support, ⚠️ = Requires workaround

---

## Offline Capability Comparison

| Solution | Fully Offline | Hybrid Mode | Download Size | Quality Offline |
|----------|--------------|-------------|---------------|-----------------|
| expo-speech | ✅ Yes | N/A | 0 (native) | ⭐⭐ Fair |
| expo-edge-speech | ❌ No | ❌ No | 0 | N/A |
| OpenAI TTS | ❌ No | ⚠️ Cache | 0 | N/A |
| ElevenLabs | ❌ No | ⚠️ Cache | 0 | N/A |
| Google Cloud | ❌ No | ⚠️ Cache | 0 | N/A |
| Azure Speech | ⚠️ Container | ✅ Yes | Large | ⭐⭐⭐⭐ Excellent |
| Sherpa-ONNX | ✅ Yes | N/A | 20-50MB/model | ⭐⭐⭐ Good |
| Coqui TTS | ⚠️ Server | ⚠️ Server | Large | ⭐⭐⭐ Good |
| Piper TTS | ✅ Yes | N/A | Small-Medium | ⭐⭐⭐ Good |

**Best for Offline**: Sherpa-ONNX (most practical for mobile)

---

## Recommendations

### Primary Recommendation: Hybrid Approach

**Implementation Strategy**:

```
┌─────────────────────────────────────────────────────────┐
│                    VOX TTS SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PRIMARY (Free Users & Default)                         │
│  ├─ expo-edge-speech (Microsoft Edge TTS)               │
│  │  ├─ FREE, unlimited                                  │
│  │  ├─ 400+ neural voices                               │
│  │  ├─ Excellent quality                                │
│  │  └─ Requires internet                                │
│                                                          │
│  PREMIUM (Pro Subscribers)                              │
│  ├─ OpenAI TTS (tts-1 or GPT-4o-mini-tts)              │
│  │  ├─ Best-in-class quality                            │
│  │  ├─ $0.015/min of audio                              │
│  │  ├─ 6 distinct voices                                │
│  │  └─ Premium feature differentiation                  │
│                                                          │
│  OFFLINE FALLBACK (All Users)                           │
│  ├─ Sherpa-ONNX (when no internet)                      │
│  │  ├─ FREE, works offline                              │
│  │  ├─ Good quality neural voices                       │
│  │  ├─ 20-50MB download per model                       │
│  │  └─ Auto-download on first use                       │
│                                                          │
│  LEGACY (Compatibility)                                 │
│  └─ expo-speech (device native)                         │
│     └─ Extreme fallback only                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Tier 1: Free Users (expo-edge-speech)

**Why**:
- Zero cost with unlimited usage
- Excellent quality improvement over expo-speech
- Easy drop-in implementation
- 400+ voices for variety

**Implementation**:
```typescript
import * as EdgeSpeech from 'expo-edge-speech';

async function speak(text: string, language: string) {
  const voiceMap = {
    'en': 'en-US-JennyNeural',
    'es': 'es-ES-ElviraNeural',
    'fr': 'fr-FR-DeniseNeural',
    // Add more languages
  };

  await EdgeSpeech.speak(text, {
    language: language,
    voice: voiceMap[language],
    rate: 0.9, // Slightly slower for language learning
  });
}
```

### Tier 2: Premium Users (OpenAI TTS)

**Why**:
- Best quality for paying customers
- Reasonable cost at scale
- Premium feature differentiation
- Multiple voice personalities

**Implementation**:
```typescript
async function speakPremium(text: string, voice: string = 'nova') {
  // Check if user has premium subscription
  if (!user.isPremium) {
    return speak(text, user.language); // Fall back to expo-edge-speech
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1', // or 'tts-1-hd' for Pro+
      voice: voice,
      input: text,
      speed: 0.9
    }),
  });

  const audioData = await response.arrayBuffer();
  // Play with expo-av
}
```

### Tier 3: Offline Mode (Sherpa-ONNX)

**Why**:
- Handles no-internet scenarios
- Better than device-native voices
- Free after initial setup
- Privacy-friendly

**Implementation**:
```typescript
import SherpaONNX from 'react-native-sherpa-onnx-offline-tts';

async function setupOfflineTTS() {
  // Download model on first app launch or settings
  const modelUrl = 'https://your-cdn.com/models/vits-piper-en_US-ryan-medium.zip';
  const modelPath = await downloadAndUnzip(modelUrl);

  await SherpaONNX.initialize({
    model: `${modelPath}/model.onnx`,
    tokens: `${modelPath}/tokens.txt`,
    data: `${modelPath}/espeak-ng-data`
  });
}

async function speakOffline(text: string) {
  if (!await SherpaONNX.isInitialized()) {
    await setupOfflineTTS();
  }
  await SherpaONNX.speak(text);
}
```

### Intelligent TTS Router

```typescript
enum TTSProvider {
  EdgeSpeech = 'edge',
  OpenAI = 'openai',
  SherpaONNX = 'sherpa',
  Native = 'native'
}

async function intelligentSpeak(text: string, options: TTSOptions) {
  const { language, voice, rate } = options;

  // Determine best provider based on context
  let provider: TTSProvider;

  if (!isOnline()) {
    provider = TTSProvider.SherpaONNX;
  } else if (user.isPremium && user.settings.preferPremiumVoices) {
    provider = TTSProvider.OpenAI;
  } else {
    provider = TTSProvider.EdgeSpeech;
  }

  // Fallback chain
  try {
    switch (provider) {
      case TTSProvider.OpenAI:
        await speakWithOpenAI(text, voice);
        break;
      case TTSProvider.EdgeSpeech:
        await speakWithEdge(text, language, voice);
        break;
      case TTSProvider.SherpaONNX:
        await speakWithSherpa(text);
        break;
      case TTSProvider.Native:
        await Speech.speak(text, { language, rate });
        break;
    }
  } catch (error) {
    console.warn(`TTS failed with ${provider}, falling back`, error);
    // Try next provider in chain
    if (provider === TTSProvider.OpenAI) {
      await speakWithEdge(text, language, voice);
    } else if (provider === TTSProvider.EdgeSpeech) {
      await speakWithSherpa(text);
    } else {
      await Speech.speak(text, { language, rate }); // Ultimate fallback
    }
  }
}
```

---

## Implementation Roadmap

### Phase 1: Quick Win (Week 1)
**Goal**: Immediate quality improvement with zero cost

1. Install expo-edge-speech
   ```bash
   npm install expo-edge-speech
   ```

2. Replace expo-speech calls with expo-edge-speech
   - Update TTS utility functions
   - Add voice mapping for supported languages
   - Test across iOS and Android

3. Measure improvements
   - User feedback on voice quality
   - Engagement metrics
   - Any issues with latency or connectivity

**Estimated Time**: 2-3 days
**Cost**: $0
**Risk**: Low
**Impact**: High

### Phase 2: Premium TTS (Week 2-3)
**Goal**: Add premium voice option for Pro subscribers

1. Setup OpenAI API integration
   - Secure API key management (env variables)
   - Error handling and retries
   - Audio caching strategy

2. Implement TTS service layer
   - Create abstraction for multiple providers
   - Add intelligent routing based on user tier
   - Implement fallback chain

3. Add premium voice selection UI
   - Let Pro users choose from 6 OpenAI voices
   - Preview voice samples
   - Settings persistence

4. Monitor usage and costs
   - Track API usage by user
   - Set up billing alerts
   - Optimize caching

**Estimated Time**: 1-1.5 weeks
**Cost**: Variable based on usage
**Risk**: Medium (cost management)
**Impact**: High (premium differentiation)

### Phase 3: Offline Support (Week 4-6)
**Goal**: Enable offline TTS for better user experience

1. Integrate react-native-sherpa-onnx-offline-tts
   ```bash
   npm install react-native-sherpa-onnx-offline-tts
   ```

2. Setup model management
   - Host models on CDN
   - Implement smart downloading (WiFi only by default)
   - Add model management UI in settings

3. Implement offline detection
   - NetInfo integration
   - Automatic fallback to offline TTS
   - User notification when offline

4. Optimize model size
   - Choose appropriate quality/size tradeoff
   - Implement on-demand model downloads
   - Add option to delete models to free space

**Estimated Time**: 2-3 weeks
**Cost**: CDN hosting (~$10-50/month)
**Risk**: Medium (technical complexity)
**Impact**: Medium (improves offline experience)

### Phase 4: Optimization (Ongoing)
**Goal**: Reduce costs and improve quality

1. Implement aggressive audio caching
   - Cache common phrases
   - Pre-generate lesson audio
   - LRU cache with size limits

2. Add user settings
   - Voice speed control
   - Voice personality selection
   - Quality vs. data usage toggle

3. A/B testing
   - Compare user engagement across TTS providers
   - Measure completion rates
   - Gather quality feedback

4. Cost optimization
   - Monitor OpenAI usage
   - Identify high-usage patterns
   - Consider pre-generating common content

---

## Technical Implementation Notes

### Audio Playback with expo-av

All cloud TTS solutions return audio data that needs to be played. Use expo-av:

```typescript
import { Audio } from 'expo-av';

async function playTTSAudio(audioUri: string) {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );

    await sound.playAsync();

    // Cleanup
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
}
```

### Caching Strategy

```typescript
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const TTS_CACHE_DIR = `${FileSystem.cacheDirectory}tts/`;

async function getCachedOrGenerateTTS(text: string, provider: string): Promise<string> {
  // Create cache key
  const cacheKey = `${provider}_${hashString(text)}.mp3`;
  const cachePath = `${TTS_CACHE_DIR}${cacheKey}`;

  // Check if cached
  const fileInfo = await FileSystem.getInfoAsync(cachePath);
  if (fileInfo.exists) {
    return cachePath;
  }

  // Generate new audio
  const audioData = await generateTTS(text, provider);

  // Save to cache
  await FileSystem.makeDirectoryAsync(TTS_CACHE_DIR, { intermediates: true });
  await FileSystem.writeAsStringAsync(cachePath, audioData, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return cachePath;
}

// Implement cache size limits
async function cleanupOldCache() {
  const files = await FileSystem.readDirectoryAsync(TTS_CACHE_DIR);
  const MAX_CACHE_SIZE_MB = 100;

  // Sort by last modified, delete oldest if over limit
  // Implementation details...
}
```

### Network Detection

```typescript
import NetInfo from '@react-native-community/netinfo';

let isConnected = true;

NetInfo.addEventListener(state => {
  isConnected = state.isConnected;
  console.log('Connection type:', state.type);
  console.log('Is connected?', state.isConnected);
});

function shouldUseOfflineTTS(): boolean {
  return !isConnected || user.settings.offlineMode;
}
```

### Error Handling

```typescript
async function robustTTS(text: string) {
  const providers = [
    TTSProvider.OpenAI,     // Try premium first if applicable
    TTSProvider.EdgeSpeech, // Fall back to free cloud
    TTSProvider.SherpaONNX, // Then offline
    TTSProvider.Native      // Finally device native
  ];

  for (const provider of providers) {
    try {
      await executeTTS(text, provider);
      return; // Success
    } catch (error) {
      console.warn(`TTS failed with ${provider}:`, error);
      // Continue to next provider
    }
  }

  // All providers failed
  throw new Error('All TTS providers failed');
}
```

---

## Quality Assessment

### Voice Quality Ranking (2025)

Based on naturalness, prosody, and human-likeness:

1. **ElevenLabs** (⭐⭐⭐⭐⭐) - Most natural, emotional, but expensive
2. **OpenAI TTS-HD** (⭐⭐⭐⭐⭐) - Excellent quality, best value
3. **OpenAI TTS-1** (⭐⭐⭐⭐) - Very good, fast, affordable
4. **expo-edge-speech** (⭐⭐⭐⭐) - Excellent for free, 400+ voices
5. **Google WaveNet** (⭐⭐⭐⭐) - High quality, many languages
6. **Azure Neural** (⭐⭐⭐⭐) - Professional quality
7. **Amazon Polly** (⭐⭐⭐⭐) - Good neural voices
8. **Sherpa-ONNX** (⭐⭐⭐) - Good for offline, natural enough
9. **Coqui TTS** (⭐⭐⭐) - Good, customizable
10. **Piper TTS** (⭐⭐⭐) - Decent for lightweight
11. **expo-speech** (⭐⭐) - Robotic, device-dependent

### Language Learning Suitability

For language learning, prioritize:
- Clear pronunciation ✅
- Natural prosody ✅
- Consistent quality ✅
- Multiple speaker voices ✅
- Adjustable speed ✅

**Best Choices**:
1. OpenAI TTS (premium lessons)
2. expo-edge-speech (free lessons)
3. Sherpa-ONNX (offline practice)

---

## Cost-Benefit Analysis

### Return on Investment

**Current State (expo-speech)**:
- Cost: $0/month
- User satisfaction: Low (robotic voices)
- Retention impact: Negative
- Premium differentiation: None

**Recommended Hybrid (expo-edge-speech + OpenAI)**:
- Cost: $0/month (free tier) + $XX for premium (scales with usage)
- User satisfaction: High (natural voices)
- Retention impact: Positive (better experience = higher retention)
- Premium differentiation: Strong (best voices for Pro)

**Value Metrics**:

Assuming improved voice quality increases retention by 10%:
- Current: 10,000 users × $5/month × 30% retention = $15,000/month
- Improved: 10,000 users × $5/month × 33% retention = $16,500/month
- **Gain**: $1,500/month

Even if premium TTS costs $500/month for OpenAI, net gain = $1,000/month

**Plus intangible benefits**:
- Better user reviews
- Higher NPS scores
- Competitive differentiation
- Premium tier justification

---

## Migration Strategy

### Step-by-Step Migration

**Current Code**:
```typescript
import * as Speech from 'expo-speech';

Speech.speak('Hello world', {
  language: 'en-US',
  pitch: 1.0,
  rate: 0.9
});
```

**Phase 1 - Add expo-edge-speech**:
```typescript
import * as EdgeSpeech from 'expo-edge-speech';

// Drop-in replacement
EdgeSpeech.speak('Hello world', {
  language: 'en-US',
  voice: 'en-US-JennyNeural',
  rate: 0.9
});
```

**Phase 2 - Add TTS Service Layer**:
```typescript
// services/tts.service.ts
import * as EdgeSpeech from 'expo-edge-speech';
import * as Speech from 'expo-speech';

export class TTSService {
  async speak(text: string, options: TTSOptions) {
    try {
      await EdgeSpeech.speak(text, {
        language: options.language,
        voice: this.getVoiceForLanguage(options.language),
        rate: options.rate || 0.9
      });
    } catch (error) {
      // Fallback to native
      await Speech.speak(text, options);
    }
  }

  private getVoiceForLanguage(language: string): string {
    const voices = {
      'en-US': 'en-US-JennyNeural',
      'es-ES': 'es-ES-ElviraNeural',
      'fr-FR': 'fr-FR-DeniseNeural',
      // Add more
    };
    return voices[language] || voices['en-US'];
  }
}
```

**Phase 3 - Add Premium Provider**:
```typescript
export class TTSService {
  async speak(text: string, options: TTSOptions) {
    const provider = this.selectProvider(options);

    switch (provider) {
      case 'openai':
        return await this.speakWithOpenAI(text, options);
      case 'edge':
        return await this.speakWithEdge(text, options);
      case 'native':
        return await this.speakWithNative(text, options);
    }
  }

  private selectProvider(options: TTSOptions): TTSProvider {
    if (options.premium && this.user.isPremium) {
      return 'openai';
    }
    if (this.networkInfo.isConnected) {
      return 'edge';
    }
    return 'native';
  }
}
```

**Phase 4 - Add Offline Support**:
```typescript
export class TTSService {
  private sherpaInitialized = false;

  async speak(text: string, options: TTSOptions) {
    const provider = this.selectProvider(options);

    switch (provider) {
      case 'openai':
        return await this.speakWithOpenAI(text, options);
      case 'edge':
        return await this.speakWithEdge(text, options);
      case 'sherpa':
        return await this.speakWithSherpa(text, options);
      case 'native':
        return await this.speakWithNative(text, options);
    }
  }

  private selectProvider(options: TTSOptions): TTSProvider {
    if (!this.networkInfo.isConnected) {
      return this.sherpaInitialized ? 'sherpa' : 'native';
    }
    if (options.premium && this.user.isPremium) {
      return 'openai';
    }
    return 'edge';
  }
}
```

---

## Conclusion

### Final Recommendation Summary

**Implement a 3-tier hybrid TTS system**:

1. **Primary (All Users)**: expo-edge-speech
   - FREE, unlimited
   - Excellent quality improvement
   - Quick implementation (1-2 days)

2. **Premium (Pro Users)**: OpenAI TTS
   - Best-in-class quality
   - Reasonable cost ($15-30 per 1M chars)
   - Strong premium differentiation

3. **Offline (All Users)**: Sherpa-ONNX
   - Works without internet
   - FREE after setup
   - Good enough quality for practice

### Why This Approach Wins

✅ **Cost-Effective**: Free for 90% of users, paid only scales with premium
✅ **High Quality**: Massive improvement over robotic expo-speech
✅ **Reliable**: Multiple fallbacks ensure TTS always works
✅ **Scalable**: Costs scale with revenue (premium users)
✅ **Competitive**: Premium voices justify Pro subscription
✅ **Offline-Ready**: Works even without connectivity
✅ **Quick to Implement**: Phase 1 takes just 2-3 days

### Avoid These Options

❌ **ElevenLabs**: Too expensive ($180+ per 1M vs $15-30 for OpenAI)
❌ **Coqui TTS**: Company defunct, requires backend server
❌ **Pure expo-speech**: Robotic quality hurts retention
❌ **Azure/Google**: More complex, no clear advantage over OpenAI + expo-edge-speech

### Next Steps

1. **This Week**: Install expo-edge-speech, replace expo-speech calls
2. **Next Week**: Measure user feedback and engagement improvements
3. **Week 3-4**: Implement OpenAI TTS for premium users
4. **Week 5-8**: Add Sherpa-ONNX offline support
5. **Ongoing**: Monitor costs, optimize caching, gather feedback

---

## Sources & References

### ElevenLabs
- [ElevenLabs API Pricing](https://elevenlabs.io/pricing/api)
- [ElevenLabs Pricing Plans](https://elevenlabs.io/pricing)
- [ElevenLabs API Cost Guide](https://help.elevenlabs.io/hc/en-us/articles/28184926326033-How-much-does-it-cost-to-use-the-API)
- [ElevenLabs TTS API Pricing Explained](https://blog.unrealspeech.com/elevenlabs-tts-api-pricing-explained-a-developers-guide/)

### Coqui TTS
- [Coqui TTS GitHub](https://github.com/coqui-ai/TTS)
- [Coqui TTS Deep Dive](https://medium.com/@sudeshnm/coqui-tts-deep-dive-into-an-open-source-text-to-speech-framework-129c76a66580)
- [Coqui XTTS v2 on Hugging Face](https://huggingface.co/coqui/XTTS-v2)

### Piper TTS & Mozilla TTS
- [Piper TTS GitHub](https://github.com/rhasspy/piper)
- [Piper TTS Web Browser Integration](https://github.com/rhasspy/piper/issues/352)
- [react-native-sherpa-onnx-offline-tts](https://github.com/kislay99/react-native-sherpa-onnx-offline-tts)

### Microsoft Edge TTS
- [expo-edge-speech Documentation](https://oovz.github.io/expo-edge-speech/)
- [@andresaya/edge-tts npm](https://www.npmjs.com/package/@andresaya/edge-tts)
- [react-native-text-to-speech-edge GitHub](https://github.com/atsneves/react-native-text-to-speech-edge)

### Google Cloud TTS
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)
- [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Google Cloud Speech-to-Text Pricing 2025](https://www.trustradius.com/products/google-cloud-speech-to-text/pricing)

### React Native TTS Comparisons
- [Comparison of Text to Speech Solutions for React Native](https://www.netguru.com/blog/react-native-text-to-speech)
- [Add AI Text-to-Speech in React Native](https://www.sevensquaretech.com/ai-text-to-speech-react-native-github-code/)
- [React Native TTS npm](https://www.npmjs.com/package/react-native-tts)
- [9 Best Open Source TTS Engines](https://code-b.dev/blog/open-source-text-to-speech-tts-engines)

### OpenAI TTS
- [OpenAI Text To Speech Pricing](https://ttsopenai.com/pricing)
- [OpenAI TTS API Pricing Calculator](https://costgoat.com/pricing/openai-tts)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [OpenAI TTS Cost Analysis](https://www.s-anand.net/blog/openai-tts-cost/)

### Azure Cognitive Services
- [Azure AI Speech Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)
- [Microsoft Azure Text to Speech Pricing](https://speechify.com/blog/microsoft-azure-pricing-plans/)
- [Best TTS APIs in 2025](https://www.speechmatics.com/company/articles-and-news/best-tts-apis-in-2025-top-12-text-to-speech-services-for-developers)

### Sherpa-ONNX
- [Sherpa-ONNX GitHub](https://github.com/k2-fsa/sherpa-onnx)
- [Sherpa-ONNX Documentation](https://k2-fsa.github.io/sherpa/onnx/index.html)
- [Sherpa-ONNX TTS Documentation](https://k2-fsa.github.io/sherpa/onnx/tts/index.html)
- [Sherpa-ONNX Unified Speech Platform](https://www.blog.brightcoding.dev/2025/09/11/sherpa-onnx-unified-speech-recognition-synthesis-and-audio-processing-for-every-platform/)

### Expo Speech
- [Expo Speech Documentation](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Making Speech-to-Text Work with React Native and Expo](https://fostermade.co/about/journal/making-speech-to-text-work-with-react-native-and-expo)

---

**Document Version**: 1.0
**Last Updated**: December 14, 2025
**Next Review**: March 2026
