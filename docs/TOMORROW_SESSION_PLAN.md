# Tomorrow's Session Plan - November 28, 2025

**Last Updated:** November 27, 2025, 21:00
**Status:** Ready for Refactoring
**Primary Focus:** 🎯 **REFACTOR CARDS INTO SEPARATE FILES**

---

## 🔥 PRIORITY #1: Card Architecture Refactoring (Est. 2-3 hours)

### Why This Matters
The `/components/cards/index.tsx` file is currently **28KB and growing**. This is unsustainable for:
- Multiple developers working simultaneously
- Debugging individual card issues
- Performance (bundle size, tree-shaking)
- Code maintainability
- Testing individual components

### The Better Architecture

**Current (Bad):**
```
/components/cards/
  └── index.tsx (28KB, 947 lines, all 6 cards in one file)
```

**Target (Good):**
```
/components/cards/
  ├── index.tsx               (~50 lines - just exports)
  ├── SingleVocabCard.tsx     (~150 lines)
  ├── MultipleChoiceCard.tsx  (~120 lines)
  ├── ImageQuizCard.tsx       (~130 lines)
  ├── AudioCard.tsx           (~160 lines)
  ├── TextInputCard.tsx       (~180 lines)
  ├── SpeakingCard.tsx        (~190 lines)
  ├── FillInBlankCard.tsx     ✅ (already separated)
  ├── SentenceScrambleCard.tsx ✅ (already separated)
  ├── DescribeImageCard.tsx   ✅ (already separated)
  ├── StorytellingCard.tsx    ✅ (already separated)
  ├── QuestionGameCard.tsx    ✅ (already separated)
  └── RolePlayCard.tsx        ✅ (already separated)
```

### Refactoring Steps (Tomorrow Morning)

#### Step 1: Extract SingleVocabCard (30 min)
- [ ] Create `/components/cards/SingleVocabCard.tsx`
- [ ] Copy lines 34-187 from index.tsx
- [ ] Add proper imports (React, Reanimated, Haptics, Image, etc.)
- [ ] Export the component
- [ ] Update index.tsx to re-export: `export { SingleVocabCard } from './SingleVocabCard';`
- [ ] Test: Run app and verify card still works

#### Step 2: Extract MultipleChoiceCard (20 min)
- [ ] Create `/components/cards/MultipleChoiceCard.tsx`
- [ ] Copy lines 189-299 from index.tsx
- [ ] Add imports
- [ ] Export
- [ ] Update index.tsx
- [ ] Test

#### Step 3: Extract ImageQuizCard (20 min)
- [ ] Create `/components/cards/ImageQuizCard.tsx`
- [ ] Copy lines 301-428 from index.tsx
- [ ] Add imports (remember: wrap Image in Animated.View!)
- [ ] Export
- [ ] Update index.tsx
- [ ] Test

#### Step 4: Extract AudioCard (20 min)
- [ ] Create `/components/cards/AudioCard.tsx`
- [ ] Copy lines 430-587 from index.tsx
- [ ] Add imports
- [ ] Export
- [ ] Update index.tsx
- [ ] Test

#### Step 5: Extract TextInputCard (20 min)
- [ ] Create `/components/cards/TextInputCard.tsx`
- [ ] Copy lines 589-759 from index.tsx
- [ ] Add imports
- [ ] Export
- [ ] Update index.tsx
- [ ] Test

#### Step 6: Extract SpeakingCard (20 min)
- [ ] Create `/components/cards/SpeakingCard.tsx`
- [ ] Copy lines 761-947 from index.tsx
- [ ] Add imports
- [ ] Export
- [ ] Update index.tsx
- [ ] Test

