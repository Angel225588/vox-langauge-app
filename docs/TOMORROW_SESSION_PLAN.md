# Tomorrow's Session Plan - November 29, 2025

**Last Updated:** November 29, 2025, 02:30
**Status:** Ready for Anki Template System & Speaking Card Enhancements
**Primary Focus:** 🎯 **ANKI-STYLE CARD TEMPLATE SYSTEM + SPEAKING CARD AUTO-CORRECTION**

---

## 🎉 MAJOR ACCOMPLISHMENTS (Nov 27-28)

### ✅ Card Architecture Refactoring - COMPLETE!
All 13 cards successfully extracted into separate files:
- **Working polished cards (7)**: SingleVocabCard, MultipleChoiceCard, ImageQuizCard, AudioCard, TextInputCard, SpeakingCard, ComparisonCard
- **Gemini-generated cards (6)**: FillInBlankCard, SentenceScrambleCard, DescribeImageCard, StorytellingCard, QuestionGameCard, RolePlayCard

**Result**: `components/cards/index.tsx` reduced from 28KB (947 lines) to ~40 lines of barrel exports! 🎉

### ✅ Wrong Answer Feedback System - IMPLEMENTED!
Applied polished error feedback to all quiz cards:
- **Blur overlay** with semi-transparent dark background (`rgba(0, 0, 0, 0.4)`)
- **Red theme** for explanation card (`#2D1B1E`) and Continue button
- **Unified card container** (no blue gaps)
- **Strong haptic feedback** (double vibration: Error + Heavy impact)
- **Larger readable text** (`fontSize.lg`, `lineHeight: 26`)
- **Cards updated**: ImageQuizCard, AudioCard, TextInputCard, FillInBlankCard, MultipleChoiceCard

**Pattern**:
```typescript
// Blur overlay
{showWrongAnswer && (
  <Animated.View
    entering={FadeIn.duration(300)}
    style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    }}
    pointerEvents="none"
  />
)}

// Unified explanation card
<View style={{
  marginHorizontal: spacing.lg,
  backgroundColor: '#2D1B1E',
  borderRadius: borderRadius.xl,
  borderLeftWidth: 4,
  borderLeftColor: colors.error.DEFAULT,
}}>
  {/* Explanation text */}
  {/* Continue button */}
</View>
```

---

## 🔥 PRIORITY #1: Anki-Style Card Template System (Est. 3-4 hours)

### Why This Matters
Currently, we create **individual card data** for each card type. With Anki's approach, we can:
- **Single data model** generates multiple card types
- **Automatic card sequencing** from base vocabulary/lesson data
- **Reduced content creation effort** - one dataset powers entire lesson flow
- **Better spaced repetition** - same content tested in different formats

### The Anki Philosophy

In Anki, a **note** contains field data (front, back, audio, image). **Card templates** define how that data is displayed.

**Example**:
```typescript
// Single note (data)
const vocabularyNote = {
  word: "manzana",
  translation: "apple",
  phonetic: "/manˈθana/",
  image_url: "https://...",
  audio_url: "https://...",
  example_sentence: "Me gusta la manzana roja",
  category: "food"
};

// Multiple card templates generated from same note
const cardTemplates = [
  'single-vocab',        // Display: word + image + audio
  'multiple-choice',     // Question: "What is 'manzana'?" Options: [apple, orange, banana, grape]
  'image-quiz',          // Show image, select correct word
  'audio-card',          // Play audio, select matching word
  'text-input',          // "Type the Spanish word for 'apple'"
  'speaking',            // "Say the word: manzana"
];
```

### Implementation Plan

#### Step 1: Create Data Model (`/lib/anki/note-types.ts`)
Define base note types with all possible fields:

```typescript
// Base note type - vocabulary
export interface VocabularyNote {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  image_url?: string;
  audio_url?: string;
  example_sentence?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Grammar note type
export interface GrammarNote {
  id: string;
  rule: string;
  explanation: string;
  examples: string[];
  fill_in_blank_template: string;  // e.g., "I [BLANK] to school yesterday"
  correct_answer: string;
  incorrect_options: string[];
}

// Conversation note type
export interface ConversationNote {
  id: string;
  scenario: string;
  role_play_script: Array<{
    speaker: 'ai' | 'user';
    message?: string;
    options?: string[];
  }>;
  secret_word?: string;  // For question game
}
```

