# Voice Conversation UI/UX Plan

## Current State
- Voice conversation works with Gemini Live ✅
- High latency (expected for now)
- No real-time transcription visible
- Basic UI

## Target Experience

### 1. Call UI (Phone-Call Style)

```
┌─────────────────────────────────────┐
│  ← Back              00:45          │  ← Timer
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐            │
│         │             │            │
│         │   🎭 María   │            │  ← AI Avatar (animated)
│         │  Speaking... │            │
│         └─────────────┘            │
│                                     │
│   "Hola! ¿Cómo estás hoy?"        │  ← Current AI speech
│                                     │
│   ─────────────────────────        │
│                                     │
│   You: "Estoy bien, gracias"       │  ← User's last message
│                                     │
├─────────────────────────────────────┤
│                                     │
│         ┌───────────────┐          │
│         │ 🎤 Hold to    │          │  ← Push-to-talk button
│         │    Speak      │          │
│         └───────────────┘          │
│                                     │
│              🔴 End                 │  ← End call button
└─────────────────────────────────────┘
```

**States:**
- Idle: Waiting for user
- Recording: Pulse animation, "Listening..."
- Processing: Loading spinner, "Thinking..."
- Speaking: Sound wave animation, AI text appears

### 2. Real-Time Transcription

During call:
- Show last 2-3 exchanges
- Scroll for full history
- Highlight current speaker

After call:
- Full transcript view
- Timestamp for each message
- Option to replay audio segments

### 3. Post-Call Feedback Page

```
┌─────────────────────────────────────┐
│        🎉 Great Conversation!       │
├─────────────────────────────────────┤
│                                     │
│   ⏱️ Duration: 2:34                 │
│   💬 Exchanges: 8                   │
│   🎯 Points: +45                    │
│                                     │
├─────────────────────────────────────┤
│   📝 AI Feedback                    │
│                                     │
│   "Your pronunciation of 'gracias' │
│    was excellent! Try rolling the  │
│    'r' more in 'por favor'."       │
│                                     │
├─────────────────────────────────────┤
│   📜 Transcript                     │
│                                     │
│   🤖 María: Hola! ¿Cómo estás?     │
│   👤 You: Estoy bien, gracias      │
│   🤖 María: ¡Qué bueno! ¿Qué...    │
│   ...                               │
│                                     │
├─────────────────────────────────────┤
│   [View Full Transcript]            │
│   [Practice Again]  [Done ✓]        │
└─────────────────────────────────────┘
```

### 4. Accent Selection

Add to scenario selection screen:

```
Voice & Accent
┌─────────────────────────────────────┐
│  🇲🇽 Spanish (Latin America)        │ ← Default for Spanish
│  🇪🇸 Spanish (Spain)                │
│  🇫🇷 French (France)                │
│  🇬🇧 British English                │
│  🇺🇸 American English               │
└─────────────────────────────────────┘
```

**Implementation via System Prompt:**

```typescript
const ACCENT_PROMPTS = {
  'es-latam': `Speak Spanish with a clear Latin American accent,
               similar to Mexican or Colombian Spanish.
               Use "ustedes" instead of "vosotros".`,

  'es-spain': `Speak Spanish with a Castilian accent from Spain.
               Use "vosotros" and the ceceo/distinción.`,

  'fr-france': `Speak French with a Parisian accent.
                Use formal French pronunciation.`,

  'en-british': `Speak English with a British RP accent.
                 Use British vocabulary and expressions.`,

  'en-american': `Speak English with a General American accent.
                  Use American vocabulary and expressions.`,
};
```

### 5. Voice Selection (8 voices)

```typescript
const GEMINI_VOICES = [
  { id: 'Kore', name: 'Kore', gender: 'female', style: 'warm' },
  { id: 'Aoede', name: 'Aoede', gender: 'female', style: 'professional' },
  { id: 'Leda', name: 'Leda', gender: 'female', style: 'friendly' },
  { id: 'Puck', name: 'Puck', gender: 'male', style: 'casual' },
  { id: 'Charon', name: 'Charon', gender: 'male', style: 'deep' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'male', style: 'energetic' },
  { id: 'Orus', name: 'Orus', gender: 'male', style: 'calm' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'neutral', style: 'light' },
] as const;
```

## Implementation Priority

### Phase 1: Core UX (This Session)
1. ✅ Gemini Live working
2. [ ] Update to show real-time transcription
3. [ ] Add Call UI layout
4. [ ] Add accent selection

### Phase 2: Feedback System
1. [ ] Post-call feedback page
2. [ ] Points integration
3. [ ] Save conversation history

### Phase 3: Polish
1. [ ] Animations and transitions
2. [ ] Audio replay feature
3. [ ] Share/export conversations

## Technical Notes

### Transcription Sources
1. **User speech**: Gemini returns `inputTranscript` in `serverContent`
2. **AI response**: Gemini returns `text` in `modelTurn.parts[]`

Both are already captured in `GeminiLiveClient` but need to be surfaced to UI.

### Accent via System Prompt
The system prompt approach works because:
- Gemini's voice models can adapt accent/style based on instructions
- Same prebuilt voice (e.g., Kore) can sound different with accent prompts
- Tested and confirmed in November 2025 Gemini update

### Latency Considerations
Current latency is high because:
1. Record full audio → Send → Wait for full response → Play
2. No streaming playback yet

Future optimization:
1. Stream audio chunks as they arrive (AudioPlayer already supports this)
2. Consider reducing recording quality for faster upload
3. Use WebSocket keep-alive to reduce connection overhead
