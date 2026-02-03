# Toast System Integration Guide

This guide shows how to integrate the Toast notification system into your Vox Language App.

## Step 1: Add ToastProvider to App Root

Update your `app/_layout.tsx` to wrap the app with `ToastProvider`:

```tsx
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { ToastProvider } from '@/components/ui'; // Add this import
import { validateEnvironment, logEnvironmentStatus } from '@/lib/config/env';
import { initializeFlashcardDB, insertSampleFlashcards } from '@/lib/db/flashcards';
import { initializeWordBankDatabase } from '@/lib/word-bank';
import { initializeReadingSessionsTable } from '@/lib/reading';
import { dbManager } from '@/lib/db/database';
import tamaguiConfig from '../tamagui.config';
import '../global.css';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function prepare() {
      try {
        console.log('🚀 Initializing Vox Language App...');
        logEnvironmentStatus();

        const envValidation = validateEnvironment();
        if (!envValidation.valid) {
          throw new Error(
            'Environment configuration errors:\n' + envValidation.errors.join('\n')
          );
        }

        console.log('📦 Initializing database...');
        await initializeFlashcardDB();

        console.log('📚 Initializing Word Bank...');
        const db = await dbManager.initialize();
        await initializeWordBankDatabase(db);

        console.log('🎤 Initializing Reading Sessions...');
        await initializeReadingSessionsTable(db);

        console.log('📚 Loading vocabulary...');
        await insertSampleFlashcards();

        console.log('✅ App initialized successfully!');
        setIsReady(true);
      } catch (e) {
        console.error('❌ Initialization error:', e);
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
      }
    }

    prepare();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold text-red-500 mb-4">
          Initialization Error
        </Text>
        <Text className="text-base text-gray-700 text-center mb-4">
          {error}
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Please check your configuration and restart the app.
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="text-lg text-gray-600 mt-4">
          Initializing...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        {/* Wrap Stack with ToastProvider */}
        <ToastProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#0A0E1A',
              },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="test-cards" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="reading-practice" options={{ headerShown: false }} />
            <Stack.Screen name="library" options={{ headerShown: false }} />
            <Stack.Screen name="about-lecture" options={{ headerShown: false }} />
            <Stack.Screen name="teleprompter" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="recordings" options={{ headerShown: false }} />
            <Stack.Screen name="completion" options={{ headerShown: false }} />
          </Stack>
        </ToastProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
```

## Step 2: Use in Components

Now you can use the toast in any component within your app:

### Example 1: Vocabulary Card with Toast

```tsx
import { useToast } from '@/components/ui';

export function VocabularyCard({ word, onComplete }) {
  const { showToast } = useToast();

  const handleCorrectAnswer = () => {
    showToast('Great job! Word learned.', 'success');
    onComplete(true);
  };

  const handleWrongAnswer = () => {
    showToast('Try again! You can do it.', 'error', {
      duration: 2000
    });
  };

  return (
    // ... your card UI
  );
}
```

### Example 2: Save Progress with Error Handling

```tsx
import { useToast } from '@/components/ui';

export function LessonScreen() {
  const { showToast } = useToast();

  const handleSaveProgress = async () => {
    try {
      await saveProgressToDatabase(currentProgress);
      showToast('Progress saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save progress', 'error', {
        duration: 5000,
        action: {
          label: 'Retry',
          onPress: handleSaveProgress
        }
      });
    }
  };

  return (
    // ... your lesson UI
  );
}
```

### Example 3: Network Status Notifications

```tsx
import { useEffect } from 'react';
import { useToast } from '@/components/ui';
import NetInfo from '@react-native-community/netinfo';

export function AppWrapper() {
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        showToast(
          'You are offline. Some features may be limited.',
          'warning',
          { duration: 5000 }
        );
      } else if (state.isConnected && previouslyDisconnected) {
        showToast('Back online!', 'success', { duration: 2000 });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    // ... your app content
  );
}
```

### Example 4: Flashcard Learning with Streaks

```tsx
import { useToast } from '@/components/ui';

export function FlashcardReview() {
  const { showToast } = useToast();

  const handleCardComplete = (correct: boolean) => {
    if (correct) {
      const streak = incrementStreak();
      if (streak % 5 === 0) {
        showToast(`${streak}-card streak! Keep going!`, 'success', {
          duration: 4000
        });
      } else {
        showToast('Correct!', 'success', { duration: 1500 });
      }
    } else {
      showToast('Review this card again', 'warning', { duration: 2000 });
    }
  };

  return (
    // ... your flashcard UI
  );
}
```

