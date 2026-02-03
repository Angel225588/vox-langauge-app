/**
 * WritingEditor - Encouraging Coach Design
 *
 * Clean, distraction-free writing with gentle encouragement:
 * - Category emoji + task title (read-only header)
 * - Full-screen writing card
 * - Milestone-based encouragement (non-distracting)
 * - Progress bar + word count inline
 * - Playful "Done! ✨" CTA
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, animation } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import { useHaptics } from '@/hooks/useHaptics';
import type { WritingTask, TaskCategory } from './types';

interface WritingEditorProps {
  task: WritingTask;
  initialTitle?: string;
  initialContent?: string;
  onComplete: (title: string, content: string) => void;
  onBack?: () => void;
}

// Category emojis matching TaskBriefCard
const CATEGORY_EMOJIS: Record<TaskCategory, string> = {
  daily_routine: '☀️',
  self_introduction: '👋',
  job_interview: '💼',
  email: '📧',
  message: '💬',
  travel: '✈️',
  opinion: '💡',
  story: '📖',
  custom: '✨',
};

// Milestone-based encouragement messages
// Only changes at specific thresholds, not every word
const ENCOURAGEMENT_MILESTONES = [
  { threshold: 0, message: "Start writing! Every word counts." },
  { threshold: 10, message: "Great start! Keep the words flowing..." },
  { threshold: 25, message: "You're making progress! 💪" },
  { threshold: 50, message: "Halfway there! You've got this." },
  { threshold: 75, message: "Almost done! Just a bit more." },
  { threshold: 100, message: "Amazing work! Finish strong! 🌟" },
];

// Get encouragement message based on word count
function getEncouragement(wordCount: number, minWords: number): string {
  // If they've hit the minimum, celebrate!
  if (minWords > 0 && wordCount >= minWords) {
    return "You did it! Ready to submit? ✨";
  }

  // Find the appropriate milestone
  for (let i = ENCOURAGEMENT_MILESTONES.length - 1; i >= 0; i--) {
    if (wordCount >= ENCOURAGEMENT_MILESTONES[i].threshold) {
      return ENCOURAGEMENT_MILESTONES[i].message;
    }
  }

  return ENCOURAGEMENT_MILESTONES[0].message;
}

export function WritingEditor({
  task,
  initialTitle = '',
  initialContent = '',
  onComplete,
  onBack,
}: WritingEditorProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const contentInputRef = useRef<TextInput>(null);

  const [content, setContent] = useState(initialContent);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Track the displayed encouragement separately to prevent constant updates
  const [displayedEncouragement, setDisplayedEncouragement] = useState(() =>
    getEncouragement(initialContent.trim().split(/\s+/).filter(Boolean).length, task.minWords || 0)
  );

  // Debounce timer for encouragement updates
  const encouragementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buttonScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const encouragementOpacity = useSharedValue(1);

  // Word count
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const minWords = task.minWords || 0;
  const progress = minWords > 0 ? Math.min(wordCount / minWords, 1) : Math.min(wordCount / 50, 1);

  const categoryEmoji = CATEGORY_EMOJIS[task.category] || '📝';

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Update progress animation
  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, { duration: 300 });
  }, [progress, progressWidth]);

  // Debounced encouragement update - only after 500ms pause
  useEffect(() => {
    if (encouragementTimer.current) {
      clearTimeout(encouragementTimer.current);
    }

    encouragementTimer.current = setTimeout(() => {
      const newEncouragement = getEncouragement(wordCount, minWords);
      if (newEncouragement !== displayedEncouragement) {
        // Fade out, update, fade in
        encouragementOpacity.value = withTiming(0, { duration: 150 }, () => {
          // This callback runs on UI thread, so we need runOnJS
        });

        // Update after fade out
        setTimeout(() => {
          setDisplayedEncouragement(newEncouragement);
          encouragementOpacity.value = withTiming(1, { duration: 200 });
        }, 150);
      }
    }, 500); // Wait 500ms after typing stops

    return () => {
      if (encouragementTimer.current) {
        clearTimeout(encouragementTimer.current);
      }
    };
  }, [wordCount, minWords, displayedEncouragement, encouragementOpacity]);

  const handleComplete = useCallback(() => {
    if (minWords > 0 && wordCount < minWords) {
      haptics.warning();
      return;
    }
    haptics.success();
    onComplete(task.title, content);
  }, [task.title, content, wordCount, minWords, haptics, onComplete]);

  const handleBack = useCallback(() => {
    haptics.light();
    onBack?.();
  }, [haptics, onBack]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const encouragementStyle = useAnimatedStyle(() => ({
    opacity: encouragementOpacity.value,
  }));

  const isComplete = minWords > 0 ? wordCount >= minWords : wordCount >= 10;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <BackButton onPress={handleBack} />

        {/* Task Title - Read Only */}
        <View style={styles.headerTitle}>
          <Text style={styles.headerEmoji}>{categoryEmoji}</Text>
          <Text style={styles.headerText} numberOfLines={1}>
            {task.title}
          </Text>
        </View>

        {/* Spacer for symmetry */}
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Editor Content */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Writing Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100).springify()}
          style={styles.writingCard}
        >
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing here..."
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
            autoFocus
          />
        </Animated.View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={[
        styles.bottomSection,
        { paddingBottom: isKeyboardVisible ? spacing.md : insets.bottom + spacing.md }
      ]}>
        {/* Encouragement Message - Subtle, milestone-based */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={[styles.encouragementContainer, encouragementStyle]}
        >
          <Text style={styles.encouragementText}>{displayedEncouragement}</Text>
        </Animated.View>

        {/* Progress Bar + Word Count Row */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                progressBarStyle,
                isComplete && styles.progressBarComplete,
              ]}
            />
          </View>
          <View style={styles.wordCountBadge}>
            <Text style={[styles.wordCountText, isComplete && styles.wordCountComplete]}>
              {wordCount}{minWords > 0 ? `/${minWords}` : ''}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <Animated.View style={[buttonStyle, styles.buttonWrapper]}>
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.9}
            disabled={!isComplete}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97, animation.spring.stiff);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, animation.spring.default);
            }}
            style={[styles.completeButton, !isComplete && styles.completeButtonDisabled]}
          >
            <LinearGradient
              colors={isComplete ? colors.gradients.primary : [colors.background.elevated, colors.background.elevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeButtonGradient}
            >
              <Text style={[
                styles.completeButtonText,
                !isComplete && styles.completeButtonTextDisabled,
              ]}>
                Done! ✨
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  headerSpacer: {
    width: 40, // Same width as BackButton for symmetry
  },

  // Editor
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  writingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    minHeight: 300,
    ...shadows.sm,
  },
  contentInput: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    lineHeight: typography.fontSize.lg * 1.6,
    minHeight: 260,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },

  // Encouragement
  encouragementContainer: {
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Progress Row
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.elevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 3,
  },
  progressBarComplete: {
    backgroundColor: colors.success.DEFAULT,
  },
  wordCountBadge: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  wordCountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  wordCountComplete: {
    color: colors.success.DEFAULT,
  },

  // Button
  buttonWrapper: {
    width: '100%',
  },
  completeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  completeButtonDisabled: {
    ...shadows.sm,
    shadowColor: 'transparent',
  },
  completeButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  completeButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
