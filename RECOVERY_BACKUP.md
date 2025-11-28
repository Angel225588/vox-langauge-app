# Recovery & Backup Documentation

**Last Updated**: 2025-11-27 20:15 UTC
**Session**: Card Polishing & Gemini Integration

## Current Working State

### ✅ Working Components (6 Cards in `/components/cards/index.tsx`)

All these cards are **polished and working** with animations, haptic feedback, and proper image rendering:

1. **SingleVocabCard** (lines 34-187)
   - Props: `word`, `translation`, `phonetic`, `image_url`, `example_sentence`
   - Features: Image display, staggered animations, Continue button
   - **IMPORTANT**: Uses `<Image>` wrapped in `<Animated.View>` for remote images

2. **MultipleChoiceCard** (lines 189-299)
   - Props: `word`, `translation`, `options[]`, `correct_answer` (number index)
   - Features: Checkmark/X feedback, haptic on answer, staggered option animations

3. **ImageQuizCard** (lines 301-428)
   - Props: `word`, `image_url`, `options[]`, `correct_answer`
   - **IMPORTANT**: Uses `<Image>` wrapped in `<Animated.View>` for remote images

4. **AudioCard** (lines 430-587)
   - Props: `word`, `translation`, `audio_url`, `options[]`, `correct_answer`
   - Features: Animated audio button with scale effect

5. **TextInputCard** (lines 589-759)
   - Props: `word`, `translation`, `correct_answer` (string)
   - Features: Input focus animation, shows correct answer on error

6. **SpeakingCard** (lines 761-947)
   - Props: `word`, `translation`, `phonetic`, `example_sentence`
   - Features: Recording pulse animation, button rotation

### ⚠️ Gemini-Created Cards (Separate Files - Need Review)

These were created by Gemini and have issues:

1. `DescribeImageCard.tsx` - Placeholder speech recognition
2. `FillInBlankCard.tsx` - Basic implementation
3. `QuestionGameCard.tsx` - Uses fake AI (Math.random)
4. `RolePlayCard.tsx` - Hardcoded responses
5. `SentenceScrambleCard.tsx` - Drag-and-drop not implemented
6. `StorytellingCard.tsx` - Trivial evaluation

**Status**: These are exported from `index.tsx` but not integrated into test-cards yet.

## Critical Fixes Applied

### Fix #1: Image Rendering Issue
**Problem**: Images disappeared when using `Animated.Image`
**Solution**: Wrap regular `<Image>` in `<Animated.View>`

```typescript
// ❌ BROKEN
<Animated.Image
  entering={ZoomIn.duration(500)}
  source={{ uri: image_url }}
/>

// ✅ FIXED
<Animated.View entering={ZoomIn.duration(500)}>
  <Image source={{ uri: image_url }} />
</Animated.View>
```

**Files Fixed**:
- `components/cards/index.tsx` line 82-92 (SingleVocabCard)
- `components/cards/index.tsx` line 340-354 (ImageQuizCard)

### Fix #2: Test Cards Screen
**File**: `app/test-cards.tsx`

Changes:
- Line 215: Added `edges={['top', 'bottom']}` to SafeAreaView
- Line 218-232: New header with centered title and ✕ close button
- Line 326: Added `flexGrow: 1` to content container for Continue button visibility
- Line 266-297: Updated header styles to centered flexbox layout

### Fix #3: Hide URL Bar
**File**: `app/_layout.tsx` line 94

```typescript
<Stack.Screen
  name="test-cards"
  options={{ headerShown: false, presentation: 'modal' }}
/>
```

### Fix #4: Syntax Error from Gemini
**File**: `components/cards/SpeakingCard.tsx` line 13

```typescript
// ❌ BROKEN
import * => Haptics from 'expo-haptics';

// ✅ FIXED
import * as Haptics from 'expo-haptics';
```

## Deleted Files (Gemini Duplicates)

Removed these duplicate files created by Gemini:
- `SingleVocabCard.tsx` (duplicate - we have it in index.tsx)
- `ImageMultipleChoiceCard.tsx` (duplicate)
- `TextInputCard.tsx` (duplicate)
- `BaseCard.tsx` (not needed)
- `AudioControls.tsx` (not needed)
- `AudioToImageCard.tsx` (duplicate - we have AudioCard)
- `ComparisonCard.tsx` (not in requirements)
- `SpeakingCard.tsx` (duplicate - we have it in index.tsx)

## Test Data Structure

**File**: `app/test-cards.tsx` lines 23-147

### Critical: Image URLs
All using Unsplash (working as of 2025-11-27):
```typescript
const IMAGES = {
  apple: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
  // ... etc
};
```

### Sample Data Format
```typescript
'single-vocab': [
  {
    word: 'apple',
    phonetic: '/ˈæp.əl/',
    translation: 'manzana',
    image_url: IMAGES.apple
  },
]
```

## How to Restore If Issues Occur

### If Images Disappear Again:
1. Check `components/cards/index.tsx` lines 82-92 and 340-354
2. Ensure `<Image>` is wrapped in `<Animated.View>`, NOT using `<Animated.Image>`
3. Verify Unsplash URLs are still accessible

### If Syntax Errors Appear:
1. Search for `import * =>` and replace with `import * as`
2. Run: `grep -r "import \* =>" components/`

### If Continue Button Missing:
1. Check `app/test-cards.tsx` line 326: `flexGrow: 1` must be present
2. Verify ScrollView is wrapping the card content

### If Header Issues:
1. Check `app/test-cards.tsx` lines 217-232 for header structure
2. Check `app/_layout.tsx` line 94 for `headerShown: false`

## Git Backup Commands

```bash
# Create a backup branch
git checkout -b backup/working-cards-2025-11-27

# Commit current state
git add .
git commit -m "Backup: Working 6 cards with image fix"

# Return to main branch
git checkout feature/duolingo-homepage

# If needed, restore from backup
git cherry-pick <commit-hash>
```

## Next Steps (If Continuing Session)

1. ✅ Verify app builds successfully
2. ✅ Test all 6 working cards show images
3. ⚠️ Review Gemini's 6 card implementations
4. ⚠️ Either fix or rewrite Gemini cards based on GEMINI_TASKS.md
5. ⚠️ Add test data for Gemini cards in test-cards.tsx

## Known Issues

1. **iOS Tab Navigation**: User reported tabs not working on iOS (works on Android)
   - Status: Not yet investigated
   - File: Likely `app/(tabs)/_layout.tsx`

2. **Gemini Cards Not Tested**: The 6 Gemini cards exist but haven't been added to test-cards.tsx yet

---

**CRITICAL REMINDER**:
- Always use `<Image>` wrapped in `<Animated.View>` for remote images
- Never use `Animated.Image` directly with `source={{ uri }}`
- Keep this file updated when making significant changes
