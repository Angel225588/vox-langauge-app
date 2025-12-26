/**
 * Post-Call Feedback Screen (Redesigned)
 *
 * Minimalistic celebration screen with skill scores after voice conversation.
 *
 * Features:
 * - Celebration animation (fireworks/success)
 * - 3 Skill Cards: Fluency, Confidence, Comprehension
 * - Points earned display
 * - Continue & Practice Again buttons
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { ConversationMessage } from '@/lib/voice';
import { LottieSuccess } from '@/components/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

export interface PostCallFeedbackScreenProps {
  /** Conversation duration in seconds */
  duration: number;
  /** All conversation messages */
  messages: ConversationMessage[];
  /** Scenario title for display */
  scenarioTitle: string;
  /** Character name (optional) */
  characterName?: string;
  /** Callback to practice again */
  onPracticeAgain: () => void;
  /** Callback when done */
  onDone: () => void;
}

interface SkillScores {
  fluency: number;
  confidence: number;
  comprehension: number;
}

// =============================================================================
// Skill Score Calculator
// =============================================================================

function calculateSkillScores(
  messages: ConversationMessage[],
  duration: number
): SkillScores {
  const userMessages = messages.filter((m) => m.role === 'user');

  if (userMessages.length === 0) {
    return { fluency: 50, confidence: 50, comprehension: 50 };
  }

  // FLUENCY: Based on word count, turn count, conversation pace
  const totalWords = userMessages.reduce(
    (sum, m) => sum + m.content.split(/\s+/).filter(w => w.length > 0).length,
    0
  );
  const avgWordsPerTurn = totalWords / userMessages.length;
  const turnScore = Math.min(userMessages.length, 10) / 10; // Up to 10 turns = full score
  const wordScore = Math.min(avgWordsPerTurn, 15) / 15; // Up to 15 words/turn = full score
  const fluency = Math.round((wordScore * 50 + turnScore * 50));

  // CONFIDENCE: Based on response consistency, lack of hesitation markers
  const hesitantResponses = userMessages.filter((m) =>
    /\b(um|uh|hmm|err|i don't know|no sé)\b/i.test(m.content) ||
    m.content.length < 10 ||
    m.content.endsWith('?') && m.content.split(' ').length < 4
  ).length;
  const hesitationRatio = hesitantResponses / userMessages.length;
  const confidence = Math.round(Math.max(30, 100 - hesitationRatio * 60));

  // COMPREHENSION: Based on turn count and response relevance (simplified)
  // More turns = better comprehension (kept conversation going)
  const turnBonus = Math.min(userMessages.length * 8, 40);
  const baseComprehension = 60;
  const comprehension = Math.round(Math.min(100, baseComprehension + turnBonus));

  return {
    fluency: Math.min(100, Math.max(0, fluency)),
    confidence: Math.min(100, Math.max(0, confidence)),
    comprehension: Math.min(100, Math.max(0, comprehension)),
  };
}

// =============================================================================
// Skill Card Component
// =============================================================================

interface SkillCardProps {
  icon: string;
  label: string;
  score: number;
  color: string;
  delay: number;
}

const SkillCard: React.FC<SkillCardProps> = ({
  icon,
  label,
  score,
  color,
  delay,
}) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 150 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    // Progress bar fill animation
    progress.value = withDelay(
      delay + 200,
      withTiming(score / 100, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, [score, delay]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const getScoreColor = (s: number) => {
    if (s >= 70) return colors.success.DEFAULT;
    if (s >= 50) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  return (
    <Animated.View style={[skillStyles.card, cardStyle]}>
      <View style={skillStyles.cardHeader}>
        <View style={skillStyles.labelRow}>
          <Text style={skillStyles.icon}>{icon}</Text>
          <Text style={skillStyles.label}>{label}</Text>
        </View>
        <Text style={[skillStyles.score, { color: getScoreColor(score) }]}>
          {score}
        </Text>
      </View>
      <View style={skillStyles.progressTrack}>
        <Animated.View
          style={[
            skillStyles.progressFill,
            { backgroundColor: color },
            progressStyle,
          ]}
        />
      </View>
    </Animated.View>
  );
};

const skillStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  score: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.background.elevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

// =============================================================================
// Points Display Component
// =============================================================================

interface PointsDisplayProps {
  total: number;
  delay: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ total, delay }) => {
  const scale = useSharedValue(0);
  const [displayedPoints, setDisplayedPoints] = useState(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));

    // Count up animation
    const timeout = setTimeout(() => {
      const duration = 1200;
      const steps = 30;
      const increment = total / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= total) {
          setDisplayedPoints(total);
          clearInterval(interval);
        } else {
          setDisplayedPoints(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => clearTimeout(timeout);
  }, [total, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[pointsStyles.container, animatedStyle]}>
      <Ionicons name="star" size={28} color={colors.warning.DEFAULT} />
      <Text style={pointsStyles.points}>+{displayedPoints}</Text>
      <Text style={pointsStyles.label}>Points Earned</Text>
    </Animated.View>
  );
};

const pointsStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  points: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

// =============================================================================
// Main Component
// =============================================================================

export const PostCallFeedbackScreen: React.FC<PostCallFeedbackScreenProps> = ({
  duration,
  messages,
  scenarioTitle,
  characterName,
  onPracticeAgain,
  onDone,
}) => {
  const insets = useSafeAreaInsets();
  const [showSuccess, setShowSuccess] = useState(true);

  // Calculate skill scores
  const skills = useMemo(() => {
    return calculateSkillScores(messages, duration);
  }, [messages, duration]);

  // Calculate total points
  const points = useMemo(() => {
    const avgScore = (skills.fluency + skills.confidence + skills.comprehension) / 3;
    const base = Math.round(avgScore * 1.2); // 0-120 base
    const bonus = messages.length >= 6 ? 25 : 0; // Completion bonus
    return base + bonus;
  }, [skills, messages.length]);

  // Hide celebration after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Skill card configurations
  const SKILL_CARDS = [
    {
      icon: '🗣️',
      label: 'Fluency',
      score: skills.fluency,
      color: '#FF6B6B',
      delay: 2200,
    },
    {
      icon: '💪',
      label: 'Confidence',
      score: skills.confidence,
      color: '#8B5CF6',
      delay: 2400,
    },
    {
      icon: '🧠',
      label: 'Comprehension',
      score: skills.comprehension,
      color: '#06D6A0',
      delay: 2600,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Success Animation */}
      {showSuccess && (
        <Animated.View entering={FadeIn} style={styles.successOverlay}>
          <LottieSuccess message="Great job!" />
        </Animated.View>
      )}

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(2000).duration(400)}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Conversation Complete!</Text>
          <Text style={styles.headerSubtitle}>
            {characterName ? `with ${characterName}` : scenarioTitle}
          </Text>
        </Animated.View>

        {/* Skill Cards */}
        <View style={styles.skillCardsContainer}>
          {SKILL_CARDS.map((skill) => (
            <SkillCard
              key={skill.label}
              icon={skill.icon}
              label={skill.label}
              score={skill.score}
              color={skill.color}
              delay={skill.delay}
            />
          ))}
        </View>

        {/* Points */}
        <PointsDisplay total={points} delay={2800} />
      </View>

      {/* Bottom Actions */}
      <Animated.View
        entering={FadeInUp.delay(3200).duration(400)}
        style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onPracticeAgain}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={colors.text.secondary} />
          <Text style={styles.secondaryButtonText}>Practice Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onDone}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  skillCardsContainer: {
    marginBottom: spacing.md,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  primaryButtonArrow: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});

export default PostCallFeedbackScreen;