### Example 5: Lesson Completion

```tsx
import { useToast } from '@/components/ui';

export function LessonCompletionScreen({ xpEarned }) {
  const { showToast } = useToast();

  useEffect(() => {
    showToast(`Lesson completed! +${xpEarned} XP`, 'success', {
      duration: 4000
    });
  }, []);

  return (
    // ... your completion UI
  );
}
```

## Step 3: Replace Existing Alerts

Find and replace existing `Alert.alert()` calls with toasts where appropriate:

### Before:
```tsx
Alert.alert('Success', 'Your progress has been saved');
```

### After:
```tsx
const { showToast } = useToast();
showToast('Your progress has been saved', 'success');
```

## Best Practices

### 1. Choose the Right Variant

- **Success**: Completed actions, achievements, confirmations
  - "Progress saved successfully!"
  - "Lesson completed! +50 XP"
  - "Word added to favorites"

- **Error**: Failed operations, critical issues
  - "Failed to save progress"
  - "Network connection error"
  - "Unable to load lesson"

- **Warning**: Important notices, non-critical issues
  - "You are offline"
  - "Low storage space"
  - "Review this card again"

- **Info**: General information, tips, neutral messages
  - "New lesson available"
  - "Tip: Practice daily for best results"
  - "Swipe to see more cards"

### 2. Duration Guidelines

- **Quick feedback (1-2s)**: Simple confirmations ("Saved!", "Copied!")
- **Standard (3s)**: Default for most messages
- **Long (5s+)**: Important messages, messages with actions
- **No auto-dismiss (0)**: Critical errors requiring user action

### 3. When to Use Actions

Add action buttons for:
- Undo operations: "Deleted card" with "Undo" action
- Retry failed operations: "Network error" with "Retry" action
- Navigation: "New lesson available" with "View" action

### 4. Don't Overuse

Avoid showing toasts for:
- Every single user interaction (use visual feedback instead)
- Expected loading states (use loading indicators)
- Routine operations that don't need confirmation

### 5. Message Length

- Keep messages concise (1-2 lines)
- Use clear, action-oriented language
- Avoid technical jargon

## Common Use Cases in Vox Language App

### Vocabulary Learning
```tsx
showToast('Word mastered!', 'success');
showToast('Keep practicing this word', 'warning');
```

### Quiz Completion
```tsx
showToast(`Quiz complete! Score: ${score}/${total}`, 'success');
```

### Offline Mode
```tsx
showToast('Offline mode active', 'info', { duration: 5000 });
```

### Audio Recording
```tsx
showToast('Recording saved', 'success');
showToast('Recording failed', 'error', {
  action: { label: 'Retry', onPress: startRecording }
});
```

### Favorites
```tsx
showToast('Added to favorites', 'success');
showToast('Removed from favorites', 'info');
```

### Settings Changes
```tsx
showToast('Settings saved', 'success');
```

## Testing

Test your toast implementation:

```tsx
// In any screen for testing
import { useToast } from '@/components/ui';

function TestToastScreen() {
  const { showToast } = useToast();

  return (
    <View>
      <Button onPress={() => showToast('Success!', 'success')}>
        Test Success Toast
      </Button>
      <Button onPress={() => showToast('Error!', 'error')}>
        Test Error Toast
      </Button>
      <Button onPress={() => showToast('Warning!', 'warning')}>
        Test Warning Toast
      </Button>
      <Button onPress={() => showToast('Info!', 'info')}>
        Test Info Toast
      </Button>
    </View>
  );
}
```

## Troubleshooting

### Toast not appearing
1. Ensure `ToastProvider` is wrapping your component tree
2. Check that there are no z-index conflicts
3. Verify `useToast` is being called within the provider

### Multiple toasts overlapping
This shouldn't happen - toasts are automatically queued. If it does:
1. Check for multiple `ToastProvider` instances
2. Ensure you're using the same context

### Animation issues
1. Verify React Native Reanimated is properly configured
2. Check device performance
3. Ensure no conflicting animations are running

## Next Steps

1. Add `ToastProvider` to `app/_layout.tsx`
2. Replace existing alerts in your most-used screens
3. Test thoroughly on both iOS and Android
4. Gather user feedback on timing and placement
5. Consider adding custom variants for specific app features

## Support

For issues or questions:
- See `Toast.README.md` for detailed API documentation
- Check `Toast.example.tsx` for more usage examples
- Review `__tests__/components/ui/Toast.test.tsx` for test examples
