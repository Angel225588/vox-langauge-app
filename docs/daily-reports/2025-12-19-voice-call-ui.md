# Voice Call UI & Accent System Implementation

**Date:** 2025-12-19
**Session Focus:** Gemini Live Voice Conversation with Accents and Phone-Call UI

---

## Summary

Implemented a complete voice conversation system with accent support and a new phone-call style UI for the Vox Language App. The system uses Google's Gemini Live API for real-time voice conversations with configurable regional accents.

---

## Features Implemented

### 1. Accent System

Added comprehensive accent support for voice conversations:

**Supported Accents:**
| Language | Accent ID | Flag | Description |
|----------|-----------|------|-------------|
| Spanish | `es-latam` | 🇲🇽 | Latin American Spanish (Mexico, Colombia) |
| Spanish | `es-spain` | 🇪🇸 | Castilian Spanish (Spain) |
| French | `fr-france` | 🇫🇷 | Parisian French |
| French | `fr-canada` | 🇨🇦 | Québécois French |
| English | `en-american` | 🇺🇸 | General American |
| English | `en-british` | 🇬🇧 | British RP |
| English | `en-australian` | 🇦🇺 | Australian |
| Portuguese | `pt-brazil` | 🇧🇷 | Brazilian Portuguese |
| Portuguese | `pt-portugal` | 🇵🇹 | European Portuguese |

**Implementation:**
- Accent instructions are prepended to the system prompt
- Gemini adapts speech patterns, vocabulary, and pronunciation based on accent
- Default accent per language (e.g., `es-latam` for Spanish)

### 2. Voice Call Screen (Phone-Call Style UI)

New `VoiceCallScreen` component with:

**Visual Elements:**
- Large animated avatar (120x120px)
- Pulsing glow effect when AI is speaking
- Scaling effect when recording user audio
- Session timer in header
- Real-time transcription display (last 4 messages)

**State Animations:**
| State | Avatar Animation | UI Feedback |
|-------|-----------------|-------------|
| Idle | Static | "Ready" status |
| Connecting | Static | "Connecting..." |
| Recording | Scale with audio level | Red mic, "Listening..." |
| Processing | Rotation | "Thinking..." with spinner |
| Speaking | Pulse animation | "Speaking..." with wave |

**Controls:**
- Large push-to-talk button (88x88px) with gradient
- End call button (red with rotated phone icon)
- Stop playback button (appears during AI speech)

### 3. Accent Selector UI

Dropdown selector in scenario selection screen:
- Shows flag + accent name
- Only visible when "Live Mode" is selected
- Animated dropdown with checkmarks
- Persists selection across scenario changes

### 4. useVoiceConversation Hook Updates

Added accent support to the hook:

```typescript
const conversation = useVoiceConversation({
  scenario,
  character,
  accent: 'es-latam', // NEW: Accent option
  voice: 'Kore',
  language: 'es',
  // ... other options
});
```

**Accent Resolution Order:**
1. Character's accent (if character has one)
2. Explicit accent option
3. Default accent for language

---

## Files Changed

### New Files
| File | Description |
|------|-------------|
| `components/cards/VoiceCallScreen.tsx` | Phone-call style voice conversation UI |

### Modified Files
| File | Changes |
|------|---------|
| `hooks/useVoiceConversation.ts` | Added `accent` option, passes to GeminiLiveClient |
| `components/cards/index.tsx` | Export VoiceCallScreen |
| `app/voice-conversation.tsx` | Accent selector UI, use VoiceCallScreen for Live mode |

### Previously Modified (This Session)
| File | Changes |
|------|---------|
| `lib/voice/types.ts` | Added `AccentType`, `ACCENT_OPTIONS`, helper functions |
| `lib/voice/geminiLive.ts` | Accent instructions in system prompt, fixed binary message handling |

---

## Technical Details

### Gemini Live API Integration

**WebSocket Connection:**
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=API_KEY
```

**Audio Format:**
- Input: WAV (16kHz, mono)
- Output: PCM (24kHz) - requires WAV header for playback

**Accent via System Prompt:**
```typescript
const accentPreamble = `IMPORTANT ACCENT INSTRUCTION: ${accentInfo.promptInstruction}\n\n`;
systemPrompt = accentPreamble + systemPrompt;
```

### Component Architecture

```
VoiceConversationScreen (app/voice-conversation.tsx)
├── Scenario Selection
│   ├── Mode Selector (Eco/Live)
│   ├── Accent Selector (Live mode only)
│   └── Scenario Cards
└── Conversation View
    ├── VoiceCallScreen (gemini-live mode) ← NEW
    └── VoiceRolePlayCard (hybrid mode)
```

---

## Testing Instructions

1. Navigate to **Practice** tab
2. Tap **Voice Conversation**
3. Select **Live Mode** (orange button)
4. Tap **Accent** dropdown → Select **Latin American Spanish** or **Spanish (Spain)**
5. Choose a scenario (e.g., "Ordering at a Café")
6. Wait for "Ready" status
7. **Hold** the microphone button to speak
8. **Release** to send audio
9. Listen to AI response with selected accent

---

## Known Limitations

1. **Latency:** ~2-3 seconds for response (expected for Gemini Live)
2. **No streaming playback:** Audio plays after full response received
3. **Post-call feedback:** Not yet implemented (pending task)

---

## Next Steps

1. **Post-Call Feedback Page**
   - Display conversation summary
   - Show turn count and duration
   - AI-generated feedback on pronunciation
   - Points/XP integration

2. **Streaming Audio Playback**
   - Play audio chunks as they arrive
   - Reduce perceived latency

3. **Voice Selection UI**
   - Allow users to choose from 8 Gemini voices
   - Preview voice before conversation

---

## Dependencies

- `@google/generative-ai` - Gemini API client
- `expo-av` - Audio recording and playback
- `expo-file-system` - File operations
- `react-native-reanimated` - Animations

---

## Cost Considerations

Gemini Live API is billed per minute of audio:
- Input audio: ~$0.04/minute
- Output audio: ~$0.16/minute
- Typical 5-minute conversation: ~$1.00

Consider using **Eco Mode** (Whisper + Gemini Text + TTS) for cost-sensitive users (~30x cheaper).
