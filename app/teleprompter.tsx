/**
 * Teleprompter Screen
 *
 * Premium, immersive reading experience.
 * Now receives passage data from the Library → About Lecture flow.
 *
 * Flow:
 * Library → About Lecture → Teleprompter → Analyzing → Results
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, glass } from '@/constants/designSystem';
import { TeleprompterCard, TeleprompterResults } from '@/components/cards/TeleprompterCard';
import { ReadingResultsCard } from '@/components/cards/ReadingResultsCard';
import { AnalyzingScreen } from '@/components/reading/AnalyzingScreen';
import {
  useActiveSession,
  useTranscription,
  useArticulationAnalysis,
  type Passage,
  type AnalysisResult,
} from '@/lib/reading';
import { useAuth } from '@/hooks/useAuth';
import { generateLecturePassage } from '@/lib/ai/libraryGenerator';
import { savePracticeScore } from '@/lib/db/competencyMetrics';
import { updateStreakData } from '@/lib/db/sqlite';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ScreenState = 'teleprompter' | 'analyzing' | 'results' | 'complete';

// ─── KPI Ring constants ─────────────────────────────────────
const RING_SIZE = 80;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const READING_KPI_CONFIG = [
  { key: 'articulation' as const, label: 'Articulation', icon: 'mic-outline' as const, color: '#00A3FF', bgColor: 'rgba(0, 163, 255, 0.12)' },
  { key: 'fluency' as const, label: 'Fluency', icon: 'speedometer-outline' as const, color: '#06D6A0', bgColor: 'rgba(6, 214, 160, 0.12)' },
  { key: 'accuracy' as const, label: 'Accuracy', icon: 'checkmark-circle-outline' as const, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.12)' },
  { key: 'overall' as const, label: 'Overall', icon: 'star-outline' as const, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.12)' },
];

// ─── Score Ring Component ───────────────────────────────────
function ReadingScoreRing({ score, color, bgColor, icon, label, delay }: {
  score: number; color: string; bgColor: string;
  icon: keyof typeof Ionicons.glyphMap; label: string; delay: number;
}) {
  const ringProgress = useSharedValue(0);
  const numberOpacity = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withDelay(delay, withSpring(score / 100, { damping: 15, stiffness: 150 }));
    numberOpacity.value = withDelay(delay + 200, withTiming(1, { duration: 400 }));
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const numberStyle = useAnimatedStyle(() => ({ opacity: numberOpacity.value }));

  return (
    <View style={[completeStyles.scoreRingCard, { backgroundColor: bgColor }]}>
      <View style={completeStyles.ringOuter}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke={color + '20'} strokeWidth={RING_STROKE} fill="transparent" />
          <AnimatedCircle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke={color} strokeWidth={RING_STROKE} fill="transparent" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} animatedProps={animatedProps} />
        </Svg>
        <Animated.View style={[completeStyles.ringCenter, numberStyle]}>
          <Ionicons name={icon} size={16} color={color} style={{ marginBottom: 2 }} />
          <Text style={[completeStyles.ringScore, { color }]}>{score}</Text>
        </Animated.View>
      </View>
      <Text style={completeStyles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── Reading Complete View ──────────────────────────────────
function ReadingCompleteView({ analysisResult, onDone }: {
  analysisResult: AnalysisResult | null; onDone: () => void;
}) {
  const articulationScore = Math.round(analysisResult?.articulationScore ?? 0);
  const fluencyScore = Math.round(analysisResult?.fluencyScore ?? 0);
  const overallScore = Math.round(analysisResult?.overallScore ?? 0);
  const accuracy = analysisResult?.accuracy ?? 0;
  const feedback = analysisResult?.feedback;

  const scores: Record<string, number> = {
    articulation: articulationScore,
    fluency: fluencyScore,
    accuracy,
    overall: overallScore,
  };

  return (
    <SafeAreaView style={completeStyles.container} edges={['top', 'bottom']}>
      <View style={completeStyles.content}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600).delay(100)} style={completeStyles.headerSection}>
          <View style={completeStyles.iconCircle}>
            <Ionicons name="book" size={36} color={colors.primary.DEFAULT} />
          </View>
          <Text style={completeStyles.title}>Reading Complete</Text>
        </Animated.View>

        {/* AI Summary / Recommendation quote */}
        {feedback && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={completeStyles.quoteSection}>
            <View style={completeStyles.quoteLine} />
            <View style={completeStyles.quoteContent}>
              <Text style={completeStyles.quoteText}>{feedback.summary}</Text>
              {feedback.encouragement && (
                <Text style={completeStyles.quoteEncouragement}>{feedback.encouragement}</Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Spacer pushes KPI + button to bottom */}
        <View style={{ flex: 1 }} />

        {/* 4 KPI Rings (2x2) — above Done button */}
        <Animated.View entering={FadeInDown.duration(500).delay(450)} style={completeStyles.kpiGrid}>
          {READING_KPI_CONFIG.map((kpi, index) => (
            <ReadingScoreRing
              key={kpi.key}
              score={scores[kpi.key] ?? 0}
              color={kpi.color}
              bgColor={kpi.bgColor}
              icon={kpi.icon}
              label={kpi.label}
              delay={600 + index * 150}
            />
          ))}
        </Animated.View>

        {/* Done Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(750)} style={completeStyles.buttonContainer}>
          <TouchableOpacity onPress={onDone} activeOpacity={0.85}>
            <LinearGradient
              colors={colors.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={completeStyles.doneButton}
            >
              <Text style={completeStyles.doneText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// No hardcoded sample passages — all content is AI-generated in the target language.
// If AI generation fails, the screen shows a retry state.

export default function TeleprompterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    storyId?: string;
    title?: string;
    category?: string;
    difficulty?: string;
    wordCount?: string;
    language?: string;
  }>();

  const [screenState, setScreenState] = useState<ScreenState>('teleprompter');
  const [results, setResults] = useState<TeleprompterResults | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // For AI-generated lectures, passage is loaded async
  const [passage, setPassage] = useState<Passage | null>(null);
  const [passageLoading, setPassageLoading] = useState(true);
  const [passageError, setPassageError] = useState(false);

  // Load passage — always AI-generated in the target language
  const loadPassage = useCallback(async () => {
    setPassageLoading(true);
    setPassageError(false);

    if (!params.storyId || !user?.id) {
      setPassageError(true);
      setPassageLoading(false);
      return;
    }

    try {
      const text = await generateLecturePassage(user.id, params.storyId, {
        title: params.title || 'Reading Practice',
        category: params.category || 'General',
        difficulty: params.difficulty || 'intermediate',
        wordCount: parseInt(params.wordCount || '180', 10),
        language: params.language,
      });

      if (text) {
        setPassage({
          id: params.storyId,
          title: params.title || 'Reading Practice',
          text,
          difficulty: (params.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
          category: params.category || 'General',
          language: params.language || 'english',
          wordCount: text.split(/\s+/).length,
          estimatedDuration: Math.round(text.split(/\s+/).length / 2.5) * 1000,
          sourceType: 'ai_generated',
          createdAt: new Date().toISOString(),
        });
      } else {
        setPassageError(true);
      }
    } catch {
      setPassageError(true);
    }
    setPassageLoading(false);
  }, [params.storyId, params.title, params.category, params.difficulty, params.wordCount, user?.id]);

  useEffect(() => {
    loadPassage();
  }, [loadPassage]);

  // Integration hooks
  const { activeSession, startSession, updateSession } = useActiveSession();
  const { transcribe, isTranscribing, progress: transcriptionProgress } = useTranscription();
  const { analyze, isAnalyzing } = useArticulationAnalysis();

  // Calculate overall progress for analyzing screen
  const analyzingProgress = isTranscribing
    ? transcriptionProgress * 0.5
    : isAnalyzing
    ? 50 + (50 * 0.5)
    : 100;

  const analyzingStage = isTranscribing
    ? 'transcribing'
    : isAnalyzing
    ? 'analyzing'
    : 'uploading';

  // Start session when passage is ready
  useEffect(() => {
    if (!passage) return;
    const initSession = async () => {
      await startSession({
        userId: user?.id || 'user_123',
        sourceType: passage.sourceType as any,
        text: passage.text,
        title: passage.title,
        difficulty: passage.difficulty,
      });
    };
    initSession();
  }, [passage]);

  const handleTeleprompterFinish = async (teleprompterResults: TeleprompterResults) => {
    setResults(teleprompterResults);

    if (teleprompterResults.recordingUri) {
      setRecordingUri(teleprompterResults.recordingUri);
      setScreenState('analyzing');

      try {
        // Step 1: Transcribe the audio
        const transcriptionResult = await transcribe(
          teleprompterResults.recordingUri,
          passage!.text
        );

        if (!transcriptionResult) {
          throw new Error('Transcription failed');
        }

        // Step 2: Analyze articulation (with language for AI-powered feedback)
        const analysis = await analyze(
          passage!.text,
          transcriptionResult,
          teleprompterResults.duration * 1000,
          passage!.language // Pass language for Gemini-powered problem word filtering
        );

        if (!analysis) {
          throw new Error('Analysis failed');
        }

        setAnalysisResult(analysis);

        // Step 3: Save to competency metrics (feedback history + dashboard)
        const userId = user?.id || 'anonymous';
        try {
          await savePracticeScore(userId, 'reading', {
            articulation: analysis.articulationScore,
            fluency: analysis.fluencyScore,
            communication: 0,
            scenario: 0,
          });
          const readingPoints = 10 + Math.round(analysis.overallScore / 10);
          await updateStreakData(userId, readingPoints);
        } catch (err) {
          console.warn('[Teleprompter] Failed to save practice score:', err);
        }

        // Step 4: Update session with results
        if (activeSession) {
          await updateSession({
            transcription: transcriptionResult.text,
            wordsSpoken: analysis.wordsSpoken,
            articulationScore: analysis.articulationScore,
            fluencyScore: analysis.fluencyScore,
            overallScore: analysis.overallScore,
            problemWords: analysis.problemWords,
            feedback: analysis.feedback,
          });
        }

        setScreenState('results');
      } catch (error) {
        console.error('Analysis error:', error);
        setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
        setScreenState('results');
      }
    } else {
      // No recording - show results with basic stats
      setScreenState('results');
    }
  };

  const handlePracticeAgain = () => {
    setResults(null);
    setAnalysisResult(null);
    setRecordingUri(null);
    setAnalysisError(null);
    setScreenState('teleprompter');
  };

  const handleFinish = () => {
    setScreenState('complete');
  };

  const handleCompleteDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Go back to library (past about-lecture too)
    router.back();
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state while AI generates the passage
  if (passageLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Preparing your reading...</Text>
        </View>
      </View>
    );
  }

  // Error / retry state — never show English fallback
  if (passageError || !passage) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.errorTitle}>Couldn't load passage</Text>
          <Text style={styles.errorSub}>Check your connection and try again</Text>
          <TouchableOpacity onPress={loadPassage} activeOpacity={0.8} style={styles.retryBtn}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.8} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {screenState === 'teleprompter' && (
        <TeleprompterCard
          passage={passage}
          onFinish={handleTeleprompterFinish}
          onBack={handleBack}
        />
      )}

      {screenState === 'analyzing' && (
        <AnalyzingScreen
          progress={analyzingProgress}
          stage={analyzingStage}
        />
      )}

      {screenState === 'results' && results && (
        <ReadingResultsCard
          results={results}
          analysisResult={analysisResult}
          recordingUri={recordingUri}
          language={passage.language}
          onPracticeAgain={handlePracticeAgain}
          onFinish={handleFinish}
        />
      )}

      {screenState === 'complete' && (
        <ReadingCompleteView
          analysisResult={analysisResult}
          onDone={handleCompleteDone}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  errorSub: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  retryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  backLink: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

// ─── Reading Complete Styles ────────────────────────────────
import { StyleSheet as CompleteStyleSheet } from 'react-native';

const completeStyles = CompleteStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 54, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Quote / AI recommendation
  quoteSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
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
  quoteText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  quoteEncouragement: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.5,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  scoreRingCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.border.subtle,
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
  },
  ringLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    paddingTop: spacing.md,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    shadowColor: colors.success.DEFAULT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  doneText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
