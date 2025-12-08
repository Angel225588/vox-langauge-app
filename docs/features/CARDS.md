# Feature: Cards System

**Created**: 2025-12-02
**Last Updated**: 2025-12-02 11:00 AM
**Owner**: Angel Polanco
**Priority**: P0
**Status**: 80% Done

---

## Overview

### What It Does
14 different card types for learning vocabulary, grammar, speaking, and more. Each card type serves a specific learning purpose and uses consistent UI patterns.

### Why It Matters
- Core learning mechanic - everything else builds on this
- Research: Different card types reinforce different skills
- Research: Variety prevents boredom and improves retention

### Your Idea Connection
**From project-ideas.txt (#4A)**:
> "Design System Overhaul - Create unified component library with consistent styling. Document all components properly. Fancy but functional - animations, transitions, micro-interactions. Consistent spacing, colors, typography across all cards."

---

## Card Types Inventory

| # | Card Type | Purpose | Status | File |
|---|-----------|---------|--------|------|
| 1 | SingleVocabCard | Learn new word with image/audio | Done | `/components/cards/SingleVocabCard.tsx` |
| 2 | MultipleChoiceCard | Select correct answer | Done | `/components/cards/MultipleChoiceCard.tsx` |
| 3 | TextInputCard | Type the translation | Done | `/components/cards/TextInputCard.tsx` |
| 4 | SpeakingCard | Record pronunciation | Done | `/components/cards/SpeakingCard.tsx` |
| 5 | ListeningCard | Listen and type | Done | `/components/cards/ListeningCard.tsx` |
| 6 | ImageQuizCard | Match image to word | Done | `/components/cards/ImageQuizCard.tsx` |
| 7 | SentenceScrambleCard | Arrange words correctly | Done | `/components/cards/SentenceScrambleCard.tsx` |
| 8 | FillBlankCard | Complete the sentence | Done | `/components/cards/FillBlankCard.tsx` |
| 9 | ComparisonCard | Compare two options | Done | `/components/cards/ComparisonCard.tsx` |
| 10 | RolePlayCard | Conversation practice | Done | `/components/cards/RolePlayCard.tsx` |
| 11 | StorytellingCard | Create story from images | Done | `/components/cards/StorytellingCard.tsx` |
| 12 | TeleprompterCard | Read aloud practice | Partial | `/components/cards/TeleprompterCard.tsx` |
| 13 | ReadingResultsCard | Reading feedback | Partial | `/components/cards/ReadingResultsCard.tsx` |
| 14 | TapToMatchCard | Match pairs game | Done | `/components/games/TapToMatchCard.tsx` |

---

## Shared Components

All cards use these shared UI components for consistency:

| Component | Path | Usage |
|-----------|------|-------|
| ResultAnimation | `/components/ui/ResultAnimation.tsx` | Success/error feedback |
| AudioButton | `/components/ui/AudioButton.tsx` | Play audio |
| RecordButton | `/components/ui/RecordButton.tsx` | Voice recording |
| ProgressBar | `/components/ui/ProgressBar.tsx` | Visual progress |

---

## Design System

### Colors (from designSystem.ts)
```typescript
colors = {
  primary: '#6366F1',      // Indigo - main actions
  secondary: '#EC4899',    // Pink - secondary actions
  success: '#10B981',      // Green - correct answers
  error: '#EF4444',        // Red - incorrect answers
  warning: '#F59E0B',      // Amber - hints/tips
  background: '#FFFFFF',   // Light mode
  backgroundDark: '#111827', // Dark mode
  text: '#111827',
  textMuted: '#6B7280',
}
```

### Spacing
```typescript
spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}
```

### Animations
- All cards use `react-native-reanimated`
- Entry: `FadeIn`, `SlideInUp`
- Exit: `FadeOut`, `SlideOutDown`
- Haptic feedback via `useHaptics` hook

---

## Known Issues (To Fix in Session 1)

### Critical
- [x] ~~Haptics import error in RolePlayCard.tsx~~ (Fixed 2025-12-02)
- [x] ~~Haptics import error in StorytellingCard.tsx~~ (Fixed 2025-12-02)
- [x] ~~Haptics import error in SentenceScrambleCard.tsx~~ (Fixed 2025-12-02)

### Medium
- [ ] Inconsistent styling across cards
- [ ] Some cards missing dark mode support
- [ ] Loading states not uniform

### Low
- [ ] Animation timing varies between cards
- [ ] Some cards missing accessibility labels

---

## Files

### Card Components
- `/components/cards/SingleVocabCard.tsx`
- `/components/cards/MultipleChoiceCard.tsx`
- `/components/cards/TextInputCard.tsx`
- `/components/cards/SpeakingCard.tsx`
- `/components/cards/ListeningCard.tsx`
- `/components/cards/ImageQuizCard.tsx`
- `/components/cards/SentenceScrambleCard.tsx`
- `/components/cards/FillBlankCard.tsx`
- `/components/cards/ComparisonCard.tsx`
- `/components/cards/RolePlayCard.tsx`
- `/components/cards/StorytellingCard.tsx`
- `/components/cards/TeleprompterCard.tsx`
- `/components/cards/ReadingResultsCard.tsx`

### Game Components
- `/components/games/TapToMatchCard.tsx`
- `/components/games/MultipleChoiceCard.tsx`

### Shared UI
- `/components/ui/ResultAnimation.tsx`
- `/components/ui/index.tsx`

### Design System
- `/constants/designSystem.ts`

### Hooks
- `/hooks/useHaptics.ts`

---

## Implementation Status

### Done
- [x] 14 card types created
- [x] Basic animations working
- [x] Haptics implemented
- [x] Result animations (success/error)
- [x] Haptics errors fixed (Dec 2)

### In Progress
- [ ] Design consistency pass

### TODO (Session 1 Focus)
- [ ] Audit all cards for consistent styling
- [ ] Fix dark mode on all cards
- [ ] Standardize loading states
- [ ] Test each card type individually
- [ ] Document card props in comments

---

## Testing

### Manual Test Steps
For each card type:
1. Load the card
2. Complete the interaction
3. Verify haptic feedback
4. Verify animation (success/error)
5. Check dark mode
6. Check accessibility

### Test Matrix

| Card | Renders | Haptics | Animation | Dark Mode | a11y |
|------|---------|---------|-----------|-----------|------|
| SingleVocab | ? | ? | ? | ? | ? |
| MultipleChoice | ? | ? | ? | ? | ? |
| TextInput | ? | ? | ? | ? | ? |
| Speaking | ? | ? | ? | ? | ? |
| Listening | ? | ? | ? | ? | ? |
| ImageQuiz | ? | ? | ? | ? | ? |
| SentenceScramble | ? | ? | ? | ? | ? |
| FillBlank | ? | ? | ? | ? | ? |
| Comparison | ? | ? | ? | ? | ? |
| RolePlay | ? | ? | ? | ? | ? |
| Storytelling | ? | ? | ? | ? | ? |
| Teleprompter | ? | ? | ? | ? | ? |
| ReadingResults | ? | ? | ? | ? | ? |
| TapToMatch | ? | ? | ? | ? | ? |

---

## Changelog

### 2025-12-02
- Fixed Haptics errors in 3 cards
- Documentation created
- Test matrix added

### 2025-11-28
- 14 card types completed
- Basic functionality working
