/**
 * ReadingResultsCard - Premium Redesign
 *
 * Clean, premium results experience inspired by:
 * - Summary view with key metrics
 * - Expandable detailed feedback
 * - No emojis - clean typography and icons
 * - Consistent with TeleprompterCard design language
 */

import React, { useState, useEffect } from 'react';
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
  useSharedValue,
  Easing,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { TeleprompterResults } from './TeleprompterCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import {
  addAllProblemWordsToBank,
  ProblemWordToAdd,
} from '@/lib/reading/wordBankIntegration';
import type { AnalysisResult } from '@/lib/reading';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Score ring dimensions
const RING_SIZE = 140;
const RING_RADIUS = 58;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ReadingResultsCardProps {
  results: TeleprompterResults;
  analysisResult: AnalysisResult | null;
  recordingUri?: string | null;
  onPracticeAgain: () => void;
  onFinish: () => void;
}

export function ReadingResultsCard({
  results,
  analysisResult,
  recordingUri,
  onPracticeAgain,
  onFinish,
}: ReadingResultsCardProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Animation values
  const scoreProgress = useSharedValue(0);
  const toastOpacity = useSharedValue(0);

  // Calculate metrics
  const overallScore = analysisResult?.overallScore ?? 0;
  const articulationScore = analysisResult?.articulationScore ?? 0;
  const fluencyScore = analysisResult?.fluencyScore ?? 0;
  const problemWords = analysisResult?.problemWords ?? [];
  const feedback = analysisResult?.feedback;

  const wordsPerMinute = results.duration > 0
    ? Math.round((results.totalWords / results.duration) * 60)
    : 0;

  const accuracy = analysisResult?.accuracy ??
    Math.round(((results.totalWords - problemWords.length) / results.totalWords) * 100);

  // Animate score on mount
  useEffect(() => {
    scoreProgress.value = withDelay(
      300,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  // Auto-add problem words
  useEffect(() => {
    const autoAddWords = async () => {
      if (!problemWords || problemWords.length === 0) return;

      const wordsToAdd = problemWords.filter(
        w => w.issueType === 'mispronounced' || w.issueType === 'skipped'
      );

      if (wordsToAdd.length === 0) return;

      try {
        const wordsForBank: ProblemWordToAdd[] = wordsToAdd.map(item => ({
          word: item.word,
          phonetic: '',
          issueType: item.issueType,
        }));

        const addResults = await addAllProblemWordsToBank(wordsForBank);

        const newAdded = new Set<string>();
        addResults.forEach(r => newAdded.add(r.word));
        setAddedWords(newAdded);

        // Show toast
        showToast(`${addResults.length} word${addResults.length > 1 ? 's' : ''} added to Word Bank`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error auto-adding words:', error);
      }
    };

    autoAddWords();
  }, [analysisResult]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    toastOpacity.value = withTiming(1, { duration: 200 });

    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => setToastVisible(false), 200);
    }, 2500);
  };

  // Animated styles
  const ringAnimatedProps = useAnimatedProps(() => {
    const progress = (overallScore / 100) * scoreProgress.value;
    return {
      strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress),
    };
  });

  const scoreTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scoreProgress.value, [0, 0.5, 1], [0, 1, 1]),
    transform: [{ scale: interpolate(scoreProgress.value, [0, 0.5, 1], [0.8, 1.05, 1]) }],
  }));

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: interpolate(toastOpacity.value, [0, 1], [-10, 0]) }],
  }));

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success.DEFAULT;
    if (score >= 70) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  const scoreColor = getScoreColor(overallScore);

  // Play word pronunciation
  const handlePlayWord = (word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(word, { language: 'en-US', rate: 0.8 });
  };

  // Group problem words
  const mispronounced = problemWords.filter(w => w.issueType === 'mispronounced');
  const skipped = problemWords.filter(w => w.issueType === 'skipped');
  const hesitations = problemWords.filter(w => w.issueType === 'hesitated' || w.issueType === 'repeated');

  if (showDetailedFeedback) {
    return (
      <DetailedFeedbackView
        insets={insets}
        feedback={feedback}
        problemWords={problemWords}
        mispronounced={mispronounced}
        skipped={skipped}
        hesitations={hesitations}
        addedWords={addedWords}
        articulationScore={articulationScore}
        fluencyScore={fluencyScore}
        onPlayWord={handlePlayWord}
        onBack={() => setShowDetailedFeedback(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, toastStyle]}>
          <View style={styles.toastContent}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Reading Complete</Text>
          <Text style={styles.headerSubtitle}>
            {results.totalWords} words in {formatDuration(results.duration)}
          </Text>
        </Animated.View>

        {/* Main Score Ring */}
        <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.scoreSection}>
          <View style={styles.scoreRingContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              {/* Progress ring */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={scoreColor}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeLinecap="round"
                animatedProps={ringAnimatedProps}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            {/* Score text */}
            <Animated.View style={[styles.scoreTextContainer, scoreTextStyle]}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {Math.round(overallScore)}
              </Text>
              <Text style={styles.scoreLabel}>Overall</Text>
            </Animated.View>
            {/* Glow effect */}
            <View style={[styles.scoreGlow, { shadowColor: scoreColor }]} />
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(fluencyScore)}</Text>
            <Text style={styles.statLabel}>Fluency</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, problemWords.length > 0 && styles.statWarning]}>
              {problemWords.length}
            </Text>
            <Text style={styles.statLabel}>To Review</Text>
          </View>
        </Animated.View>

        {/* Feedback Quote */}
        {feedback && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.feedbackSection}>
            <View style={styles.feedbackQuote}>
              <View style={styles.quoteLine} />
              <View style={styles.quoteContent}>
                <Text style={styles.feedbackText}>{feedback.summary}</Text>
                {feedback.encouragement && (
                  <Text style={styles.encouragementText}>{feedback.encouragement}</Text>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Problem Words Preview */}
        {problemWords.length > 0 && (
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.wordsPreviewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Words to Practice</Text>
              <Text style={styles.sectionCount}>{problemWords.length}</Text>
            </View>

            {/* Word chips preview (max 6) */}
            <View style={styles.wordChipsContainer}>
              {problemWords.slice(0, 6).map((word, index) => (
                <TouchableOpacity
                  key={`${word.word}-${index}`}
                  onPress={() => handlePlayWord(word.word)}
                  activeOpacity={0.7}
                  style={[
                    styles.wordChip,
                    word.issueType === 'mispronounced' && styles.wordChipError,
                    word.issueType === 'skipped' && styles.wordChipWarning,
                  ]}
                >
                  <Text style={styles.wordChipText}>{word.word}</Text>
                  {addedWords.has(word.word) && (
                    <View style={styles.addedDot} />
                  )}
                </TouchableOpacity>
              ))}
              {problemWords.length > 6 && (
                <View style={styles.moreChip}>
                  <Text style={styles.moreChipText}>+{problemWords.length - 6}</Text>
                </View>
              )}
            </View>

            {/* View Details Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDetailedFeedback(true);
              }}
              activeOpacity={0.8}
              style={styles.viewDetailsButton}
            >
              <Text style={styles.viewDetailsText}>View Detailed Feedback</Text>
              <Text style={styles.viewDetailsArrow}>→</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* No Analysis State */}
        {!analysisResult && (
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.noAnalysisSection}>
            <Text style={styles.noAnalysisText}>
              Detailed analysis will appear here after recording
            </Text>
          </Animated.View>
        )}

        {/* Spacer for buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <Animated.View
        entering={FadeInUp.delay(700).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={styles.footerGradient}
          pointerEvents="none"
        />

        <View style={styles.buttonRow}>
          {/* Secondary - Practice Again */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPracticeAgain();
            }}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Practice Again</Text>
          </TouchableOpacity>

          {/* Primary - Continue */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onFinish();
            }}
            activeOpacity={0.9}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// Detailed Feedback View Component
