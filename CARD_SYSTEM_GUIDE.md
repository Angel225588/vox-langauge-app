# Vox Language App - Card Component System

## Overview
All reusable card components have been designed and implemented with the new immersive design system featuring gradients, depth effects, and glow.

---

## Design System

### Colors
New immersive color palette located in `/constants/designSystem.ts`:
- **Background**: Deep space blue-black (#0A0E1A) with layered depth
- **Gradients**:
  - Primary: Indigo to Purple (#6366F1 → #8B5CF6)
  - Secondary: Teal to Turquoise (#06D6A0 → #4ECDC4)
  - Success: Green (#10B981 → #34D399)
  - Error: Red (#EF4444 → #F87171)
- **Glow Effects**: Soft shadows using gradient colors for depth

### Features
- Gradient backgrounds with smooth transitions
- Glow effects for depth and focus
- Subtle haptic feedback (not overwhelming)
- Smooth animations using Reanimated
- Consistent spacing and typography

---

## Card Components

### 1. **AudioControls** (`/components/cards/AudioControls.tsx`)
Reusable audio playback component with two speed options:
- **Normal speed** button (1.0x)
- **Slow speed** button (0.7x)
- Visual feedback during playback
- Haptic feedback on tap
- Supports horizontal/vertical layouts
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

---

### 2. **BaseCard** (`/components/cards/BaseCard.tsx`)
Foundation component for all cards with:
- Gradient or solid backgrounds
- Optional glow effects
- Tag labels (positioned at top)
- Size variants: small, medium, large
- Variant styles: default, primary, secondary, dark

**Usage:**
```tsx
<BaseCard
  variant="primary"
  size="large"
  withGlow
  tag="VOCABULARY"
>
  {/* Your content */}
</BaseCard>
```

---

### 3. **SingleVocabCard** (`/components/cards/SingleVocabCard.tsx`)
Display a single vocabulary word with:
- Large image
- Word in target language
- Phonetic pronunciation
- Optional translation
- Audio controls (normal + slow speed)
- Tag label support

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

---

### 4. **ComparisonCard** (`/components/cards/ComparisonCard.tsx`)
Compare two related words (past/present, synonyms, etc.):
- **Stacked vertically** for mobile (as you requested!)
- Separate audio controls for each word
- Visual separator with swap icon
- Custom tag colors for each item
- Phonetic support

**Usage:**
```tsx
<ComparisonCard
  title="Past vs Present"
  items={[
    { label: 'PRESENT', word: 'watch', phonetic: '/wɒtʃ/' },
    { label: 'PAST', word: 'watched', phonetic: '/wɒtʃt/' }
  ]}
  language="en-US"
/>
```

---

### 5. **ImageMultipleChoiceCard** (`/components/cards/ImageMultipleChoiceCard.tsx`)
Show an image, user selects the correct word:
- Large image display
- 4 answer options
- Instant feedback with animations
- Success: Green glow + scale up + success vibration
- Error: Red shake + error vibration
- Shows correct answer when wrong

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

---

### 6. **AudioToImageCard** (`/components/cards/AudioToImageCard.tsx`)
Hear audio, select the matching image:
- Large audio play button
- Grid of 4 image options (2x2)
- Plays audio with TTS
- Instant feedback on selection
- Highlights correct image if user is wrong

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

---

### 7. **TextInputCard** (`/components/cards/TextInputCard.tsx`)
Type the answer with instant correction:
- Optional image prompt
- Text input with gradient background
- "Check Answer" button
- Instant feedback:
  - Correct: Green glow + success vibration
  - Wrong: Shake animation + error vibration + shows correct answer
- "Try Again" option
- Accepts multiple correct answers
- Case-insensitive option

**Usage:**
```tsx
<TextInputCard
  question="Translate to English:"
  prompt="Spanish: libro"
  imageUrl="https://..."
  correctAnswer="book"
  acceptedAnswers={['books', 'a book']}
  caseSensitive={false}
  onAnswer={(isCorrect, answer) => console.log(isCorrect, answer)}
/>
```

---

### 8. **SpeakingCard** (`/components/cards/SpeakingCard.tsx`)
Record and practice pronunciation:
- Shows target word with phonetic
- "Listen" button to hear model pronunciation
- Large record button (140x140) with:
  - Pulsing animation while recording
  - Glowing effect
  - Red when recording, purple when ready
- Playback button to hear your recording
- Saves audio URI for analysis

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

---

## Testing the Cards

### View Test Screen
Navigate to: **`/test-cards`** in your running app

The test screen shows all 6 card types with:
- Placeholder images from Unsplash
- Sample data
- Full interactivity
- Real haptic feedback

Or manually navigate in your app:
1. Open your app (already running on port 8081)
2. Navigate to `/test-cards` route
3. Test all card interactions

---

## Image & Audio APIs

### Images
**Option 1: Unsplash (Free)**
- Free stock photos with attribution
- API: https://unsplash.com/developers
- Already used in test screen

**Option 2: Replicate/Stable Diffusion (Paid)**
- Generate custom images with AI
- Cost: ~$0.002 per image
- API: https://replicate.com

**Recommendation**: Start with Unsplash (free), add AI generation later for custom scenarios

### Audio
**Current**: Expo Speech (built-in TTS, works offline)
**Recommended**: Google Cloud TTS
- Free tier: 1M characters/month
- More natural voices
- Multiple speed controls
- TODO: Add API integration in AudioControls.tsx (line 36)

---

## Next Steps

### Immediate (This Session)
1. ✅ Test all cards in `/test-cards` route
2. Review design and provide feedback
3. Choose final color palette
4. Decide on Unsplash vs AI images

### Phase 2 (Next Session)
1. Integrate Google Cloud TTS for better audio
2. Create user onboarding questions (for personalized stairs)
3. Build dynamic staircase home screen
4. Connect cards to database/lesson content
5. Add AI feedback system for recordings
6. Implement Gemini Live conversation feature

---

## File Structure
```
/constants
  └── designSystem.ts          # Colors, spacing, typography, animations

/components/cards
  ├── index.ts                 # Export all cards
  ├── AudioControls.tsx        # Reusable audio buttons
  ├── BaseCard.tsx             # Foundation component
  ├── SingleVocabCard.tsx      # Vocab with image + audio
  ├── ComparisonCard.tsx       # Stacked comparison (past/present)
  ├── ImageMultipleChoiceCard.tsx  # Image → select word
  ├── AudioToImageCard.tsx     # Audio → select image
  ├── TextInputCard.tsx        # Type answer
  └── SpeakingCard.tsx         # Record pronunciation

/app
  └── test-cards.tsx           # Test screen with all cards
```

---

## Key Features

✅ **Immersive Design**: Deep gradients, glow effects, depth
✅ **Audio First**: Every text has audio (normal + slow speed)
✅ **Subtle Haptics**: Light feedback, not overwhelming
✅ **Smooth Animations**: Spring physics, natural motion
✅ **Mobile Optimized**: Vertical layout, thumb-friendly buttons
✅ **Instant Feedback**: Visual + haptic confirmation
✅ **Reusable Components**: Build lessons quickly
✅ **Accessibility**: Clear phonetics, multiple input methods

---

## What's Different From Your Reference

### Improvements:
1. **Vertical stacking** for comparison cards (better for mobile)
2. **Separate audio buttons** (normal + slow) instead of single button
3. **Gradient backgrounds** with depth instead of flat colors
4. **Glow effects** for immersion
5. **Multiple card types** for variety (6 interaction modes)
6. **Haptic feedback** throughout
7. **Instant correction** for text input

### Stayed True To:
- Dark theme aesthetic
- Clean, minimalist design
- Focus on listening and practicing
- Phonetic pronunciation display
- Image-based learning

---

Ready to test! 🚀

Navigate to `/test-cards` in your app to see all cards in action.