#### Step 7: Clean Up index.tsx (10 min)
Final index.tsx should look like:
```typescript
/**
 * Card Components Index
 *
 * Barrel file that exports all card components.
 * Each card is in its own file for better maintainability.
 */

// Working polished cards (6)
export { SingleVocabCard } from './SingleVocabCard';
export { MultipleChoiceCard } from './MultipleChoiceCard';
export { ImageQuizCard } from './ImageQuizCard';
export { AudioCard } from './AudioCard';
export { TextInputCard } from './TextInputCard';
export { SpeakingCard } from './SpeakingCard';

// New cards (6)
export { FillInBlankCard } from './FillInBlankCard';
export { SentenceScrambleCard } from './SentenceScrambleCard';
export { DescribeImageCard } from './DescribeImageCard';
export { StorytellingCard } from './StorytellingCard';
export { QuestionGameCard } from './QuestionGameCard';
export { RolePlayCard } from './RolePlayCard';
```

#### Step 8: Verify All Imports Still Work (15 min)
- [ ] Check `app/test-cards.tsx` still imports correctly
- [ ] Check `app/lesson/[stepId].tsx` still works
- [ ] Run app on iOS and Android
- [ ] Test all 7 working cards (6 original + FillInBlank)
- [ ] Commit: "refactor: Separate card components into individual files"

### Expected Benefits After Refactoring
✅ Easier to debug individual cards
✅ Faster development (work on cards in parallel)
✅ Better code organization
✅ Smaller bundle size (better tree-shaking)
✅ Clearer git history (changes isolated per card)
✅ Easier for code review
✅ Better TypeScript performance in IDE

---

## 🎨 PRIORITY #2: Polish Each Card Individually (Est. 2-3 hours)

Now that each card is in its own file, we can polish them one by one!

### Polish Checklist (Per Card)

For each card, go through this checklist:

#### Visual Polish
- [ ] Consistent spacing (use design system spacing values)
- [ ] Smooth animations (60fps)
- [ ] Proper shadows and elevation
- [ ] Color consistency (use design system colors)
- [ ] Proper dark mode support

#### Interaction Polish
- [ ] Haptic feedback on all interactions
- [ ] Loading states where needed
- [ ] Error handling
- [ ] Disabled states
- [ ] Success/failure feedback

#### Code Quality
- [ ] TypeScript types properly defined
- [ ] No unused imports
- [ ] Consistent code style
- [ ] Comments for complex logic
- [ ] Prop validation

### Card-by-Card Polish Plan

#### 1. SingleVocabCard.tsx
**Current Status:** ✅ Already polished
**Verify:**
- [ ] Image loads correctly (wrapped in Animated.View)
- [ ] Continue button visible and working
- [ ] Animations smooth

#### 2. MultipleChoiceCard.tsx
**Current Status:** ✅ Already polished
**Verify:**
- [ ] Options animate in sequence
- [ ] Checkmark/X appear correctly
- [ ] Haptic feedback works

#### 3. ImageQuizCard.tsx
**Current Status:** ✅ Already polished
**Verify:**
- [ ] Image displays (wrapped in Animated.View)
- [ ] Answer feedback clear

#### 4. AudioCard.tsx
**Current Status:** ✅ Already polished
**Enhancements to Add:**
- [ ] Real audio playback (currently placeholder)
- [ ] Visual waveform during playback
- [ ] Replay button

#### 5. TextInputCard.tsx
**Current Status:** ✅ Already polished
**Verify:**
- [ ] Shows correct answer on error
- [ ] Keyboard dismisses properly

#### 6. SpeakingCard.tsx
**Current Status:** ✅ Already polished
**Enhancements to Add:**
- [ ] Real audio recording (expo-av)
- [ ] Playback recorded audio
- [ ] Pronunciation feedback (future: Google Speech-to-Text)

#### 7. FillInBlankCard.tsx
**Current Status:** ✅ Just implemented
**Verify:**
- [ ] Sentence splits correctly at [BLANK]
- [ ] Selected word fills in properly
- [ ] Options animate nicely

