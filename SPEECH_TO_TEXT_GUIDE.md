# Speech-to-Text Implementation Guide

This guide explains how to implement real speech-to-text for the StorytellingCard microphone feature.

---

## Current Status

✅ **Working:**
- Microphone button in text input
- Audio recording with duration tracking
- Visual feedback (red button, timer)
- Contextual sample text generation

⏳ **Not Implemented:**
- Real speech-to-text transcription
- Audio file is recorded but not transcribed

---

## Option 1: expo-speech-recognition (RECOMMENDED)

**Best for:** Expo managed workflow, quick implementation

### Installation

```bash
npx expo install expo-speech-recognition
```

### Implementation

```typescript
import * as SpeechRecognition from 'expo-speech-recognition';

// Check if available
const { available } = await SpeechRecognition.getAvailableVoiceRecognitionServices();

// Start listening
const result = await SpeechRecognition.start({
  lang: 'en-US',
  interimResults: true,
  maxAlternatives: 1,
});

// Handle result
result.addEventListener('result', (event) => {
  const transcript = event.results[0][0].transcript;
  setStory(prev => prev ? `${prev} ${transcript}` : transcript);
});

// Stop listening
await SpeechRecognition.stop();
```

### Pros:
- ✅ Native device speech recognition
- ✅ No API costs
- ✅ Works offline
- ✅ Fast and responsive

### Cons:
- ❌ Requires native permissions
- ❌ Device-dependent quality
- ❌ May not work on all devices

---

## Option 2: Google Cloud Speech-to-Text API

**Best for:** Production apps, high accuracy needed

### Setup

1. Create Google Cloud project
2. Enable Speech-to-Text API
3. Get API key
4. Add to `.env`:
   ```
   GOOGLE_CLOUD_API_KEY=your_api_key_here
   ```

### Installation

```bash
npm install @google-cloud/speech
```

### Implementation

```typescript
const transcribeAudio = async (audioUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  });

  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 44100,
          languageCode: 'en-US',
        },
        audio: {
          content: base64Audio,
        },
      }),
    }
  );

  const data = await response.json();
  const transcript = data.results[0]?.alternatives[0]?.transcript || '';
  return transcript;
};
```

### Pros:
- ✅ Very high accuracy
- ✅ Supports 125+ languages
- ✅ Works consistently across devices
- ✅ Advanced features (punctuation, profanity filter)

### Cons:
- ❌ Requires API key
- ❌ Costs money (first 60 minutes free/month)
- ❌ Requires internet connection

**Pricing:** $0.006 per 15 seconds after free tier

---

## Option 3: OpenAI Whisper API

**Best for:** Best accuracy, already using OpenAI

### Setup

Add to `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

### Installation

```bash
npm install openai
```

### Implementation

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (audioUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  });
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.text;
};
```

### Pros:
- ✅ Best-in-class accuracy
- ✅ Supports 90+ languages
- ✅ Handles accents/noise well
- ✅ Simple API

### Cons:
- ❌ Costs money
- ❌ Requires internet
- ❌ Slower than native

**Pricing:** $0.006 per minute

---

## Recommended Implementation Steps

### Step 1: Update StorytellingCard.tsx

Replace the `stopRecording` function:

```typescript
const stopRecording = async () => {
  if (recordingInterval.current) clearInterval(recordingInterval.current);
  if (!recording) return;

  setIsRecording(false);
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  setRecording(null);

  // Show loading state
  Alert.alert('Transcribing...', 'Converting speech to text...');

  try {
    // Choose your implementation:
    // const transcript = await transcribeWithExpoSpeechRecognition(uri);
    // const transcript = await transcribeWithGoogleCloud(uri);
    const transcript = await transcribeWithWhisper(uri);

    // Add transcribed text to story
    setStory(prev => prev ? `${prev} ${transcript}` : transcript);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.error('Transcription error:', error);
    Alert.alert('Error', 'Could not transcribe audio. Please type instead.');
  }
};
```

### Step 2: Create Transcription Service

Create `lib/services/speechToText.ts`:

```typescript
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  // Your chosen implementation here
  // Return the transcribed text
};
```

### Step 3: Test

1. Record a story
2. Check transcription appears in text input
3. Verify word count updates
4. Test submit flow

---

## Quick Start (Recommended)

**For immediate testing:** Use **expo-speech-recognition**

```bash
# 1. Install
npx expo install expo-speech-recognition

# 2. Update StorytellingCard.tsx
import * as SpeechRecognition from 'expo-speech-recognition';

# 3. Replace recording logic with live transcription
const startRecording = async () => {
  const { available } = await SpeechRecognition.getAvailableVoiceRecognitionServices();
  if (!available) {
    Alert.alert('Not Available', 'Speech recognition is not available on this device.');
    return;
  }

  await SpeechRecognition.requestPermissionsAsync();

  const result = await SpeechRecognition.start({
    lang: 'en-US',
    interimResults: true,
  });

  result.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    setStory(transcript);
  });
};

const stopRecording = async () => {
  await SpeechRecognition.stop();
};
```

---

## Next Steps

1. Choose implementation (expo-speech-recognition recommended)
2. Install dependencies
3. Update StorytellingCard.tsx
4. Test microphone → transcription → story submission flow
5. Add error handling
6. Polish UX (loading states, error messages)

---

## Notes

- The current implementation saves audio but doesn't transcribe
- Sample text is generated based on image labels
- Real transcription requires one of the options above
- Consider user's device capabilities when choosing

**File to modify:** `components/cards/StorytellingCard.tsx` (lines 87-124)
