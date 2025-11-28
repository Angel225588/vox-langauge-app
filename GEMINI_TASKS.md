# Gemini AI Assistant - Task List & Status Report

**Project**: Vox Language App - React Native (Expo)
**Last Updated**: 2025-11-27 14:45 UTC
**Claude's Current Work**: Polishing the 6 working card components
**Gemini's Mission**: Fix and complete the 6 remaining card components

---

## 🔴 CRITICAL PRIORITY - START HERE

### Task 0: Fix & Complete 6 Remaining Card Components
**Created**: 2025-11-27 14:45 UTC
**Deadline**: ASAP (blocking lesson composition system)
**Status**: 🔴 **URGENT - START NOW**

---

## 📊 Current Component Status

### ✅ Working Cards (6) - Being Polished by Claude
1. ✅ **SingleVocabCard** - Display word with image and pronunciation
2. ✅ **MultipleChoiceCard** - Select correct translation from options
3. ✅ **ImageQuizCard** - See image, select correct word
4. ✅ **AudioCard** - Listen to audio, select matching option
5. ✅ **TextInputCard** - Type what you hear (dictation)
6. ✅ **SpeakingCard** - Record your pronunciation

### ⚠️ Your Mission: Fix These 6 Cards

#### Priority 1: Needs Critical Fixes (3 cards)

**7. SentenceScrambleCard.tsx** - ✅ **FIXED**
- **Completion Date**: 2025-11-27
- **Current Status**: Drag-and-drop fully implemented with `react-native-gesture-handler` and `react-native-reanimated`.
- **Location**: `/components/cards/SentenceScrambleCard.tsx`
- **What was Fixed**:
  ```typescript
  // Replaced broken PanResponder with a robust PanGesture handler.
  // Implemented smooth, animated reordering of words.
  // Added haptic feedback on drag and drop for better UX.
  // Ensured validation and completion logic is working correctly.
  ```
- **Test Cases Passed**:
  - User can drag any word to any position.
  - Words reorder correctly when dropped.
  - Sentence validation checks if order is correct.
  - Haptic feedback on successful drag.

**8. DescribeImageCard.tsx** - ✅ **FIXED**
- **Completion Date**: 2025-11-27
- **Current Status**: Real audio recording implemented with `expo-av`, and evaluation logic is improved.
- **Location**: `/components/cards/DescribeImageCard.tsx`
- **What was Fixed**:
  ```typescript
  // Replaced placeholder with actual audio recording.
  // Added microphone permission requests.
  // Implemented recording state management (isRecording, duration).
  // Saved audio URI on completion.
  // Evaluation now checks for min length, verb presence, and keywords.
  ```
- **Test Cases to Pass**:
  - User can record audio description.
  - Recording state is clearly indicated.
  - Evaluation provides feedback on length, structure, and keywords.
  - Audio URI is captured upon completion.

**9. SpeakingCard.tsx** - ✅ **FIXED**
- **Completion Date**: 2025-11-27
- **Current Status**: Records audio with enhanced feedback mechanisms.
- **Location**: `/components/cards/SpeakingCard.tsx`
- **What was Fixed**:
  ```typescript
  // Implemented a 'recordingStatus' state to manage UI flow (idle, recording, recorded, playing).
  // Added a simple animated waveform visualization during recording.
  // Provided post-recording options: "Listen", "Try Again", and "Submit".
  // "Submit" includes a duration check (>0.5 seconds).
  ```
- **Test Cases to Pass**:
  - User can record audio.
  - Waveform animation is visible during recording.
  - User can listen to their recording.
  - User can try again to record.
  - User can submit, with duration check.

#### Priority 2: AI Integration Missing (3 cards)

**10. QuestionGameCard.tsx** - ✅ **FIXED**
- **Completion Date**: 2025-11-27
- **Current Status**: Fake AI replaced with a rule-based system.
- **Location**: `/components/cards/QuestionGameCard.tsx`
- **What was Fixed**:
  ```typescript
  // Replaced Math.random() AI with a deterministic, rule-based response system
  // based on a simple knowledge base for common words/categories.
  // The 'onComplete' prop now correctly passes 'won' (boolean) and
  // 'questionsUsed' (number) arguments to align with the game flow.
  ```