#### Step 2: Create Template Generator (`/lib/anki/card-generator.ts`)
Map notes to card props:

```typescript
import {
  SingleVocabCard,
  MultipleChoiceCard,
  ImageQuizCard,
  AudioCard,
  TextInputCard,
  SpeakingCard,
} from '@/components/cards';

export type CardTemplate =
  | 'single-vocab'
  | 'multiple-choice'
  | 'image-quiz'
  | 'audio-card'
  | 'text-input'
  | 'speaking';

export function generateCardsFromNote(
  note: VocabularyNote,
  templates: CardTemplate[]
): CardData[] {
  const cards: CardData[] = [];

  templates.forEach((template) => {
    switch (template) {
      case 'single-vocab':
        cards.push({
          type: 'single-vocab',
          props: {
            word: note.word,
            translation: note.translation,
            phonetic: note.phonetic,
            image_url: note.image_url,
            audio_url: note.audio_url,
            example_sentence: note.example_sentence,
          },
        });
        break;

      case 'multiple-choice':
        cards.push({
          type: 'multiple-choice',
          props: {
            word: note.word,
            translation: note.translation,
            image_url: note.image_url,
            options: generateDistractors(note.word, note.category, 3), // AI-generated or database lookup
            correct_answer: 0, // First option is always correct (shuffle later)
            explanation: `"${note.word}" means "${note.translation}"`,
          },
        });
        break;

      case 'image-quiz':
        if (note.image_url) {
          cards.push({
            type: 'image-quiz',
            props: {
              word: note.word,
              image_url: note.image_url,
              options: generateDistractors(note.word, note.category, 3),
              correct_answer: 0,
              explanation: `This is a picture of ${note.translation}`,
            },
          });
        }
        break;

      // ... other templates
    }
  });

  return cards;
}
```

#### Step 3: Lesson Composer Integration
Update lesson composition to use templates:

```typescript
// /lib/lesson/lesson-composer.ts
import { generateCardsFromNote } from '@/lib/anki/card-generator';

export function composeLessonFromNotes(
  notes: VocabularyNote[],
  config: {
    cardsPerNote: CardTemplate[];
    sequencePattern: 'linear' | 'spaced' | 'random';
  }
): CardData[] {
  const allCards: CardData[] = [];

  notes.forEach((note) => {
    const cards = generateCardsFromNote(note, config.cardsPerNote);
    allCards.push(...cards);
  });

  // Sequence cards based on pattern
  if (config.sequencePattern === 'spaced') {
    // Interleave cards: vocab1-singleVocab, vocab2-singleVocab, vocab1-multipleChoice, ...
    return interleaveCards(allCards);
  } else if (config.sequencePattern === 'linear') {
    // All cards for vocab1, then all cards for vocab2, etc.
    return allCards;
  } else {
    // Shuffle
    return shuffleCards(allCards);
  }
}
```

#### Step 4: Distractor Generation (AI-Powered)
Use Gemini to generate realistic wrong answer options:

