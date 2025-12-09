/**
 * TaskBriefCard - Writing Task Introduction
 *
 * Professional "About this lesson" style card that presents:
 * - Task title and scenario
 * - Goal and learning objectives
 * - Recommendations before starting
 * - Start button
 *
 * Design: Clean, professional, Notion/Obsidian inspired
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { WritingTask, TaskCategory } from './types';

interface TaskBriefCardProps {
  task: WritingTask;
  onStart: () => void;
  onBack?: () => void;
}

const CATEGORY_ICONS: Record<TaskCategory, keyof typeof Ionicons.glyphMap> = {
  daily_routine: 'sunny-outline',
  self_introduction: 'person-outline',
  job_interview: 'briefcase-outline',
  email: 'mail-outline',
  message: 'chatbubble-outline',
  travel: 'airplane-outline',
  opinion: 'bulb-outline',
  story: 'book-outline',
  custom: 'create-outline',
};

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  daily_routine: 'Daily Routine',
  self_introduction: 'Self Introduction',
  job_interview: 'Job Interview',
  email: 'Email',
  message: 'Message',
  travel: 'Travel',
  opinion: 'Opinion',
  story: 'Story',
  custom: 'Custom',
};

const DIFFICULTY_COLORS = {
  beginner: colors.success.DEFAULT,
  intermediate: colors.warning.DEFAULT,
  advanced: colors.error.DEFAULT,
};

export function TaskBriefCard({ task, onStart, onBack }: TaskBriefCardProps) {
  const haptics = useHaptics();
  const buttonScale = useSharedValue(1);

  const handleStart = useCallback(() => {
    haptics.medium();
    onStart();
  }, [haptics, onStart]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerBadges}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={CATEGORY_ICONS[task.category]}
              size={14}
              color={colors.text.secondary}
            />
            <Text style={styles.categoryText}>{CATEGORY_LABELS[task.category]}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: `${DIFFICULTY_COLORS[task.difficulty]}20` }]}>
            <View style={[styles.difficultyDot, { backgroundColor: DIFFICULTY_COLORS[task.difficulty] }]} />
            <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[task.difficulty] }]}>
              {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Title */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={styles.title}>{task.title}</Text>
        </Animated.View>

        {/* Scenario Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.scenarioCard}
        >
          <View style={styles.scenarioHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.scenarioLabel}>Your Task</Text>
          </View>
          <Text style={styles.scenarioText}>{task.scenario}</Text>
          {task.context && (
            <Text style={styles.contextText}>{task.context}</Text>
          )}
        </Animated.View>

        {/* Goal Section */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.goalSection}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="flag-outline" size={18} color={colors.secondary.DEFAULT} />
            <Text style={styles.sectionTitle}>Learning Goal</Text>
          </View>
          <Text style={styles.goalText}>{task.goal}</Text>
        </Animated.View>

        {/* Recommendations */}
        {task.recommendations.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            style={styles.recommendationsSection}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={18} color={colors.warning.DEFAULT} />
              <Text style={styles.sectionTitle}>Tips</Text>
            </View>
            <View style={styles.recommendationsList}>
              {task.recommendations.map((tip, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.duration(300).delay(500 + index * 80)}
                  style={styles.recommendationItem}
                >
                  <View style={styles.recommendationBullet}>
                    <Text style={styles.bulletText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.recommendationText}>{tip}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Word Count Guide */}
        {(task.minWords || task.maxWords) && (
          <Animated.View
            entering={FadeIn.duration(400).delay(600)}
            style={styles.wordGuide}
          >
            <Ionicons name="analytics-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.wordGuideText}>
              {task.minWords && task.maxWords
                ? `Aim for ${task.minWords}-${task.maxWords} words`
                : task.minWords
                ? `Minimum ${task.minWords} words`
                : `Maximum ${task.maxWords} words`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Animated.View style={[buttonStyle, styles.buttonWrapper]}>
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.9}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
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
              <Text style={styles.startButtonText}>Start Writing</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  headerBadges: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  scenarioCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scenarioLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scenarioText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: typography.fontSize.lg * 1.6,
  },
  contextText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
    lineHeight: typography.fontSize.base * 1.5,
  },
  goalSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.5,
    paddingLeft: spacing.lg + spacing.sm,
  },
  recommendationsSection: {
    marginBottom: spacing.lg,
  },
  recommendationsList: {
    gap: spacing.md,
    paddingLeft: spacing.lg + spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  recommendationBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  bulletText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  wordGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  wordGuideText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  bottomAction: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
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
});
