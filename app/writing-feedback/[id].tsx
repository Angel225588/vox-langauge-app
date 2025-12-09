/**
 * WritingFeedbackDetail Screen
 *
 * Philosophy: "Confidence comes from a safe space where evolution is the reward"
 *
 * Features:
 * - Encouragement FIRST (emoji + celebratory message)
 * - Strengths section BEFORE improvements
 * - Positive framing: "tip" and "suggestion" (never "error" or "wrong")
 * - Visual score rings (gentle, not harsh numbers)
 * - Growth areas with expandable cards
 * - Before/After text comparison toggle
 * - Progress tracking vs previous attempts
 * - Actions: Practice in Teleprompter | Edit Note
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import type {
  WritingFeedbackData,
  WritingCorrection,
  FeedbackImprovement,
  FeedbackStrength,
} from '@/components/feedback/types';
import { getPositiveLabel } from '@/components/feedback/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCORE_RING_SIZE = 90;
const SCORE_RING_STROKE = 8;

// Mock data for development (replace with actual data fetching)
const MOCK_FEEDBACK_DATA: WritingFeedbackData = {
  id: '1',
  noteId: 'note-1',
  title: 'My First Essay',
  category: 'Writing Practice',
  completedAt: new Date().toISOString(),
  timeSpentMs: 1200000, // 20 minutes
  grammarScore: 85,
  vocabularyScore: 78,
  clarityScore: 92,
  overallScore: 85,
  originalText:
    'Today I go to the park and see many peoples. The weather was very good and I feel happy. I think that nature is important for our lifes.',
  correctedText:
    'Today I went to the park and saw many people. The weather was very good and I felt happy. I think that nature is important for our lives.',
  corrections: [
    {
      id: '1',
      type: 'grammar',
      original: 'I go',
      corrected: 'I went',
      explanation: 'When talking about past events, use the past tense form of the verb.',
      rule: 'Past tense for completed actions',
      betterWayToSay: 'I went to the park',
    },
    {
      id: '2',
      type: 'vocabulary',
      original: 'many peoples',
      corrected: 'many people',
      explanation: '"People" is already plural, so we don\'t add "s".',
      betterWayToSay: 'many people',
    },
    {
      id: '3',
      type: 'spelling',
      original: 'lifes',
      corrected: 'lives',
      explanation: 'The plural of "life" is "lives".',
      betterWayToSay: 'our lives',
    },
  ],
  strengths: [
    {
      id: '1',
      text: 'Great use of descriptive words like "happy" and "good"',
      icon: 'checkmark-circle',
    },
    {
      id: '2',
      text: 'Clear structure with a beginning, middle, and end',
      icon: 'checkmark-circle',
    },
    {
      id: '3',
      text: 'Nice personal reflection about nature',
      icon: 'checkmark-circle',
    },
  ],
  improvements: [
    {
      id: '1',
      area: 'Past Tense Consistency',
      suggestion: 'Practice using past tense verbs when describing events that already happened.',
      priority: 'high',
      examples: ['go → went', 'see → saw', 'feel → felt'],
    },
    {
      id: '2',
      area: 'Irregular Plurals',
      suggestion: 'Some words have special plural forms. "People" is already plural!',
      priority: 'medium',
      examples: ['person → people', 'child → children', 'life → lives'],
    },
  ],
  encouragementMessage: 'Outstanding work! Your dedication is paying off!',
  celebrationEmoji: '🎉',
  progress: {
    previousAttempts: 3,
    grammarTrend: {
      metric: 'Grammar',
      previousValue: 75,
      currentValue: 85,
      trend: 'up',
      message: '+10 points since last time',
    },
    vocabularyTrend: {
      metric: 'Vocabulary',
      previousValue: 80,
      currentValue: 78,
      trend: 'stable',
      message: 'Staying consistent',
    },
    commonPatterns: ['Past tense verbs', 'Article usage'],
  },
};

export default function WritingFeedbackDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // TODO: Fetch actual feedback data based on ID
  const feedbackData = MOCK_FEEDBACK_DATA;

  // State
  const [expandedCorrections, setExpandedCorrections] = useState<Set<string>>(new Set());
  const [expandedImprovements, setExpandedImprovements] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const toggleCorrection = useCallback((correctionId: string) => {
    setExpandedCorrections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(correctionId)) {
        newSet.delete(correctionId);
      } else {
        newSet.add(correctionId);
      }
      return newSet;
    });
  }, []);

  const toggleImprovement = useCallback((improvementId: string) => {
    setExpandedImprovements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(improvementId)) {
        newSet.delete(improvementId);
      } else {
        newSet.add(improvementId);
      }
      return newSet;
    });
  }, []);

  const handlePracticeInTeleprompter = useCallback(() => {
    // TODO: Navigate to teleprompter with corrected text
    router.push('/teleprompter');
  }, [router]);

  const handleEditNote = useCallback(() => {
    // TODO: Navigate to edit note screen
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <BackButton onPress={handleBack} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Feedback</Text>
            <Text style={styles.headerSubtitle}>{feedbackData.title}</Text>
          </View>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Encouragement Banner - FIRST! */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.encouragementBanner}
            >
              <Text style={styles.celebrationEmoji}>{feedbackData.celebrationEmoji}</Text>
              <Text style={styles.encouragementText}>{feedbackData.encouragementMessage}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Score Rings Row - Visual, Not Harsh */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.scoresSection}>
            <Text style={styles.sectionTitle}>How You Did</Text>
            <View style={styles.scoreRingsRow}>
              <ScoreRing
                label="Grammar"
                score={feedbackData.grammarScore}
                color={colors.success.DEFAULT}
                delay={300}
              />
              <ScoreRing
                label="Vocabulary"
                score={feedbackData.vocabularyScore}
                color={colors.accent.purple}
                delay={400}
              />
              <ScoreRing
                label="Clarity"
                score={feedbackData.clarityScore}
                color={colors.secondary.DEFAULT}
                delay={500}
              />
            </View>
          </Animated.View>

          {/* Your Writing Section - Show Original & Corrected */}
          <Animated.View entering={FadeInDown.duration(400).delay(550)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color={colors.primary.DEFAULT} />
              <Text style={styles.sectionTitle}>Your Writing</Text>
              <TouchableOpacity
                onPress={() => setShowComparison(!showComparison)}
                style={styles.toggleButton}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleButtonText}>
                  {showComparison ? 'Show Corrected' : 'Show Original'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.writingContainer}>
              <Text style={styles.writingLabel}>
                {showComparison ? 'What you wrote:' : 'Corrected version:'}
              </Text>
              <Text style={[
                styles.writingText,
                showComparison && styles.writingTextOriginal
              ]}>
                {showComparison ? feedbackData.originalText : feedbackData.correctedText}
              </Text>
            </View>
          </Animated.View>

          {/* Strengths Section - BEFORE Improvements! */}
          {feedbackData.strengths.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(600)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={24} color={colors.warning.DEFAULT} />
                <Text style={styles.sectionTitle}>What You Did Great</Text>
              </View>
              <View style={styles.strengthsList}>
                {feedbackData.strengths.map((strength, index) => (
                  <StrengthItem key={strength.id} strength={strength} index={index} />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Growth Areas Section - Gentle, Expandable */}
          {feedbackData.improvements.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(700)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={24} color={colors.primary.DEFAULT} />
                <Text style={styles.sectionTitle}>Growth Opportunities</Text>
              </View>
              <View style={styles.improvementsList}>
                {feedbackData.improvements.map((improvement) => (
                  <ImprovementCard
                    key={improvement.id}
                    improvement={improvement}
                    isExpanded={expandedImprovements.has(improvement.id)}
                    onToggle={() => toggleImprovement(improvement.id)}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Detailed Corrections List - Expandable */}
          {feedbackData.corrections.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color={colors.accent.orange} />
                <Text style={styles.sectionTitle}>Better Ways to Say</Text>
              </View>
              <View style={styles.correctionsList}>
                {feedbackData.corrections.map((correction) => (
                  <CorrectionCard
                    key={correction.id}
                    correction={correction}
                    isExpanded={expandedCorrections.has(correction.id)}
                    onToggle={() => toggleCorrection(correction.id)}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Before/After Text Comparison Toggle */}
          <Animated.View entering={FadeInDown.duration(400).delay(900)} style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowComparison(!showComparison)}
              activeOpacity={0.8}
              style={styles.comparisonToggle}
            >
              <View style={styles.comparisonToggleInner}>
                <Ionicons
                  name={showComparison ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.comparisonToggleText}>
                  {showComparison ? 'Hide' : 'Show'} Before & After
                </Text>
                <Ionicons
                  name={showComparison ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.text.tertiary}
                />
              </View>
            </TouchableOpacity>

            {showComparison && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.comparisonContainer}>
                {/* Before */}
                <View style={styles.textComparisonCard}>
                  <View style={styles.textComparisonHeader}>
                    <Text style={styles.textComparisonLabel}>Before</Text>
                  </View>
                  <Text style={styles.textComparisonContent}>{feedbackData.originalText}</Text>
                </View>

                {/* After */}
                <View style={[styles.textComparisonCard, styles.textComparisonCardAfter]}>
                  <View style={styles.textComparisonHeader}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success.DEFAULT} />
                    <Text style={styles.textComparisonLabel}>After</Text>
                  </View>
                  <Text style={styles.textComparisonContent}>{feedbackData.correctedText}</Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Progress Section (if available) */}
          {feedbackData.progress && (
            <Animated.View entering={FadeInDown.duration(400).delay(1000)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="analytics" size={24} color={colors.accent.cyan} />
                <Text style={styles.sectionTitle}>Your Progress</Text>
              </View>
              <View style={styles.progressCards}>
                <ProgressCard trend={feedbackData.progress.grammarTrend} />
                <ProgressCard trend={feedbackData.progress.vocabularyTrend} />
              </View>
              <View style={styles.attemptsBadge}>
                <Ionicons name="trophy" size={16} color={colors.warning.DEFAULT} />
                <Text style={styles.attemptsText}>
                  {feedbackData.progress.previousAttempts + 1} practice sessions completed
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Spacer for bottom actions */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Fixed Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            onPress={handleEditNote}
            activeOpacity={0.8}
            style={styles.secondaryActionButton}
          >
            <View style={styles.secondaryActionButtonInner}>
              <Ionicons name="create-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.secondaryActionButtonText}>Edit Note</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePracticeInTeleprompter}
            activeOpacity={0.8}
            style={styles.primaryActionButton}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryActionButtonGradient}
            >
              <Ionicons name="mic" size={20} color={colors.text.primary} />
              <Text style={styles.primaryActionButtonText}>Practice in Teleprompter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =====================================================================
// SCORE RING COMPONENT
// =====================================================================

interface ScoreRingProps {
  label: string;
  score: number;
  color: string;
  delay: number;
}

function ScoreRing({ label, score, color, delay }: ScoreRingProps) {
  const radius = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2;
  const circumference = radius * 2 * Math.PI;
  // Calculate the offset based on score (0-100 maps to full circumference to 0)
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Animated.View entering={FadeIn.duration(400).delay(delay)} style={styles.scoreRingContainer}>
      <View style={styles.scoreRingWrapper}>
        <Svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE}>
          {/* Background circle */}
          <Circle
            cx={SCORE_RING_SIZE / 2}
            cy={SCORE_RING_SIZE / 2}
            r={radius}
            stroke={colors.border.light}
            strokeWidth={SCORE_RING_STROKE}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={SCORE_RING_SIZE / 2}
            cy={SCORE_RING_SIZE / 2}
            r={radius}
            stroke={color}
            strokeWidth={SCORE_RING_STROKE}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SCORE_RING_SIZE / 2} ${SCORE_RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.scoreRingCenter}>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>
      <Text style={styles.scoreLabel}>{label}</Text>
    </Animated.View>
  );
}

// =====================================================================
// STRENGTH ITEM COMPONENT
// =====================================================================

interface StrengthItemProps {
  strength: FeedbackStrength;
  index: number;
}

function StrengthItem({ strength, index }: StrengthItemProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 100)}
      style={styles.strengthItem}
    >
      <View style={styles.strengthIconContainer}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
      </View>
      <Text style={styles.strengthText}>{strength.text}</Text>
    </Animated.View>
  );
}

// =====================================================================
// IMPROVEMENT CARD COMPONENT
// =====================================================================

interface ImprovementCardProps {
  improvement: FeedbackImprovement;
  isExpanded: boolean;
  onToggle: () => void;
}

function ImprovementCard({ improvement, isExpanded, onToggle }: ImprovementCardProps) {
  const priorityColors = {
    high: colors.accent.orange,
    medium: colors.accent.purple,
    low: colors.accent.cyan,
  };

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={styles.improvementCard}>
      <View style={styles.improvementCardHeader}>
        <View style={styles.improvementCardTitleRow}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColors[improvement.priority] }]} />
          <Text style={styles.improvementCardTitle}>{improvement.area}</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.tertiary}
        />
      </View>

      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.improvementCardContent}>
          <Text style={styles.improvementSuggestion}>{improvement.suggestion}</Text>
          {improvement.examples && improvement.examples.length > 0 && (
            <View style={styles.improvementExamples}>
              <Text style={styles.improvementExamplesLabel}>Examples:</Text>
              {improvement.examples.map((example, index) => (
                <View key={index} style={styles.improvementExampleItem}>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary.DEFAULT} />
                  <Text style={styles.improvementExampleText}>{example}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

// =====================================================================
// CORRECTION CARD COMPONENT
// =====================================================================

interface CorrectionCardProps {
  correction: WritingCorrection;
  isExpanded: boolean;
  onToggle: () => void;
}

function CorrectionCard({ correction, isExpanded, onToggle }: CorrectionCardProps) {
  const typeColors = {
    grammar: colors.success.DEFAULT,
    spelling: colors.accent.purple,
    vocabulary: colors.accent.cyan,
    style: colors.accent.orange,
    punctuation: colors.accent.pink,
  };

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={styles.correctionCard}>
      <View style={styles.correctionCardHeader}>
        <View style={styles.correctionBadge}>
          <Text style={[styles.correctionBadgeText, { color: typeColors[correction.type] }]}>
            {getPositiveLabel(correction.type)}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.tertiary}
        />
      </View>

      <View style={styles.correctionPreview}>
        <View style={styles.correctionTextRow}>
          <Text style={styles.correctionOriginal}>{correction.original}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.text.tertiary} />
          <Text style={styles.correctionCorrected}>{correction.corrected}</Text>
        </View>
      </View>

      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.correctionCardContent}>
          <View style={styles.correctionExplanation}>
            <Ionicons name="information-circle" size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.correctionExplanationText}>{correction.explanation}</Text>
          </View>
          {correction.betterWayToSay && (
            <View style={styles.betterWayContainer}>
              <LinearGradient
                colors={[colors.background.elevated, colors.background.card]}
                style={styles.betterWayInner}
              >
                <Ionicons name="sparkles" size={16} color={colors.warning.DEFAULT} />
                <Text style={styles.betterWayLabel}>Better way:</Text>
                <Text style={styles.betterWayText}>{correction.betterWayToSay}</Text>
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

// =====================================================================
// PROGRESS CARD COMPONENT
// =====================================================================

interface ProgressCardProps {
  trend: {
    metric: string;
    previousValue: number;
    currentValue: number;
    trend: 'up' | 'down' | 'stable';
    message: string;
  };
}

function ProgressCard({ trend }: ProgressCardProps) {
  const trendIcons = {
    up: 'trending-up',
    down: 'trending-down',
    stable: 'remove',
  };

  const trendColors = {
    up: colors.success.DEFAULT,
    down: colors.warning.DEFAULT,
    stable: colors.text.tertiary,
  };

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressCardHeader}>
        <Text style={styles.progressCardMetric}>{trend.metric}</Text>
        <Ionicons name={trendIcons[trend.trend] as any} size={20} color={trendColors[trend.trend]} />
      </View>
      <View style={styles.progressCardValues}>
        <Text style={styles.progressCardValue}>{trend.currentValue}</Text>
        <Text style={styles.progressCardPrevious}>from {trend.previousValue}</Text>
      </View>
      <Text style={styles.progressCardMessage}>{trend.message}</Text>
    </View>
  );
}

// =====================================================================
// STYLES
// =====================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },

  // Encouragement Banner
  encouragementBanner: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.glow.primary,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  encouragementText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Score Rings
  scoresSection: {
    marginBottom: spacing.xl,
  },
  scoreRingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
  scoreRingContainer: {
    alignItems: 'center',
  },
  scoreRingWrapper: {
    position: 'relative',
    width: SCORE_RING_SIZE,
    height: SCORE_RING_SIZE,
    marginBottom: spacing.sm,
  },
  scoreRingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  toggleButton: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  toggleButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.medium,
  },

  // Your Writing Section
  writingContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  writingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  writingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  writingTextOriginal: {
    color: colors.text.secondary,
    fontStyle: 'italic',
  },

  // Strengths
  strengthsList: {
    gap: spacing.md,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.md,
  },
  strengthIconContainer: {
    marginTop: 2,
  },
  strengthText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.5,
  },

  // Improvements
  improvementsList: {
    gap: spacing.md,
  },
  improvementCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
  },
  improvementCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  improvementCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  improvementCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  improvementCardContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  improvementSuggestion: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  improvementExamples: {
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  improvementExamplesLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  improvementExampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  improvementExampleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  // Corrections
  correctionsList: {
    gap: spacing.md,
  },
  correctionCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
  },
  correctionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  correctionBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  correctionBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  correctionPreview: {
    marginBottom: spacing.sm,
  },
  correctionTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  correctionOriginal: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  correctionCorrected: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.DEFAULT,
  },
  correctionCardContent: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  correctionExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  correctionExplanationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  betterWayContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  betterWayInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  betterWayLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  betterWayText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Text Comparison
  comparisonToggle: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
  },
  comparisonToggleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  comparisonToggleText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  comparisonContainer: {
    gap: spacing.md,
  },
  textComparisonCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
  },
  textComparisonCardAfter: {
    borderColor: colors.success.DEFAULT,
    borderWidth: 1.5,
  },
  textComparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  textComparisonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  textComparisonContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.6,
  },

  // Progress
  progressCards: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  progressCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressCardMetric: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  progressCardValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressCardValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  progressCardPrevious: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  progressCardMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  attemptsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignSelf: 'center',
  },
  attemptsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  secondaryActionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  secondaryActionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  primaryActionButton: {
    flex: 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  primaryActionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryActionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
