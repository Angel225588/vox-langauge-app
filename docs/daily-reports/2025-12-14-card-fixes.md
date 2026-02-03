# Card Component Fixes - December 14, 2025

## Summary

Fixed multiple card components based on user feedback regarding iOS layout issues, audio player consistency, and user experience improvements.

## Changes Made

### 1. ComparisonCard Layout Fix (iOS)

**File**: `components/cards/ComparisonCard.tsx`

**Problem**: Cards were displaying stacked/compressed into a square on iOS instead of side-by-side.

**Solution**: Replaced `gap` property (not fully supported on older iOS) with explicit margins for proper flexbox layout.

```tsx
// Before: Used gap property
gridTwoColumns: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: GRID_GAP,
}

// After: Uses explicit margins
<View style={{
  width: CARD_WIDTH,
  marginRight: index % 2 === 0 ? GRID_GAP : 0,
  marginBottom: GRID_GAP,
}}>
```

### 2. New AudioPlayer Component

**File**: `components/ui/AudioPlayer.tsx` (NEW)

Created a reusable audio player component with:
- Normal speed play button (1x)
- Slow speed play button (0.5x/0.6x)
- Pulse animation when playing
- Supports audio URL or text-to-speech fallback
- Haptic feedback on interactions
- Auto-play option for quiz cards
- Three size variants: `small`, `medium`, `large`

**Usage**:
```tsx
import { AudioPlayer } from '@/components/ui';

<AudioPlayer
  text="apple"
  audioUrl={audio_url}
  size="medium"
  showSlowButton={true}
  autoPlay={false}
/>
```

### 3. SpeakingCard Improvements

**File**: `components/cards/SpeakingCard.tsx`

Added features:
- **Expression Type Badge**: Displays at top-right showing "VERB", "NOUN", "PHRASE", etc.
- **AudioPlayer Integration**: Users can listen to the word before speaking
- **"I can't speak" Button**: For public situations, redirects to typing practice
- **"I know this" Button**: Quick skip for known words
- **Styled with StyleSheet**: Replaced inline styles with proper StyleSheet for better performance

**New Props**:
```tsx
interface SpeakingCardProps {
  word?: string;
  translation?: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
  expressionType?: string;     // NEW: "verb", "noun", "phrase", etc.
  onCantSpeak?: () => void;    // NEW: Callback for "I can't speak"
}
```

### 4. UI Index Export Update

**File**: `components/ui/index.ts`

Added AudioPlayer to the exported components for app-wide usage.

### 5. Lesson Step Usage Fix

**File**: `app/lesson/[stepId].tsx`

Fixed prop name from `exampleAudioUrl` to `audio_url` to match SpeakingCardProps.

## Files Modified

| File | Change Type |
|------|-------------|
| `components/cards/ComparisonCard.tsx` | Fixed layout |
| `components/cards/SpeakingCard.tsx` | Major refactor |
| `components/ui/AudioPlayer.tsx` | New file |
| `components/ui/index.ts` | Added export |
| `app/lesson/[stepId].tsx` | Fixed prop name |

## Pre-existing Issues (Not Related to Changes)

The following TypeScript errors exist in other files and were not caused by these changes:
- `components/flashcards/SpeakingCard.tsx` - Old duplicate file with different implementation
- `app/(auth)/onboarding/` - Tamagui type issues

## Testing Recommendations

1. **ComparisonCard**: Test on iOS simulator with 2 and 4 item comparisons
2. **SpeakingCard**: Test the full flow:
   - Listen to word with AudioPlayer
   - Record pronunciation
   - Use "I can't speak" button
   - Use "I know this" button
3. **AudioPlayer**: Test in isolation with different sizes and audio sources

## Next Steps (As Requested)

The following items were mentioned but not yet implemented:
1. Update AudioQuizCard to use shared AudioPlayer component
2. Fix TextInputCard layout (question top, remove skip)
3. Reading practice and writing practice modules
4. Notes feature with @ tagging
