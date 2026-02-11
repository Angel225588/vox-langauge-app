/**
 * ResultsCard
 *
 * Displays calibration results with skill radar visualization.
 * Shows CEFR level, per-skill breakdown, and AI recommendations.
 * Celebrates completion with points earned.
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { CalibrationResult, CEFRLevel, ProbeType } from '@/types/calibration';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ResultsCardProps {
  result: CalibrationResult;
  onContinue: () => void;
}

// CEFR level descriptions
const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A0: 'Just starting out',
  A1: 'Basic understanding',
  A2: 'Elementary level',
  B1: 'Intermediate level',
  B2: 'Upper intermediate',
  C1: 'Advanced level',
  C2: 'Near-native proficiency',
};

// Skill icons
const SKILL_ICONS: Record<ProbeType, keyof typeof Ionicons.glyphMap> = {
  vocabulary: 'book-outline',
  listening: 'ear-outline',
  speaking: 'mic-outline',
  writing: 'create-outline',
};

// CEFR level to numeric value for visualization
const LEVEL_VALUES: Record<CEFRLevel, number> = {
  A0: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

interface SkillBarProps {
  skill: ProbeType;
  level: CEFRLevel;
  confidence: number;
  delay: number;
}

function SkillBar({ skill, level, confidence, delay }: SkillBarProps) {
  const progress = useSharedValue(0);
  const targetProgress = (LEVEL_VALUES[level] + 1) / 7; // 0-1 scale

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(targetProgress, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [targetProgress, delay]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={styles.skillBarContainer}
    >
      <View style={styles.skillBarHeader}>
        <View style={styles.skillBarLeft}>
          <View style={styles.skillIconContainer}>
            <Ionicons
              name={SKILL_ICONS[skill]}
              size={18}
              color={colors.primary.light}
            />
          </View>
          <Text style={styles.skillName}>
            {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </Text>
        </View>
        <View style={styles.skillBarRight}>
          <Text style={styles.skillLevel}>{level}</Text>
          <View style={styles.confidenceDots}>
            {[1, 2, 3].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.confidenceDot,
                  confidence >= dot / 3 && styles.confidenceDotFilled,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.skillBarTrack}>
        <Animated.View style={[styles.skillBarFill, barStyle]}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* Level markers */}
        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l, i) => (
          <View
            key={l}
            style={[
              styles.levelMarker,
              { left: `${((i + 1) / 7) * 100}%` },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

export function ResultsCard({ result, onContinue }: ResultsCardProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  // Celebration animation
  const celebrationScale = useSharedValue(0);
  const pointsScale = useSharedValue(0);

  useEffect(() => {
    haptics.success();
    celebrationScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    pointsScale.value = withDelay(
      500,
      withSequence(
        withSpring(1.3, { damping: 6, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      )
    );
  }, []);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
  }));

  const continueScale = useSharedValue(1);
  const continueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueScale.value }],
  }));

  const handleContinue = () => {
    haptics.medium();
    onContinue();
  };

  const skills = Object.entries(result.skills).filter(
    ([_, v]) => v !== undefined
  ) as [ProbeType, NonNullable<(typeof result.skills)[ProbeType]>][];

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <Animated.View
          entering={FadeIn.delay(100)}
          style={[styles.celebrationContainer, celebrationStyle]}
        >
          <LinearGradient
            colors={['rgba(0, 54, 255, 0.2)', 'rgba(0, 163, 255, 0.1)']}
            style={styles.celebrationGradient}
          >
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Calibration Complete!</Text>
            <Text style={styles.celebrationSubtitle}>
              Your personalized path is ready
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Points Earned */}
        <Animated.View
          entering={ZoomIn.delay(400)}
          style={[styles.pointsCard, pointsStyle]}
        >
          <Ionicons name="star" size={20} color={colors.warning.DEFAULT} />
          <Text style={styles.pointsText}>
            +{result.pointsEarned} points earned
          </Text>
        </Animated.View>

        {/* Overall Level */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.levelCard}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelBadge}
          >
            <Text style={styles.levelBadgeText}>{result.calibratedLevel}</Text>
          </LinearGradient>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Your Level</Text>
            <Text style={styles.levelDescription}>
              {LEVEL_DESCRIPTIONS[result.calibratedLevel]}
            </Text>
          </View>
        </Animated.View>

        {/* Skill Breakdown */}
        <Animated.View
          entering={FadeInDown.delay(800).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Skill Breakdown</Text>
          {skills.map(([skill, assessment], index) => (
            <SkillBar
              key={skill}
              skill={skill}
              level={assessment.estimatedLevel}
              confidence={assessment.confidence}
              delay={900 + index * 150}
            />
          ))}
        </Animated.View>

        {/* Recommendations */}
        <Animated.View
          entering={FadeInDown.delay(1400).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Your Learning Path</Text>

          {/* Starting Point */}
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="flag-outline" size={20} color={colors.success.light} />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationLabel}>Starting Point</Text>
              <Text style={styles.recommendationText}>
                {result.recommendations.startingPoint}
              </Text>
            </View>
          </View>

          {/* Focus Areas */}
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="locate-outline" size={20} color={colors.primary.light} />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationLabel}>Focus Areas</Text>
              <View style={styles.tagContainer}>
                {result.recommendations.focusAreas.map((area, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Time Estimate */}
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="time-outline" size={20} color={colors.warning.light} />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationLabel}>Next Milestone</Text>
              <Text style={styles.recommendationText}>
                {result.recommendations.estimatedTimeToNextLevel}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInUp.delay(1600)}
          style={styles.statsRow}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{result.probesCompleted}</Text>
            <Text style={styles.statLabel}>Probes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(result.totalTime / 1000)}s
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{skills.length}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => {
            continueScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            continueScale.value = withSpring(1, { damping: 15, stiffness: 300 });
          }}
          style={[styles.continueButton, continueStyle]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Start Learning</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  celebrationContainer: {
    marginBottom: spacing.md,
  },
  celebrationGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.2)',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  celebrationTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  celebrationSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  pointsText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning.light,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelBadgeText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  skillBarContainer: {
    marginBottom: spacing.md,
  },
  skillBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  skillBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  skillName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  skillBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skillLevel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  confidenceDots: {
    flexDirection: 'row',
    gap: 3,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border.medium,
  },
  confidenceDotFilled: {
    backgroundColor: colors.primary.light,
  },
  skillBarTrack: {
    height: 8,
    backgroundColor: colors.background.elevated,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border.dark,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.dark,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  continueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
