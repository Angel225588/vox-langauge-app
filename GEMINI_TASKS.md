# Tasks for Gemini AI Assistant

**Project**: Vox Language App - React Native (Expo)
**Current Phase**: Building Core Learning Mechanics (Flashcard System)
**Date**: 2025-11-20

---

## 📋 Instructions for Gemini

Hi Gemini! You're helping build the **Vox Language App**, a language learning mobile app. Please follow these guidelines:

### General Guidelines:
1. **Read the documentation first**: Check `/docs/PROJECT_STATUS.md`, `/docs/PROGRESS_REPORT.md`, and relevant files before starting
2. **Follow existing patterns**: Look at existing components (like `/app/(auth)/login.tsx`) for styling and structure
3. **Use TypeScript**: All files must use TypeScript with proper types
4. **Use NativeWind**: For styling (Tailwind CSS for React Native) - check existing components for examples
5. **Use Reanimated**: For animations (React Native Reanimated 3)
6. **Document everything**: Add clear comments explaining what the code does
7. **Test your work**: Ensure the component can be imported without errors
8. **Update this file**: Mark tasks as complete and add notes about what you did

### 🔍 CODE REVIEW REQUIREMENTS (CRITICAL):

**After EVERY task, you MUST**:

1. **Self-Review Your Code**:
   - Check for TypeScript errors
   - Verify all imports are correct
   - Ensure props interface matches usage
   - Test that animations work smoothly
   - Verify dark mode support (dark: classes)

2. **Review Against Documentation**:
   - Read `/docs/PROJECT_STATUS.md` - Are you following the project structure?
   - Read `/docs/UI_DESIGN_SYSTEM.md` - Are you using the right colors/spacing?
   - Read `/docs/claude.md` - Are you following the code style?
   - Check types in `/types/flashcard.ts` - Are you using correct types?

3. **Document What You Did**:
   - Update this file (GEMINI_TASKS.md) with completion notes
   - Explain any decisions you made
   - List any issues you encountered
   - Suggest improvements if you see opportunities

4. **Check for Common Issues**:
   - ❌ Hardcoded colors (use theme/NativeWind classes)
   - ❌ Missing TypeScript types
   - ❌ Unused imports
   - ❌ Console.log statements (remove or comment out)
   - ❌ Commented-out code
   - ❌ Missing error handling
   - ❌ Poor accessibility (missing labels)

5. **Reduce Hallucinations**:
   - Don't invent props or APIs that don't exist
   - Check actual file paths before importing
   - Verify function names match exactly
   - Don't assume libraries have features they don't
   - When unsure, check the actual file or ask in Notes section

### 📝 Task Completion Checklist:

Before marking a task complete, verify:
- [ ] Code compiles without errors
- [ ] All imports are correct and files exist
- [ ] Component follows existing patterns
- [ ] TypeScript types are correct
- [ ] Comments explain the code
- [ ] Dark mode works (uses dark: classes)
- [ ] Animations are smooth
- [ ] Error handling is present
- [ ] Accessibility labels are added
- [ ] Documentation is updated
- [ ] You've reviewed against `/docs/` files
- [ ] You've listed any issues in Notes section

### Code Style:
- Functional components with hooks (no class components)
- Use `ClassName` prop for NativeWind styling (e.g., `className="bg-blue-500 p-4"`)
- File naming: PascalCase for components (e.g., `LearningCard.tsx`)
- Export components as default: `export default function ComponentName()`
- Use absolute imports with `@/` prefix (e.g., `import { Flashcard } from '@/types/flashcard'`)

### Where to Find Things:
- **Types**: `/types/flashcard.ts`
- **Database**: `/lib/db/flashcards.ts`
- **SM-2 Algorithm**: `/lib/spaced-repetition/sm2.ts`
- **Existing Components**: `/app/(auth)/login.tsx` (good example of styling + animations)
- **Documentation**: `/docs/` folder

---

## 🎯 Active Tasks for Gemini

### Task 3: Build SpeakingCard Component ⚡ MEDIUM PRIORITY
**Status**: 🔴 Not Started
**File to create**: `/components/flashcards/SpeakingCard.tsx`
**Estimated time**: 45-60 minutes

