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
- Use `className` prop for NativeWind styling (e.g., `className="bg-blue-500 p-4"`)
- **CRITICAL**: DO NOT use `styled()` from NativeWind - it doesn't exist in v4! Use native components with `className` directly
- File naming: PascalCase for components (e.g., `LearningCard.tsx`)
- Export components as default: `export default function ComponentName()`
- Use absolute imports with `@/` prefix (e.g., `import { Flashcard } from '@/types/flashcard'`)

### ❌ BANNED PATTERNS (DO NOT USE):
```typescript
// ❌ WRONG - styled() doesn't exist in NativeWind v4
import { styled } from 'nativewind';
const StyledView = styled(View);

// ✅ CORRECT - Use className directly
import { View } from 'react-native';
<View className="bg-blue-500 p-4">...</View>
```

### Where to Find Things:
- **Types**: `/types/flashcard.ts`
- **Database**: `/lib/db/flashcards.ts`
- **SM-2 Algorithm**: `/lib/spaced-repetition/sm2.ts`
- **Existing Components**: `/app/(auth)/login.tsx` (good example of styling + animations)
- **Documentation**: `/docs/` folder

---

## 🎯 Active Tasks for Gemini

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

### Task 3: Build SpeakingCard Component ⚡ MEDIUM PRIORITY
**Status**: ✅ Completed
**File created**: `/components/flashcards/SpeakingCard.tsx`

**Summary of work**:
- Created the `SpeakingCard` component for recording and assessing pronunciation.
- Implemented audio recording and playback using `expo-av`, including permission handling.
- Integrated a recording timer and a pulsing animation for the record button using React Native Reanimated.
- Provided UI for playing example audio (if available), playing back user's recording, and options to "Try Again" or "Done".
- Ensured `onComplete` is called with the recorded audio URI and `onSkip` is triggered correctly.
- Implemented robust error handling for audio operations.

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
**Next Review**: All flashcard components completed
