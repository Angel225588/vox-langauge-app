# Vox Language App - Card System Documentation

**Date:** November 22, 2025
**Status:** ✅ All 8 cards tested and approved
**Design System:** Immersive gradients with depth and glow effects

---

## Overview

This document describes the complete card component system for Vox Language App. All cards have been tested and approved for production use.

---

## Design System

### Color Palette
- **Background:** Deep space blue-black (#0A0E1A)
- **Primary Gradient:** Indigo → Purple (#6366F1 → #8B5CF6)
- **Secondary Gradient:** Teal → Turquoise (#06D6A0 → #4ECDC4)
- **Success Gradient:** Green (#10B981 → #34D399)
- **Error Gradient:** Red (#EF4444 → #F87171)

### Key Features
- ✅ Gradient backgrounds with smooth transitions
- ✅ Glow effects for depth (subtle shadows)
- ✅ Subtle haptic feedback (not overwhelming)
- ✅ Smooth animations with spring physics
- ✅ Consistent spacing and typography
- ✅ Audio on every card (normal + slow speed)

---

## Card Components (All 8 Approved)

### 1. AudioControls
**File:** `/components/cards/AudioControls.tsx`

**Purpose:** Reusable audio playback with two speed options

**Features:**
- Normal speed button (1.0x)
- Slow speed button (0.7x)
- Visual loading state
- Haptic feedback on tap
- Horizontal/vertical layouts
- Size variants: small, medium, large

**Usage:**
```tsx
<AudioControls
  text="hello"
  language="en-US"
  variant="horizontal"
  size="medium"
/>
```

**Future:** Will be upgraded to Google Cloud TTS (currently using expo-speech)

---

### 2. SingleVocabCard
**File:** `/components/cards/SingleVocabCard.tsx`

**Purpose:** Display vocabulary word with image and audio

**Features:**
- Large image (70% of screen width)
- Word in target language
- Phonetic pronunciation (IPA format)
- Optional translation
- Audio controls (normal + slow)
- Tag label support

**Use Cases:**
- ✅ Vocabulary learning (words)
- ✅ Vocabulary learning (phrases)
- ✅ Vocabulary learning (sentences)

**Usage:**
```tsx
<SingleVocabCard
  word="apple"
  phonetic="/ˈæp.əl/"
  translation="manzana"
  imageUrl="https://..."
  language="en-US"
  showTranslation={false}
  tag="Food"
/>
```

**Notes:**
- Works for words, phrases, AND sentences
- Image shows context
- Same component for all vocabulary types

---

### 3. ComparisonCard
**File:** `/components/cards/ComparisonCard.tsx`

**Purpose:** Compare two related words/concepts

**Features:**
- **Stacked vertically** (mobile-optimized)
- Separate audio controls for each item
- Visual separator with swap icon
- Custom tag colors for each item
- Phonetic support for both items

**Use Cases:**
- ✅ **Past vs Present tense** (watch → watched)
- ✅ **Homophones** (see → sea, to → two → too)
- ✅ **Similar words** (affect → effect)
- ✅ **Synonyms** (big → large)
- ✅ **Antonyms** (hot → cold)
- ✅ **Confusing pairs** (then → than)

**Usage:**
```tsx
// Past vs Present
<ComparisonCard
  title="Past vs Present Tense"
  items={[
    { label: 'PRESENT', word: 'watch', phonetic: '/wɒtʃ/' },
    { label: 'PAST', word: 'watched', phonetic: '/wɒtʃt/' }
  ]}
  language="en-US"
/>

// Homophones
<ComparisonCard
  title="Homophones - Sound Alike"
  items={[
    { label: 'SEE', word: 'see', phonetic: '/siː/', tagColor: ['#8B5CF6', '#6366F1'] },
    { label: 'SEA', word: 'sea', phonetic: '/siː/', tagColor: ['#06D6A0', '#4ECDC4'] }
  ]}
  language="en-US"
/>
```

**Important Notes:**
- **Homophones are critical in language learning** (especially English!)
- English has MANY homophones: see/sea, to/two/too, their/there/they're, etc.
- Spanish has homophones too: hola/ola, valla/vaya/baya
- French: ver/vert/verre, mère/maire/mer
- This card type handles ALL comparison scenarios

---

### 4. ImageMultipleChoiceCard
**File:** `/components/cards/ImageMultipleChoiceCard.tsx`

**Purpose:** Show image, user selects correct word

**Features:**
- Large image display
- 4 answer options (buttons)
- Instant feedback with animations
- Success: Green glow + scale up + success vibration
- Error: Red shake + error vibration + shows correct answer
- One-time answer (can't change after selection)

**Use Cases:**
- ✅ Vocabulary recognition (words)
- ✅ Phrase recognition (with context image)
- ✅ Sentence completion (with scenario image)

**Usage:**
```tsx
<ImageMultipleChoiceCard
  question="What is this?"
  imageUrl="https://..."
  options={['coffee', 'tea', 'water', 'juice']}
  correctAnswer="coffee"
  onAnswer={(isCorrect) => console.log(isCorrect)}
/>
```

**Notes:**
- Works for words, phrases, and sentences
- Image provides context
- 4 options keeps it challenging but not overwhelming

---

### 5. AudioToImageCard
**File:** `/components/cards/AudioToImageCard.tsx`

**Purpose:** Hear audio, select matching image

**Features:**
- Large audio play button with gradient
- Grid of 4 image options (2x2)
- Plays audio with TTS
- Instant feedback on selection
- Highlights correct image if user is wrong
- Visual overlay on selection (green/red)

**Use Cases:**
- ✅ Listening comprehension (words)
- ✅ Listening comprehension (phrases)
- ✅ Listening comprehension (sentences)

**Usage:**
```tsx
<AudioToImageCard
  question="Select the image that matches the word"
  audioText="dog"
  language="en-US"
  images={[
    { id: '1', url: 'https://...', label: 'dog' },
    { id: '2', url: 'https://...', label: 'cat' },
    { id: '3', url: 'https://...', label: 'house' },
    { id: '4', url: 'https://...', label: 'car' }
  ]}
  correctImageId="1"
  onAnswer={(isCorrect) => console.log(isCorrect)}
/>
```

**Notes:**
- Critical for listening practice
- Works for words, phrases, and full sentences
- Audio can say "The dog is running" and images show different scenarios

---

### 6. TextInputCard
**File:** `/components/cards/TextInputCard.tsx`

**Purpose:** Type answer with instant correction

**Features:**
- Optional image prompt
- Text input with gradient background
- "Check Answer" button (disabled until text entered)
- Instant feedback:
  - ✅ Correct: Green glow + success vibration
  - ❌ Wrong: Shake animation + error vibration + shows correct answer
- "Try Again" option after wrong answer
- Accepts multiple correct answers
- Case-insensitive option

**Use Cases:**
- ✅ Spelling practice (words)
- ✅ Translation practice (words → phrases → sentences)
- ✅ Grammar practice (fill in the blank)
- ✅ Writing practice (full sentences)

**Usage:**
```tsx
<TextInputCard
  question="Translate to English:"
  prompt="Spanish: libro"
  imageUrl="https://..."
  correctAnswer="book"
  acceptedAnswers={['books', 'a book', 'the book']}
  caseSensitive={false}
  onAnswer={(isCorrect, answer) => console.log(isCorrect, answer)}
/>
```

**Notes:**
- Flexible for all text-based learning
- Can handle single words or full sentences
- `acceptedAnswers` array allows multiple valid responses

---

### 7. SpeakingCard
**File:** `/components/cards/SpeakingCard.tsx`

**Purpose:** Record and practice pronunciation

**Features:**
- Shows target word/phrase/sentence with phonetic
- "Listen" button to hear model pronunciation (TTS)
- Large record button (140x140) with:
  - Pulsing animation while recording
  - Glowing effect (purple/indigo gradient)
  - Red gradient when recording
- Playback button to hear your recording
- Saves audio URI for analysis

**Use Cases:**
- ✅ Pronunciation practice (words)
- ✅ Pronunciation practice (phrases)
- ✅ Pronunciation practice (sentences)
- ✅ Conversation practice (full dialogues)

**Usage:**
```tsx
<SpeakingCard
  question="Say this word out loud:"
  targetWord="flower"
  phonetic="/ˈflaʊ.ər/"
  imageUrl="https://..."
  language="en-US"
  onRecordingComplete={(uri) => console.log('Recording:', uri)}
/>
```

**Future Enhancement - AI Feedback:**
Will be added in Phase 5 (after v1):
- Send recording to Gemini API for pronunciation analysis
- Get feedback: "Your pronunciation of 'flower' was good! Try emphasizing the 'flow' sound more."
- Score accuracy (1-5 stars)
- Identify specific phonemes that need work
- Update user's focus areas in staircase

**Notes:**
- Works for any length: word → phrase → sentence → paragraph
- Recording saved for future AI analysis
- **No instant AI feedback yet** (will be added post-v1)

---

### 8. BaseCard
**File:** `/components/cards/BaseCard.tsx`

**Purpose:** Foundation component for custom cards

**Features:**
- Gradient or solid backgrounds
- Optional glow effects
- Tag labels (positioned at top)
- Size variants: small, medium, large
- Variant styles: default, primary, secondary, dark
- Animated scale effects

**Usage:**
```tsx
<BaseCard
  variant="primary"
  size="large"
  withGlow
  tag="VOCABULARY"
>
  {/* Your custom content */}
</BaseCard>
```

**Notes:**
- Use this to build custom card types
- Maintains consistent design system

---

## Card Usage by Learning Type

### Vocabulary (Words)
- ✅ SingleVocabCard - Learn new word with image
- ✅ ComparisonCard - Compare similar words or homophones
- ✅ ImageMultipleChoiceCard - Select correct word
- ✅ AudioToImageCard - Listen and identify
- ✅ TextInputCard - Spell the word
- ✅ SpeakingCard - Pronounce the word

### Phrases
- ✅ SingleVocabCard - Learn phrase with context image
- ✅ ComparisonCard - Compare similar phrases (formal vs informal)
- ✅ ImageMultipleChoiceCard - Select phrase that matches image
- ✅ AudioToImageCard - Listen to phrase, select scenario
- ✅ TextInputCard - Translate or complete the phrase
- ✅ SpeakingCard - Practice saying the phrase

### Sentences
- ✅ SingleVocabCard - Learn sentence with scenario image
- ✅ ComparisonCard - Compare sentence structures (past vs present)
- ✅ ImageMultipleChoiceCard - Select sentence describing image
- ✅ AudioToImageCard - Listen to sentence, select scenario
- ✅ TextInputCard - Write the full sentence
- ✅ SpeakingCard - Practice saying the sentence

**Conclusion:** ALL 8 cards work for words, phrases, AND sentences! 🎉

---

## Homophones Documentation

### Why Homophones Are Critical

Homophones are words that **sound the same but have different meanings and spellings**. They are extremely common in many languages and cause confusion for learners.

### English Homophones (Examples)

**Common confusions:**
- see / sea
- to / two / too
- their / there / they're
- hear / here
- right / write
- no / know
- son / sun
- meet / meat
- peace / piece
- knight / night

**How ComparisonCard Helps:**
```tsx
<ComparisonCard
  title="Homophones - Different Meanings, Same Sound"
  items={[
    {
      label: 'SEE',
      word: 'see (verb)',
      phonetic: '/siː/',
      tagColor: ['#8B5CF6', '#6366F1']
    },
    {
      label: 'SEA',
      word: 'sea (noun)',
      phonetic: '/siː/',
      tagColor: ['#06D6A0', '#4ECDC4']
    }
  ]}
  language="en-US"
/>
```

### Spanish Homophones

- hola (hello) / ola (wave)
- valla (fence) / vaya (go) / baya (berry)
- has (you have) / as (ace)
- hecho (fact) / echo (I throw)

### French Homophones

- ver (worm) / vert (green) / verre (glass)
- mère (mother) / maire (mayor) / mer (sea)
- pain (bread) / pin (pine)

### Portuguese Homophones

- coser (to sew) / cozer (to cook)
- conserto (repair) / concerto (concert)

**ComparisonCard handles ALL of these!** 🎯

---

## Image Strategy

### Current: Unsplash (Free)
- High-quality stock photos
- Free tier: 50 requests/hour
- Attribution required
- Already integrated in test cards

**Pros:**
- Free and beautiful
- Works great for common words
- Fast to implement

**Cons:**
- Generic (not personalized)
- May not have images for specific scenarios
- Limited to stock photography

### Future: AI-Generated Images (Post-v1)

**Option 1: Replicate + Stable Diffusion**
- Cost: ~$0.002 per image
- Generate custom images for user scenarios
- Example: "A person in a job interview shaking hands with interviewer"

**Option 2: DALL-E 3 via OpenAI**
- Cost: ~$0.04 per image (more expensive)
- Higher quality
- Better prompt following

**Recommendation:** Start with Unsplash for v1, add AI generation in v1.1 for personalized scenario images.

---

## Audio Strategy

### Current: Expo Speech (Temporary)
- Built-in TTS
- Works offline
- Free
- Multiple languages supported

**Pros:**
- Already working
- No API costs
- Instant

**Cons:**
- Robotic voice quality
- Limited voice options
- No speed fine-tuning

### Future: Google Cloud TTS (Phase 4)

**Features:**
- Natural-sounding voices
- Multiple accents (British, American, Australian English)
- Speed control (0.5x - 2.0x)
- Pitch control
- Free tier: 1M characters/month (~200k words)

**Cost After Free Tier:**
- Standard voices: $4 per 1M characters
- WaveNet voices (premium): $16 per 1M characters

**Implementation:**
```typescript
// lib/audio/google-tts.ts
import TextToSpeech from '@google-cloud/text-to-speech';

export async function getAudioUrl(text: string, speed: number = 1.0) {
  const client = new TextToSpeech.TextToSpeechClient();

  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-J',
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: speed, // 0.7 for slow, 1.0 for normal
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  const audioUrl = await uploadToStorage(response.audioContent);
  return audioUrl;
}
```

**Timeline:** Will be added in Week 2, Day 5 (Phase 4 of v1 plan)

---

## Git Commit Summary

### Files Added (8 card components)
1. `/components/cards/AudioControls.tsx`
2. `/components/cards/BaseCard.tsx`
3. `/components/cards/SingleVocabCard.tsx`
4. `/components/cards/ComparisonCard.tsx`
5. `/components/cards/ImageMultipleChoiceCard.tsx`
6. `/components/cards/AudioToImageCard.tsx`
7. `/components/cards/TextInputCard.tsx`
8. `/components/cards/SpeakingCard.tsx`
9. `/components/cards/index.ts` (exports)

### Files Added (Design System)
10. `/constants/designSystem.ts`

### Files Added (Test Screen)
11. `/app/test-cards.tsx`

### Files Modified
12. `/app/(tabs)/home.tsx` - Added "Test Cards" button

### Documentation Created
13. `/docs/CARD_SYSTEM_DOCUMENTATION.md`
14. `/CARD_SYSTEM_GUIDE.md`
15. `/CARD_FIXES.md`
16. `/PRACTICE_WITH_OTHERS_FEATURE.md`

---

## Next Steps

### ✅ Completed
- All 8 card components tested and approved
- Immersive design system implemented
- Audio controls working (normal + slow speed)
- Comparison cards support homophones and past/present
- All cards work for words, phrases, and sentences
- Images integrated (Unsplash)

### 🚀 Next Phase: Personalized Onboarding
Moving to **Phase 1** of v1 plan:
1. Build 4-question onboarding flow
2. Create database schema for user profiles
3. Integrate Gemini to generate personalized staircases
4. Build dynamic staircase home screen

**Ready to continue!** 🎉
