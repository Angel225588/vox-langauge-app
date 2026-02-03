/**
 * SpeakingResultsCard - Honest Feedback with Effort Points
 *
 * Premium results card that shows:
 * - Honest, accurate feedback (not always positive)
 * - Effort-based points (more tries = more points!)
 * - Milestone achievements
 * - Raw accuracy data
 * - Clear areas for improvement
 *
 * Philosophy: Being honest IS being helpful
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  useSharedValue,
  Easing,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import type {
  SpeakingSessionResult,
  HonestFeedback,
  EffortPoints,
  Milestone,
  WordAnalysis,
} from '@/lib/speaking/speakingFeedbackTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Score ring dimensions
const RING_SIZE = 140;
const RING_RADIUS = 58;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface SpeakingResultsCardProps {
  result: SpeakingSessionResult;
  celebration: {
    pointsMessage: string;
    mistakeMessage: string;
    milestoneMessages: Array<{ title: string; message: string; emoji: string }>;
    overallTone: 'celebrate' | 'encourage' | 'support';
  };
  onTryAgain: () => void;
  onContinue: () => void;
}

export function SpeakingResultsCard({
  result,
  celebration,
  onTryAgain,
  onContinue,
}: SpeakingResultsCardProps) {
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);

  // Animation values
  const scoreProgress = useSharedValue(0);
  const pointsScale = useSharedValue(0);

  const { feedback, points, milestonesAchieved } = result;
  const accuracy = feedback.accuracyPercent;

  // Animate on mount
  useEffect(() => {
    scoreProgress.value = withDelay(
      300,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
    );
    pointsScale.value = withDelay(
      800,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Show milestone celebration if any achieved
    if (milestonesAchieved.length > 0) {
      setTimeout(() => {
        setShowMilestones(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
    }
  }, []);

  // Animated styles
  const ringAnimatedProps = useAnimatedProps(() => {
    const progress = (accuracy / 100) * scoreProgress.value;
    return {
      strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress),
    };
  });

  const scoreTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scoreProgress.value, [0, 0.5, 1], [0, 1, 1]),
    transform: [{ scale: interpolate(scoreProgress.value, [0, 0.5, 1], [0.8, 1.05, 1]) }],
  }));

  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
    opacity: pointsScale.value,
  }));

  // Get score color based on honest thresholds
  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success.DEFAULT;
    if (score >= 70) return '#F59E0B'; // Amber
    if (score >= 50) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  const scoreColor = getScoreColor(accuracy);

  // Get tone-based styling
  const getToneColor = () => {
    switch (celebration.overallTone) {
      case 'celebrate': return colors.success.DEFAULT;
      case 'encourage': return '#F59E0B';
      case 'support': return colors.accent.primary;
    }
  };

  if (showDetails) {
    return (
      <DetailedView
        feedback={feedback}
        points={points}
        insets={insets}
        onBack={() => setShowDetails(false)}
        onTryAgain={onTryAgain}
        onContinue={onContinue}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Milestone Celebration Overlay */}
        {showMilestones && milestonesAchieved.length > 0 && (
          <MilestoneCelebration
            milestones={celebration.milestoneMessages}
            onClose={() => setShowMilestones(false)}
          />
        )}

        {/* Points Banner */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(600)}
          style={pointsStyle}
        >
          <LinearGradient
            colors={[getToneColor(), `${getToneColor()}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pointsBanner}
          >
            <Text style={styles.pointsValue}>+{points.totalPoints}</Text>
            <Text style={styles.pointsLabel}>points earned</Text>
          </LinearGradient>
        </Animated.View>

        {/* Score Ring */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.scoreContainer}
        >
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background circle */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={`${scoreColor}20`}
              strokeWidth={RING_STROKE}
              fill="transparent"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={scoreColor}
              strokeWidth={RING_STROKE}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              animatedProps={ringAnimatedProps}
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>

          <Animated.View style={[styles.scoreTextContainer, scoreTextStyle]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {accuracy}%
            </Text>
            <Text style={styles.scoreLabel}>accuracy</Text>
          </Animated.View>
        </Animated.View>

        {/* Honest Summary */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={styles.summaryContainer}
        >
          <Text style={styles.summaryText}>
            {feedback.honestSummary}
          </Text>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(300)}
          style={styles.statsRow}
        >
          <StatBadge
            label="Words"
            value={`${feedback.wordsCorrect}/${feedback.wordsTotal}`}
            color={scoreColor}
          />
          <StatBadge
            label="WPM"
            value={feedback.wpm.toString()}
            color={colors.accent.primary}
          />
          <StatBadge
            label="Mistakes"
            value={`+${points.mistakePoints}`}
            subLabel="bonus!"
            color={colors.success.DEFAULT}
          />
        </Animated.View>

        {/* Points Breakdown (Collapsible) */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={styles.section}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.sectionTitle}>Points Breakdown</Text>
          </TouchableOpacity>
          <Text style={styles.breakdownText}>
            {points.breakdown}
          </Text>
          <Text style={styles.motivationText}>
            {celebration.mistakeMessage}
          </Text>
        </Animated.View>

        {/* Areas Needing Work (if any) */}
        {feedback.areasNeedingWork.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Areas to Practice</Text>
            {feedback.areasNeedingWork.map((area, index) => (
              <View key={index} style={styles.areaItem}>
                <View style={[styles.areaDot, { backgroundColor: colors.warning.DEFAULT }]} />
                <Text style={styles.areaText}>{area}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Actual Strengths (only if they exist) */}
        {feedback.actualStrengths.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>What Went Well</Text>
            {feedback.actualStrengths.map((strength, index) => (
              <View key={index} style={styles.areaItem}>
                <View style={[styles.areaDot, { backgroundColor: colors.success.DEFAULT }]} />
                <Text style={styles.areaText}>{strength}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Words to Focus */}
        {feedback.wordsToFocus.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(700)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>
              Words to Practice ({feedback.wordsToFocus.length})
            </Text>
            <View style={styles.wordsGrid}>
              {feedback.wordsToFocus.slice(0, 6).map((word, index) => (
                <WordChip key={index} word={word} />
              ))}
            </View>
            {feedback.wordsToFocus.length > 6 && (
              <TouchableOpacity onPress={() => setShowDetails(true)}>
                <Text style={styles.showMoreText}>
                  +{feedback.wordsToFocus.length - 6} more
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Next Step */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(800)}
          style={styles.nextStepContainer}
        >
          <Text style={styles.nextStepLabel}>Next Step</Text>
          <Text style={styles.nextStepText}>{feedback.nextStep}</Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(900)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onTryAgain();
            }}
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: getToneColor() }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onContinue();
            }}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* View Details Link */}
        <TouchableOpacity
          style={styles.detailsLink}
          onPress={() => setShowDetails(true)}
        >
          <Text style={styles.detailsLinkText}>View Detailed Analysis</Text>
        </TouchableOpacity>

        {/* Milestones Achieved */}
        {milestonesAchieved.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(1000)}
            style={styles.milestonesPreview}
          >
            <TouchableOpacity onPress={() => setShowMilestones(true)}>
              <Text style={styles.milestonesPreviewText}>
                {milestonesAchieved.map(m =>
                  celebration.milestoneMessages.find(cm => cm.title.includes(m.name))?.emoji || '🏆'
                ).join(' ')} {milestonesAchieved.length} milestone{milestonesAchieved.length > 1 ? 's' : ''} achieved!
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatBadge({ label, value, subLabel, color }: {
  label: string;
  value: string;
  subLabel?: string;
  color: string;
}) {
  return (
    <View style={styles.statBadge}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
    </View>
  );
}

function WordChip({ word }: { word: WordAnalysis }) {
  const getSeverityColor = () => {
    switch (word.severity) {
      case 'critical': return colors.error.DEFAULT;
      case 'significant': return colors.warning.DEFAULT;
      case 'moderate': return '#F59E0B';
      default: return colors.text.tertiary;
    }
  };

  return (
    <View style={[styles.wordChip, { borderColor: getSeverityColor() }]}>
      <Text style={styles.wordChipText}>{word.expected}</Text>
      {word.issueType && (
        <Text style={[styles.wordChipIssue, { color: getSeverityColor() }]}>
          {word.issueType}
        </Text>
      )}
    </View>
  );
}

function MilestoneCelebration({ milestones, onClose }: {
  milestones: Array<{ title: string; message: string; emoji: string }>;
  onClose: () => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.milestoneOverlay}
    >
      <View style={styles.milestoneCard}>
        <Text style={styles.milestoneTitle}>Milestone Achieved!</Text>
        {milestones.map((m, i) => (
          <View key={i} style={styles.milestoneItem}>
            <Text style={styles.milestoneEmoji}>{m.emoji}</Text>
            <View>
              <Text style={styles.milestoneName}>{m.title}</Text>
              <Text style={styles.milestoneDesc}>{m.message}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.milestoneClose} onPress={onClose}>
          <Text style={styles.milestoneCloseText}>Awesome!</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function DetailedView({
  feedback,
  points,
  insets,
  onBack,
  onTryAgain,
  onContinue,
}: {
  feedback: HonestFeedback;
  points: EffortPoints;
  insets: { top: number; bottom: number };
  onBack: () => void;
  onTryAgain: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.detailedTitle}>Detailed Analysis</Text>

        {/* Raw Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Raw Data</Text>
          <View style={styles.metricsGrid}>
            <MetricRow label="Accuracy" value={`${feedback.accuracyPercent}%`} />
            <MetricRow label="Words Correct" value={`${feedback.wordsCorrect}/${feedback.wordsTotal}`} />
            <MetricRow label="WPM" value={feedback.wpm.toString()} />
            {feedback.technicalMetrics && (
              <>
                <MetricRow label="Articulation" value={`${feedback.technicalMetrics.articulationScore}`} />
                <MetricRow label="Fluency" value={`${feedback.technicalMetrics.fluencyScore}`} />
                <MetricRow label="Completion" value={`${feedback.technicalMetrics.completionRate}%`} />
                <MetricRow label="Hesitations" value={feedback.technicalMetrics.hesitationCount.toString()} />
                <MetricRow label="Avg Pause" value={`${feedback.technicalMetrics.averagePauseDuration}ms`} />
              </>
            )}
          </View>
        </View>

        {/* All Problem Words */}
        {feedback.detailedAnalysis && feedback.detailedAnalysis.filter(w => !w.isCorrect).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Issues</Text>
            {feedback.detailedAnalysis
              .filter(w => !w.isCorrect)
              .map((word, i) => (
                <View key={i} style={styles.detailedWordItem}>
                  <View style={styles.detailedWordHeader}>
                    <Text style={styles.detailedWordExpected}>{word.expected}</Text>
                    <Text style={[styles.detailedWordIssue, {
                      color: word.severity === 'critical' ? colors.error.DEFAULT : colors.warning.DEFAULT
                    }]}>
                      {word.issueType}
                    </Text>
                  </View>
                  {word.spoken && (
                    <Text style={styles.detailedWordSpoken}>
                      You said: "{word.spoken}"
                    </Text>
                  )}
                  {word.explanation && (
                    <Text style={styles.detailedWordExplanation}>
                      {word.explanation}
                    </Text>
                  )}
                  {word.practiceAdvice && (
                    <Text style={styles.detailedWordAdvice}>
                      Tip: {word.practiceAdvice}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* Points Explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points Earned</Text>
          <Text style={styles.breakdownText}>{points.breakdown}</Text>
        </View>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.accent.primary }]}
            onPress={onContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  pointsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  pointsValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginRight: spacing.sm,
  },
  pointsLabel: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    opacity: 0.9,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  summaryContainer: {
    marginBottom: spacing.lg,
  },
  summaryText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  statBadge: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statSubLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.success.DEFAULT,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  breakdownText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  motivationText: {
    fontSize: typography.fontSize.sm,
    color: colors.success.DEFAULT,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  areaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  areaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wordChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    backgroundColor: colors.background.secondary,
  },
  wordChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  wordChipIssue: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  showMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.primary,
    marginTop: spacing.sm,
  },
  nextStepContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  nextStepLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextStepText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tryAgainButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  continueButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  continueText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  detailsLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailsLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.primary,
    textDecorationLine: 'underline',
  },
  milestonesPreview: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  milestonesPreviewText: {
    fontSize: typography.fontSize.md,
    color: colors.success.DEFAULT,
    fontWeight: typography.fontWeight.medium,
  },

  // Milestone overlay
  milestoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  milestoneCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    width: SCREEN_WIDTH - spacing.xl * 2,
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  milestoneEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  milestoneName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  milestoneDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  milestoneClose: {
    backgroundColor: colors.success.DEFAULT,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  milestoneCloseText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },

  // Back button
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.accent.primary,
  },

  // Detailed view
  detailedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  detailedWordItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  detailedWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailedWordExpected: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  detailedWordIssue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  detailedWordSpoken: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  detailedWordExplanation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  detailedWordAdvice: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.primary,
  },
});
