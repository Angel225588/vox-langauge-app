/**
 * TaskBriefCard - Writing Task Introduction
 *
 * Motivational and playful design that presents:
 * - Category emoji + Task title
 * - Scenario description
 * - Collapsible tips section
 * - Encouraging message
 * - Playful CTA button
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, shadows, animation } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import type { WritingTask, TaskCategory } from './types';

interface TaskBriefCardProps {
  task: WritingTask;
  onStart: () => void;
  onBack?: () => void;
}

// Category emojis for visual personality
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

// Encouraging messages to motivate users
const ENCOURAGEMENT_MESSAGES = [
  "You've got this! Just write naturally.",
  "Don't worry about mistakes - that's how we learn!",
  "Express yourself freely, we'll polish it together.",
  "Take your time, there's no rush.",
  "Every word you write makes you better!",
];

// Get difficulty label with emoji
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '🌱 Beginner';
    case 'intermediate': return '🌿 Intermediate';
    case 'advanced': return '🌳 Advanced';
    default: return difficulty;
  }
};

// Get random encouragement message
const getEncouragement = () => {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
};

export function TaskBriefCard({ task, onStart, onBack }: TaskBriefCardProps) {
  const insets = useSafeAreaInsets();
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [encouragement] = useState(getEncouragement);

  const buttonScale = useSharedValue(1);
  const tipsHeight = useSharedValue(0);
  const tipsRotation = useSharedValue(0);

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  }, [onStart]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  }, [onBack]);

  const toggleTips = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTipsExpanded(prev => !prev);
    tipsHeight.value = withSpring(tipsExpanded ? 0 : 1, animation.spring.default);
    tipsRotation.value = withSpring(tipsExpanded ? 0 : 1, animation.spring.default);
  }, [tipsExpanded, tipsHeight, tipsRotation]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const tipsContainerStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(
      tipsHeight.value,
      [0, 1],
      [0, 300],
      Extrapolation.CLAMP
    ),
    opacity: tipsHeight.value,
    marginTop: interpolate(tipsHeight.value, [0, 1], [0, spacing.md]),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(tipsRotation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const categoryEmoji = CATEGORY_EMOJIS[task.category] || '📝';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <BackButton onPress={handleBack} />
        <View style={styles.headerSpacer} />
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{getDifficultyLabel(task.difficulty)}</Text>
        </View>
      </Animated.View>

      {/* Main Content Card */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100).springify()}
        style={styles.mainCard}
      >
        {/* Category Emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{categoryEmoji}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{task.title}</Text>

        {/* Scenario */}
        <Text style={styles.scenario}>{task.scenario}</Text>

        {/* Context (if available) */}
        {task.context && (
          <Text style={styles.context}>{task.context}</Text>
        )}
      </Animated.View>

      {/* Encouragement Quote */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.quoteContainer}
      >
        <View style={styles.quoteBar} />
        <Text style={styles.quoteText}>{encouragement}</Text>
      </Animated.View>

      {/* Collapsible Tips */}
      {task.recommendations && task.recommendations.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.tipsCard}
        >
          <TouchableOpacity
            onPress={toggleTips}
            style={styles.tipsHeader}
            activeOpacity={0.7}
          >
            <View style={styles.tipsHeaderLeft}>
              <Text style={styles.tipsIcon}>💡</Text>
              <Text style={styles.tipsLabel}>Quick tips</Text>
            </View>
            <Animated.View style={chevronStyle}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.text.tertiary}
              />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={[styles.tipsContent, tipsContainerStyle]}>
            {task.recommendations.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>✨</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Bottom CTA */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + spacing.md }]}>
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />
        <Animated.View style={[buttonStyle, styles.buttonWrapper]}>
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.9}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97, animation.spring.stiff);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, animation.spring.default);
            }}
            style={styles.startButton}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <Ionicons name="pencil" size={20} color={colors.text.primary} />
              <Text style={styles.startButtonText}>Let's Write!</Text>
              {(task.minWords || task.maxWords) && (
                <Text style={styles.wordCountText}>
                  ({task.minWords}+ words)
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
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
  headerSpacer: {
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  difficultyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Main Card
  mainCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  emojiContainer: {
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: typography.fontSize['2xl'] * 1.2,
  },
  scenario: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  context: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.5,
  },

  // Quote
  quoteContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  quoteBar: {
    width: 3,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  quoteText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipsIcon: {
    fontSize: 18,
  },
  tipsLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tipsContent: {
    overflow: 'hidden',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipBullet: {
    fontSize: 14,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Bottom Action
  bottomAction: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  bottomGradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },
  buttonWrapper: {
    width: '100%',
  },
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  startButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  wordCountText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: spacing.xs,
  },
});