- **Test Cases to Pass**:
  - AI provides logical "Yes/No/Maybe" answers based on question content and secret word properties.
  - Game ends after max questions or correct guess.
  - Points are awarded based on win/loss condition.

**11. RolePlayCard.tsx** - ✅ **FIXED**
- **Completion Date**: 2025-11-27
- **Current Status**: Fake AI responses replaced with scripted conversations.
- **Location**: `/components/cards/RolePlayCard.tsx`
- **What was Fixed**:
  ```typescript
  // Replaced hardcoded AI responses with a structured, scripted conversation system.
  // Implemented a data structure for conversational turns with AI messages and user options.
  // The UI now displays interactive buttons for user responses instead of a free-form text input.
  // Speech synthesis is integrated for AI dialogue.
  // The 'onComplete' function is triggered based on script progression and success conditions.
  ```
- **Test Cases to Pass**:
  - User can navigate through a conversation by selecting options.
  - AI responses are consistent with the script.
  - Speech synthesis for AI dialogue works.
  - Conversation ends correctly, and 'onComplete' is called with success status and turns taken.

**12. StorytellingCard.tsx** - ✅ **FIXED**
- **Completion Date**: 2025-11-27
- **Current Status**: Improved evaluation logic for storytelling.
- **Location**: `/components/cards/StorytellingCard.tsx`
- **What was Fixed**:
  ```typescript
  // Updated 'images' prop to accept an array of objects with id, url, and label.
  // Implemented improved evaluation logic to calculate a score based on:
  //   - Word count (meeting 'minWords' requirement).
  //   - Image keyword relevance (checking image labels in the story).
  //   - Simplified sentence structure (multiple sentences).
  // The 'onComplete' prop now correctly returns the story text and calculated score.
  ```
- **Test Cases to Pass**:
  - Story score is calculated based on word count, keywords, and sentence count.
  - Evaluation feedback is displayed to the user.
  - 'onComplete' is called with the story and calculated score.

---

## 🎯 Your Task Checklist

For EACH card above:

### Step 1: Read Current Code
```bash
# Read the existing component
cd /components/cards/
cat SentenceScrambleCard.tsx  # or whichever card

# Understand:
# - What props does it accept?
# - What's the current user flow?
# - Where are the TODO comments?
# - What's broken or fake?
```

### Step 2: Fix Critical Issues
- [ ] Remove all `Math.random()` AI placeholders
- [ ] Implement real gesture handling (SentenceScramble)
- [ ] Add proper audio recording flow (DescribeImage, Speaking)
- [ ] Connect to Gemini API OR create pre-scripted content

### Step 3: Test Each Card
```typescript
// Create test data in `/app/test-cards.tsx`
// Add your card to the CARD_SAMPLES object

const CARD_SAMPLES = {
  // ... existing samples ...

  'sentence-scramble': [
    {
      sentence: "This is a good example",
      scrambled: ["is", "This", "example", "good", "a"],
      correct_order: ["This", "is", "a", "good", "example"]
    },
    // Add 2 more samples
  ],

  'question-game': [
    {
      secretWord: "apple",
      category: "food",
      difficulty: "easy",
      hints: ["It's a fruit", "It's red or green", "Keeps doctor away"]
    },
    // Add 2 more samples
  ],

  // ... etc for all 6 cards
};
```

### Step 4: Follow Existing Card Patterns

**Look at working cards for reference:**
```typescript
// All cards follow this structure:

export function YourCard({
  // Props specific to this card
  word,
  options,
  correct_answer,
  // Always include:
  onNext,
}: YourCardProps & CardProps) {
  const [userAnswer, setUserAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    // Validate answer
    const isCorrect = validateAnswer();
    setShowResult(true);

    // Award points (even if wrong!)
    const points = isCorrect ? 15 : 5;

    // Wait for feedback, then move on
    setTimeout(() => {
      onNext({ correct: isCorrect, points });
    }, 1500);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {/* Card content */}
      <Text>{/* Question */}</Text>
      {/* Interactive element */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Step 5: Match Design System

**Use existing color constants:**
```typescript
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Background colors
backgroundColor: colors.background.primary    // '#0A0E1A' (dark)
backgroundColor: colors.background.card       // '#1A1F3A' (card)

// Text colors
color: colors.text.primary                    // '#F9FAFB' (white)
color: colors.text.secondary                  // '#D1D5DB' (gray)

