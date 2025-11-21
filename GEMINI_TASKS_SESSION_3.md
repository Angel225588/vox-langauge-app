# Gemini AI Tasks - Session 3
## Vox Language App - Task Assignments

**Date:** November 21, 2025
**Session:** 3
**Status:** 🚀 Ready to Execute
**Dependencies:** All installed ✅ (Tamagui, MMKV, Lottie, Gemini SDK)

---

## 📋 Task Overview

You have **4 main tasks** to complete. All foundational work has been done by Claude:
- ✅ Tamagui installed and configured
- ✅ babel.config.js updated
- ✅ tamagui.config.ts created with full theme
- ✅ TamaguiProvider added to app/_layout.tsx
- ✅ 4 base Tamagui components created (Button, Card, Input, Stack)
- ✅ React Native MMKV installed
- ✅ Lottie installed
- ✅ Gemini AI SDK installed
- ✅ Comprehensive documentation created

**Your Role:** Build UI components and convert screens to use the new Tamagui system.

---

## 🎯 Tasks

### Task 1: Build Lottie Animation Components ⭐ **START HERE**
**Priority:** HIGH (Needed by other tasks)
**Estimated Time:** 30 minutes
**Difficulty:** 🟢 Easy

#### Background
Lottie provides lightweight, high-quality animations for loading states, success feedback, and error messages. These will be used throughout the app for better UX.

#### Requirements

**1. Create LottieLoader Component**

File: `/components/animations/LottieLoader.tsx`

```typescript
import React from 'react';
import LottieView from 'lottie-react-native';
import { YStack, Text } from '@/components/ui/tamagui';

interface LottieLoaderProps {
  message?: string;
  size?: number;
}

export function LottieLoader({ message = 'Loading...', size = 200 }: LottieLoaderProps) {
  return (
    <YStack alignItems="center" justifyContent="center" gap="$4">
      <LottieView
        source={require('@/assets/animations/loading.json')} // You'll need to add this
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
      {message && (
        <Text fontSize={16} color="$textSecondary">
          {message}
        </Text>
      )}
    </YStack>
  );
}
```

**Note:** For now, use a placeholder JSON or skip the animation if you don't have the file. Focus on the structure.

**2. Create LottieSuccess Component**

File: `/components/animations/LottieSuccess.tsx`

Similar structure but with:
- One-time animation (loop={false})
- Green success theme
- Auto-dismiss after 2 seconds (optional callback)

**3. Create LottieError Component**

File: `/components/animations/LottieError.tsx`

Similar structure with:
- Red error theme
- Shake animation
- Error message prop

**4. Create Index File**

File: `/components/animations/index.tsx`

```typescript
export { LottieLoader } from './LottieLoader';
export { LottieSuccess } from './LottieSuccess';
export { LottieError } from './LottieError';
```

#### Acceptance Criteria
- [ ] All 3 components created with proper TypeScript types
- [ ] Components use Tamagui's YStack and Text
- [ ] Props are well-documented
- [ ] Index file exports all components
- [ ] Components compile without errors

#### Resources
- Lottie Free Animations: https://lottiefiles.com/featured
- Download 3 animations: loading, success, error
- Place in `/assets/animations/` directory

---

### Task 2: Build Game Components with Tamagui
**Priority:** HIGH
**Estimated Time:** 90 minutes
**Difficulty:** 🟡 Medium

#### Background
Games are a core engagement feature. These two components will be used in the Practice tab for interactive learning.

#### Requirements

**1. TapToMatchCard Component**

File: `/components/games/TapToMatchCard.tsx`

**Purpose:** Match Spanish words with English translations by tapping pairs.

**Features:**
- Grid of 8 cards (4 pairs)
- Card flip animation when tapped
- Matched pairs stay flipped (success state)
- Unmatched pairs flip back after 1 second
- Track matches (0/4)
- Success animation when all matched
- Use Tamagui Card component
- Haptic feedback on tap

**Props:**
```typescript
interface TapToMatchCardProps {
  pairs: Array<{
    id: string;
    spanish: string;
    english: string;
  }>;
  onComplete: (timeInSeconds: number) => void;
}
```