#### What this component does:
The SpeakingCard shows a word and asks the user to pronounce it. It records their voice and allows playback for self-assessment.

#### Requirements:

**Props Interface**:
```typescript
interface SpeakingCardProps {
  word: string;              // Word to pronounce
  phonetic?: string;        // IPA pronunciation guide
  exampleAudioUrl?: string; // Optional reference audio
  onComplete: (audioUri: string) => void; // Called when recording is done
  onSkip?: () => void;       // Called when user skips
}
```

**Visual Design**:
- Large word at top
- Phonetic guide below word (if available)
- "Play example" button (if exampleAudioUrl available)
- Large record button in center (🎤 icon)
- Recording indicator (red pulsing dot when recording)
- Playback button (appears after recording)
- "Done" button to continue
- "Try again" to record again

**Functionality**:
- Use `expo-av` for recording and playback
- Record button: Tap to start, tap again to stop
- Show recording timer during recording
- Allow playback of user's recording
- Allow re-recording unlimited times
- Save recording URI and pass to onComplete

**Recording Logic**:
```typescript
import { Audio } from 'expo-av';

// Request permissions
await Audio.requestPermissionsAsync();

// Start recording
const recording = new Audio.Recording();
await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
await recording.startAsync();

// Stop recording
await recording.stopAndUnloadAsync();
const uri = recording.getURI();
```

**Styling**:
- Word: Large, bold, centered
- Phonetic: Smaller, gray, italics
- Record button: Red (#F44336) when recording, blue when ready
- Pulsing animation while recording
- Playback button: Green (#4CAF50)
- Clean, minimal design

**Acceptance Criteria**:
- ✅ Requests and handles audio permissions
- ✅ Records audio when button is tapped
- ✅ Shows recording indicator
- ✅ Can play back recorded audio
- ✅ Can re-record multiple times
- ✅ Passes audio URI to onComplete callback
- ✅ TypeScript types are correct
- ✅ Code is well-commented
- ✅ Handles errors gracefully (no permissions, etc.)

---

## ✅ Completed Tasks

### Task 1: Build LearningCard Component ⚡ HIGH PRIORITY
**Status**: ✅ Completed
**File created**: `/components/flashcards/LearningCard.tsx`

**Summary of work**:
- Created the `LearningCard` component with a front and back face.
- Implemented a 3D flip animation using React Native Reanimated.
- The front of the card displays the word, an optional image, and phonetic spelling.
- The back of the card displays the translation, an example sentence, and a button to play audio.
- Used `expo-av` to handle audio playback.
- Styled the component using NativeWind, following the design specifications.

### Task 2: Build ListeningCard Component ⚡ MEDIUM PRIORITY
**Status**: ✅ Completed
**File created**: `/components/flashcards/ListeningCard.tsx`

**Summary of work**:
- Created the `ListeningCard` component with a text input for user response.
- Implemented audio playback using `expo-av`, with auto-play on load and a replay button.
- Implemented input validation (case-insensitive, trim whitespace) and a check button.
- Added animated feedback (fade-in/scale, green for correct, red for incorrect) using React Native Reanimated.
- Included an optional skip button.
- Ensured correct callbacks (`onCorrect`, `onIncorrect`, `onSkip`) are fired.

---

## 📝 Notes & Questions for Claude

*(Gemini: If you have questions or encounter issues, document them here. Claude will review and provide guidance.)*

**Example**:
- ❓ Question: Should the audio files be downloaded locally or streamed?
- ❓ Issue: Reanimated animation is laggy on Android, need optimization tips
- ✅ Resolved: Used `useSharedValue` instead of regular state for better performance

---

## 🔗 Useful Links

- **React Native Reanimated Docs**: https://docs.swmansion.com/react-native-reanimated/
- **NativeWind Docs**: https://www.nativewind.dev/
- **Expo AV Docs**: https://docs.expo.dev/versions/latest/sdk/av/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**Last Updated**: 2025-11-20 by Gemini
**Next Review**: After Task 3 completion