// Accent colors
backgroundColor: colors.accent.success        // Green for correct
backgroundColor: colors.accent.error          // Red for incorrect
backgroundColor: colors.accent.primary        // Purple for buttons

// Spacing
padding: spacing.xl                           // 32
marginBottom: spacing.lg                      // 24

// Typography
fontSize: typography.fontSize['2xl']          // 24
fontWeight: typography.fontWeight.bold        // '700'
```

---

## 📋 Acceptance Criteria

Each fixed card must:

✅ **Functional Requirements**
- [ ] Works with provided test data
- [ ] User can complete the exercise
- [ ] Provides immediate visual feedback
- [ ] Calls `onNext()` with result
- [ ] Awards points (even for wrong answers!)

✅ **Code Quality**
- [ ] TypeScript with proper types
- [ ] No `any` types
- [ ] No console.log left in code
- [ ] Comments explain complex logic
- [ ] Follows existing card structure

✅ **UX Requirements**
- [ ] Matches dark theme design
- [ ] Smooth animations (60fps)
- [ ] Haptic feedback on interactions
- [ ] Loading states where needed
- [ ] Error handling (network failures, etc.)

✅ **Testing**
- [ ] Can be tested in `/app/test-cards.tsx`
- [ ] 3 different sample exercises provided
- [ ] Works on iOS and Android
- [ ] No crashes or TypeScript errors

---

## 🚫 What NOT to Do

❌ **Don't** use `Math.random()` for AI behavior
❌ **Don't** leave placeholder comments like "TODO: implement this"
❌ **Don't** create new design patterns - follow existing cards
❌ **Don't** add external dependencies without asking
❌ **Don't** change the file structure
❌ **Don't** modify working cards (SingleVocab, MultipleChoice, etc.)
❌ **Don't** break TypeScript compilation

---

## 📚 Reference Files to Read

**Before starting, read these:**
1. `/components/cards/index.tsx` (lines 1-630) - See all working cards
2. `/app/test-cards.tsx` - Understand testing structure
3. `/constants/designSystem.ts` - Colors and styling
4. `/lib/gemini/lesson-composer.ts` - Example Gemini API usage
5. `/docs/MINI_GAMES_ARCHITECTURE.md` - Card system philosophy
6. `GAME_COMPONENTS_REPORT.md` - Detailed analysis of each card

**Gemini API Integration:**
- See `/docs/GEMINI_IMPLEMENTATION_GUIDE.md` for examples
- Use `gemini-2.0-flash-exp` model (fast and cheap)
- Cache responses for offline replay
- Handle network errors gracefully

---

## 📝 Deliverables

When done, you should have:

1. **6 Fixed Card Components**
   - SentenceScrambleCard.tsx ✅
   - DescribeImageCard.tsx ✅
   - SpeakingCard.tsx ✅
   - QuestionGameCard.tsx ✅
   - RolePlayCard.tsx ✅
   - StorytellingCard.tsx ✅

2. **Updated Test Data**
   - 3 samples per card in `/app/test-cards.tsx`

3. **Working Demo**
   - All 12 cards testable from Practice tab
   - No TypeScript errors
   - No runtime crashes

---

## ⏰ Timeline

**Target**: Complete in current session
**Priority Order**:
1. SentenceScrambleCard (2 hours)
2. DescribeImageCard (1 hour)
3. SpeakingCard (1 hour)
4. QuestionGameCard (2 hours)
5. RolePlayCard (2 hours)
6. StorytellingCard (1.5 hours)

**Total Est**: 9.5 hours

---

## 💬 Questions to Ask Before Starting

If anything is unclear:
1. Should I use Gemini API or pre-scripted content?
2. What's the priority if time is limited?
3. Can I simplify any card for MVP?
4. Are there existing gesture libraries I should use?

---

## 🎯 Success Definition

**This task is DONE when:**
- ✅ All 12 cards appear in Practice tab grid
- ✅ Tapping any card shows working component
- ✅ User can complete 3 samples per card
- ✅ No TypeScript errors
- ✅ No crashes on iOS or Android
- ✅ Claude can start integrating cards into lesson flow

---

**Ready to start? Begin with SentenceScrambleCard.tsx! 🚀**

**Timestamp**: 2025-11-27 14:45 UTC
**Assigned To**: Gemini AI Assistant
**Status**: 🔴 URGENT - START NOW