```typescript
// /lib/anki/distractor-generator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateDistractors(
  word: string,
  category: string,
  count: number
): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate ${count} plausible but incorrect translations for the Spanish word "${word}" in the category "${category}".

  Return ONLY a JSON array of strings, like: ["option1", "option2", "option3"]

  Make sure the distractors are realistic enough to be challenging but not impossible to distinguish.`;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  return JSON.parse(response); // ["orange", "banana", "grape"]
}
```

### Benefits After Implementation
✅ **Single data source** (vocabulary list) generates 6+ card types
✅ **Dynamic difficulty** - same word tested in multiple ways
✅ **Faster content creation** - add 1 word, get 6 cards
✅ **Better spaced repetition** - more variety in testing
✅ **AI-powered distractors** - realistic wrong options
✅ **Flexible sequencing** - interleave, linear, or random

---

## 🔥 PRIORITY #2: Speaking Card Auto-Correction (Est. 2-3 hours)

### Current Status
SpeakingCard allows users to record audio but provides **no feedback** on pronunciation accuracy.

### Goal: Duolingo-Style Speech Recognition
Implement **speech-to-text auto-correction** like Duolingo:
1. User sees prompt: "Say: manzana"
2. User taps microphone and speaks
3. App transcribes audio using **Speech-to-Text**
4. App compares transcription to expected text
5. Feedback:
   - ✅ **Green checkmark** if correct
   - ❌ **Red X** with "You said: [transcription]" if incorrect
   - 🟡 **Partial credit** for close matches (Levenshtein distance)

### Implementation Plan

#### Step 1: Choose Speech-to-Text Provider

**Options**:
1. **Google Cloud Speech-to-Text** ✅ RECOMMENDED
   - Pros: 60+ languages, high accuracy, mobile-optimized
   - Pricing: $0.006 per 15 seconds (~$0.024/user/month)
   - Integration: REST API or gRPC
   - Streaming support for real-time feedback

2. **Expo Speech Recognition** (expo-speech-recognition)
   - Pros: Native iOS/Android, no API costs
   - Cons: iOS 13+/Android 8+ only, less accurate

3. **OpenAI Whisper API**
   - Pros: Multilingual, very accurate
   - Pricing: $0.006 per minute (~$0.10/user/month)

**Recommendation**: Start with **expo-speech-recognition** for MVP (free), upgrade to **Google Cloud Speech-to-Text** later for better accuracy.

#### Step 2: Install & Configure

```bash
# Install expo-speech-recognition (if using native)
npx expo install expo-speech-recognition

# OR use Google Cloud Speech-to-Text
npm install @google-cloud/speech
```

#### Step 3: Update SpeakingCard with Transcription

```typescript
// components/cards/SpeakingCard.tsx
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useState } from 'react';

