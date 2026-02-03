# Path Generation Service - Quick Start Guide

**5-Minute Setup Guide** for using the path generation service.

---

## 1. Basic Usage (Simplest)

```typescript
import { createPersonalizedPath } from '@/lib/services/pathGeneration';

// Get data from onboarding
const { user } = useAuth();
const { data } = useOnboardingV2();

// Create the path
const result = await createPersonalizedPath(user.id, data);

// Handle result
if (result.success) {
  console.log('Path created:', result.pathId);
  router.push('/(tabs)/home');
} else {
  Alert.alert('Error', result.error);
}
```

---

## 2. In a React Component

```typescript
import { useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';
import { Button } from '@/components/ui/Button';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingV2();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    setLoading(true);

    try {
      const result = await createPersonalizedPath(user.id, onboardingData);

      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', result.error || 'Failed to create path');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Your path is ready!</Text>
      <Button onPress={handleGetStarted} disabled={loading}>
        {loading ? <ActivityIndicator /> : 'Get Started'}
      </Button>
    </View>
  );
}
```

---

## 3. With React Query (Recommended)

```typescript
import { useMutation } from '@tanstack/react-query';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';

function useCreatePath() {
  return useMutation({
    mutationFn: ({ userId, data }) =>
      createPersonalizedPath(userId, data),
    onSuccess: (result) => {
      if (result.success) {
        console.log('Path created:', result.pathId);
      } else {
        console.error('Failed:', result.error);
      }
    },
  });
}

// In your component:
export default function OnboardingComplete() {
  const router = useRouter();
  const { user } = useAuth();
  const { data } = useOnboardingV2();
  const createPath = useCreatePath();

  const handleSubmit = () => {
    createPath.mutate(
      { userId: user.id, data },
      {
        onSuccess: (result) => {
          if (result.success) {
            router.replace('/(tabs)/home');
          } else {
            Alert.alert('Error', result.error);
          }
        },
      }
    );
  };

  return (
    <Button
      onPress={handleSubmit}
      loading={createPath.isPending}
      disabled={createPath.isPending}
    >
      Create My Path
    </Button>
  );
}
```

---

## 4. What You Need

### Required Environment Variable

```bash
# .env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com

### Required Data Structure

```typescript
// From useOnboardingV2 hook
const onboardingData = {
  native_language: 'English',        // Required
  target_language: 'Spanish',        // Required
  motivation: 'travel',              // Required (or motivation_custom)
  motivation_custom: null,           // Optional
  why_now: 'Trip next year',         // Optional
  proficiency_level: 'beginner',     // Required
  previous_attempts: null,           // Optional
  timeline: '3-6_months',            // Required
  commitment_stakes: 'I want to...',  // Required (min 20 chars)
};
```

---

## 5. Error Handling

```typescript
const result = await createPersonalizedPath(userId, data);

if (!result.success) {
  // Show appropriate error message
  switch (result.error) {
    case 'Native language is required':
      Alert.alert('Missing Info', 'Please select your native language');
      break;

    case 'Target language is required':
      Alert.alert('Missing Info', 'Please select the language you want to learn');
      break;

    case 'Motivation is required':
      Alert.alert('Missing Info', 'Please tell us why you want to learn');
      break;

    case 'Proficiency level is required':
      Alert.alert('Missing Info', 'Please select your proficiency level');
      break;

    case 'Timeline is required':
      Alert.alert('Missing Info', 'Please select your learning timeline');
      break;

    case 'Commitment stakes are required':
      Alert.alert('Missing Info', 'Please share what this means to you');
      break;

    default:
      Alert.alert('Error', result.error || 'Something went wrong');
  }
}
```

---

## 6. Testing

### Test with Valid Data

```typescript
const testData = {
  native_language: 'English',
  target_language: 'Spanish',
  motivation: 'travel',
  motivation_custom: null,
  why_now: 'Planning a trip',
  proficiency_level: 'beginner',
  previous_attempts: null,
  timeline: '3-6_months',
  commitment_stakes: 'I want to travel confidently and make local friends',
};

const result = await createPersonalizedPath('test_user_123', testData);
console.log('Result:', result);
// Expected: { success: true, pathId: "path_test_user_123_..." }
```

### Test with Invalid Data

```typescript
const invalidData = {
  native_language: null,  // Missing!
  target_language: 'Spanish',
  motivation: null,       // Missing!
  motivation_custom: null,
  why_now: null,
  proficiency_level: null, // Missing!
  previous_attempts: null,
  timeline: null,          // Missing!
  commitment_stakes: null, // Missing!
};

const result = await createPersonalizedPath('test_user_123', invalidData);
console.log('Result:', result);
// Expected: { success: false, error: "Native language is required" }
```

---

## 7. What Happens Behind the Scenes

When you call `createPersonalizedPath()`:

1. **Validates** onboarding data
2. **Transforms** data to AI-compatible format
3. **Calls Gemini AI** to generate a personalized path
   - OR falls back to template if AI fails
4. **Stores path** in database (currently stubbed)
   - Creates learning_path record
   - Creates section record (5-7 stairs)
   - Creates individual stair records
5. **Initializes user AI memory** for future personalization
6. **Returns** result with path ID or error

**Total time:** 2-6 seconds

---

## 8. Next Steps After Path Creation

```typescript
const result = await createPersonalizedPath(userId, data);

if (result.success) {
  // Path created successfully!

  // 1. Navigate to home screen
  router.replace('/(tabs)/home');

  // 2. Show success message
  Toast.show({
    type: 'success',
    text1: 'Path Created!',
    text2: 'Your personalized learning journey is ready',
  });

  // 3. Optional: Track analytics
  analytics.track('path_created', {
    pathId: result.pathId,
    motivation: onboardingData.motivation,
    targetLanguage: onboardingData.target_language,
  });

  // 4. Optional: Fetch the created path
  // const path = await fetchLearningPath(result.pathId);
}
```

---

## 9. Common Issues

### Issue: "Cannot find module '@/lib/services/pathGeneration'"

**Solution:** Make sure you're using the `@/` path alias. Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "EXPO_PUBLIC_GEMINI_API_KEY environment variable is not set"

**Solution:** Add the API key to your `.env` file:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

Then restart the Expo server:

```bash
npx expo start -c
```

### Issue: AI generation fails

**Don't worry!** The service automatically falls back to template-based generation. You'll still get a functional learning path.

### Issue: Database errors

**Current status:** Database storage is stubbed. The service logs what would be created but doesn't actually store data yet. This is expected and noted in the TODO comments.

---

## 10. Full Example File

See `/lib/services/pathGeneration.example.ts` for comprehensive examples including:

- Basic usage
- React component integration
- Error handling
- Different motivations (travel, career, relationship)
- React Query integration
- Custom motivations

---

## Need Help?

- **Documentation:** `/lib/services/README.md`
- **Examples:** `/lib/services/pathGeneration.example.ts`
- **Types:** `/types/learning.ts`
- **Architecture:** `/docs/LEARNING_PATH_SYSTEM.md`

---

**Happy path generation!** 🚀