**UI Layout:**
```
┌──────────────────────────────────┐
│  Tap to Match - Food 🍕         │
│  Matches: 2/4            ⏱️ 0:15│
├──────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│  │Manzana│ │Apple│ │ Pan │ │Water││
│  └─────┘ └─────┘ └─────┘ └─────┘│
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│  │Bread│ │Agua │ │Leche│ │Milk ││
│  └─────┘ └─────┘ └─────┘ └─────┘│
└──────────────────────────────────┘
```

**Tamagui Usage:**
- Use `Card` component for each card
- Use `YStack` and `XStack` for layout
- Use `Button` variant="ghost" for card tappability
- Use `Text` for card content
- Animation: `animation="bouncy"` for card flip

**CRITICAL RULES:**
- ❌ NO `styled()` usage (doesn't exist in NativeWind v4)
- ✅ Use Tamagui's `styled` from `tamagui` package if needed
- ✅ Or use Tamagui components directly with props
- ❌ NO console.log statements

**2. MultipleChoiceCard Component**

File: `/components/games/MultipleChoiceCard.tsx`

**Purpose:** Hear a Spanish word, select the correct image from 4 options.

**Features:**
- Audio playback of Spanish word
- 4 image options in a grid
- Tap to select answer
- Visual feedback (green checkmark for correct, red X for incorrect)
- "Next" button after answer selected
- Progress tracker (Question 3/10)
- Use Tamagui Card for each image option

**Props:**
```typescript
interface MultipleChoiceCardProps {
  questions: Array<{
    id: string;
    audioUri: string;
    correctImageUri: string;
    word: string; // Spanish word
    translation: string; // English
    options: Array<{
      id: string;
      imageUri: string;
      label: string;
    }>;
  }>;
  onComplete: (score: number) => void;
}
```

**UI Layout:**
```
┌──────────────────────────────────┐
│  Multiple Choice 🎧  Question 3/10│
├──────────────────────────────────┤
│                                  │
│  🔊 Listen and select the image  │
│      [🔊 Replay Audio]           │
│                                  │
│  ┌─────────┐  ┌─────────┐       │
│  │  🍎     │  │  🍌     │       │
│  │ Apple   │  │ Banana  │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │  🍊     │  │  🍇     │       │
│  │ Orange  │  │ Grapes  │       │
│  └─────────┘  └─────────┘       │
│                                  │
│         [Next Question →]        │
└──────────────────────────────────┘
```

**Tamagui Usage:**
- Use `Card` with `interactive={true}` for selectable options
- Use `Button` for audio replay and next button
- Use `XStack` and `YStack` for layout
- Use `Text` for labels

#### Acceptance Criteria
- [ ] TapToMatchCard compiles and renders correctly
- [ ] Card flip animation works smoothly
- [ ] Matching logic works (correct pairs stay flipped)
- [ ] Timer tracks elapsed time
- [ ] onComplete callback fires with time
- [ ] MultipleChoiceCard compiles and renders
- [ ] Audio playback works (use expo-av)
- [ ] Image selection provides visual feedback
- [ ] Progress tracker updates correctly
- [ ] onComplete callback fires with score
- [ ] Both components use Tamagui (no NativeWind className)
- [ ] No TypeScript errors
- [ ] No console.log statements

---

### Task 3: Convert Auth Screens to Tamagui + Dark Mode
**Priority:** MEDIUM
**Estimated Time:** 60 minutes
**Difficulty:** 🟡 Medium

#### Background
The auth screens currently use NativeWind. Convert them to Tamagui to support dark mode automatically and improve performance.

#### Files to Convert
1. `/app/(auth)/login.tsx`
2. `/app/(auth)/signup.tsx`
3. `/app/(auth)/onboarding/welcome.tsx`

#### Requirements

**For Each Screen:**

**1. Replace React Native Components:**
```typescript
// ❌ OLD (NativeWind)
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

// ✅ NEW (Tamagui)
import { YStack, XStack, Text } from '@/components/ui/tamagui';
import { Button, Input, Card } from '@/components/ui/tamagui';
```

**2. Replace className with Tamagui Props:**

**Before (NativeWind):**
```typescript
<View className="flex-1 bg-white px-6 py-4">
  <Text className="text-2xl font-bold text-gray-900">Login</Text>
  <TextInput
    className="border border-gray-300 rounded-lg px-4 py-2"
    placeholder="Email"
  />
</View>
```

**After (Tamagui):**
```typescript
<YStack flex={1} backgroundColor="$background" paddingHorizontal="$6" paddingVertical="$4">
  <Text fontSize={24} fontWeight="bold" color="$color">
    Login
  </Text>
  <Input
    placeholder="Email"
    fullWidth
  />
</YStack>
```

**3. Add Dark Mode Support:**

Dark mode will work automatically through Tamagui's theme system. Use theme tokens:
- `$background` → auto-switches between light/dark
- `$color` → text color (auto-switches)
- `$primary` → brand color (works in both modes)
- `$borderColor` → border color (auto-switches)

**4. Use Tamagui Components:**
- Buttons → `<Button variant="primary">Login</Button>`
- Text Inputs → `<Input label="Email" placeholder="you@example.com" />`
- Cards → `<Card variant="elevated">...</Card>`

#### Example Conversion: Login Screen

**File:** `/app/(auth)/login.tsx`

```typescript
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { YStack, XStack, Text, Button, Input, Card } from '@/components/ui/tamagui';
import { supabase } from '@/lib/db/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$6"
        paddingTop="$10"
        gap="$6"
      >
        <YStack gap="$2">
          <Text fontSize={32} fontWeight="bold" color="$color">
            Welcome Back
          </Text>
          <Text fontSize={16} color="$textSecondary">
            Sign in to continue learning
          </Text>
        </YStack>

        <Card variant="elevated" padding="lg">
          <YStack gap="$5">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              fullWidth
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              fullWidth
            />

            {error && (
              <Text fontSize={14} color="$error">
                {error}
              </Text>
            )}

            <Button
              onPress={handleLogin}
              disabled={loading || !email || !password}
              fullWidth
              size="lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </YStack>
        </Card>

        <XStack justifyContent="center" gap="$2">
          <Text color="$textSecondary">Don't have an account?</Text>
          <Text
            color="$primary"
            fontWeight="600"
            onPress={() => router.push('/(auth)/signup')}
            cursor="pointer"
          >
            Sign Up
          </Text>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
```

#### Acceptance Criteria
- [ ] login.tsx converted to Tamagui
- [ ] signup.tsx converted to Tamagui
- [ ] welcome.tsx converted to Tamagui
- [ ] All screens work in light mode
- [ ] All screens work in dark mode (test by changing device settings)
- [ ] No className usage remaining
- [ ] All form validation still works
- [ ] Navigation still works
- [ ] No TypeScript errors
- [ ] No console.log statements

---

### Task 4: Self-Review & Documentation
**Priority:** CRITICAL ⚠️
**Estimated Time:** 20 minutes
**Difficulty:** 🟢 Easy

#### Requirements

**1. Code Review Checklist**

Go through ALL your code and verify:
- [ ] ❌ NO `styled()` from NativeWind used
- [ ] ❌ NO console.log statements
- [ ] ✅ All components use Tamagui components
- [ ] ✅ All TypeScript types are defined
- [ ] ✅ All props are documented
- [ ] ✅ Dark mode tokens used (`$background`, `$color`, etc.)
- [ ] ✅ Components compile without errors
- [ ] ✅ Components render correctly in expo

**2. Test Each Component**

For **each component you built**, test:
- Does it compile? (`npx expo start`)
- Does it render without errors?
- Do interactions work? (buttons, taps, etc.)
- Are animations smooth?
- Does dark mode work?

**3. Create Summary Document**

File: `/GEMINI_SESSION_3_SUMMARY.md`

```markdown
# Gemini Session 3 Summary

**Date:** November 21, 2025
**Tasks Completed:** X/4

## Task 1: Lottie Animation Components
- [ ] LottieLoader created
- [ ] LottieSuccess created
- [ ] LottieError created
- **Status:** ✅ Complete / ⏳ In Progress / ❌ Blocked
- **Notes:** Any issues or blockers

## Task 2: Game Components
- [ ] TapToMatchCard created
- [ ] MultipleChoiceCard created
- **Status:** ✅ Complete / ⏳ In Progress / ❌ Blocked
- **Notes:** Any issues or blockers

## Task 3: Auth Screen Conversion
- [ ] login.tsx converted
- [ ] signup.tsx converted
- [ ] welcome.tsx converted
- [ ] Dark mode tested
- **Status:** ✅ Complete / ⏳ In Progress / ❌ Blocked
- **Notes:** Any issues or blockers

## Task 4: Self-Review
- [ ] Code review checklist complete
- [ ] All components tested
- [ ] No console.log statements
- [ ] No NativeWind styled() usage
- **Status:** ✅ Complete

## Issues Encountered
(List any problems, errors, or questions)

## Questions for Claude
(List any clarifications needed)

## Time Spent
- Task 1: X minutes
- Task 2: X minutes
- Task 3: X minutes
- Task 4: X minutes
**Total:** X minutes
```

#### Acceptance Criteria
- [ ] All code reviewed against checklist
- [ ] All components tested
- [ ] Summary document created
- [ ] No console.log statements remain
- [ ] No critical errors

---

## 🚨 Critical Rules to Follow

### 1. NO NativeWind `styled()` Usage
**Why:** NativeWind v4 doesn't have a `styled()` function. It was the cause of critical errors in Session 2.

**❌ NEVER DO THIS:**
```typescript
import { styled } from 'nativewind';
const StyledView = styled(View, 'bg-blue-500'); // ❌ ERROR
```

**✅ DO THIS INSTEAD:**
```typescript
import { styled } from 'tamagui'; // ✅ Correct import
// Or use components directly without styled()
```

### 2. NO console.log Statements
Keep the code clean. Remove all debug logs before submitting.

### 3. Use Tamagui Theme Tokens
Always use theme tokens for colors:
- `$background` (not `#FFFFFF`)
- `$color` (not `#000000`)
- `$primary` (not `#6366F1`)

This ensures dark mode works automatically.

### 4. TypeScript Types Required
Every component must have:
- Props interface defined
- Proper return types
- No `any` types

### 5. Test Before Submitting
Run `npx expo start` and verify:
- App compiles
- Your components render
- No red error screens

---

## 📚 Resources

### Tamagui Documentation
- Components: https://tamagui.dev/docs/components
- Styling: https://tamagui.dev/docs/core/configuration
- Themes: https://tamagui.dev/docs/core/theme
- API Reference: https://tamagui.dev/docs/core/api-reference

### Project Files (Created by Claude)
- `tamagui.config.ts` - Full theme configuration
- `/components/ui/tamagui/Button.tsx` - Button examples
- `/components/ui/tamagui/Card.tsx` - Card examples
- `/components/ui/tamagui/Input.tsx` - Input examples
- `/components/ui/tamagui/Stack.tsx` - Layout examples
- `/docs/GEMINI_IMPLEMENTATION_GUIDE.md` - Comprehensive AI guide

### Expo Documentation
- expo-av (audio): https://docs.expo.dev/versions/latest/sdk/av/
- Lottie: https://docs.expo.dev/versions/latest/sdk/lottie/

---

## 💬 Communication

### If You Get Stuck
1. Check the project files listed above for examples
2. Read the Tamagui documentation
3. Document the issue in your summary
4. Ask Claude for clarification

### Reporting Issues
In your summary document, include:
- What you were trying to do
- What error occurred
- What you've tried to fix it
- Code snippet if relevant

---

## ⏱️ Timeline

**Total Estimated Time:** 200 minutes (~3.3 hours)

**Suggested Order:**
1. **Task 1:** Lottie components (30 min) - Start here, other tasks need this
2. **Task 2:** Game components (90 min) - Most complex, do when fresh
3. **Task 3:** Auth conversion (60 min) - Straightforward, good for later
4. **Task 4:** Self-review (20 min) - Always do last

**Breaks:**
- Take 10-minute break after each task
- Test frequently (don't wait until the end)

---

## ✅ Success Criteria

**Session 3 is successful when:**
- ✅ All 4 tasks completed
- ✅ All components compile without errors
- ✅ Dark mode works on all converted screens
- ✅ Games are interactive and functional
- ✅ Lottie animations render (even if placeholder)
- ✅ No console.log statements remain
- ✅ No NativeWind styled() usage
- ✅ Summary document created
- ✅ Code reviewed against checklist

---

**You've got this! 🚀 Remember: Quality over speed. Test as you go. Ask questions if stuck.**

**Good luck!** 🎉
