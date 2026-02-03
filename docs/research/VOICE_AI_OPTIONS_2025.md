# Voice AI Options Research - December 2025

> **Research Date**: December 16, 2025
> **Purpose**: Evaluate voice AI solutions for conversational language learning features
> **Use Cases**: Character voices for stories, real-time conversation scenarios, roleplay dialogues

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Gemini Live API](#gemini-live-api)
3. [ElevenLabs Conversational AI](#elevenlabs-conversational-ai)
4. [Open Source TTS Models](#open-source-tts-models)
5. [Open Source Orchestration Frameworks](#open-source-orchestration-frameworks)
6. [React Native / Expo Considerations](#react-native--expo-considerations)
7. [Cost Analysis](#cost-analysis)
8. [Production Concerns](#production-concerns)
9. [Recommendations](#recommendations)
10. [Sources](#sources)

---

## Executive Summary

### Key Findings

| Solution | Voice Quality | Latency | Cost | Expo Support | Best For |
|----------|--------------|---------|------|--------------|----------|
| Gemini Live API | Good | ~500ms | Free tier + pay-as-you-go | Via WebSocket | Quick prototyping |
| ElevenLabs | Excellent | ~200ms | $0.08/min | Official SDK | Production character voices |
| Chatterbox (Open Source) | Very Good | <200ms | Self-host or API | Manual integration | Scale optimization |
| Fish Speech | Excellent | Variable | Self-host | Manual integration | Emotion-rich characters |
| Kokoro | Good | <300ms | Free (CPU) | Manual integration | Lightweight/offline |

### Decision Matrix

- **MVP/Prototype**: Gemini Live API (already integrated, free tier)
- **Production Quality**: ElevenLabs + Gemini Flash (best voices, official Expo SDK)
- **Scale (>250k conv/mo)**: Self-hosted Chatterbox + Pipecat

---

## Gemini Live API

### Overview
Google's real-time voice conversation API built on Gemini 2.5 Flash Native Audio.

### Pricing (December 2025)

| Tier | Input | Output |
|------|-------|--------|
| **Free** | Free | Free (with rate limits) |
| **Paid** | $0.50/1M tokens (text), $3.00/1M tokens (audio) | $2.00/1M tokens (text), $12.00/1M tokens (audio) |

**Additional costs reported:**
- Session setup: ~$0.005 per session
- Active conversation: ~$0.025 per minute

### Features
- ✅ 24 languages supported
- ✅ Barge-in capability (users can interrupt)
- ✅ Affective dialog (adapts tone to user input)
- ✅ Tool/function calling support
- ✅ WebSocket connections

### Limitations
- ⚠️ Stricter concurrency: 5-10 simultaneous sessions (vs hundreds for standard API)
- ⚠️ Voice quality good but not best-in-class
- ⚠️ Less control over voice personality/character

### User Feedback
- Generally positive for prototyping
- Voice quality described as "natural but AI-ish"
- Good for functional conversations, less immersive for storytelling

### Integration Complexity
- **Difficulty**: Low-Medium
- **Expo**: Works via WebSocket, no native SDK needed
- **Documentation**: Good, official Google docs

---

## ElevenLabs Conversational AI

### Overview
Industry-leading voice AI with the most natural-sounding voices, now with native Gemini 2.0 Flash integration.

### Pricing (December 2025)

| Plan | Price | Minutes | Per-Minute |
|------|-------|---------|------------|
| Free | $0 | 15 min/mo | - |
| Starter | $5/mo | ~30 min | ~$0.17 |
| Creator | $22/mo | ~100 min | ~$0.22 |
| Pro | $99/mo | ~500 min | ~$0.20 |
| Scale | $330/mo | ~2,000 min | ~$0.17 |
| Business | $1,320/mo | 13,750 min | $0.08 |

### Features
- ✅ **3,000+ voices** available
- ✅ **Voice cloning** from 20-second audio sample
- ✅ **Emotion control** and expressiveness tuning
- ✅ **23 languages** with Multilingual v2
- ✅ **Official React Native SDK** for Expo
- ✅ **Gemini 2.0 Flash integration** native support
- ✅ Can swap LLMs without changing voice infrastructure

### Quality Benchmarks
- **63.75%** of evaluators preferred ElevenLabs over competitors (Podonos blind test)
- Ranked as "most realistic voice provider on the market" by users
- Function calling: 80% accuracy (vs OpenAI's 66.5%)
- Instruction following: 50%+ accuracy (vs OpenAI's 30.5%)

### User Feedback

**Positive:**
> "Voice cloning interface is extremely easy to use, only required a 20-second recording"

> "Users consistently rank ElevenLabs as the most realistic voice provider"

**Negative:**
> "Credit-based pricing model confusing"

> "Re-renders cost credits even for small edits"

> "Hidden costs like voice licensing, previews, HIPAA add-ons"

### Integration Complexity
- **Difficulty**: Low
- **Expo**: Official SDK with WebRTC support
- **Installation**: `npm install @11labs/react-native`

---

## Open Source TTS Models

### Chatterbox (Resemble AI) ⭐ TOP PICK

| Attribute | Value |
|-----------|-------|
| Parameters | 500M (Llama backbone) |
| Latency | <200ms first chunk |
| Languages | 23 |
| Voice Cloning | Yes (zero-shot) |
| Emotion Control | Yes (unique feature) |
| License | **MIT** (fully free) |

**Key Features:**
- Emotion exaggeration control (dial expressiveness up/down)
- Paralinguistic tags: `[cough]`, `[laugh]`, `[chuckle]`
- Turbo model (350M params) for faster inference
- Trained on 500K+ hours of cleaned audio

**Benchmarks:**
- 63.75% preference over ElevenLabs in blind tests
- Sub-200ms latency on high-end GPUs

**User Feedback:**
> "Emotion exaggeration control is a first among open-source TTS models"

**Concerns:**
- Requires GPU for production speeds
- Self-hosting adds infrastructure complexity

**Links:**
- GitHub: https://github.com/resemble-ai/chatterbox
- HuggingFace: https://huggingface.co/ResembleAI/chatterbox

---

### Fish Speech / OpenAudio S1 ⭐ TOP PICK

| Attribute | Value |
|-----------|-------|
| Ranking | **#1 on TTS-Arena2** |
| Languages | 8 (EN, ES, FR, DE, JP, KO, ZH, AR) |
| Voice Cloning | Yes (10-30 sec audio) |
| Emotions | 50+ markers |
| GitHub Stars | 20,000+ |

**Key Features:**
- Natural language emotion control ("speak sadly", "whisper")
- High similarity scores (0.914 on Resemblyzer, 0.76% gap from ground truth)
- Active community and development

**User Feedback:**
> "The best text to speech software I've ever used. You can generate a whole script in one go"

> "Voice cloning so lifelike from just 20-second recording"

**Concerns:**
- Some users report initial voice cloning needs tuning
- Requires GPU for optimal performance

**Links:**
- GitHub: https://github.com/fishaudio/fish-speech
- Website: https://fish.audio/

---

### Kokoro (Lightweight)

| Attribute | Value |
|-----------|-------|
| Parameters | **82M** (very small) |
| Speed | <0.3 seconds |
| Runs on | **CPU** at real-time |
| License | Apache 2.0 |

**Key Features:**
- Highest-ranking non-proprietary model on TTS leaderboard
- ONNX version runs fast even on CPU
- Good quality-to-size ratio

**User Feedback:**
> "ONNX version is fantastic, models are pretty small, sound really good and run fast even on CPU"

**Limitations:**
- ❌ No voice cloning (preset voice library only)
- ❌ Limited emotional range
- Quality trade-off for speed

**Links:**
- HuggingFace: https://huggingface.co/hexgrad/Kokoro-82M

---

### XTTS-v2 (Coqui) ⚠️ USE WITH CAUTION

| Attribute | Value |
|-----------|-------|
| Languages | 13 (including Spanish) |
| Voice Cloning | Yes (6-second clip) |
| Status | **Community-maintained** (Coqui shut down Dec 2024) |

**Key Features:**
- Multiple speaker interpolation
- Cross-language voice cloning

**User Feedback:**
> "XTTS-v2 clone of my grandfather's voice brought tears to my eyes"

**BUT Critical Issues:**
> "Day 3 of trying to install on Windows 11. Ready to give up"

> "Works great for English, terrible for Spanish"

> "Training success rate among beginners is approximately 25%"

**Major Concern:** Coqui AI shut down in December 2024. Community maintains code but no full model weights for training.

**Links:**
- GitHub: https://github.com/coqui-ai/TTS
- HuggingFace: https://huggingface.co/coqui/XTTS-v2

---

### Dia TTS (Multi-Speaker Dialogues)

| Attribute | Value |
|-----------|-------|
| Parameters | 1.6B |
| Specialty | **Multi-speaker dialogues** |
| Languages | English only |

**Unique Feature:**
```text
[S1] Hello, how are you today?
[S2] I'm doing great, thanks for asking!
```
Automatically generates distinct voices per speaker tag.

**Best For:** Scripted dialogues with multiple characters

**Limitations:**
- ❌ English only (planned expansion)
- Requires GPU

---

### MeloTTS (MyShell.ai)

| Attribute | Value |
|-----------|-------|
| Languages | EN, ES, FR, ZH, JP, KO |
| Optimization | Real-time on **CPU** |

**Good For:** Multilingual apps on limited hardware

---

### Comparison Summary

| Model | Quality | Speed | Voice Clone | Languages | GPU Required | Character Voices |
|-------|---------|-------|-------------|-----------|--------------|------------------|
| Chatterbox | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Yes | 23 | Yes | Excellent |
| Fish Speech | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Yes | 8 | Yes | Excellent |
| Kokoro | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | No | Limited | No | Limited |
| XTTS-v2 | ⭐⭐⭐⭐ | ⭐⭐⭐ | Yes | 13 | Yes | Good |
| Dia TTS | ⭐⭐⭐⭐ | ⭐⭐⭐ | No | 1 | Yes | Excellent |
| MeloTTS | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | No | 6 | No | Limited |

---

## Open Source Orchestration Frameworks

### Pipecat ⭐ RECOMMENDED

**Overview:** Open-source Python framework for building real-time voice and multimodal conversational agents by Daily.

**Community:**
- 13,000+ developers in Slack
- Active development and support

**User Feedback:**
> "One of the best open-source AI voice agents available in 2025"

> "Super easy to get started—run on local machine then move to cloud"

**Known Issues:**
- ⚠️ 2-5 second delays between user stops speaking and bot responds
- ⚠️ STT timeout handling adds latency
- ⚠️ Async function calling has "quirks"
- ⚠️ Service providers "not as reliable as you wish"

**Best For:**
- Full pipeline control
- Custom conversation logic
- Plugging in any TTS/STT/LLM combination

**Links:**
- GitHub: https://github.com/pipecat-ai/pipecat
- Website: https://www.pipecat.ai/

---

### LiveKit

**Overview:** Go framework for real-time communication with WebRTC focus.

**Strengths:**
- Better scalability than Pipecat
- Hardware-accelerated VAD
- Good turn detection

**Known Issues:**
- ⚠️ Telephony latency "quite unbearable"
- ⚠️ More complex setup

---

## React Native / Expo Considerations

### Critical Limitations

| Issue | Impact | Solution |
|-------|--------|----------|
| **No Expo Go support** | @react-native-voice/voice requires native build | Use development build or EAS |
| **Android fragmentation** | Continuous mode only Android 13+ | Feature detection and fallbacks |
| **iOS Siri requirement** | Speech recognition needs Siri enabled | User guidance in app |
| **Permissions** | Microphone access needs app.json config | Add infoPlist and permissions |

### Working Solutions

**ElevenLabs (Official SDK):**
```bash
npm install @11labs/react-native
```
- WebRTC support for real-time
- Works with Expo (requires native build)

**expo-speech-recognition:**
```bash
npx expo install expo-speech-recognition
```
- Community package, July 2025 multi-platform support

**Speechmatics Flow:**
- Supports Expo with real-time audio
- Requires EventTarget polyfill

### app.json Configuration

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSSpeechRecognitionUsageDescription": "This app uses speech recognition for language practice",
        "NSMicrophoneUsageDescription": "This app needs microphone access for voice conversations"
      }
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    },
    "plugins": [
      "expo-speech-recognition"
    ]
  }
}
```

---

## Cost Analysis

### API-Based Solutions

| Solution | 10k min/mo | 100k min/mo | 1M min/mo |
|----------|------------|-------------|-----------|
| Gemini Live | ~$30-50 | ~$300-500 | ~$3,000-5,000 |
| ElevenLabs | ~$800 | ~$8,000 | Negotiate |
| OpenAI Realtime | ~$3,000 | ~$30,000 | ~$300,000 |

### Self-Hosted Infrastructure

| Component | Monthly Cost |
|-----------|-------------|
| GPU Cloud (T4) | ~$275 |
| GPU Cloud (A100) | ~$2,600 |
| Bandwidth | ~$50-200 |
| DevOps (1-2 FTE) | $10,000-20,000 |

**Break-Even Analysis:**
- <100k conversations/month: APIs cheaper
- >250k conversations/month: Self-hosting starts to pay off
- Need >8,000 conversations/day for self-hosting to be cost-effective

### Hidden Costs

1. **Infrastructure**: 2.5-3x raw GPU investment (cooling, networking, storage)
2. **Engineering**: 1-2 FTE for production deployments
3. **Reliability**: Service provider outages, fallback systems
4. **Latency optimization**: Custom tuning, CDN, edge deployment

---

## Production Concerns

### Common Pitfalls

1. **80% of AI tools fail in production** due to poor integration
2. **Only 1 in 5 enterprises** report full satisfaction with voice AI platforms
3. **Latency targets**: 800ms median voice-to-voice (reality: 1,500-3,000ms for many)

### Latency Requirements

| Target | User Experience |
|--------|-----------------|
| <500ms | Excellent, natural flow |
| 500-800ms | Good, acceptable |
| 800-1,500ms | Noticeable delay |
| >1,500ms | Feels robotic, breaks immersion |

### Language Quality Issues

> "Works great for English, terrible for Spanish" - XTTS user

**Recommendation:** Always test with target language content before committing.

### Security & Compliance

- Non-compliant TTS solutions pose security risks
- Consider: HIPAA, GDPR, SOC 2 requirements
- Deepfake concerns with voice cloning

---

## Recommendations

### For Vox Language App

#### Phase 1: Prototype (Free)
**Gemini Live API**
- Already integrated
- Free tier for validation
- Test conversation flows

#### Phase 2: Production Quality
**ElevenLabs + Gemini Flash**
- Best voice quality for characters
- Official Expo SDK
- Emotion control for stories
- Start at $5-99/mo tiers

#### Phase 3: Scale Optimization
**Self-hosted Chatterbox + Pipecat**
- When >100k conversations/month
- Or negotiate ElevenLabs Enterprise

---

## Sources

### Official Documentation
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini Live API Docs](https://ai.google.dev/gemini-api/docs/live)
- [ElevenLabs Expo React Native Guide](https://elevenlabs.io/docs/cookbooks/conversational-ai/expo-react-native)
- [ElevenLabs + Gemini Integration](https://elevenlabs.io/blog/gemini-2-0-flash-conversational-ai)

### Open Source Projects
- [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- [Fish Speech GitHub](https://github.com/fishaudio/fish-speech)
- [Pipecat GitHub](https://github.com/pipecat-ai/pipecat)
- [Kokoro HuggingFace](https://huggingface.co/hexgrad/Kokoro-82M)
- [XTTS-v2 GitHub](https://github.com/coqui-ai/TTS)

### Analysis & Reviews
- [Pipecat Review 2025](https://www.neuphonic.com/blog/pipecat-review-open-source-ai-voice-agents)
- [Voice AI Building Advice 2025](https://www.daily.co/blog/advice-on-building-voice-ai-in-june-2025/)
- [ElevenLabs Pricing Guide](https://www.callpod.ai/blog/elevenlabs-pricing)
- [Self-Hosting AI True Costs](https://www.crowdee.com/blog/posts/self-hosting-ai-costs)
- [Enterprise Voice AI Challenges](https://taritas.com/blog/enterprise-voice-ai-implementation-challenges-2025)
- [Best Open Source TTS 2025](https://www.siliconflow.com/articles/en/best-open-source-AI-models-for-voice-assistants)

---

*Document created: December 16, 2025*
*Last updated: December 16, 2025*