export function SpeakingCard({ word, phonetic, onNext }: SpeakingCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleRecord = async () => {
    setIsRecording(true);

    // Start recording
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    // Stop after 3 seconds
    setTimeout(async () => {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Transcribe audio
      const transcribedText = await transcribeAudio(uri);
      setTranscription(transcribedText);

      // Compare to expected word
      const similarity = calculateSimilarity(transcribedText, word);
      setIsCorrect(similarity > 0.8); // 80% match threshold

      setIsRecording(false);
    }, 3000);
  };

  const transcribeAudio = async (audioUri: string): Promise<string> => {
    // TODO: Implement with Google Speech-to-Text or expo-speech-recognition
    // For now, placeholder
    return "manzana"; // Mock response
  };

  const calculateSimilarity = (text1: string, text2: string): number => {
    // Levenshtein distance (simple implementation)
    const a = text1.toLowerCase().trim();
    const b = text2.toLowerCase().trim();

    if (a === b) return 1.0;

    // Calculate edit distance
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);

    return 1 - distance / maxLength;
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 48, fontWeight: 'bold' }}>{word}</Text>
      {phonetic && <Text style={{ fontSize: 20, color: '#888' }}>{phonetic}</Text>}

      <TouchableOpacity onPress={handleRecord} disabled={isRecording}>
        <Text>{isRecording ? '🎙️ Recording...' : '🎤 Tap to Speak'}</Text>
      </TouchableOpacity>

      {transcription && (
        <View style={{ marginTop: 20 }}>
          {isCorrect ? (
            <Text style={{ color: 'green', fontSize: 24 }}>✓ Correct!</Text>
          ) : (
            <>
              <Text style={{ color: 'red', fontSize: 24 }}>✗ Try again</Text>
              <Text style={{ color: '#888' }}>You said: "{transcription}"</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}
```

#### Step 4: Implement Levenshtein Distance

```typescript
// /lib/utils/string-similarity.ts
export function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
```

#### Step 5: Google Speech-to-Text Integration (Production)

```typescript
// /lib/speech/google-stt.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function transcribeAudioWithGoogle(
  audioUri: string,
  language: string = 'es-ES'
): Promise<string> {
  // Read audio file as base64
  const audioData = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Call Google Cloud Speech-to-Text API
  const response = await fetch(
    'https://speech.googleapis.com/v1/speech:recognize',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`, // Use Firebase Functions proxy for security
      },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 44100,
          languageCode: language,
        },
        audio: {
          content: audioData,
        },
      }),
    }
  );

  const result = await response.json();
  return result.results[0]?.alternatives[0]?.transcript || '';
}
```

### Expected UX Flow

1. **User sees**: "Say: manzana" (large text, phonetic below)
2. **User taps**: 🎤 microphone button
3. **UI shows**: "🎙️ Recording..." with animated waveform
4. **Recording stops**: After 3 seconds (or manual stop)
5. **Transcription**: "Analyzing..." (loading spinner)
6. **Feedback**:
   - ✅ **Correct**: Green background, "Perfect! ✓", +20 XP, auto-advance
   - ❌ **Incorrect**: Red background, "Try again ✗", "You said: [X]", Try Again button
   - 🟡 **Close**: Yellow background, "Almost! 🟡", "You said: [X]", +10 XP, Continue button

---

## 📋 Yesterday's Accomplishments (Nov 28)

### ✅ Card Refactoring Complete
1. All 13 cards extracted into separate files
2. index.tsx reduced to 40 lines of exports
3. All imports updated and working

### ✅ Wrong Answer Feedback System
1. Applied blur overlay to all quiz cards
2. Red theme for incorrect answers
3. Unified card design (no gaps)
4. Strong haptic feedback pattern
5. Larger, more readable text

### ✅ Card Fixes by Gemini
1. SentenceScrambleCard: Drag-and-drop fully implemented
2. DescribeImageCard: Audio recording + evaluation
3. QuestionGameCard: Rule-based AI (no Math.random())
4. RolePlayCard: Scripted conversations
5. StorytellingCard: Improved scoring logic

### ✅ Documentation Updated
1. GEMINI_TASKS.md: All 6 cards marked complete
2. Tomorrow's plan updated with new priorities

---

## 🎯 Tomorrow's Success Criteria

### Must Complete (Anki System):
- [ ] Define VocabularyNote, GrammarNote, ConversationNote types
- [ ] Implement generateCardsFromNote() function
- [ ] Create distractor generator with Gemini AI
- [ ] Test: 1 vocabulary note → 6 different cards
- [ ] Update lesson composer to use template system
- [ ] Git commit: "feat: Implement Anki-style card template system"

### Must Complete (Speaking Card):
- [ ] Install expo-speech-recognition or set up Google STT
- [ ] Implement audio transcription in SpeakingCard
- [ ] Add Levenshtein distance similarity calculation
- [ ] Show feedback: ✓ Correct / ✗ Try again / 🟡 Almost
- [ ] Test with 5 different Spanish words
- [ ] Git commit: "feat: Add speech-to-text auto-correction to SpeakingCard"

### Nice to Have:
- [ ] Add waveform animation during recording
- [ ] Implement "slow playback" of user's recording
- [ ] Add pronunciation score (0-100%)
- [ ] Cache transcriptions for offline replay

---

## 📝 Notes for Tomorrow

### Remember These Key Points:
1. **Anki Philosophy**: One note (data) → Many card templates (views)
2. **AI-Generated Distractors**: Use Gemini to create realistic wrong options
3. **Speech Recognition**: Start with expo-speech-recognition (free), upgrade to Google STT later
4. **Levenshtein Distance**: Industry-standard for text similarity (Duolingo uses it)
5. **Feedback UX**: Green/Red/Yellow color coding, auto-advance for correct

### Files to Create:
- `/lib/anki/note-types.ts` - Data models
- `/lib/anki/card-generator.ts` - Template generator
- `/lib/anki/distractor-generator.ts` - AI-powered wrong options
- `/lib/utils/string-similarity.ts` - Levenshtein distance
- `/lib/speech/google-stt.ts` - Speech-to-text integration

### Files to Update:
- `components/cards/SpeakingCard.tsx` - Add transcription & feedback
- `/lib/lesson/lesson-composer.ts` - Use template system
- `/app/test-cards.tsx` - Add Anki-generated cards

---

## 🚀 Week Plan Overview

### Friday (Nov 29) - ANKI SYSTEM + SPEAKING ENHANCEMENTS
- Morning: Implement Anki card template system
- Afternoon: Add speech-to-text to Speaking card
- Evening: Test complete flow with AI-generated lessons

### Weekend
- Integrate Anki system with Gemini lesson composer
- Build 3-5 complete lessons using templates
- Polish speaking card feedback UX

### Next Week
- Full lesson flow testing
- Community features (share recordings)
- Leaderboard integration

---

**Last Updated:** November 29, 2025, 02:30
**Next Session:** November 29, 2025
**Prepared by:** Claude
**Status:** Ready for Anki System & Speaking Card 🚀
