/**
 * WritingAnalysisView - AI Feedback Results
 *
 * Displays the AI analysis of user's writing:
 * - Overall scores (grammar, vocabulary, clarity)
 * - Corrections list (one-by-one animated)
 * - Corrected text preview
 * - Save to Notes button
 *
 * Design: Clear, educational, motivating
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { CorrectionCard } from './CorrectionCard';
import type { WritingAnalysis, GrammarCorrection, WritingTask } from './types';

interface WritingAnalysisViewProps {
  task: WritingTask;
  originalText: string;
  title: string;
  analysis: WritingAnalysis;
  onSaveToNotes: () => void;
  onPracticeInTeleprompter?: () => void;
  onBack?: () => void;
}

interface ScoreRingProps {
  score: number;
  label: string;
  color: string;
  delay?: number;
}

function ScoreRing({ score, label, color, delay = 0 }: ScoreRingProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(score / 100, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [score, delay]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 360}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(delay)}
      style={styles.scoreRing}
    >
      <View style={styles.scoreRingOuter}>
        <View style={[styles.scoreRingProgress, { borderColor: color }]}>
          <View style={styles.scoreRingInner}>
            <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.scoreLabel}>{label}</Text>
    </Animated.View>
  );
}

export function WritingAnalysisView({
  task,
  originalText,
  title,
  analysis,
  onSaveToNotes,
  onPracticeInTeleprompter,
  onBack,
}: WritingAnalysisViewProps) {
  const haptics = useHaptics();
  const [expandedCorrection, setExpandedCorrection] = useState<number | null>(0);
  const [acceptedCorrections, setAcceptedCorrections] = useState<Set<string>>(new Set());
  const [showCorrectedText, setShowCorrectedText] = useState(false);

  const buttonScale = useSharedValue(1);

  const handleAcceptCorrection = useCallback((correction: GrammarCorrection) => {
    setAcceptedCorrections(prev => new Set(prev).add(correction.id));
  }, []);

  const handleToggleExpand = useCallback((index: number) => {
    setExpandedCorrection(prev => prev === index ? null : index);
  }, []);

  const handleToggleCorrectedText = useCallback(() => {
    haptics.light();
    setShowCorrectedText(!showCorrectedText);
  }, [showCorrectedText, haptics]);

  const handleSave = useCallback(() => {
    haptics.success();
    onSaveToNotes();
  }, [haptics, onSaveToNotes]);

  const handlePractice = useCallback(() => {
    haptics.medium();
    onPracticeInTeleprompter?.();
  }, [haptics, onPracticeInTeleprompter]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const correctionsCount = analysis.corrections.length;
  const acceptedCount = acceptedCorrections.size;
  const allAccepted = acceptedCount === correctionsCount;

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Analysis</Text>
          <View style={styles.correctionsBadge}>
            <Text style={styles.correctionsBadgeText}>
              {correctionsCount} {correctionsCount === 1 ? 'correction' : 'corrections'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Preview */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.titleSection}
        >
          <Text style={styles.noteTitle}>{title}</Text>
        </Animated.View>

        {/* Scores Section */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.scoresSection}
        >
          <ScoreRing
            score={analysis.grammarScore}
            label="Grammar"
            color={colors.primary.DEFAULT}
            delay={300}
          />
          <ScoreRing
            score={analysis.vocabularyScore}
            label="Vocabulary"
            color={colors.secondary.DEFAULT}
            delay={400}
          />
          <ScoreRing
            score={analysis.clarityScore}
            label="Clarity"
            color={colors.accent.purple}
            delay={500}
          />
        </Animated.View>

        {/* Overall Feedback */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.feedbackSection}
        >
          <View style={styles.feedbackHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.success.DEFAULT} />
            <Text style={styles.feedbackLabel}>Feedback</Text>
          </View>
          <Text style={styles.feedbackText}>{analysis.overallFeedback}</Text>
        </Animated.View>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            style={styles.strengthsSection}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={16} color={colors.warning.DEFAULT} />
              <Text style={styles.sectionTitle}>Strengths</Text>
            </View>
            <View style={styles.strengthsList}>
              {analysis.strengths.map((strength, index) => (
                <View key={index} style={styles.strengthItem}>
                  <Ionicons name="checkmark" size={14} color={colors.success.DEFAULT} />
                  <Text style={styles.strengthText}>{strength}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Corrections List */}
        {correctionsCount > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(500)}
            style={styles.correctionsSection}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="pencil-outline" size={16} color={colors.error.DEFAULT} />
              <Text style={styles.sectionTitle}>Corrections</Text>
              <Text style={styles.progressText}>
                {acceptedCount}/{correctionsCount} reviewed
              </Text>
            </View>

            <View style={styles.correctionsList}>
              {analysis.corrections.map((correction, index) => (
                <CorrectionCard
                  key={correction.id}
                  correction={correction}
                  index={index}
                  onAccept={handleAcceptCorrection}
                  isExpanded={expandedCorrection === index}
                  onToggleExpand={() => handleToggleExpand(index)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Corrected Text Toggle */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(600)}
          style={styles.correctedTextSection}
        >
          <TouchableOpacity
            onPress={handleToggleCorrectedText}
            style={styles.correctedTextToggle}
            activeOpacity={0.8}
          >
            <View style={styles.toggleLeft}>
              <Ionicons
                name={showCorrectedText ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.primary.DEFAULT}
              />
              <Text style={styles.toggleText}>
                {showCorrectedText ? 'Hide' : 'Show'} Corrected Text
              </Text>
            </View>
            <Ionicons
              name={showCorrectedText ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          {showCorrectedText && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.correctedTextBox}
            >
              <Text style={styles.correctedTextContent}>{analysis.correctedText}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {onPracticeInTeleprompter && (
          <TouchableOpacity
            onPress={handlePractice}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Ionicons name="mic-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Practice</Text>
          </TouchableOpacity>
        )}

        <Animated.View style={[buttonStyle, styles.primaryButtonWrapper]}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.9}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
            style={styles.saveButton}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="bookmark" size={20} color={colors.text.primary} />
              <Text style={styles.saveButtonText}>Save to Notes</Text>
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
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  correctionsBadge: {
    backgroundColor: `${colors.error.DEFAULT}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  correctionsBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error.DEFAULT,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingBottom: spacing.xl,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  noteTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scoresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  scoreRing: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreRingOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingProgress: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackSection: {
    backgroundColor: `${colors.success.DEFAULT}10`,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.success.DEFAULT}20`,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedbackLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  strengthsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  strengthsList: {
    gap: spacing.sm,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  strengthText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  correctionsSection: {
    marginBottom: spacing.lg,
  },
  correctionsList: {
    gap: spacing.md,
  },
  correctedTextSection: {
    marginBottom: spacing.lg,
  },
  correctedTextToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.DEFAULT,
  },
  correctedTextBox: {
    backgroundColor: colors.background.elevated,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  correctedTextContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  primaryButtonWrapper: {
    flex: 1,
  },
  saveButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
