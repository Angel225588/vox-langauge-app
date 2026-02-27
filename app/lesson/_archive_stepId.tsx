/**
 * Lesson Screen for Staircase Steps
 *
 * Updated to use the premium VocabularyPracticeScreen component
 * with full 5-card flow, SM-2 spaced repetition, and points tracking.
 *
 * Flow:
 * 1. Load vocabulary for the stair
 * 2. Practice each word with VocabularyPracticeScreen
 * 3. Track progress and update stair completion
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { updateStepProgress, completeStep } from '@/lib/api/staircases';
import { VocabularyPracticeScreen } from '@/components/cards/vocabulary/VocabularyPracticeScreen';
import { useStairContent } from '@/hooks/useStairContent';
import { getTopScenariosForStair, createUserProfile, MatchedScenario } from '@/lib/voice/scenarioMatcher';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import { Ionicons } from '@expo/vector-icons';
import type { VocabularyItem } from '@/types/vocabulary';

// Lesson state machine
type LessonState = 'loading' | 'intro' | 'practice' | 'summary' | 'error';

export default function LessonScreen() {
  const router = useRouter();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingV2();

  // Lesson state
  const [state, setState] = useState<LessonState>('loading');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [startTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Load vocabulary from stair content (AI-generated or cached)
  const {
    data: stairContent,
    isLoading: contentLoading,
    error: contentError,
    wasGenerated,
  } = useStairContent(stepId, user?.id);

  // Get matched speaking scenarios for this stair
  const matchedScenarios = useMemo<MatchedScenario[]>(() => {
    if (!stairContent?.scenarios || stairContent.scenarios.length === 0) {
      return [];
    }

    // Create user profile from onboarding
    const userProfile = createUserProfile(
      onboardingData.target_language,
      onboardingData.motivation,
      onboardingData.proficiency_level
    );

    // Get top 3 scenarios for this stair
    const stairContext = {
      skillsFocus: stairContent.grammarPoints || [],
      scenarioTags: [], // Would come from stair metadata
      difficulty: onboardingData.proficiency_level || 'beginner',
    };

    return getTopScenariosForStair(stairContext, userProfile, 3);
  }, [stairContent, onboardingData]);

  // Navigate to voice conversation with selected scenario
  const handlePracticeSpeaking = useCallback((scenario: MatchedScenario) => {
    router.push({
      pathname: '/voice-conversation',
      params: { scenarioId: scenario.id },
    });
  }, [router]);

  // Process stair content when loaded
  useEffect(() => {
    if (contentLoading) {
      setState('loading');
      return;
    }

    if (contentError) {
      setError(contentError);
      setState('error');
      return;
    }

    if (stairContent?.vocabulary && stairContent.vocabulary.length > 0) {
      // Use batch of 5 words per lesson (configurable)
      const WORDS_PER_LESSON = 5;
      const lessonVocab = stairContent.vocabulary.slice(0, WORDS_PER_LESSON);
      setVocabulary(lessonVocab);
      setState('intro');

      if (wasGenerated) {
        console.log('[LessonScreen] Using freshly generated vocabulary:', lessonVocab.length, 'words');
      } else {
        console.log('[LessonScreen] Using cached vocabulary:', lessonVocab.length, 'words');
      }
    } else {
      setError('No vocabulary found for this lesson');
      setState('error');
    }
  }, [stairContent, contentLoading, contentError, wasGenerated]);

  // Start practicing
  const handleStartPractice = useCallback(() => {
    setState('practice');
  }, []);

  // Handle word practice completion
  const handleWordComplete = useCallback(async () => {
    const newCompleted = wordsCompleted + 1;
    setWordsCompleted(newCompleted);

    // Update progress in database
    if (user?.id && stepId) {
      const practiceMinutes = Math.floor((Date.now() - startTime) / 60000);
      await updateStepProgress(user.id, stepId, {
        vocabulary_learned: newCompleted,
        cards_reviewed: newCompleted * 5, // 5 cards per word
        practice_minutes: practiceMinutes,
      });
    }

    // Move to next word or show summary
    if (currentWordIndex < vocabulary.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setState('summary');
    }
  }, [currentWordIndex, vocabulary.length, wordsCompleted, user?.id, stepId, startTime]);

  // Handle points earned from vocabulary practice
  const handlePointsEarned = useCallback((points: number) => {
    setTotalPoints(prev => prev + points);
  }, []);

  // Handle early exit
  const handleExit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  // Complete the lesson
  const handleLessonComplete = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Complete the step in database
    if (user?.id && stepId) {
      const result = await completeStep(user.id, stepId);

      if (result?.success && result?.nextStepUnlocked) {
        Alert.alert(
          'Step Complete! 🎉',
          `You earned ${totalPoints} points!\n\n🔓 Next step unlocked!`,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)/home') }]
        );
        return;
      }

      if (result?.success && result?.staircaseCompleted) {
        Alert.alert(
          'Path Complete! 🏆',
          `Amazing! You finished this learning path!\n\n${totalPoints} points earned!`,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)/home') }]
        );
        return;
      }
    }

    // Default navigation
    router.replace('/(tabs)/home');
  }, [user?.id, stepId, totalPoints, router]);

  // Loading state
  if (state === 'loading') {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </LinearGradient>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.centerContainer}
      >
        <Text style={styles.errorEmoji}>📚</Text>
        <Text style={styles.errorTitle}>Couldn't Load Lesson</Text>
        <Text style={styles.errorMessage}>{error || 'Please try again'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Intro state - show lesson overview
  if (state === 'intro') {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.container}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.introContainer}
        >
          <Text style={styles.introEmoji}>🎯</Text>
          <Text style={styles.introTitle}>Ready to Practice?</Text>
          <Text style={styles.introSubtitle}>
            You'll learn {vocabulary.length} new words
          </Text>

          {/* Word preview */}
          <View style={styles.wordPreview}>
            {vocabulary.map((word, index) => (
              <Animated.View
                key={word.id}
                entering={FadeInUp.duration(300).delay(index * 100)}
                style={styles.wordPreviewItem}
              >
                <Text style={styles.wordPreviewText}>{word.word}</Text>
                <Text style={styles.wordPreviewTranslation}>{word.translation}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Start button */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(400)}
            style={styles.startButtonContainer}
          >
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPractice}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start Practice</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
            >
              <Text style={styles.exitButtonText}>← Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    );
  }

  // Practice state - show vocabulary practice
  if (state === 'practice' && vocabulary[currentWordIndex]) {
    return (
      <VocabularyPracticeScreen
        item={vocabulary[currentWordIndex]}
        userId={user?.id || 'anonymous'}
        onComplete={handleWordComplete}
        onExit={handleExit}
        onPointsEarned={handlePointsEarned}
        fullFlow={true}
      />
    );
  }

  // Summary state - show results
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.summaryScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.summaryContainer}
        >
          <Text style={styles.summaryEmoji}>🎉</Text>
          <Text style={styles.summaryTitle}>Lesson Complete!</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wordsCompleted}</Text>
              <Text style={styles.statLabel}>Words Learned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.floor((Date.now() - startTime) / 60000)}m
              </Text>
              <Text style={styles.statLabel}>Practice Time</Text>
            </View>
          </View>

          {/* Practice Speaking Section */}
          {matchedScenarios.length > 0 && (
            <View style={styles.speakingSection}>
              <View style={styles.speakingSectionHeader}>
                <Ionicons name="mic-outline" size={20} color={colors.secondary.DEFAULT} />
                <Text style={styles.speakingSectionTitle}>Practice Speaking</Text>
              </View>
              <Text style={styles.speakingSectionSubtitle}>
                Practice what you learned in real conversations
              </Text>

              <View style={styles.scenarioCards}>
                {matchedScenarios.map((scenario: MatchedScenario) => (
                  <TouchableOpacity
                    key={scenario.id}
                    style={styles.scenarioCard}
                    onPress={() => handlePracticeSpeaking(scenario)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.scenarioCardContent}>
                      <View style={styles.scenarioIcon}>
                        <Ionicons
                          name="chatbubbles-outline"
                          size={24}
                          color={colors.primary.DEFAULT}
                        />
                      </View>
                      <View style={styles.scenarioInfo}>
                        <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                        <Text style={styles.scenarioDescription} numberOfLines={2}>
                          {scenario.description}
                        </Text>
                        <View style={styles.scenarioBadges}>
                          <View style={styles.difficultyBadge}>
                            <Text style={styles.difficultyText}>{scenario.difficulty}</Text>
                          </View>
                          <Text style={styles.matchReason}>{scenario.matchReason}</Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.text.tertiary}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Complete button */}
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleLessonComplete}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.success}
              style={styles.completeButtonGradient}
            >
              <Text style={styles.completeButtonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.md,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
  },

  // Intro styles
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  introEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  introTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  introSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  wordPreview: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  wordPreviewItem: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordPreviewText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  wordPreviewTranslation: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  startButtonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  exitButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // Summary styles
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  summaryEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  completeButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Summary scroll content
  summaryScrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.xl,
  },

  // Speaking Section Styles
  speakingSection: {
    width: '100%',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  speakingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  speakingSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  speakingSectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  scenarioCards: {
    gap: spacing.sm,
  },
  scenarioCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scenarioCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scenarioIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.DEFAULT + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  scenarioDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  scenarioBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.DEFAULT + '20',
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.DEFAULT,
    textTransform: 'capitalize',
  },
  matchReason: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
