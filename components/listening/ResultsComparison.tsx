/**
 * ResultsComparison — Before/after score comparison screen
 *
 * Shows two score circles (before=muted, after=teal glow),
 * delta badge, motivational message, points badge, and action buttons.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LISTENING } from './theme';

interface ResultsComparisonProps {
  /** Stage 1 quiz score (correct count) */
  beforeScore: number;
  /** Stage 4 quiz score (correct count) */
  afterScore: number;
  /** Total questions */
  totalQuestions: number;
  /** Points earned */
  points: number;
  /** Generate a new exercise */
  onNewExercise: () => void;
  /** Continue / go back */
  onContinue: () => void;
  /** Label for the continue button */
  continueLabel: string;
}

function getResultMessage(before: number, after: number, total: number): string {
  const delta = after - before;
  const pctBefore = before / total;
  const pctAfter = after / total;

  if (pctAfter === 1 && pctBefore === 1) return 'Mastery from the start!';
  if (pctAfter === 1) return 'Perfect score!';
  if (delta > total * 0.5) return 'Impressive growth!';
  if (delta > 0) return "You're getting it!";
  if (delta === 0 && pctAfter >= 0.5) return 'Solid comprehension.';
  return 'Listening takes practice. Keep going.';
}

function getSubMessage(before: number, after: number, total: number): string {
  const delta = after - before;
  if (delta > 0) {
    return `You improved by ${delta} question${delta > 1 ? 's' : ''} after the scaffolding.`;
  }
  if (delta === 0 && after === total) {
    return 'You got every question right both times.';
  }
  if (delta === 0) {
    return 'Your score held steady. Try replaying the stages.';
  }
  return 'Comprehension takes repetition. Each attempt builds your ear.';
}

export default function ResultsComparison({
  beforeScore,
  afterScore,
  totalQuestions,
  points,
  onNewExercise,
  onContinue,
  continueLabel,
}: ResultsComparisonProps) {
  const delta = afterScore - beforeScore;

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      {/* Title */}
      <Text style={styles.title}>COMPREHENSION RESULTS</Text>

      {/* Score circles */}
      <View style={styles.scoresRow}>
        {/* Before circle */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(400).springify()}
          style={styles.scoreColumn}
        >
          <View
            style={styles.circleBefore}
            accessibilityLabel={`Before score: ${beforeScore} out of ${totalQuestions}`}
          >
            <Text style={styles.scoreNumberBefore}>{beforeScore}</Text>
            <Text style={styles.scoreDenominator}>of {totalQuestions}</Text>
          </View>
          <Text style={styles.circleLabelBefore}>BEFORE</Text>
        </Animated.View>

        {/* Delta badge */}
        <Animated.View
          entering={ZoomIn.delay(500).duration(300)}
          style={[
            styles.deltaBadge,
            delta === 0 && styles.deltaBadgeNeutral,
          ]}
        >
          <Text
            style={[
              styles.deltaBadgeText,
              delta === 0 && styles.deltaBadgeTextNeutral,
            ]}
          >
            {delta > 0 ? `+${delta}` : delta === 0 ? '=' : `${delta}`}
          </Text>
        </Animated.View>

        {/* After circle */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
          style={styles.scoreColumn}
        >
          <View
            style={[styles.circleAfter, styles.glowAfter]}
            accessibilityLabel={`After score: ${afterScore} out of ${totalQuestions}`}
          >
            <Text style={styles.scoreNumberAfter}>{afterScore}</Text>
            <Text style={styles.scoreDenominator}>of {totalQuestions}</Text>
          </View>
          <Text style={styles.circleLabelAfter}>AFTER</Text>
        </Animated.View>
      </View>

      {/* Message */}
      <Animated.View entering={FadeIn.delay(600).duration(300)}>
        <Text style={styles.message}>
          {getResultMessage(beforeScore, afterScore, totalQuestions)}
        </Text>
        <Text style={styles.subMessage}>
          {getSubMessage(beforeScore, afterScore, totalQuestions)}
        </Text>
      </Animated.View>

      {/* Points badge */}
      <Animated.View
        entering={FadeInDown.delay(700).duration(300)}
        style={styles.pointsBadge}
      >
        <Ionicons name="star" size={16} color={LISTENING.teal} />
        <Text style={styles.pointsBadgeText}>+{points} pts</Text>
      </Animated.View>

      {/* Action buttons */}
      <Animated.View
        entering={FadeInDown.delay(800).duration(300)}
        style={styles.actionsContainer}
      >
        <TouchableOpacity onPress={onNewExercise} activeOpacity={0.8}>
          <LinearGradient
            colors={LISTENING.tealGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>New Exercise</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onContinue}
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>{continueLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LISTENING.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: LISTENING.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 32,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
  },
  scoreColumn: {
    alignItems: 'center',
  },
  circleBefore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: LISTENING.grayBorder,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleAfter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: LISTENING.teal,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowAfter: {
    shadowColor: LISTENING.tealGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreNumberBefore: {
    fontSize: 30,
    fontWeight: '800',
    color: LISTENING.textTertiary,
  },
  scoreNumberAfter: {
    fontSize: 30,
    fontWeight: '800',
    color: LISTENING.teal,
  },
  scoreDenominator: {
    fontSize: 14,
    fontWeight: '500',
    color: LISTENING.textDisabled,
    marginTop: 2,
  },
  circleLabelBefore: {
    fontSize: 12,
    fontWeight: '600',
    color: LISTENING.textTertiary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  circleLabelAfter: {
    fontSize: 12,
    fontWeight: '600',
    color: LISTENING.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deltaBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: LISTENING.tealSubtle,
    borderColor: LISTENING.tealBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  deltaBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: LISTENING.teal,
  },
  deltaBadgeNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  deltaBadgeTextNeutral: {
    color: LISTENING.textTertiary,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: LISTENING.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: LISTENING.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    borderColor: 'rgba(6, 214, 160, 0.25)',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
  },
  pointsBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: LISTENING.teal,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: LISTENING.textSecondary,
  },
});