#### 8. SentenceScrambleCard.tsx
**Status:** ⚠️ Needs work (Gemini version has issues)
**Todo:**
- [ ] Implement real drag-and-drop (react-native-gesture-handler)
- [ ] Word reordering logic
- [ ] Visual feedback during drag
- [ ] Haptic feedback on drop

#### 9. DescribeImageCard.tsx
**Status:** ⚠️ Needs work (placeholder speech recognition)
**Todo:**
- [ ] Add text input for description
- [ ] Simple keyword validation
- [ ] Image display
- [ ] Voice input (future enhancement)

#### 10. StorytellingCard.tsx
**Status:** ⚠️ Needs work (trivial evaluation)
**Todo:**
- [ ] Multiple image display
- [ ] Text area for story
- [ ] Word count validation
- [ ] Better evaluation logic

#### 11. QuestionGameCard.tsx
**Status:** ⚠️ Needs work (fake AI)
**Todo:**
- [ ] Pre-scripted Q&A pairs
- [ ] Question counter (20 questions)
- [ ] Hint system
- [ ] Win/lose conditions

#### 12. RolePlayCard.tsx
**Status:** ⚠️ Needs work (hardcoded responses)
**Todo:**
- [ ] Branching dialogue tree
- [ ] Multiple scenarios
- [ ] Chat-like interface
- [ ] Scenario completion tracking

---

## 📋 Today's Accomplishments (Nov 27)

### ✅ Fixed Critical Errors
1. Fixed Gemini syntax error: `import * =>` → `import * as`
2. Deleted 8 duplicate card files created by Gemini
3. Fixed image rendering (wrapped Image in Animated.View)
4. Fixed old imports in `app/lesson/[stepId].tsx`

### ✅ Implemented FillInBlankCard
- Clean implementation following our pattern
- Animations, haptic feedback, visual feedback
- 3 test samples
- Integrated into test-cards.tsx

### ✅ Created Documentation
- **RECOVERY_BACKUP.md**: All critical fixes with restore instructions
- **Tomorrow plan updated**: Clear refactoring roadmap

### ✅ Images Now Working
- SingleVocabCard: Image displays with animation
- ImageQuizCard: Image displays with animation
- Fix documented in RECOVERY_BACKUP.md

---

## 🎯 Tomorrow's Success Criteria

### Must Complete:
- [ ] All 6 working cards extracted into separate files
- [ ] index.tsx reduced to ~50 lines of exports
- [ ] All imports still work correctly
- [ ] App builds and runs without errors
- [ ] All 7 working cards tested and verified
- [ ] Git commit: "refactor: Separate card components"

### Nice to Have:
- [ ] Start polishing remaining 5 Gemini cards
- [ ] Add more test data for new cards
- [ ] Update Practice tab grid with all 12 cards

---

## 📝 Notes for Tomorrow

### Remember These Key Points:
1. **Image Rendering**: Always wrap `<Image>` in `<Animated.View>` for remote URLs
2. **Imports**: All cards need React, Reanimated, Haptics, design system
3. **Testing**: Test each card after extraction before moving to next
4. **Commit Often**: Commit after each successful extraction

### Files That Import Cards:
- `app/test-cards.tsx` ✅ (uses index exports)
- `app/lesson/[stepId].tsx` ✅ (fixed to use index exports)
- Any other files? Check before refactoring!

### Common Import Pattern:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
```

---

## 🚀 Week Plan Overview

### Thursday (Nov 28) - REFACTORING DAY
- Morning: Extract all 6 cards into separate files
- Afternoon: Polish cards 8-12 (Gemini cards)

### Friday (Nov 29)
- Test complete mini-lesson flow
- Add more test data
- Bug fixes

### Weekend
- Review and plan next week
- Optional: Start on Gemini lesson composer integration

---

**Last Updated:** November 27, 2025, 21:00
**Next Session:** November 28, 2025
**Prepared by:** Claude
**Status:** Ready to Refactor 🚀
