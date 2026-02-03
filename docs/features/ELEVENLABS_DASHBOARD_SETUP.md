# ElevenLabs Dashboard Setup Checklist

**Purpose**: Step-by-step guide to configure your ElevenLabs account and agent for Vox Language App.

---

## Quick Links

- [ElevenLabs Dashboard](https://elevenlabs.io/app)
- [Voice Library](https://elevenlabs.io/voice-library)
- [API Keys](https://elevenlabs.io/app/settings/api-keys)
- [Agents (Conversational AI)](https://elevenlabs.io/app/conversational-ai)

---

## Pre-Setup Checklist

- [ ] Create ElevenLabs account at https://elevenlabs.io
- [ ] Select a plan (Pro recommended: $82.50/mo)
- [ ] Verify email and complete account setup

---

## Step 1: Get API Key

1. Go to [Settings > API Keys](https://elevenlabs.io/app/settings/api-keys)
2. Click "Create API Key"
3. Name it "Vox Language App"
4. Copy the API key
5. Add to your `.env` file:

```bash
EXPO_PUBLIC_ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security Note**: Never commit your API key to git!

---

## Step 2: Create Conversational AI Agent

1. Go to [Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Configure the agent:

### Basic Settings

| Setting | Recommended Value |
|---------|-------------------|
| **Name** | Vox Language Tutor |
| **Description** | AI language tutor for conversation practice |

### LLM Configuration

| Setting | Value |
|---------|-------|
| **Model** | Gemini 2.0 Flash |
| **System Prompt** | See template below |

**System Prompt Template:**

```
You are a friendly, patient language tutor helping users practice speaking.

Your role:
- Speak naturally in the target language
- Keep responses concise (1-3 sentences based on user level)
- Gently correct errors when appropriate
- Be encouraging and supportive
- Stay in character for the scenario

Guidelines:
- Wait for the user to finish speaking
- Adapt difficulty to the user's level
- Never switch to English unless explicitly asked
- Praise effort and progress
```

### Voice Settings

| Setting | Value |
|---------|-------|
| **Default Voice** | Choose a clear, native-sounding voice |
| **Speed** | 0.9 (slightly slower for learning) |
| **Stability** | 0.7 |
| **Similarity** | 0.8 |

### Save Agent and Get ID

1. Save the agent
2. Copy the Agent ID from the URL or settings
3. Add to your `.env` file:

```bash
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxx
```

---

## Step 3: Enable Event Callbacks

**Important**: Without this, your app won't receive messages!

1. In your agent settings, go to "Advanced" tab
2. Enable these client events:
   - [x] `onConnect`
   - [x] `onDisconnect`
   - [x] `onMessage`
   - [x] `onError`
   - [x] `onStatusChange`

---

## Step 4: Select Native Voices

For the best language learning experience, select native speakers for each language.

### How to Find Voices

1. Go to [Voice Library](https://elevenlabs.io/voice-library)
2. Filter by:
   - Language (e.g., French, Spanish)
   - Use case: "Conversational"
   - Accent (e.g., France vs Quebec)

### Recommended Voice Selection

| Language | Accent | Voice Criteria |
|----------|--------|----------------|
| French | France | Native Parisian, clear pronunciation |
| French | Quebec | Native Québécois, friendly |
| Spanish | Mexico | Native Mexican, warm tone |
| Spanish | Spain | Native Castilian, clear |
| Portuguese | Brazil | Native Brazilian, expressive |
| Portuguese | Portugal | Native European, formal |
| English | US | Neutral American, clear |
| English | UK | British RP, polite |

### Save Voice IDs

For each voice you select:

1. Click on the voice
2. Copy the Voice ID
3. Update `lib/voice/elevenLabsConfig.ts`:

```typescript
{
  id: 'fr-FR-marie',
  name: 'Marie',
  language: 'fr',
  accent: 'fr-france',
  flag: '🇫🇷',
  elevenLabsVoiceId: 'PASTE_VOICE_ID_HERE', // <- Replace this
  // ...
}
```

---

## Step 5: Test Agent in Dashboard

Before integrating with the app:

1. Go to your agent's page
2. Click "Test Agent"
3. Have a brief conversation
4. Verify:
   - Voice sounds natural
   - Response speed is acceptable
   - Corrections are gentle, not intrusive

---

## Step 6: Configure Environment Variables

Create or update your `.env` file:

```bash
# ElevenLabs Configuration
EXPO_PUBLIC_ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxx
```

---

## Step 7: Build Development App

ElevenLabs requires native modules - Expo Go won't work!

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Or run on Android
npx expo run:android
```

---

## Verification Checklist

After setup, verify:

- [ ] API key is set in `.env`
- [ ] Agent ID is set in `.env`
- [ ] Event callbacks are enabled in agent settings
- [ ] At least one voice ID is configured per language
- [ ] Development build runs (not Expo Go)
- [ ] Test call connects successfully

---

## Troubleshooting

### "Agent not found" Error

- Verify `EXPO_PUBLIC_ELEVENLABS_AGENT_ID` is correct
- Check if agent is published (not draft)

### No Audio Output

- Check device volume
- Verify microphone permissions are granted
- Check if another app is using the microphone

### Connection Fails Immediately

- Check `EXPO_PUBLIC_ELEVENLABS_API_KEY` is valid
- Verify you have credits remaining
- Check internet connection

### Voice Sounds Robotic

- Try a different voice from the library
- Increase "Similarity" setting
- Use a voice marked as "Premium"

### High Latency (Slow Responses)

- Switch to Gemini 2.0 Flash (fastest)
- Reduce system prompt length
- Check internet connection speed

---

## Cost Monitoring

### Track Usage

1. Go to [Usage Dashboard](https://elevenlabs.io/app/usage)
2. Monitor credits used
3. Set up billing alerts

### Estimated Costs (Pro Plan)

| Usage | Credits | Sessions (5 min each) |
|-------|---------|----------------------|
| 500 min/mo | 1,000,000 | ~100 |
| Per session | ~10,000 | 1 |

---

## Voice ID Reference

After selecting voices, update this table for your reference:

| Voice Name | Language/Accent | ElevenLabs Voice ID |
|------------|-----------------|---------------------|
| Marie | French (France) | `___________________` |
| Sophie | French (Quebec) | `___________________` |
| Lucía | Spanish (Mexico) | `___________________` |
| Elena | Spanish (Spain) | `___________________` |
| Ana | Portuguese (Brazil) | `___________________` |
| Miguel | Portuguese (Portugal) | `___________________` |
| Sarah | English (US) | `___________________` |
| James | English (UK) | `___________________` |

---

## Next Steps

After completing this setup:

1. [ ] Test the integration in the app
2. [ ] Migrate VoiceCallScreen to use ElevenLabs
3. [ ] Update accent selector with ElevenLabs voices
4. [ ] Test all language/accent combinations
5. [ ] Monitor usage and costs

---

**Document Version**: 1.0
**Last Updated**: December 27, 2025
