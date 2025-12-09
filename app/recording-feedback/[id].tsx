/**
 * Recording Feedback Detail Screen
 *
 * Philosophy: "Confidence comes from a safe space where evolution is the reward"
 * - ARTICULATION not ACCENT - we never judge accents!
 * - Show encouragement FIRST
 * - Strengths BEFORE improvements
 * - Never say "mispronounced" - use "word to practice"
 * - Problem words show syllable breakdown
 * - Progress comparison if available
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows
} from '@/constants/designSystem';

import type {
  RecordingFeedbackData,
  ProblemWord,
  FeedbackStrength,
  FeedbackImprovement,
  FeedbackProgress,
} from '@/components/feedback/types';

import { getPositiveLabel } from '@/components/feedback/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for demonstration - replace with actual data fetching
const getMockFeedbackData = (id: string): RecordingFeedbackData => ({
  id,
  sessionId: 'session_001',
  title: 'The Cathedral Reading',
  passageCategory: 'Architecture & History',
  completedAt: new Date().toISOString(),
  durationMs: 125000,

  articulationScore: 82,
  fluencyScore: 75,
  completionScore: 90,
  overallScore: 82,

  recordingUrl: 'file:///path/to/recording.m4a',

  wordsTotal: 150,
  wordsSpoken: 145,

  problemWords: [
    {
      id: 'pw_1',
      word: 'cathedral',
      issueType: 'hesitation',
      context: 'The magnificent cathedral stood tall against the skyline.',
      suggestion: 'Break it down: "ca-THEE-dral". Try emphasizing the middle syllable.',
      syllableBreakdown: 'ca-THEE-dral',
      addedToWordBank: true,
      timestamp: 15000,
    },
    {
      id: 'pw_2',
      word: 'architecture',
      issueType: 'incomplete',
      context: 'The architecture was truly breathtaking.',
      suggestion: 'Practice the "tect" ending: "AR-ki-tek-chur".',
      syllableBreakdown: 'AR-ki-tek-chur',
      addedToWordBank: true,
      timestamp: 42000,
    },
    {
      id: 'pw_3',
      word: 'magnificent',
      issueType: 'hesitation',
      context: 'A magnificent view from the top.',
      suggestion: 'Take your time with the "nif" sound: "mag-NIF-i-sent".',
      syllableBreakdown: 'mag-NIF-i-sent',
      addedToWordBank: false,
      timestamp: 67000,
    },
    {
      id: 'pw_4',
      word: 'particularly',
      issueType: 'skipped',
      context: 'This was particularly impressive.',
      suggestion: 'Long word! Break it down: "par-TIK-yu-lar-lee".',
      syllableBreakdown: 'par-TIK-yu-lar-lee',
      addedToWordBank: false,
      timestamp: 89000,
    },
  ],

  strengths: [
    {
      id: 's_1',
      text: 'Clear enunciation of consonants throughout',
      icon: '✓',
    },
    {
      id: 's_2',
      text: 'Excellent pacing in the opening paragraphs',
      icon: '✓',
    },
    {
      id: 's_3',
      text: 'Strong breath control and projection',
      icon: '✓',
    },
    {
      id: 's_4',
      text: 'Natural intonation that enhanced meaning',
      icon: '✓',
    },
  ],

  improvements: [
    {
      id: 'i_1',
      area: 'Complex word articulation',
      suggestion: 'Practice breaking down longer words into syllables before speaking',
      priority: 'high',
      examples: ['architecture', 'cathedral'],
    },
    {
      id: 'i_2',
      area: 'Consistent pacing',
      suggestion: 'Try to maintain steady rhythm even through challenging sections',
      priority: 'medium',
    },
  ],

  encouragementMessage: 'Outstanding work! Your dedication is paying off!',
  celebrationEmoji: '🎉',

  progress: {
    previousAttempts: 3,
    articulationTrend: {
      metric: 'Articulation',
      previousValue: 75,
      currentValue: 82,
      trend: 'up',
      message: '+7 points from your last session!',
    },
    fluencyTrend: {
      metric: 'Fluency',
      previousValue: 70,
      currentValue: 75,
      trend: 'up',
      message: '+5 points improvement!',
    },
    improvedWords: ['magnificent', 'breathtaking', 'perspective'],
    persistentChallenges: ['architecture', 'particularly'],
  },
});

export default function RecordingFeedbackDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const [feedbackData, setFeedbackData] = useState<RecordingFeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load feedback data
  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Replace with actual API call
        const data = getMockFeedbackData(id);
        setFeedbackData(data);
      } catch (error) {
        console.error('Error loading feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!feedbackData?.recordingUrl) return;

    try {
      if (!soundRef.current) {
        // Load audio
        const { sound } = await Audio.Sound.createAsync(
          { uri: feedbackData.recordingUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.positionMillis !== undefined) {
              setPlaybackPosition(status.positionMillis);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPlaybackPosition(0);
              }
            }
          }
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handlePracticeAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to practice screen
    console.log('Practice again');
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement sharing functionality
    console.log('Share recording');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!feedbackData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Feedback not found</Text>
          <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Group problem words by type
  const groupedWords: Record<string, ProblemWord[]> = {
    hesitation: [],
    skipped: [],
    incomplete: [],
    repeated: [],
  };

  feedbackData.problemWords.forEach(word => {
    groupedWords[word.issueType].push(word);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Recording Feedback
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encouragement Banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.encouragementBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.encouragementEmoji}>{feedbackData.celebrationEmoji}</Text>
            <Text style={styles.encouragementMessage}>{feedbackData.encouragementMessage}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Recording Playback Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{feedbackData.title}</Text>
            <Text style={styles.sectionSubtitle}>{feedbackData.passageCategory}</Text>

            {/* Playback Controls */}
            <View style={styles.playbackContainer}>
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.playButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.playButtonText}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Simple waveform visualization */}
              <View style={styles.waveformContainer}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const height = Math.random() * 30 + 10;
                  const progress = playbackPosition / feedbackData.durationMs;
                  const isActive = i < progress * 30;

                  return (
                    <View
                      key={i}
                      style={[
                        styles.waveformBar,
                        {
                          height,
                          backgroundColor: isActive
                            ? colors.primary.DEFAULT
                            : colors.text.tertiary,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>
                {formatDuration(playbackPosition)} / {formatDuration(feedbackData.durationMs)}
              </Text>
              <Text style={styles.wordsCountText}>
                {feedbackData.wordsSpoken} / {feedbackData.wordsTotal} words spoken
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Score Rings Row */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.scoresRow}>
            <ScoreRing
              label="Articulation"
              score={feedbackData.articulationScore}
              color={colors.success.DEFAULT}
            />
            <ScoreRing
              label="Fluency"
              score={feedbackData.fluencyScore}
              color={colors.primary.DEFAULT}
            />
            <ScoreRing
              label="Completion"
              score={feedbackData.completionScore}
              color={colors.secondary.DEFAULT}
            />
          </View>
        </Animated.View>

        {/* Strengths Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderIcon}>💪</Text>
              <Text style={styles.sectionHeaderTitle}>What You Did Well</Text>
            </View>

            {feedbackData.strengths.map((strength, index) => (
              <View key={strength.id} style={styles.strengthItem}>
                <View style={styles.strengthIconContainer}>
                  <Text style={styles.strengthIcon}>{strength.icon}</Text>
                </View>
                <Text style={styles.strengthText}>{strength.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Growth Areas Section */}
        {feedbackData.improvements.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderIcon}>🌱</Text>
                <Text style={styles.sectionHeaderTitle}>Growth Opportunities</Text>
              </View>

              {feedbackData.improvements.map((improvement) => (
                <View key={improvement.id} style={styles.improvementItem}>
                  <Text style={styles.improvementArea}>{improvement.area}</Text>
                  <Text style={styles.improvementSuggestion}>{improvement.suggestion}</Text>
                  {improvement.examples && improvement.examples.length > 0 && (
                    <View style={styles.improvementExamples}>
                      {improvement.examples.map((example, i) => (
                        <View key={i} style={styles.exampleTag}>
                          <Text style={styles.exampleText}>{example}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Problem Words Section */}
        {feedbackData.problemWords.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderIcon}>📚</Text>
                <Text style={styles.sectionHeaderTitle}>Words to Practice</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Remember: These are opportunities to grow, not mistakes!
              </Text>

              {Object.entries(groupedWords).map(([type, words]) => {
                if (words.length === 0) return null;

                return (
                  <View key={type} style={styles.wordGroup}>
                    <Text style={styles.wordGroupTitle}>
                      {getPositiveLabel(type)}
                    </Text>

                    {words.map((word) => (
                      <View key={word.id} style={styles.problemWordCard}>
                        <View style={styles.problemWordHeader}>
                          <Text style={styles.problemWordText}>{word.word}</Text>
                          {word.addedToWordBank && (
                            <View style={styles.wordBankBadge}>
                              <Text style={styles.wordBankBadgeText}>✓ Word Bank</Text>
                            </View>
                          )}
                        </View>

                        {word.syllableBreakdown && (
                          <Text style={styles.syllableBreakdown}>
                            {word.syllableBreakdown}
                          </Text>
                        )}

                        <Text style={styles.problemWordContext}>
                          "{word.context}"
                        </Text>

                        <View style={styles.suggestionContainer}>
                          <Text style={styles.suggestionIcon}>💡</Text>
                          <Text style={styles.suggestionText}>{word.suggestion}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Progress Section */}
        {feedbackData.progress && (
          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderIcon}>📈</Text>
                <Text style={styles.sectionHeaderTitle}>Your Progress</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Compared to your previous {feedbackData.progress.previousAttempts} attempts
              </Text>

              {/* Trends */}
              <View style={styles.trendsContainer}>
                <TrendItem trend={feedbackData.progress.articulationTrend} />
                <TrendItem trend={feedbackData.progress.fluencyTrend} />
              </View>

              {/* Improved Words */}
              {feedbackData.progress.improvedWords.length > 0 && (
                <View style={styles.progressWordsSection}>
                  <Text style={styles.progressWordsTitle}>🎯 Words You've Improved</Text>
                  <View style={styles.progressWordsList}>
                    {feedbackData.progress.improvedWords.map((word, i) => (
                      <View key={i} style={styles.progressWordTag}>
                        <Text style={styles.progressWordText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Persistent Challenges */}
              {feedbackData.progress.persistentChallenges.length > 0 && (
                <View style={styles.progressWordsSection}>
                  <Text style={styles.progressWordsTitle}>🎓 Still Working On</Text>
                  <View style={styles.progressWordsList}>
                    {feedbackData.progress.persistentChallenges.map((word, i) => (
                      <View key={i} style={[styles.progressWordTag, styles.challengeTag]}>
                        <Text style={styles.challengeWordText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(400).delay(700)}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handlePracticeAgain}
              style={styles.primaryActionButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.primaryActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryActionText}>Practice Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.secondaryActionButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryActionText}>Share Recording</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// ScoreRing Component
// ============================================================================

interface ScoreRingProps {
  label: string;
  score: number;
  color: string;
}

function ScoreRing({ label, score, color }: ScoreRingProps) {
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={styles.scoreRing}>
      <View style={styles.scoreRingCircle}>
        {/* Background circle */}
        <View
          style={[
            styles.scoreRingBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: colors.background.elevated,
            },
          ]}
        />

        {/* Progress circle - simplified without SVG */}
        <View
          style={[
            styles.scoreRingProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: `${(score / 100) * 360}deg` }],
            },
          ]}
        />

        {/* Score text */}
        <View style={styles.scoreRingCenter}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scorePercent}>%</Text>
        </View>
      </View>

      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

// ============================================================================
// TrendItem Component
// ============================================================================

interface TrendItemProps {
  trend: FeedbackProgress;
}

function TrendItem({ trend }: TrendItemProps) {
  const getTrendIcon = () => {
    switch (trend.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (trend.trend) {
      case 'up':
        return colors.success.DEFAULT;
      case 'down':
        return colors.error.DEFAULT;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={styles.trendItem}>
      <View style={styles.trendHeader}>
        <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
        <Text style={styles.trendMetric}>{trend.metric}</Text>
      </View>
      <View style={styles.trendValues}>
        <Text style={styles.trendPrevious}>{trend.previousValue}</Text>
        <Text style={styles.trendArrow}>→</Text>
        <Text style={[styles.trendCurrent, { color: getTrendColor() }]}>
          {trend.currentValue}
        </Text>
      </View>
      <Text style={styles.trendMessage}>{trend.message}</Text>
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Styles
// ============================================================================

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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
  },
  backButton: {
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  backButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Loading & Error States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  errorButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
  },
  errorButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Encouragement Banner
  encouragementBanner: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  encouragementEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  encouragementMessage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Section Card
  sectionCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderIcon: {
    fontSize: 24,
  },
  sectionHeaderTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },

  // Playback
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  playButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.md,
  },
  playButtonGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  wordsCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Score Rings
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  scoreRing: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreRingCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingBackground: {
    position: 'absolute',
  },
  scoreRingProgress: {
    position: 'absolute',
  },
  scoreRingCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  scorePercent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: 2,
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Strengths
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  strengthIconContainer: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthIcon: {
    fontSize: 14,
    color: colors.success.DEFAULT,
  },
  strengthText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 24,
  },

  // Improvements
  improvementItem: {
    marginBottom: spacing.lg,
  },
  improvementArea: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  improvementSuggestion: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  improvementExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  exampleTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  exampleText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
  },

  // Problem Words
  wordGroup: {
    marginBottom: spacing.lg,
  },
  wordGroupTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  problemWordCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  problemWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  problemWordText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  wordBankBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  wordBankBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
  },
  syllableBreakdown: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  problemWordContext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  suggestionContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  suggestionIcon: {
    fontSize: 16,
  },
  suggestionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },

  // Progress
  trendsContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  trendItem: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  trendIcon: {
    fontSize: 20,
  },
  trendMetric: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  trendValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  trendPrevious: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  trendArrow: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  trendCurrent: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  trendMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  progressWordsSection: {
    marginTop: spacing.md,
  },
  progressWordsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  progressWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  progressWordTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success.DEFAULT,
  },
  progressWordText: {
    fontSize: typography.fontSize.sm,
    color: colors.success.DEFAULT,
    fontWeight: typography.fontWeight.medium,
  },
  challengeTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: colors.warning.DEFAULT,
  },
  challengeWordText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning.DEFAULT,
    fontWeight: typography.fontWeight.medium,
  },

  // Actions
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  primaryActionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  primaryActionGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  secondaryActionButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  secondaryActionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
});