interface DetailedFeedbackViewProps {
  insets: { top: number; bottom: number };
  feedback: AnalysisResult['feedback'] | undefined;
  problemWords: AnalysisResult['problemWords'];
  mispronounced: AnalysisResult['problemWords'];
  skipped: AnalysisResult['problemWords'];
  hesitations: AnalysisResult['problemWords'];
  addedWords: Set<string>;
  articulationScore: number;
  fluencyScore: number;
  onPlayWord: (word: string) => void;
  onBack: () => void;
}

function DetailedFeedbackView({
  insets,
  feedback,
  mispronounced,
  skipped,
  hesitations,
  addedWords,
  articulationScore,
  fluencyScore,
  onPlayWord,
  onBack,
}: DetailedFeedbackViewProps) {
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back */}
      <View style={styles.detailHeader}>
        <BackButton onPress={onBack} variant="default" />
        <Text style={styles.detailHeaderTitle}>Detailed Feedback</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Breakdown */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.scoreBreakdown}>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Articulation</Text>
            <View style={styles.breakdownBar}>
              <View style={[styles.breakdownFill, { width: `${articulationScore}%` }]} />
            </View>
            <Text style={styles.breakdownValue}>{Math.round(articulationScore)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Fluency</Text>
            <View style={styles.breakdownBar}>
              <View style={[styles.breakdownFill, styles.breakdownFillSecondary, { width: `${fluencyScore}%` }]} />
            </View>
            <Text style={styles.breakdownValue}>{Math.round(fluencyScore)}</Text>
          </View>
        </Animated.View>

        {/* Feedback Summary */}
        {feedback && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.feedbackArticle}>
            <Text style={styles.articleTitle}>Summary</Text>
            <Text style={styles.articleText}>{feedback.summary}</Text>

            {feedback.improvements && feedback.improvements.length > 0 && (
              <>
                <Text style={styles.articleSubtitle}>Areas for Improvement</Text>
                {feedback.improvements.map((item, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </>
            )}

            {feedback.strengths && feedback.strengths.length > 0 && (
              <>
                <Text style={styles.articleSubtitle}>Strengths</Text>
                {feedback.strengths.map((item, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View style={[styles.bulletDot, styles.bulletDotSuccess]} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </>
            )}
          </Animated.View>
        )}

        {/* Mispronounced Words */}
        {mispronounced.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.wordSection}>
            <View style={styles.wordSectionHeader}>
              <View style={[styles.issueIndicator, styles.issueError]} />
              <Text style={styles.wordSectionTitle}>Mispronounced</Text>
              <Text style={styles.wordSectionCount}>{mispronounced.length}</Text>
            </View>
            <Text style={styles.wordSectionDesc}>
              These words were pronounced differently than expected. Tap to hear correct pronunciation.
            </Text>
            <View style={styles.wordList}>
              {mispronounced.map((word, index) => (
                <WordCard
                  key={`mis-${word.word}-${index}`}
                  word={word}
                  isAdded={addedWords.has(word.word)}
                  onPlay={() => onPlayWord(word.word)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Skipped Words */}
        {skipped.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.wordSection}>
            <View style={styles.wordSectionHeader}>
              <View style={[styles.issueIndicator, styles.issueWarning]} />
              <Text style={styles.wordSectionTitle}>Skipped</Text>
              <Text style={styles.wordSectionCount}>{skipped.length}</Text>
            </View>
            <Text style={styles.wordSectionDesc}>
              These words were not detected in your reading.
            </Text>
            <View style={styles.wordList}>
              {skipped.map((word, index) => (
                <WordCard
                  key={`skip-${word.word}-${index}`}
                  word={word}
                  isAdded={addedWords.has(word.word)}
                  onPlay={() => onPlayWord(word.word)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Hesitations */}
        {hesitations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.wordSection}>
            <View style={styles.wordSectionHeader}>
              <View style={[styles.issueIndicator, styles.issueInfo]} />
              <Text style={styles.wordSectionTitle}>Hesitations</Text>
              <Text style={styles.wordSectionCount}>{hesitations.length}</Text>
            </View>
            <Text style={styles.wordSectionDesc}>
              You paused or repeated these words. This is normal when learning.
            </Text>
            <View style={styles.wordList}>
              {hesitations.map((word, index) => (
                <WordCard
                  key={`hes-${word.word}-${index}`}
                  word={word}
                  isAdded={addedWords.has(word.word)}
                  onPlay={() => onPlayWord(word.word)}
                  isOptional
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Bottom padding */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

// Word Card Component
interface WordCardProps {
  word: { word: string; issueType: string; suggestion?: string };
  isAdded: boolean;
  onPlay: () => void;
  isOptional?: boolean;
}

function WordCard({ word, isAdded, onPlay }: WordCardProps) {
  return (
    <TouchableOpacity
      onPress={onPlay}
      activeOpacity={0.7}
      style={styles.wordCard}
    >
      <View style={styles.wordCardContent}>
        <Text style={styles.wordCardText}>{word.word}</Text>
        {word.suggestion && (
          <Text style={styles.wordCardSuggestion}>{word.suggestion}</Text>
        )}
      </View>
      <View style={styles.wordCardRight}>
        {isAdded && <View style={styles.addedIndicator} />}
        <View style={styles.playButton}>
          <View style={styles.playIcon} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
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
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
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

  // Score Section
  scoreSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  scoreRingContainer: {
    position: 'relative',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  scoreTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  scoreGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: RING_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statWarning: {
    color: colors.warning.DEFAULT,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Feedback Section
  feedbackSection: {
    marginBottom: spacing.xl,
  },
  feedbackQuote: {
    flexDirection: 'row',
  },
  quoteLine: {
    width: 3,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  quoteContent: {
    flex: 1,
  },
  feedbackText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  encouragementText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },

  // Words Preview Section
  wordsPreviewSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  wordChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  wordChipError: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  wordChipWarning: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  wordChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  addedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success.DEFAULT,
    marginLeft: spacing.xs,
  },
  moreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  moreChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  viewDetailsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  viewDetailsArrow: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },

  // No Analysis
  noAnalysisSection: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  noAnalysisText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  footerGradient: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 100,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.DEFAULT,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  toastText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },

  // Detail View
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  detailScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Score Breakdown
  scoreBreakdown: {
    marginBottom: spacing.xl,
  },
  breakdownTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  breakdownLabel: {
    width: 100,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 4,
  },
  breakdownFillSecondary: {
    backgroundColor: colors.accent.purple,
  },
  breakdownValue: {
    width: 30,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'right',
  },

  // Feedback Article
  feedbackArticle: {
    marginBottom: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  articleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  articleSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  articleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.DEFAULT,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  bulletDotSuccess: {
    backgroundColor: colors.success.DEFAULT,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },

  // Word Sections
  wordSection: {
    marginBottom: spacing.xl,
  },
  wordSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  issueIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  issueError: {
    backgroundColor: colors.error.DEFAULT,
  },
  issueWarning: {
    backgroundColor: colors.warning.DEFAULT,
  },
  issueInfo: {
    backgroundColor: colors.text.tertiary,
  },
  wordSectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  wordSectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  wordSectionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  wordList: {
    gap: spacing.sm,
  },

  // Word Card
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  wordCardContent: {
    flex: 1,
  },
  wordCardText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  wordCardSuggestion: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  wordCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success.DEFAULT,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: colors.text.secondary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
});
