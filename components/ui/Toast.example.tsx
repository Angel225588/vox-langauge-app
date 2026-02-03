/**
 * Toast Component - Usage Examples
 *
 * This file demonstrates how to use the Toast notification system in the Vox Language App.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ToastProvider, useToast } from './ToastProvider';
import { PremiumButton } from './PremiumButton';
import { spacing } from '@/constants/designSystem';

/**
 * Example 1: Basic Toast Usage
 *
 * Show simple toast notifications with different variants
 */
function BasicToastExample() {
  const { showToast } = useToast();

  return (
    <View style={styles.section}>
      <PremiumButton
        onPress={() => showToast('Changes saved successfully!', 'success')}
      >
        Success Toast
      </PremiumButton>

      <PremiumButton
        onPress={() => showToast('Something went wrong. Please try again.', 'error')}
      >
        Error Toast
      </PremiumButton>

      <PremiumButton
        onPress={() => showToast('This action cannot be undone', 'warning')}
      >
        Warning Toast
      </PremiumButton>

      <PremiumButton
        onPress={() => showToast('New lesson available!', 'info')}
      >
        Info Toast
      </PremiumButton>
    </View>
  );
}

/**
 * Example 2: Custom Duration
 *
 * Control how long the toast stays visible
 */
function CustomDurationExample() {
  const { showToast } = useToast();

  return (
    <View style={styles.section}>
      <PremiumButton
        onPress={() => showToast(
          'This will disappear in 1 second',
          'info',
          { duration: 1000 }
        )}
      >
        Quick Toast (1s)
      </PremiumButton>

      <PremiumButton
        onPress={() => showToast(
          'This will stay for 5 seconds',
          'info',
          { duration: 5000 }
        )}
      >
        Long Toast (5s)
      </PremiumButton>
    </View>
  );
}

/**
 * Example 3: Toast with Action Button
 *
 * Add an action button for user interaction
 */
function ToastWithActionExample() {
  const { showToast } = useToast();

  const handleUndo = () => {
    console.log('Undo action triggered');
    // Implement undo logic here
  };

  return (
    <View style={styles.section}>
      <PremiumButton
        onPress={() => showToast(
          'Lesson deleted',
          'success',
          {
            duration: 5000,
            action: {
              label: 'Undo',
              onPress: handleUndo
            }
          }
        )}
      >
        Toast with Undo Action
      </PremiumButton>

      <PremiumButton
        onPress={() => showToast(
          'Connection lost',
          'error',
          {
            duration: 0, // Won't auto-dismiss
            action: {
              label: 'Retry',
              onPress: () => console.log('Retry triggered')
            }
          }
        )}
      >
        Toast with Retry Action
      </PremiumButton>
    </View>
  );
}

/**
 * Example 4: Real-world Use Cases
 *
 * Practical examples from the Vox Language App
 */
function RealWorldExamples() {
  const { showToast } = useToast();

  const handleSaveProgress = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  const handleOfflineMode = () => {
    showToast(
      'You are offline. Some features may be limited.',
      'warning',
      { duration: 5000 }
    );
  };

  const handleLessonComplete = () => {
    showToast('Lesson completed! +50 XP', 'success', {
      duration: 4000
    });
  };

  const handleStreakMaintained = () => {
    showToast('5-day streak maintained!', 'success', {
      duration: 4000
    });
  };

  return (
    <View style={styles.section}>
      <PremiumButton onPress={handleSaveProgress}>
        Save Progress
      </PremiumButton>

      <PremiumButton onPress={handleOfflineMode}>
        Simulate Offline
      </PremiumButton>

      <PremiumButton onPress={handleLessonComplete}>
        Complete Lesson
      </PremiumButton>

      <PremiumButton onPress={handleStreakMaintained}>
        Maintain Streak
      </PremiumButton>
    </View>
  );
}

/**
 * Example 5: Setup in App Root
 *
 * Wrap your app with ToastProvider at the root level
 */
/*
// In your app/_layout.tsx or root component:

import { ToastProvider } from '@/components/ui';

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* ... other screens *\/}
      </Stack>
    </ToastProvider>
  );
}
*/

/**
 * Main Example Component
 *
 * Shows all toast examples
 */
function ToastExamples() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BasicToastExample />
      <CustomDurationExample />
      <ToastWithActionExample />
      <RealWorldExamples />
    </ScrollView>
  );
}

/**
 * Export wrapped with ToastProvider
 */
export default function ToastExampleScreen() {
  return (
    <ToastProvider>
      <ToastExamples />
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
});

/**
 * API Reference:
 *
 * showToast(message, variant, options)
 *
 * Parameters:
 * - message: string - The text to display in the toast
 * - variant: 'success' | 'error' | 'warning' | 'info' - Visual style (default: 'info')
 * - options: ToastOptions (optional)
 *   - duration: number - Auto-dismiss duration in ms (default: 3000, 0 = no auto-dismiss)
 *   - action: { label: string, onPress: () => void } - Optional action button
 *
 * Features:
 * - Automatic queueing (only one toast shown at a time)
 * - Spring physics animations
 * - Haptic feedback based on variant
 * - Safe area aware positioning
 * - Dismissible by user interaction
 * - Follows design system tokens
 *
 * Design Variants:
 * - success: Green with checkmark icon + success haptic
 * - error: Red with X icon + error haptic
 * - warning: Amber with alert icon + warning haptic
 * - info: Indigo with info icon + light haptic
 */
